/*
 * Naipe — Treino do dia (tela inicial).
 * Lê os treinos de conteudo/treinos.json e mostra o de hoje em blocos de poucos minutos.
 * O progresso do dia fica guardado no aparelho (estado.treino) e, ao concluir,
 * o tempo vai para o Diário e conta nos dias seguidos.
 */
(function () {
  "use strict";
  let DADOS = null, erro = false;
  const tempo = { bloco: -1, fim: 0, t: 0 };
  let verDeNovo = false; // depois de concluído, o aluno pode rever os blocos sem registrar de novo

  const app = () => window.NaipeApp;
  const esc = s => app().escapar(String(s == null ? "" : s));
  const hoje = () => app().hojeISO();

  async function carregar() {
    try {
      const r = await fetch("conteudo/treinos.json", { cache: "no-cache" });
      if (!r.ok) throw new Error(r.status);
      DADOS = await r.json();
    } catch { erro = true; }
    if (location.hash === "" || location.hash.startsWith("#/inicio")) render();
  }

  // Estado do dia: qual treino, quais blocos foram feitos, se foi concluído.
  function estadoDia() {
    const est = app().estado();
    const t = (est.treino = est.treino || {});
    if (!t.dia || t.dia.data !== hoje()) {
      const lista = DADOS.treinos;
      const n = Math.floor(Date.parse(hoje()) / 864e5);
      t.dia = { data: hoje(), id: lista[((n % lista.length) + lista.length) % lista.length].id, feitos: [], concluido: false };
    }
    return t.dia;
  }
  const treinoAtual = dia => DADOS.treinos.find(x => x.id === dia.id) || DADOS.treinos[0];

  // Material de cada bloco: exercício dos pilares, página de método ou música do repertório.
  function infoExercicio(id) {
    for (const r of (window.CMA && window.CMA.raizes) || []) for (const m of r.ramificacoes || []) for (const e of m.exercicios || []) if (e.id === id) return { ex: e, raiz: r };
    return null;
  }
  function linksBloco(b) {
    const out = [];
    if (b.exercicio) {
      const i = infoExercicio(b.exercicio);
      if (i) out.push(`<a class="btn primario" href="#/ex/${encodeURIComponent(b.exercicio)}">Abrir o exercício</a>`);
    }
    if (b.material) {
      const l = ((window.CMA_METODOS || {}).livros || {})[b.material.livro];
      if (l) {
        const url = app().urlArquivo(l.arquivo);
        if (url) out.push(`<a class="btn${out.length ? "" : " primario"}" href="${esc(url)}" target="_blank" rel="noopener">Abrir o PDF</a>`);
        out.push(`<a class="btn" href="#/metodo/${encodeURIComponent(b.material.livro)}">Ver o método</a>`);
      }
    }
    if (b.musica) {
      const m = ((window.NAIPE_REPERTORIO || {}).musicas || []).find(x => x.id === b.musica);
      const drive = id => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
      const sax = app().estado().sax;
      if (m) {
        const part = sax === "Sib" ? (m.tenor || m.alto) : (m.alto || m.tenor);
        if (part) out.push(`<a class="btn${out.length ? "" : " primario"}" href="${esc(drive(part))}" target="_blank" rel="noopener">Partitura</a>`);
        if (m.playback) out.push(`<a class="btn" href="${esc(drive(m.playback))}" target="_blank" rel="noopener">▶ Playback</a>`);
        if (!part && !m.playback) out.push(`<a class="btn" href="#/estudo">Ver no Repertório</a>`);
      }
    }
    return out.join("");
  }
  function fonteBloco(b) {
    if (b.exercicio) { const i = infoExercicio(b.exercicio); return i ? `${i.raiz.titulo} · ${i.ex.titulo}` : ""; }
    if (b.material) { const l = ((window.CMA_METODOS || {}).livros || {})[b.material.livro]; return l ? `${l.titulo} · ${b.material.onde || ""}` : ""; }
    if (b.musica) { const m = ((window.NAIPE_REPERTORIO || {}).musicas || []).find(x => x.id === b.musica); return m ? `${m.titulo} · ${m.autor}` : ""; }
    return "";
  }

  const mmss = s => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

  function render() {
    const el = document.getElementById("treino-dia");
    if (!el || !app()) return;
    if (erro) { el.innerHTML = `<section class="cartao treino"><p class="mudo">Não consegui carregar os treinos. Confira a conexão e abra o app de novo.</p></section>`; return; }
    if (!DADOS) { el.innerHTML = ""; return; }
    const dia = estadoDia(), t = treinoAtual(dia), cats = DADOS.categorias || {};
    const total = t.blocos.reduce((s, b) => s + b.minutos, 0);
    const feitos = dia.feitos.length, seq = app().sequencia();
    const semana = app().minutosSemana(), metaSem = app().metaSemana();
    const topo = `<div class="treino-topo"><span class="rotulo">Treino do dia</span><span class="treino-ritmo">${seq ? `${seq} ${seq === 1 ? "dia seguido" : "dias seguidos"}` : "Comece a sua sequência hoje"} · ${semana} de ${metaSem} min na semana</span></div>`;
    if (dia.concluido && !verDeNovo) {
      el.innerHTML = `<section class="cartao treino concluido">${topo}
        <h2>${esc(t.nome)}</h2>
        <p class="treino-feito">✓ Treino de hoje concluído · ${dia.minutos || total} min no Diário</p>
        <p class="mudo">Amanhã tem um treino novo. Se quiser estudar mais hoje, siga no Estudo ou nos Pilares.</p>
        <div class="linha-botoes"><a class="btn" href="#/estudo">Ir para o Estudo</a><button class="btn" type="button" data-treino="refazer">Ver o treino de novo</button></div>
      </section>`;
      return;
    }
    el.innerHTML = `<section class="cartao treino">${topo}
      <h2>${esc(t.nome)}</h2>
      <p class="mudo treino-resumo">${total} minutos · ${t.blocos.map(b => `${esc((cats[b.categoria] || {}).nome || b.categoria)} ${b.minutos}`).join(" · ")}</p>
      <ol class="treino-blocos">${t.blocos.map((b, k) => {
        const feito = dia.feitos.includes(k), rodando = tempo.bloco === k;
        const resta = rodando ? Math.max(0, Math.round((tempo.fim - Date.now()) / 1000)) : b.minutos * 60;
        return `<li class="treino-bloco${feito ? " feito" : ""}${rodando ? " rodando" : ""}">
          <div class="tb-cab"><span class="tb-cat">${esc((cats[b.categoria] || {}).nome || b.categoria)}</span><span class="tb-min">${b.minutos} min</span></div>
          <strong class="tb-titulo">${esc(b.titulo)}</strong>
          ${fonteBloco(b) ? `<small class="tb-fonte">${esc(fonteBloco(b))}</small>` : ""}
          ${b.instrucao ? `<p class="tb-instrucao">${esc(b.instrucao)}</p>` : ""}
          <div class="tb-links">${linksBloco(b)}</div>
          <div class="tb-acoes">
            <button type="button" class="btn tb-tempo" data-treino="tempo" data-k="${k}">${rodando ? `⏸ ${mmss(resta)}` : `⏱ ${mmss(resta)}`}</button>
            <button type="button" class="tb-feito" data-treino="feito" data-k="${k}" aria-pressed="${feito}">${feito ? "✓ Feito" : "Marcar como feito"}</button>
          </div>
        </li>`;
      }).join("")}</ol>
      <div class="treino-rodape">
        <span class="mudo">${feitos} de ${t.blocos.length} blocos</span>
        ${dia.concluido ? `<span class="treino-feito">✓ Concluído hoje</span>` : `<button type="button" class="btn primario" data-treino="concluir"${feitos ? "" : " disabled"}>Concluir o treino de hoje</button>`}
      </div>
      ${feitos || dia.concluido ? "" : `<button type="button" class="link-acao treino-trocar" data-treino="trocar">Trocar por outro treino</button>`}
    </section>`;
  }

  function tick() {
    if (tempo.bloco < 0) return;
    const resta = Math.round((tempo.fim - Date.now()) / 1000);
    const b = document.querySelector(`[data-treino="tempo"][data-k="${tempo.bloco}"]`);
    if (resta <= 0) {
      const k = tempo.bloco; pararTempo();
      const dia = estadoDia(); if (!dia.feitos.includes(k)) { dia.feitos.push(k); app().salvar(); }
      try { navigator.vibrate && navigator.vibrate(200); } catch { /* sem vibração */ }
      render(); return;
    }
    if (b) b.textContent = `⏸ ${mmss(resta)}`;
  }
  function pararTempo() { clearInterval(tempo.t); tempo.bloco = -1; tempo.t = 0; }

  document.addEventListener("click", ev => {
    const b = ev.target.closest("[data-treino]");
    if (!b || !document.getElementById("treino-dia").contains(b)) return;
    const acao = b.dataset.treino, dia = estadoDia(), t = treinoAtual(dia), k = Number(b.dataset.k);
    if (acao === "feito") {
      const i = dia.feitos.indexOf(k);
      if (i >= 0) dia.feitos.splice(i, 1); else dia.feitos.push(k);
      if (tempo.bloco === k) pararTempo();
      app().salvar(); render();
    } else if (acao === "tempo") {
      if (tempo.bloco === k) { pararTempo(); render(); return; }
      pararTempo();
      tempo.bloco = k; tempo.fim = Date.now() + t.blocos[k].minutos * 60 * 1000;
      tempo.t = setInterval(tick, 500); render();
    } else if (acao === "concluir") {
      if (dia.concluido) return;
      pararTempo();
      const min = t.blocos.reduce((s, x, i) => s + (dia.feitos.includes(i) ? x.minutos : 0), 0);
      dia.concluido = true; dia.minutos = min;
      app().registrarPratica(min, `Treino do dia: ${t.nome} (${dia.feitos.length} de ${t.blocos.length} blocos)`);
      app().salvar();
      if (app().atualizar) app().atualizar(); else render();
    } else if (acao === "trocar") {
      const i = DADOS.treinos.findIndex(x => x.id === dia.id);
      dia.id = DADOS.treinos[(i + 1) % DADOS.treinos.length].id; dia.feitos = [];
      app().salvar(); render();
    } else if (acao === "refazer") {
      verDeNovo = true; render();
    }
  });

  window.NaipeTreino = { render };
  carregar();
})();
