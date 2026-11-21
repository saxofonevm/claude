#!/usr/bin/env node
// Confere o arquivo conteudo/treinos.json antes de publicar.
// Uso: node ferramentas/verificar-treinos.js
const fs = require("fs"), path = require("path");
const raiz = path.resolve(__dirname, "..");
const ler = f => fs.readFileSync(path.join(raiz, f), "utf8");
const problemas = [], avisos = [];

let dados;
try { dados = JSON.parse(ler("conteudo/treinos.json")); }
catch (e) { console.log("✘ O arquivo não é um JSON válido:", e.message); console.log("  Dica: confira vírgulas entre os itens, aspas duplas e chaves { } fechando."); process.exit(1); }

global.window = {};
eval(ler("conteudo.js")); eval(ler("metodos.js")); eval(ler("repertorio.js"));
const pilares = new Set(window.CMA.raizes.map(r => r.id));
const exercicios = new Set(window.CMA.raizes.flatMap(r => (r.ramificacoes || []).flatMap(m => (m.exercicios || []).map(e => e.id))));
const livros = new Set(Object.keys(window.CMA_METODOS.livros));
const musicas = new Set(window.NAIPE_REPERTORIO.musicas.map(m => m.id));
const Music = require(path.join(raiz, "rit/js/music.js"));
const ritmos = new Set(Music.RHYTHMS.map(r => r.id)), progs = new Set(Music.PRESETS.map(p => p.id));

const cats = dados.categorias || {};
for (const [id, c] of Object.entries(cats)) {
  if (!c.nome) problemas.push(`Categoria "${id}" sem nome.`);
  if (c.pilar && !pilares.has(c.pilar)) problemas.push(`Categoria "${id}": o pilar "${c.pilar}" não existe. Pilares: ${[...pilares].join(", ")}.`);
}
const ids = new Set();
(dados.treinos || []).forEach((t, i) => {
  const onde = `Treino ${i + 1} (${t.id || "sem id"})`;
  if (!t.id) problemas.push(`${onde}: falta o "id".`);
  else if (ids.has(t.id)) problemas.push(`${onde}: o id "${t.id}" está repetido.`); else ids.add(t.id);
  if (!t.nome) problemas.push(`${onde}: falta o "nome".`);
  if (!Array.isArray(t.blocos) || !t.blocos.length) { problemas.push(`${onde}: sem blocos.`); return; }
  const total = t.blocos.reduce((s, b) => s + (Number(b.minutos) || 0), 0);
  if (total < 15 || total > 20) avisos.push(`${onde}: soma ${total} min (o combinado é de 15 a 20).`);
  t.blocos.forEach((b, k) => {
    const ob = `${onde}, bloco ${k + 1}`;
    if (!cats[b.categoria]) problemas.push(`${ob}: a categoria "${b.categoria}" não existe. Use: ${Object.keys(cats).join(", ")}.`);
    if (!(Number(b.minutos) > 0)) problemas.push(`${ob}: "minutos" precisa ser um número.`);
    if (!b.titulo) problemas.push(`${ob}: falta o "titulo".`);
    if (b.exercicio && !exercicios.has(b.exercicio)) problemas.push(`${ob}: o exercício "${b.exercicio}" não existe.`);
    if (b.material && !livros.has(b.material.livro)) problemas.push(`${ob}: o livro "${b.material.livro}" não está na Biblioteca de métodos.`);
    if (b.musica && !musicas.has(b.musica)) problemas.push(`${ob}: a música "${b.musica}" não está no Repertório essencial.`);
    if (b.rit) {
      if (!ritmos.has(b.rit.ritmo)) problemas.push(`${ob}: o ritmo do RIT "${b.rit.ritmo}" não existe. Ritmos: ${[...ritmos].join(", ")}.`);
      if (b.rit.prog && !progs.has(b.rit.prog)) problemas.push(`${ob}: a progressão do RIT "${b.rit.prog}" não existe.`);
      if (!b.rit.prog && !b.rit.cifra) avisos.push(`${ob}: o RIT está sem cifra e sem progressão (vai tocar só o ritmo).`);
      if (b.rit.cifra) { try { const c = Music.parseChart(b.rit.cifra); if (!c.bars.length) problemas.push(`${ob}: a cifra do RIT está vazia.`); } catch (e) { problemas.push(`${ob}: não consegui ler a cifra do RIT.`); } }
    }
  });
});
console.log(`${(dados.treinos || []).length} treinos lidos.`);
avisos.forEach(a => console.log("⚠ " + a));
problemas.forEach(p => console.log("✘ " + p));
if (!problemas.length) console.log("✔ Tudo certo para publicar.");
process.exit(problemas.length ? 1 : 0);
