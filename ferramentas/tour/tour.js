// Grava um tour guiado pelo app CMA (vídeo vertical 780x1688).
const { chromium } = require('playwright');
const fs = require('fs');
const [APP, SAIDA] = process.argv.slice(2);

const hoje = new Date();
const iso = k => { const d = new Date(hoje); d.setDate(d.getDate() - k); return d.toISOString().slice(0, 10); };
const futuro = k => { const d = new Date(hoje); d.setDate(d.getDate() + k); return d.toISOString().slice(0, 10); };
const ESTADO = {
  nome: 'Ana', metaSemanal: 150, desbloqueado: true, sax: '', tema: 'verde',
  sessoes: [
    { id: 'a', data: iso(0), minutos: 15, raizId: 'escuta', exercicioId: 'esc-01', avaliacao: 4, notas: '' },
    { id: 'b', data: iso(1), minutos: 25, raizId: 'ritmo', exercicioId: 'rit-01', avaliacao: 5, notas: 'Contratempo melhorando' },
    { id: 'c', data: iso(2), minutos: 20, raizId: 'escuta', exercicioId: 'esc-02', avaliacao: 3, notas: '' }
  ],
  feitos: { 'esc-01': iso(3), 'esc-02': iso(2), 'rit-01': iso(1) },
  prazos: { 'e:esc-06': futuro(2), 'r:ritmo': futuro(9) },
  andamentos: { 'rit-01': 84 }, metronomo: { bpm: 80, compasso: 4, som: 'analogico' }
};

const CSS = `
.tour-legenda { position: fixed; left: 14px; right: 14px; z-index: 9999; padding: 14px 16px 15px; border-radius: 18px;
  background: rgb(8 24 18 / .985); border: 1.5px solid #d4a24c; box-shadow: 0 18px 40px rgb(0 0 0 / .55);
  color: #f3efe6; font-family: Figtree, system-ui, sans-serif; opacity: 0; transform: translateY(10px); transition: opacity .35s, transform .35s; }
.tour-legenda.ver { opacity: 1; transform: none; }
.tour-legenda.cima { top: 12px; } .tour-legenda.baixo { bottom: 74px; }
.tour-legenda b { display: block; font-family: Archivo, sans-serif; font-stretch: 80%; font-size: 1.25rem; text-transform: uppercase; letter-spacing: .03em; color: #e9c27a; margin-bottom: 3px; }
.tour-legenda span { font-size: .98rem; line-height: 1.35; }
.tour-legenda i { position: absolute; top: 12px; right: 14px; font-style: normal; font-size: .72rem; font-weight: 800; color: #0b0b0e; background: #d4a24c; border-radius: 999px; padding: 2px 8px; }
.tour-alvo { outline: 3px solid #f2d48a !important; outline-offset: 4px; border-radius: 14px; animation: tour-anel 1.2s ease-in-out infinite !important; position: relative; z-index: 5; }
@keyframes tour-anel { 0%,100% { outline-color: rgb(242 212 138 / 1); box-shadow: 0 0 0 0 rgb(242 212 138 / .0); } 50% { outline-color: rgb(242 212 138 / .45); box-shadow: 0 0 26px 4px rgb(242 212 138 / .45); } }
.tour-dedo { position: fixed; z-index: 10000; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%;
  background: rgb(255 255 255 / .55); border: 3px solid #fff; box-shadow: 0 4px 14px rgb(0 0 0 / .4); pointer-events: none; animation: tour-toque .7s ease-out forwards; }
@keyframes tour-toque { 0% { transform: scale(.4); opacity: 0; } 30% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.7); opacity: 0; } }
.tour-capa { position: fixed; inset: 0; z-index: 10001; display: grid; place-items: center; text-align: center; padding: 30px;
  background: radial-gradient(70% 50% at 50% 30%, rgb(212 162 76 / .35), transparent 70%), #0b2a20; color: #f3efe6; font-family: Figtree, sans-serif; transition: opacity .6s; }
.tour-capa h1 { font-family: Archivo, sans-serif; font-stretch: 75%; font-size: 3rem; line-height: .95; text-transform: uppercase; margin: 14px 0 10px; }
.tour-capa h1 em { font-style: normal; color: #e9c27a; }
.tour-capa p { color: #b9c9c0; font-size: 1.05rem; margin: 0; }
.tour-capa svg { width: 70px; height: 92px; }
`;

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 780, height: 1688 }, deviceScaleFactor: 1,
    recordVideo: { dir: SAIDA, size: { width: 780, height: 1688 } } });
  await ctx.addInitScript(([estado, css]) => {
    localStorage.setItem('cma.v1', JSON.stringify(estado));
    document.addEventListener('DOMContentLoaded', () => {
      document.documentElement.style.zoom = '2';
      const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    });
  }, [ESTADO, CSS]);
  const p = await ctx.newPage();
  const espera = ms => p.waitForTimeout(ms);
  let passo = 0;
  const TOTAL = 15;

  async function capa(titulo, sub, ms) {
    await p.evaluate(([t, s]) => {
      const c = document.createElement('div'); c.className = 'tour-capa'; c.id = 'tour-capa';
      c.innerHTML = `<div><svg viewBox="-12.6 -2.12 71.22 95.96"><g transform="rotate(-10 30 85.5)" fill="none" stroke="#C9A24B" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8 L16 12 C22 15 24 19 24 25 L24 66 C24 88 46 88 46 66 L46 56"/><path d="M39 54 Q46 59 52 50"/></g></svg><h1>${t}</h1><p>${s}</p></div>`;
      document.body.appendChild(c);
    }, [titulo, sub]);
    await espera(ms);
    await p.evaluate(() => { const c = document.getElementById('tour-capa'); c.style.opacity = '0'; setTimeout(() => c.remove(), 650); });
    await espera(650);
  }

  async function legenda(seletor, titulo, texto, ms = 3800, onde) {
    passo++;
    await p.evaluate(([sel, t, tx, n, tot, ond]) => {
      document.querySelectorAll('.tour-alvo').forEach(e => e.classList.remove('tour-alvo'));
      document.querySelectorAll('.tour-legenda').forEach(e => e.remove());
      const el = sel && document.querySelector(sel);
      let lado = ond || 'baixo';
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        el.classList.add('tour-alvo');
      }
      const l = document.createElement('div'); l.className = 'tour-legenda ' + lado;
      l.innerHTML = `<i>${n}/${tot}</i><b>${t}</b><span>${tx}</span>`;
      document.body.appendChild(l);
      requestAnimationFrame(() => requestAnimationFrame(() => l.classList.add('ver')));
    }, [seletor, titulo, texto, passo, TOTAL, onde]);
    await espera(ms);
  }

  async function tocar(seletor) {
    await p.evaluate(sel => {
      const el = document.querySelector(sel); if (!el) return;
      const r = el.getBoundingClientRect(); const z = parseFloat(document.documentElement.style.zoom) || 1;
      const d = document.createElement('div'); d.className = 'tour-dedo';
      d.style.left = (r.left + r.width / 2) + 'px'; d.style.top = (r.top + r.height / 2) + 'px';
      document.body.appendChild(d); setTimeout(() => d.remove(), 800);
    }, seletor);
    await espera(450);
    await p.click(seletor);
    await espera(600);
  }

  async function limpar() {
    await p.evaluate(() => { document.querySelectorAll('.tour-alvo').forEach(e => e.classList.remove('tour-alvo')); document.querySelectorAll('.tour-legenda').forEach(e => e.remove()); });
  }

  await p.goto('file://' + APP + '/index.html#/inicio');
  await espera(900);
  await capa('Tour pelo<br><em>Naipe</em>', 'Seu estudo de saxofone na palma da mão', 3200);

  await legenda('#letreiro-radio', 'Rádio Naipe', 'Toque no letreiro para ouvir jazz e música brasileira ao vivo enquanto estuda.', 4200, 'baixo');
  await legenda('.frase-dia', 'Frase do dia', 'Uma frase para inspirar o seu estudo. Ela muda todos os dias.', 3600, 'baixo');
  await legenda('#estudo-dia', 'Sugestão de estudo', 'Três passos para hoje: aquecer com o afinador, fazer o exercício da vez e tocar junto.', 4200, 'cima');
  await legenda('#timer-iniciar', 'Cronômetro', 'Toque em Começar ao iniciar o estudo e em Finalizar para registrar a prática.', 4000, 'cima');
  await legenda('#btn-metronomo-inicio', 'Metrônomo', 'Escolha o andamento e toque com o tic-tac. O metrônomo abaixa a rádio sozinho.', 3000, 'cima');
  await tocar('#btn-metronomo-inicio');
  await espera(1600);
  await p.click('#met-fechar'); await espera(500);
  await legenda('.stats', 'Meus números', 'Dias seguidos, minutos na semana e exercícios concluídos.', 3600, 'cima');
  await legenda('.percurso-cartao', 'Meu percurso', 'O saxofone e as 6 raízes do método. Cada raiz se enche de cor conforme você avança. Toque numa raiz para abrir.', 4600, 'cima');
  await legenda('#btn-relatorio', 'Relatório para o professor', 'Mande o resumo da sua semana para o professor pelo WhatsApp com um toque.', 3800, 'cima');

  await limpar();
  await tocar('.abas a[data-aba="raizes"]');
  await legenda('#lista-raizes', 'Método Naipe', 'As 6 raízes, na ordem do método: Escuta, Figuras Rítmicas, Estudos Melódicos, Articulações, Dinâmicas e Ornamentos.', 4400, 'baixo');
  await limpar();
  await tocar('.raiz-card:nth-child(2)');
  await espera(600);
  await p.evaluate(() => document.querySelector('.ramificacao').scrollIntoView({ block: 'start', behavior: 'smooth' }));
  await espera(900);
  await legenda('.exercicio-item.proximo', 'Dentro da raiz', 'Cada ramificação tem exercícios com metrônomo e prazo. O próximo a fazer fica em destaque.', 4200, 'baixo');
  await legenda('.indicados', 'Indicado pelo professor', 'Os materiais escolhidos para esta etapa, em ordem de uso: livros, partituras e play-alongs.', 4200, 'cima');

  await limpar();
  await tocar('.abas a[data-aba="tocar"]');
  await legenda('.filtro-sax', 'Tocar junto', 'Play-alongs por gênero. Escolha o seu sax (alto em Mib ou tenor em Sib) e veja só a sua afinação.', 4600, 'baixo');
  await limpar();
  await tocar('.abas a[data-aba="metodos"]');
  await legenda('.busca', 'Métodos', 'Busque um assunto, como staccato ou terças, e veja em que página de cada método ele está.', 4200, 'baixo');
  await limpar();
  await tocar('.abas a[data-aba="diario"]');
  await legenda('#lista-sessoes', 'Diário', 'Todas as suas práticas, com o tempo, a raiz estudada e as suas anotações.', 3800, 'baixo');
  await limpar();
  await tocar('.abas a[data-aba="inicio"]');
  await espera(400);
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await espera(600);
  await legenda('.btn-topo', 'Ajustes', 'Na engrenagem você coloca o seu nome, a meta da semana, o seu sax, a cor do app e o código de acesso.', 4600, 'baixo');
  await limpar();
  await capa('Bons<br><em>estudos!</em>', 'Pouco todo dia vence muito de vez em quando.', 3600);

  await ctx.close(); await b.close();
  console.log('passos:', passo);
})();
