(() => {
  "use strict";

  const CHAVE = "cma.v1";
  const AVALIACOES = ["Difícil", "Regular", "Boa", "Muito boa", "Excelente"];
  const DIAS_CURTOS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const ANDAMENTOS = [
    [40, "Grave"], [60, "Largo"], [66, "Larghetto"], [76, "Adagio"], [108, "Andante"],
    [120, "Moderato"], [156, "Allegro"], [176, "Vivace"], [200, "Presto"], [Infinity, "Prestissimo"]
  ];
  const { icone, ilustracao } = window;

  // ---------- Conteúdo (conteudo.js) ----------

  const CMA = window.CMA || {};
  const RAIZES = Array.isArray(CMA.raizes) ? CMA.raizes : [];
  const FRASES = Array.isArray(CMA.frases) && CMA.frases.length ? CMA.frases : ["Bora tocar?"];
  const RAIZ = {};       // id → raiz
  const EXERCICIO = {};  // id → { ex, ram, raiz }
  for (const raiz of RAIZES) {
    RAIZ[raiz.id] = raiz;
    for (const ram of raiz.ramificacoes || []) {
      for (const ex of ram.exercicios || []) EXERCICIO[ex.id] = { ex, ram, raiz };
    }
  }
  const exerciciosDaRaiz = raiz => (raiz.ramificacoes || []).flatMap(r => r.exercicios || []);
  const TOTAL_EXERCICIOS = Object.keys(EXERCICIO).length;
  const RAMO = {};       // id → { ram, raiz }
  for (const raiz of RAIZES) for (const ram of raiz.ramificacoes || []) RAMO[ram.id] = { ram, raiz };

  // ---------- Métodos (metodos.js) ----------

  const MET = window.CMA_METODOS || {};
  const LIVROS = MET.livros || {};
  const PASTAS = { raiz: {}, ramificacao: {}, ...(MET.pastas || {}) };
  const INDICACOES = (MET.indicacoes || [])
    .filter(i => LIVROS[i[0]] && RAMO[i[3]])
    .map(([livro, onde, assunto, ramo]) => ({ livro, onde, assunto, ramo }));
  const indicacoesDoRamo = id => INDICACOES.filter(i => i.ramo === id);
  const urlArquivo = id => id ? `https://drive.google.com/file/d/${encodeURIComponent(id)}/view` : null;
  const urlPasta = id => id ? `https://drive.google.com/drive/folders/${encodeURIComponent(id)}` : null;
  const nomeLivro = l => l.autor ? `${l.autor} · ${l.titulo}` : l.titulo;

  // Dentro da prévia do Claude (iframe) o navegador bloqueia microfone e rádio.
  const NA_PREVIA = (() => { try { return window.self !== window.top; } catch { return true; } })();
  const AVISO_PREVIA = "Na prévia do Claude o microfone e a rádio ficam bloqueados. Abra o CMA pelo site ou pelo app instalado no celular.";

  // ---------- Estado e armazenamento ----------

  const estadoPadrao = () => ({
    nome: "",
    metaSemanal: 150,
    sessoes: [],       // { id, data, minutos, raizId, exercicioId, avaliacao, notas }
    feitos: {},        // { [exercicioId]: "AAAA-MM-DD" }
    prazos: {},        // { "r:<raizId>" | "e:<exercicioId>": "AAAA-MM-DD" }
    andamentos: {},    // { [exercicioId]: bpm atual }
    metronomo: { bpm: 80, compasso: 4 },
    desbloqueado: false,
    sax: "",
    tema: "",
    timer: { inicio: null, acumulado: 0 }
  });

  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return estadoPadrao();
      return { ...estadoPadrao(), ...JSON.parse(bruto) };
    } catch {
      return estadoPadrao();
    }
  }

  let estado = carregar();

  function aplicarTema() {
    const tema = estado.tema === "preto" ? "preto" : "verde";
    if (tema === "verde") document.documentElement.dataset.tema = "verde";
    else delete document.documentElement.dataset.tema;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", tema === "verde" ? "#0b2a20" : "#0e0e11");
  }
  aplicarTema();

  // ---------- Acesso (versão grátis x completa) ----------

  const ACESSO = CMA.acesso && Array.isArray(CMA.acesso.codigos) && CMA.acesso.codigos.length ? CMA.acesso : null;
  const liberada = raiz => !ACESSO || estado.desbloqueado || (ACESSO.gratis || []).includes(raiz.id);
  const temBloqueio = () => RAIZES.some(r => !liberada(r));

  function urlConhecer() {
    const pagina = ACESSO && urlSegura(ACESSO.paginaVendas);
    if (pagina) return pagina;
    const prof = CMA.professor || {};
    const numero = String(prof.whatsapp || "").replace(/\D/g, "");
    const texto = `Olá${prof.nome ? " " + prof.nome.split(" ")[0] : ""}! Quero conhecer o Método CMA completo.`;
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  }

  async function impressao(texto) {
    const dados = new TextEncoder().encode(texto);
    const hash = await crypto.subtle.digest("SHA-256", dados);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function tentarCodigo(bruto) {
    const codigo = String(bruto || "").trim().toUpperCase().replace(/\s+/g, "");
    if (!codigo) { avisar("Digite o código de acesso."); return false; }
    let ok = false;
    try { ok = ACESSO.codigos.includes(await impressao(codigo)); } catch { avisar("Não foi possível conferir o código neste navegador."); return false; }
    if (!ok) { avisar("Código inválido. Confira com o professor."); return false; }
    estado.desbloqueado = true;
    salvar();
    avisar("Método CMA completo liberado!");
    renderTela();
    return true;
  }

  function htmlCodigo() {
    return `<form class="form-codigo" data-form-codigo>
      <label for="inp-codigo-${rotaAtual.tela}">Já comprou? Digite o seu código de acesso</label>
      <div class="linha-codigo">
        <input type="text" id="inp-codigo-${rotaAtual.tela}" name="codigo" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Ex.: CMA-XXXX">
        <button class="btn primario" type="submit">Liberar</button>
      </div>
    </form>`;
  }

  document.addEventListener("submit", ev => {
    const f = ev.target.closest("[data-form-codigo]");
    if (!f) return;
    ev.preventDefault();
    tentarCodigo(f.querySelector("input").value);
  });

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      avisar("Não foi possível salvar neste aparelho.");
    }
  }

  // ---------- Utilidades ----------

  const $ = sel => document.querySelector(sel);
  const pad = n => String(n).padStart(2, "0");
  const dataISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const deISO = s => { const [a, m, d] = s.split("-").map(Number); return new Date(a, m - 1, d); };
  const hojeISO = () => dataISO(new Date());
  const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const limitar = (v, min, max) => Math.min(max, Math.max(min, v));
  const nomeAndamento = bpm => ANDAMENTOS.find(([max]) => bpm < max)[1];
  const corRaiz = raiz => `--c1:${escapar(raiz.cor || "#d4a24c")};--c2:${escapar(raiz.cor2 || raiz.cor || "#e9c27a")}`;
  const dois = n => String(n).padStart(2, "0");

  function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function segunda(d) {
    const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
    return r;
  }

  function diasAte(iso) {
    return Math.round((deISO(iso) - deISO(hojeISO())) / 864e5);
  }

  const maiuscula = t => t.charAt(0).toUpperCase() + t.slice(1);

  function formatarData(iso) {
    const dias = diasAte(iso);
    if (dias === 0) return "Hoje";
    if (dias === -1) return "Ontem";
    return maiuscula(deISO(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }));
  }

  function formatarMinutos(min) {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  }

  function urlSegura(url) {
    if (!url || !String(url).trim()) return null;
    try {
      const u = new URL(url, location.href);
      return ["http:", "https:"].includes(u.protocol) ? u.href : null;
    } catch { return null; }
  }

  function urlReferencia(ref) {
    if (ref.url) return urlSegura(ref.url);
    if (ref.busca) return "https://www.youtube.com/results?search_query=" + encodeURIComponent(ref.busca);
    return null;
  }

  function hidratarIcones(raiz = document) {
    raiz.querySelectorAll("[data-icone]").forEach(el => {
      if (el.dataset.iconePronto) return;
      el.insertAdjacentHTML("afterbegin", icone(el.dataset.icone));
      el.dataset.iconePronto = "1";
    });
  }

  let avisoTimeout;
  function avisar(msg) {
    let el = $(".aviso");
    if (!el) {
      el = document.createElement("div");
      el.className = "aviso";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(avisoTimeout);
    avisoTimeout = setTimeout(() => { el.hidden = true; }, 2600);
  }

  // Janela de confirmação própria (funciona em qualquer navegador)
  const dlgConf = $("#dlg-confirmar");
  function confirmar(titulo, texto, rotuloSim = "Confirmar") {
    $("#conf-titulo").textContent = titulo;
    $("#conf-texto").textContent = texto;
    $("#conf-sim").textContent = rotuloSim;
    dlgConf.returnValue = "";
    dlgConf.showModal();
    return new Promise(ok => dlgConf.addEventListener("close", () => ok(dlgConf.returnValue === "sim"), { once: true }));
  }

  // ---------- Progresso e prazos ----------

  const feito = exId => !!estado.feitos[exId];

  function progressoRaiz(raiz) {
    const exs = exerciciosDaRaiz(raiz);
    const feitos = exs.filter(e => feito(e.id)).length;
    return { feitos, total: exs.length, pct: exs.length ? Math.round((feitos / exs.length) * 100) : 0, completa: exs.length > 0 && feitos === exs.length };
  }

  function statusPrazo(iso, concluido) {
    if (concluido) return { texto: "Concluído", classe: "ok" };
    const dias = diasAte(iso);
    if (dias < 0) return { texto: `Atrasado ${-dias} dia${dias === -1 ? "" : "s"}`, classe: "atrasado" };
    if (dias === 0) return { texto: "Vence hoje", classe: "urgente" };
    if (dias === 1) return { texto: "Vence amanhã", classe: "urgente" };
    return { texto: `Em ${dias} dias`, classe: dias <= 7 ? "proximo" : "" };
  }

  function seloPrazo(chave, concluido) {
    const iso = estado.prazos[chave];
    if (!iso) return "";
    const s = statusPrazo(iso, concluido);
    return `<span class="selo ${s.classe}">${escapar(s.texto)}</span>`;
  }

  function campoPrazo(chave, rotulo) {
    return `<label class="campo-prazo">${icone("calendario")}<span>${escapar(rotulo)}</span>
      <span class="campo-prazo-linha">
        <input type="date" data-prazo="${escapar(chave)}" value="${escapar(estado.prazos[chave] || "")}">
        ${estado.prazos[chave] ? `<button type="button" class="link-acao" data-limpar-prazo="${escapar(chave)}">Remover</button>` : ""}
      </span>
    </label>`;
  }

  document.addEventListener("change", ev => {
    const inp = ev.target.closest("[data-prazo]");
    if (!inp) return;
    if (inp.value) estado.prazos[inp.dataset.prazo] = inp.value;
    else delete estado.prazos[inp.dataset.prazo];
    salvar();
    renderTela();
    avisar(inp.value ? "Prazo definido." : "Prazo removido.");
  });

  document.addEventListener("click", ev => {
    const b = ev.target.closest("[data-limpar-prazo]");
    if (!b) return;
    delete estado.prazos[b.dataset.limparPrazo];
    salvar();
    renderTela();
  });

  function proximosPrazos() {
    const itens = [];
    for (const [chave, iso] of Object.entries(estado.prazos)) {
      const [tipo, id] = [chave.slice(0, 1), chave.slice(2)];
      if (tipo === "r" && RAIZ[id]) {
        const p = progressoRaiz(RAIZ[id]);
        if (p.completa) continue;
        itens.push({ iso, raiz: RAIZ[id], titulo: RAIZ[id].titulo, contexto: `Raiz · ${p.feitos}/${p.total} exercícios`, href: `#/raiz/${id}` });
      } else if (tipo === "e" && EXERCICIO[id] && !feito(id)) {
        const { ex, raiz } = EXERCICIO[id];
        itens.push({ iso, raiz, titulo: ex.titulo, contexto: raiz.titulo, href: `#/ex/${id}` });
      }
    }
    return itens.sort((a, b) => a.iso.localeCompare(b.iso));
  }

  function proximoExercicio() {
    for (const raiz of RAIZES.filter(liberada)) {
      for (const ram of raiz.ramificacoes || []) {
        const ex = (ram.exercicios || []).find(e => !feito(e.id));
        if (ex) return { ex, ram, raiz };
      }
    }
    return null;
  }

  // ---------- Navegação (rotas por #hash) ----------

  let rotaAtual = { tela: "inicio", id: null };

  function lerRota() {
    const [, tela = "inicio", id = null] = location.hash.replace(/^#/, "").split("/");
    const validas = ["inicio", "raizes", "raiz", "ex", "tocar", "metodos", "metodo", "diario", "ajustes"];
    rotaAtual = validas.includes(tela) ? { tela, id: id && decodeURIComponent(id) } : { tela: "inicio", id: null };
    if (rotaAtual.tela === "raiz" && !RAIZ[rotaAtual.id]) rotaAtual = { tela: "raizes", id: null };
    if (rotaAtual.tela === "ex" && !EXERCICIO[rotaAtual.id]) rotaAtual = { tela: "raizes", id: null };
    if (rotaAtual.tela === "metodo" && !LIVROS[rotaAtual.id]) rotaAtual = { tela: "metodos", id: null };
    if (rotaAtual.tela === "ex" && !liberada(EXERCICIO[rotaAtual.id].raiz)) rotaAtual = { tela: "raiz", id: EXERCICIO[rotaAtual.id].raiz.id };
  }

  function mostrarTela() {
    const telaId = { ex: "exercicio", metodo: "metodos" }[rotaAtual.tela] || rotaAtual.tela;
    document.querySelectorAll(".tela").forEach(t => t.classList.toggle("ativa", t.id === `tela-${telaId}`));
    const aba = { raiz: "raizes", ex: "raizes", metodo: "metodos" }[rotaAtual.tela] || rotaAtual.tela;
    document.querySelectorAll(".abas a").forEach(a => a.classList.toggle("ativa", a.dataset.aba === aba));
  }

  function renderTela() {
    switch (rotaAtual.tela) {
      case "inicio": renderInicio(); break;
      case "raizes": renderRaizes(); break;
      case "raiz": renderRaiz(RAIZ[rotaAtual.id]); break;
      case "ex": renderExercicio(rotaAtual.id); renderGravador(rotaAtual.id); break;
      case "tocar": renderTocar(); break;
      case "metodos": renderMetodos(); break;
      case "metodo": renderMetodo(rotaAtual.id); break;
      case "diario": renderDiario(); break;
      case "ajustes": renderAjustes(); break;
    }
  }

  window.addEventListener("hashchange", () => {
    if (grav.gravando) pararGravacao();
    lerRota(); mostrarTela(); renderTela(); window.scrollTo(0, 0);
  });

  // ---------- Início ----------

  function minutosPorDia() {
    const mapa = {};
    for (const s of estado.sessoes) mapa[s.data] = (mapa[s.data] || 0) + s.minutos;
    return mapa;
  }

  function calcularSequencia(mapa) {
    const d = new Date();
    if (!mapa[dataISO(d)]) d.setDate(d.getDate() - 1); // ainda dá tempo de praticar hoje
    let dias = 0;
    while (mapa[dataISO(d)]) { dias++; d.setDate(d.getDate() - 1); }
    return dias;
  }

  // Diagrama do percurso: um saxofone de onde nascem as raízes.
  // Cada raiz se preenche com a sua cor conforme o progresso do aluno.
  function arvoreSVG() {
    const n = RAIZES.length || 1;
    const larg = 340, origem = { x: 170, y: 142 };
    const pontas = RAIZES.map((_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      return { x: 34 + t * (larg - 68), y: 236 };
    });
    const raizes = RAIZES.map((raiz, i) => {
      const { x, y } = pontas[i];
      const d = `M${origem.x} ${origem.y} C${origem.x} ${origem.y + 50}, ${x} ${y - 70}, ${x} ${y}`;
      const p = progressoRaiz(raiz);
      return `<a href="#/raiz/${encodeURIComponent(raiz.id)}" aria-label="Raiz ${i + 1}: ${escapar(raiz.titulo)}, ${p.pct}% concluída" style="color:${escapar(raiz.cor)}">
        <path d="${d}" class="raiz-base"/>
        ${p.pct ? `<path d="${d}" pathLength="100" class="raiz-cor" stroke-dasharray="${p.pct} 100"/>` : ""}
        <circle cx="${x}" cy="${y}" r="7" class="pulso-no" style="animation-delay:${(i * 0.35).toFixed(2)}s"/>
        <circle cx="${x}" cy="${y}" r="16" class="alvo-toque"/>
        <circle cx="${x}" cy="${y}" r="7" class="${p.feitos ? "no cheio" : "no"}"/>
        <text x="${x}" y="${y + (i % 2 ? 62 : 28)}" text-anchor="middle" class="raiz-nome">${escapar(raiz.curto || raiz.titulo)}</text>
        <text x="${x}" y="${y + (i % 2 ? 77 : 43)}" text-anchor="middle" class="raiz-pct">${p.pct}%</text>
        ${i % 2 ? `<line x1="${x}" y1="${y + 11}" x2="${x}" y2="${y + 47}" class="raiz-guia"/>` : ""}
      </a>`;
    }).join("");
    const chaves = [[161, 68], [159, 82], [157, 96], [155, 110], [153, 123]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" class="sax-chave"/>`).join("");
    return `<svg viewBox="0 0 ${larg} 330" role="img" style="--sobe:-18px" aria-label="Seu percurso: um saxofone e as seis raízes do CMA">
      <defs>
        <linearGradient id="latao" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fbe3a4"/><stop offset=".45" stop-color="#d9a547"/><stop offset="1" stop-color="#8a5a1c"/>
        </linearGradient>
        <radialGradient id="brilho-sax" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#d4a24c" stop-opacity=".35"/><stop offset="1" stop-color="#d4a24c" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <g transform="translate(0 -18)"><circle cx="166" cy="96" r="96" fill="url(#brilho-sax)"/>
      <g class="sax" fill="none" stroke-linecap="round">
        <path d="M162 52C162 36 146 26 128 30" stroke="url(#latao)" stroke-width="6"/>
        <path d="M128 30L113 35.5" stroke="#18181d" stroke-width="8.5"/>
        <path d="M126 27.5l3 6.5" stroke="#f6d58b" stroke-width="2.2"/>
        <path d="M162 52C160 86 152 112 152 132" stroke="url(#latao)" stroke-width="15"/>
        <path d="M152 132C152 164 189 164 189 134" stroke="url(#latao)" stroke-width="19"/>
        <path d="M189 134C190 116 193 101 198 90" stroke="url(#latao)" stroke-width="22"/>
        <path d="M163 56l-11 70" stroke="#fff3cf" stroke-opacity=".45" stroke-width="2"/>
        <ellipse cx="202" cy="82" rx="20" ry="8.5" transform="rotate(-18 202 82)" fill="url(#latao)"/>
        <ellipse cx="202.5" cy="81.5" rx="14.5" ry="5" transform="rotate(-18 202.5 81.5)" fill="#2a1d09"/>
        ${chaves}
        <circle cx="186" cy="120" r="3.6" class="sax-chave"/>
        <path d="M168 60c6 4 6 12 4 18" stroke="#b7863a" stroke-width="2"/>
      </g></g>
      ${raizes}
    </svg>`;
  }

  // Letreiros: frase do dia e rádio
  function montarLetreiroFrases(diaDoAno) {
    const faixa = $("#letreiro-faixa");
    if (!faixa || faixa.dataset.dia === String(diaDoAno)) return;
    faixa.dataset.dia = String(diaDoAno);
    const ordem = Array.from({ length: Math.min(FRASES.length, 6) }, (_, i) => FRASES[(diaDoAno + i) % FRASES.length]);
    const bloco = ordem.map(f => `<span class="letreiro-item">${escapar(f)}</span><span class="letreiro-sep">✦</span>`).join("");
    faixa.innerHTML = bloco + bloco;
    faixa.style.setProperty("--duracao", `${Math.max(34, ordem.join(" ").length * 0.34)}s`);
  }

  function atualizarLetreiroRadio() {
    const faixa = $("#letreiro-radio-faixa");
    if (!faixa) return;
    const tocando = typeof radio !== "undefined" && (radio.tocando || radio.carregando);
    const texto = tocando
      ? `Tocando agora: ${radio.estacao ? radio.estacao.nome : "Rádio CMA"} · toque para trocar de estação · `
      : "Rádio CMA · toque aqui para ouvir jazz e música brasileira ao vivo enquanto estuda · ";
    if (faixa.dataset.texto === texto) return;
    faixa.dataset.texto = texto;
    faixa.innerHTML = `<span>${escapar(texto)}</span><span>${escapar(texto)}</span>`;
    const bt = $("#letreiro-radio");
    bt.classList.toggle("tocando", tocando);
    const pl = bt.querySelector(".letreiro-radio-play");
    if (pl) pl.innerHTML = icone(tocando ? "pause" : "play");
    bt.setAttribute("aria-label", tocando ? `Rádio CMA tocando ${radio.estacao ? radio.estacao.nome : ""}. Toque para trocar de estação` : "Rádio CMA: toque para ouvir");
  }

  function renderCartaoGratis() {
    const c = $("#cartao-gratis");
    if (!c) return;
    c.hidden = !temBloqueio();
    const a = c.querySelector("[data-conhecer]");
    if (a) a.href = urlConhecer();
  }

  function renderInicio() {
    renderCartaoGratis();
    renderLembreteBackup();
    const hora = new Date().getHours();
    const cumprimento = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    $("#saudacao").textContent = estado.nome ? `${cumprimento}, ${estado.nome}.` : `${cumprimento}.`;
    $("#hero-data").textContent = maiuscula(new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }));
    const diaDoAno = Math.floor(deISO(hojeISO()) / 864e5);
    $("#frase-dia").textContent = FRASES[diaDoAno % FRASES.length];
    montarLetreiroFrases(diaDoAno);
    atualizarLetreiroRadio();

    const totalFeitos = Object.keys(estado.feitos).filter(id => EXERCICIO[id]).length;
    const pctTotal = TOTAL_EXERCICIOS ? Math.round((totalFeitos / TOTAL_EXERCICIOS) * 100) : 0;
    $("#arvore").innerHTML = arvoreSVG() + `<span class="dica-toque">${icone("seta")}Toque numa raiz para abrir</span>`;
    $("#percurso-pct").textContent = `${pctTotal}%`;
    $("#arvore-legenda").textContent = pctTotal === 0
      ? "Comece pela Escuta: cada exercício concluído aprofunda uma raiz."
      : pctTotal === 100 ? "Percurso completo. Todas as raízes do CMA foram trabalhadas."
      : `${totalFeitos} de ${TOTAL_EXERCICIOS} exercícios concluídos.`;

    renderEstudoDia();

    const mapa = minutosPorDia();
    const inicioSemana = segunda(new Date());
    let totalSemana = 0;
    let html = "";
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicioSemana); d.setDate(d.getDate() + i);
      const iso = dataISO(d);
      const min = mapa[iso] || 0;
      totalSemana += min;
      html += `<div class="dia${min ? " praticou" : ""}${iso === hojeISO() ? " hoje" : ""}"><div class="dia-ponto" title="${min} min"><span style="height:${Math.min(100, Math.round((min / Math.max(5, estado.metaSemanal / 7)) * 100))}%"></span></div>${DIAS_CURTOS[i]}</div>`;
    }
    $("#semana").innerHTML = html;

    $("#stat-semana").textContent = totalSemana;
    $("#stat-sequencia").textContent = calcularSequencia(mapa);
    $("#stat-exercicios").textContent = `${totalFeitos}/${TOTAL_EXERCICIOS}`;

    const pct = Math.min(100, Math.round((totalSemana / estado.metaSemanal) * 100));
    $("#meta-barra").style.width = pct + "%";
    $("#meta-texto").textContent = `${totalSemana} / ${estado.metaSemanal} min` + (pct >= 100 ? " · meta batida" : "");

    const prazos = proximosPrazos().slice(0, 5);
    $("#prazos-vazio").hidden = prazos.length > 0;
    $("#lista-prazos").innerHTML = prazos.map(p => {
      const s = statusPrazo(p.iso, false);
      return `<li><a class="prazo-item" href="${p.href}" style="${corRaiz(p.raiz)}">
        <span class="mini-ilus">${ilustracao(p.raiz.icone)}</span>
        <span class="prazo-texto"><strong>${escapar(p.titulo)}</strong><span class="mudo">${escapar(p.contexto)} · ${escapar(deISO(p.iso).toLocaleDateString("pt-BR"))}</span></span>
        <span class="selo ${s.classe}">${escapar(s.texto)}</span>
      </a></li>`;
    }).join("");

    if (PROFESSOR.nome) $("#btn-relatorio").textContent = `Enviar relatório para ${PROFESSOR.nome.split(" ")[0]}`;

    renderTimer();
  }

  // ---------- Raízes ----------

  function renderRaizes() {
    $("#lista-raizes").innerHTML = RAIZES.map((raiz, i) => {
      const p = progressoRaiz(raiz);
      if (!liberada(raiz)) return `<a class="raiz-card bloqueada" href="#/raiz/${encodeURIComponent(raiz.id)}" style="${corRaiz(raiz)}">
        <span class="raiz-card-ilus">${ilustracao(raiz.icone)}</span>
        <span class="raiz-num">${dois(i + 1)}</span>
        <span class="raiz-titulo">${escapar(raiz.titulo)}</span>
        <span class="raiz-resumo">${escapar(raiz.resumo)}</span>
        <span class="raiz-rodape"><span class="selo-bloqueio">${icone("cadeado")}Método completo</span></span>
      </a>`;
      return `<a class="raiz-card" href="#/raiz/${encodeURIComponent(raiz.id)}" style="${corRaiz(raiz)}">
        <span class="raiz-card-ilus">${ilustracao(raiz.icone)}</span>
        <span class="raiz-num">${dois(i + 1)}</span>
        <span class="raiz-titulo">${escapar(raiz.titulo)}</span>
        <span class="raiz-resumo">${escapar(raiz.resumo)}</span>
        <span class="raiz-rodape">
          <span class="barra clara"><span class="barra-preenchida" style="width:${p.pct}%"></span></span>
          <span class="raiz-contagem">${p.completa ? "Completa" : `${p.feitos}/${p.total}`}</span>
        </span>
        ${seloPrazo("r:" + raiz.id, p.completa)}
      </a>`;
    }).join("") || `<p class="vazio">Nenhuma raiz publicada ainda.</p>`;
  }

  function htmlReferencias(refs) {
    const validas = (refs || []).map(r => ({ ...r, href: urlReferencia(r) })).filter(r => r.href);
    if (!validas.length) return "";
    return `<div class="referencias"><h4>${icone("nota")}Ouça as referências</h4><div class="ref-grade">${validas.map(r => {
      const link = `<a class="ref" href="${escapar(r.href)}" target="_blank" rel="noopener">
        ${icone(r.busca && !r.url ? "youtube" : "externo", "ref-ic")}
        <span class="ref-texto"><strong>${escapar(r.titulo)}</strong>${r.detalhe ? `<span>${escapar(r.detalhe)}</span>` : ""}</span>
      </a>`;
      const mats = (temBloqueio() ? [] : r.material || []).map(m => ({ ...m, href: urlSegura(urlArquivo(m.arquivo)) })).filter(m => m.href);
      if (!mats.length) return link;
      return `<div class="ref-bloco">${link}<div class="ref-material">${mats.map(m =>
        `<a href="${escapar(m.href)}" target="_blank" rel="noopener">${icone(/playback/i.test(m.rotulo) ? "nota" : "pdf")}${escapar(m.rotulo)}</a>`).join("")}</div></div>`;
    }).join("")}</div></div>`;
  }

  // Lista "página tal → assunto". mostrarRamo: true = "Raiz › Ramificação", "ramo" = só a ramificação.
  function htmlIndicacoes(lista, { mostrarRamo = false, mostrarLivro = true } = {}) {
    return `<ul class="indicacoes">${lista.map(i => {
      const livro = LIVROS[i.livro];
      const href = urlSegura(urlArquivo(livro.arquivo));
      const ramo = RAMO[i.ramo];
      const legenda = [mostrarLivro ? nomeLivro(livro) : "", mostrarRamo === "ramo" ? ramo.ram.titulo : mostrarRamo ? `${ramo.raiz.titulo} › ${ramo.ram.titulo}` : ""].filter(Boolean).join(" — ");
      const miolo = `<span class="ind-onde">${escapar(i.onde)}</span>
        <span class="ind-texto"><strong>${escapar(i.assunto)}</strong>${legenda ? `<span>${escapar(legenda)}</span>` : ""}</span>
        ${href ? icone("externo", "ind-seta") : ""}`;
      return `<li>${href ? `<a class="indicacao" href="${escapar(href)}" target="_blank" rel="noopener">${miolo}</a>` : `<div class="indicacao">${miolo}</div>`}</li>`;
    }).join("")}</ul>`;
  }

  // Mesma lista, agrupada por método: o nome do método abre o PDF, cada linha diz "onde → assunto".
  function htmlIndicacoesPorLivro(lista) {
    const grupos = new Map();
    for (const i of lista) {
      if (!grupos.has(i.livro)) grupos.set(i.livro, []);
      grupos.get(i.livro).push(i);
    }
    return [...grupos].map(([chave, itens]) => {
      const l = LIVROS[chave];
      const href = urlSegura(urlArquivo(l.arquivo));
      const nome = `${icone("pdf")}<span>${escapar(l.titulo)}${l.autor ? `<small>${escapar(l.autor)}</small>` : ""}</span>`;
      return `<div class="ind-grupo">
        ${href ? `<a class="ind-livro" href="${escapar(href)}" target="_blank" rel="noopener">${nome}${icone("externo", "material-seta")}</a>` : `<div class="ind-livro">${nome}</div>`}
        <ul class="ind-linhas">${itens.map(i => `<li><span class="ind-onde">${escapar(i.onde)}</span><span>${escapar(i.assunto)}</span></li>`).join("")}</ul>
      </div>`;
    }).join("");
  }

  function htmlNosMetodos(ramId, aberto) {
    const lista = indicacoesDoRamo(ramId);
    const pasta = urlSegura(urlPasta(PASTAS.ramificacao[ramId]));
    if (!lista.length && !pasta) return "";
    const livros = new Set(lista.map(i => i.livro)).size;
    return `<details class="nos-metodos"${aberto ? " open" : ""}>
      <summary>${icone("livro")}<span><strong>Nos métodos</strong><span class="mudo">${lista.length
        ? `${lista.length} ${lista.length === 1 ? "indicação" : "indicações"} em ${livros} ${livros === 1 ? "método" : "métodos"}`
        : "Materiais na pasta do Drive"}</span></span>${icone("seta", "nos-seta")}</summary>
      ${lista.length ? `<p class="dica">Toque no nome do método para abrir o PDF e vá direto à página ou ao exercício indicado.</p>${htmlIndicacoesPorLivro(lista)}` : ""}
      ${pasta ? `<a class="material" href="${escapar(pasta)}" target="_blank" rel="noopener">${icone("pasta")}<span>Pasta desta ramificação no Drive</span>${icone("externo", "material-seta")}</a>` : ""}
    </details>`;
  }

  function htmlDrive(raiz) {
    const pasta = urlSegura(urlPasta(PASTAS.raiz[raiz.id]));
    const ramos = new Set((raiz.ramificacoes || []).map(r => r.id));
    const contagem = {};
    for (const i of INDICACOES) if (ramos.has(i.ramo)) contagem[i.livro] = (contagem[i.livro] || 0) + 1;
    const livros = Object.keys(contagem).sort((a, b) => contagem[b] - contagem[a]);
    const cabeca = `<h2>${icone("livro")}Métodos desta raiz</h2>`;
    const resumo = `<summary class="drive-topo">${icone("livro")}<span><strong>Métodos desta raiz</strong><small>${livros.length} ${livros.length === 1 ? "método" : "métodos"}${pasta ? " · pasta no Drive" : ""}</small></span>${icone("seta", "ram-seta")}</summary>`;
    if (!livros.length && !pasta) {
      return `<div class="cartao drive">${cabeca}<p class="mudo">Os métodos desta raiz serão publicados em breve pelo professor.</p></div>`;
    }
    return `<details class="cartao drive">${resumo}
      ${livros.length ? `<p class="mudo">Em cada ramificação, a aba “Métodos” mostra a página exata de cada assunto.</p>
      <div class="livros-chips">${livros.map(k => `<a class="livro-chip" href="#/metodo/${encodeURIComponent(k)}">
        <strong>${escapar(LIVROS[k].autor || LIVROS[k].titulo)}</strong><span>${escapar(LIVROS[k].autor ? LIVROS[k].titulo : "")}</span><em>${contagem[k]}</em>
      </a>`).join("")}</div>` : ""}
      ${pasta ? `<a class="material" href="${escapar(pasta)}" target="_blank" rel="noopener">
        ${icone("pasta")}<span>Abrir a pasta desta raiz no Drive</span>${icone("externo", "material-seta")}
      </a>` : ""}
    </details>`;
  }

  // ---------- Biblioteca de métodos ----------

  let buscaMetodos = "";
  const semAcento = t => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  function renderMetodos() {
    const chaves = Object.keys(LIVROS);
    const contagem = k => INDICACOES.filter(i => i.livro === k).length;
    $("#metodos-conteudo").innerHTML = `
      <header class="cabecalho">
        <p class="sobretitulo">Biblioteca</p>
        <h1>Métodos</h1>
        <p class="mudo">Cada método tem muitos assuntos. Aqui você vê em que página está cada um e em qual raiz ele se encaixa.</p>
      </header>
      <div class="corpo-metodos">
        <label class="busca">${icone("busca")}<input type="search" id="busca-metodos" placeholder="Buscar assunto: staccato, terças, trinado…" value="${escapar(buscaMetodos)}" autocomplete="off"></label>
        <div id="busca-resultado"></div>
        ${(MET.acervo || []).length && temBloqueio() ? `<section class="cartao acervo"><h2>${icone("cadeado")}Acervo de partituras e playbacks</h2><p class="mudo">Partituras em Sib e Mib, mais de 600 músicas com playback, songbooks e métodos. Disponível no Método CMA completo.</p><a class="btn largo" href="${escapar(urlConhecer())}" target="_blank" rel="noopener">Conhecer o Método CMA</a>${htmlCodigo()}</section>` : ""}
        ${(MET.acervo || []).length && !temBloqueio() ? `<section class="cartao acervo"><h2>${icone("pasta")}Acervo de partituras e playbacks</h2><div class="acervo-lista">${MET.acervo.map(x => {
          const href = urlSegura(urlPasta(x.pasta));
          return href ? `<a class="acervo-item" href="${escapar(href)}" target="_blank" rel="noopener"><span><strong>${escapar(x.titulo)}</strong><small>${escapar(x.detalhe || "")}</small></span>${icone("externo")}</a>` : "";
        }).join("")}</div></section>` : ""}
        <div class="lista-livros" id="lista-livros">${chaves.map(k => {
          const l = LIVROS[k];
          return `<a class="livro" href="#/metodo/${encodeURIComponent(k)}">
            <span class="livro-ic">${icone("livro")}</span>
            <span class="livro-texto"><strong>${escapar(l.titulo)}</strong><span>${escapar(l.autor || "Material de apoio")}</span></span>
            <span class="livro-qtd">${contagem(k)}<small>assuntos</small></span>
          </a>`;
        }).join("")}</div>
        <p class="vazio-mini">Os PDFs abrem no Google Drive. Se aparecer “Acesso negado”, entre com o e-mail que você passou ao professor.</p>
      </div>`;
    aplicarBusca();
  }

  function aplicarBusca() {
    const termo = semAcento(buscaMetodos.trim());
    const alvo = $("#busca-resultado"), livros = $("#lista-livros");
    if (!alvo) return;
    if (termo.length < 2) { alvo.innerHTML = ""; livros.hidden = false; return; }
    const achados = INDICACOES.filter(i => {
      const l = LIVROS[i.livro], r = RAMO[i.ramo];
      return semAcento(`${i.assunto} ${l.titulo} ${l.autor} ${r.ram.titulo} ${r.raiz.titulo}`).includes(termo);
    });
    livros.hidden = true;
    alvo.innerHTML = achados.length
      ? `<p class="mudo">${achados.length} ${achados.length === 1 ? "resultado" : "resultados"}</p>${htmlIndicacoes(achados, { mostrarRamo: true })}`
      : `<p class="vazio-mini">Nada encontrado para “${escapar(buscaMetodos.trim())}”.</p>`;
  }

  $("#metodos-conteudo").addEventListener("input", ev => {
    if (ev.target.id !== "busca-metodos") return;
    buscaMetodos = ev.target.value;
    aplicarBusca();
  });

  function renderMetodo(chave) {
    const l = LIVROS[chave];
    const href = urlSegura(urlArquivo(l.arquivo));
    const lista = INDICACOES.filter(i => i.livro === chave);
    const porRaiz = RAIZES.map(raiz => ({ raiz, itens: lista.filter(i => RAMO[i.ramo].raiz === raiz) })).filter(g => g.itens.length);
    $("#metodos-conteudo").innerHTML = `<article>
      <header class="cabecalho">
        <a class="btn-voltar" href="#/metodos">${icone("voltar")}Métodos</a>
        <p class="sobretitulo">${escapar(l.autor || "Material de apoio")}</p>
        <h1>${escapar(l.titulo)}</h1>
        ${l.nota ? `<p class="mudo">${escapar(l.nota)}</p>` : ""}
      </header>
      <div class="corpo-metodos">
        ${href ? `<a class="btn primario largo" href="${escapar(href)}" target="_blank" rel="noopener">${icone("pdf")}Abrir o PDF</a>` : ""}
        ${porRaiz.map(({ raiz, itens }) => `<section class="cartao grupo-raiz" style="${corRaiz(raiz)}">
          <a class="grupo-topo" href="#/raiz/${encodeURIComponent(raiz.id)}"><span class="mini-ilus">${ilustracao(raiz.icone)}</span><h2>${escapar(raiz.titulo)}</h2>${icone("seta")}</a>
          ${htmlIndicacoes(itens, { mostrarLivro: false, mostrarRamo: "ramo" })}
        </section>`).join("")}
      </div>
    </article>`;
  }

  function anel(pct, rotulo) {
    return `<div class="anel">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle class="anel-fundo" cx="60" cy="60" r="50"/>
        <circle class="anel-valor" cx="60" cy="60" r="50" pathLength="100" stroke-dasharray="0 100" data-pct="${pct}"/>
      </svg>
      <span class="anel-texto"><strong>${pct}%</strong><small>${escapar(rotulo)}</small></span>
    </div>`;
  }

  // Material do acervo do Drive (acervo.js): indicados em cada ramificação e a aba Tocar junto
  const ACERVO_DADOS = window.CMA_ACERVO || {};
  const ACERVO = ACERVO_DADOS.ramos || {};
  const TOCAR = ACERVO_DADOS.tocar || [];
  const GENEROS = ACERVO_DADOS.generos || [];

  function chipsMusica(itens) {
    const sax = estado.sax;
    return (itens || []).filter(i => !sax || i.r === sax || i.r === "Playback" || i.r === "Partitura").map(i => {
      const href = urlSegura(urlArquivo(i.id));
      return href ? `<a href="${escapar(href)}" target="_blank" rel="noopener">${icone(i.r === "Playback" ? "nota" : "pdf")}${escapar(i.r)}</a>` : "";
    }).join("");
  }

  function htmlAcervoRamo(ramoId) {
    const d = ACERVO[ramoId];
    if (!d || temBloqueio()) return "";
    const itens = (d.indicados || []).map(x => {
      if (x.tipo === "musica") return `<li><span class="ind-num"></span><span class="ind-texto"><strong>${escapar(x.t)}</strong><span class="ref-material">${chipsMusica(x.itens)}</span></span></li>`;
      const href = urlSegura(x.tipo === "pasta" ? urlPasta(x.id) : urlArquivo(x.id));
      return href ? `<li><span class="ind-num"></span><a class="ind-texto" href="${escapar(href)}" target="_blank" rel="noopener"><strong>${escapar(x.t)}</strong><small>${x.tipo === "pasta" ? "Play-along ou coleção" : "PDF"}</small></a></li>` : "";
    }).join("");
    const tocar = d.genero && TOCAR.some(t => t.g === d.genero)
      ? `<a class="ind-mais" href="#/tocar" data-genero="${escapar(d.genero)}">${icone("fone")}Mais play-alongs de ${escapar(d.genero.toLowerCase())} na aba Tocar junto${icone("seta")}</a>` : "";
    if (!itens && !tocar) return "";
    return `<div class="indicados"><h4>${icone("check")}Indicado pelo professor</h4>${itens ? `<ol class="ind-lista">${itens}</ol>` : ""}${tocar}</div>`;
  }

  let generoAberto = "";
  document.addEventListener("click", ev => {
    const a = ev.target.closest("[data-genero]");
    if (a) generoAberto = a.dataset.genero;
  });

  function renderTocar() {
    const alvo = $("#tocar-conteudo");
    const topo = `<header class="cabecalho"><p class="sobretitulo">Play-alongs</p><h1>Tocar junto</h1>
      <p class="mudo">Toque com a banda. Comece pelos indicados e escolha o seu sax para ver só a sua afinação.</p>
      <button class="btn pequeno" type="button" data-abrir-radio>${icone("radio")}Ouvir a Rádio CMA</button></header>`;
    if (temBloqueio()) {
      alvo.innerHTML = topo + `<div class="corpo-metodos"><section class="cartao acervo"><h2>${icone("cadeado")}Mais de 40 coleções de play-along</h2>
        <p class="mudo">Choro, bossa nova, MPB, jazz, blues e baladas, com playback para tocar junto. Disponível no Método CMA completo.</p>
        <a class="btn largo" href="${escapar(urlConhecer())}" target="_blank" rel="noopener">Conhecer o Método CMA</a>${htmlCodigo()}</section></div>`;
      return;
    }
    const sax = estado.sax;
    const serve = t => !sax || !t.afin.length || t.afin.includes(sax);
    const filtro = `<div class="filtro-sax" role="group" aria-label="Meu saxofone">
      ${[["", "Todos"], ["Mib", "Alto · Mib"], ["Sib", "Tenor · Sib"]].map(([v, r]) => `<button type="button" data-sax="${v}" class="${sax === v ? "ativo" : ""}" aria-pressed="${sax === v}">${r}</button>`).join("")}</div>`;
    const ocultos = TOCAR.filter(t => !serve(t)).length;
    const secoes = GENEROS.map(g => {
      const lista = TOCAR.filter(t => t.g === g && serve(t)).sort((a, b) => (b.ind ? 1 : 0) - (a.ind ? 1 : 0));
      if (!lista.length) return "";
      return `<details class="cartao genero"${generoAberto === g || (!generoAberto && g === GENEROS[0]) ? " open" : ""}><summary><h2>${escapar(g)}</h2><small>${lista.length}</small></summary>
        <ul class="tocar-lista">${lista.map(t => {
          const href = urlSegura(urlPasta(t.id));
          return href ? `<li><a href="${escapar(href)}" target="_blank" rel="noopener"><span class="tocar-texto"><strong>${escapar(t.t)}</strong>
            <span class="tocar-tags">${t.ind ? `<span class="tag ind">Indicado</span>` : ""}${(t.afin.length ? t.afin : ["Áudio e partituras"]).map(a => `<span class="tag">${escapar(a)}</span>`).join("")}</span></span>${icone("externo")}</a></li>` : "";
        }).join("")}</ul></details>`;
    }).join("");
    alvo.innerHTML = topo + `<div class="corpo-metodos">${filtro}
      ${ocultos ? `<p class="vazio-mini">${ocultos} ${ocultos === 1 ? "coleção em outra afinação está oculta" : "coleções em outras afinações estão ocultas"}.</p>` : ""}
      ${secoes}
      <p class="vazio-mini">Os play-alongs abrem no Google Drive. Se aparecer “Acesso negado”, entre com o e-mail que você passou ao professor.</p></div>`;
    generoAberto = "";
  }

  $("#tocar-conteudo").addEventListener("click", ev => {
    const b = ev.target.closest("[data-sax]");
    if (!b) return;
    estado.sax = b.dataset.sax;
    salvar();
    renderTocar();
  });

  function renderRaizBloqueada(raiz) {
    const indice = RAIZES.indexOf(raiz);
    const exs = exerciciosDaRaiz(raiz).length;
    $("#raiz-conteudo").innerHTML = `<article style="${corRaiz(raiz)}">
      <header class="banda">
        <a class="btn-voltar" href="#/raizes">${icone("voltar")}Raízes</a>
        <span class="banda-ilus">${ilustracao(raiz.icone)}</span>
        <p class="banda-sobre">Raiz ${dois(indice + 1)} / ${dois(RAIZES.length)}</p>
        <h1>${escapar(raiz.titulo)}</h1>
        ${raiz.frase ? `<p class="banda-frase">${escapar(raiz.frase)}</p>` : ""}
      </header>
      <div class="corpo">
        <div class="cartao bloqueio">
          <span class="bloqueio-ic">${icone("cadeado")}</span>
          <h2>Esta raiz faz parte do Método CMA completo</h2>
          <p class="mudo">${escapar(raiz.porQue || raiz.descricao || raiz.resumo)}</p>
          <ul class="bloqueio-lista">${(raiz.ramificacoes || []).map(ram => `<li>${escapar(ram.titulo)}</li>`).join("")}</ul>
          <p class="mudo">${(raiz.ramificacoes || []).length} ramificações · ${exs} exercícios com metrônomo e prazos · aulas em vídeo</p>
          <a class="btn primario largo" href="${escapar(urlConhecer())}" target="_blank" rel="noopener">Conhecer o Método CMA</a>
          ${htmlCodigo()}
        </div>
      </div>
    </article>`;
  }

  function animarAneis() {
    requestAnimationFrame(() => requestAnimationFrame(() =>
      document.querySelectorAll(".anel-valor[data-pct]").forEach(c => c.setAttribute("stroke-dasharray", `${c.dataset.pct} 100`))));
  }

  function renderRaiz(raiz) {
    if (!liberada(raiz)) return renderRaizBloqueada(raiz);
    const proxId = (exerciciosDaRaiz(raiz).find(e => !feito(e.id)) || {}).id;
    setTimeout(animarAneis, 0);
    const indice = RAIZES.indexOf(raiz);
    const p = progressoRaiz(raiz);
    const proxima = RAIZES[indice + 1];
    $("#raiz-conteudo").innerHTML = `<article style="${corRaiz(raiz)}">
      <header class="banda">
        <a class="btn-voltar" href="#/raizes">${icone("voltar")}Raízes</a>
        <span class="banda-ilus">${ilustracao(raiz.icone)}</span>
        <p class="banda-sobre">Raiz ${dois(indice + 1)} / ${dois(RAIZES.length)}</p>
        <h1>${escapar(raiz.titulo)}</h1>
        ${raiz.frase ? `<p class="banda-frase">${escapar(raiz.frase)}</p>` : ""}
      </header>

      <div class="corpo">
        <div class="cartao por-que">
          <h2>${icone("lampada")}Por que esta raiz importa</h2>
          <p>${escapar(raiz.porQue || raiz.descricao || raiz.resumo)}</p>
        </div>

        <div class="cartao progresso-raiz">
          ${anel(p.pct, `${p.feitos} de ${p.total}`)}
          <div class="progresso-lado">
            ${campoPrazo("r:" + raiz.id, "Meu prazo para esta raiz")}
            ${seloPrazo("r:" + raiz.id, p.completa)}
          </div>
        </div>

        ${htmlDrive(raiz)}

        <h2 class="secao">Ramificações</h2>
        ${(raiz.ramificacoes || []).map((ram, j) => {
          const exs = ram.exercicios || [];
          const fe = exs.filter(e => feito(e.id)).length;
          const aberta = exs.some(e => e.id === proxId) || (!proxId && j === 0);
          const abas = [["ouvir", "Ouvir", htmlReferencias(ram.referencias)], ["metodos", "Métodos", htmlNosMetodos(ram.id, true)], ["material", "Material", htmlAcervoRamo(ram.id)]].filter(a => a[2]);
          return `<details class="cartao ramificacao"${aberta ? " open" : ""}>
          <summary class="ram-topo">
            <span class="ram-cab"><span class="ram-num">Ramificação ${dois(j + 1)}</span><h3>${escapar(ram.titulo)}</h3></span>
            <span class="ram-cont${fe === exs.length && exs.length ? " completa" : ""}">${fe}/${exs.length}</span>${icone("seta", "ram-seta")}
          </summary>
          ${ram.descricao ? `<p class="mudo">${escapar(ram.descricao)}</p>` : ""}
          <div class="exercicios">
            ${(ram.exercicios || []).map(ex => `<a class="exercicio-item ${feito(ex.id) ? "feito" : ""}${ex.id === proxId ? " proximo" : ""}" href="#/ex/${encodeURIComponent(ex.id)}">
              <span class="check">${feito(ex.id) ? icone("check") : ""}</span>
              <span class="exercicio-nome"><strong>${escapar(ex.titulo)}</strong>${ex.andamento ? `<span class="mudo">${icone("metronomo")}${ex.andamento.inicial} → ${ex.andamento.alvo} bpm</span>` : ""}</span>
              ${seloPrazo("e:" + ex.id, feito(ex.id))}
              ${icone("seta", "seta")}
            </a>`).join("")}
          </div>
          ${abas.length ? `<div class="ram-abas" role="tablist">${abas.map((a, k) => `<button type="button" role="tab" class="${k ? "" : "ativa"}" data-aba-ram="${a[0]}" aria-selected="${!k}">${a[1]}</button>`).join("")}</div>
          ${abas.map((a, k) => `<div class="ram-painel" data-painel="${a[0]}"${k ? " hidden" : ""}>${a[2]}</div>`).join("")}` : ""}
        </details>`;
        }).join("")}

        ${proxima ? `<a class="proxima" href="#/raiz/${encodeURIComponent(proxima.id)}" style="${corRaiz(proxima)}">
          <span class="mini-ilus">${ilustracao(proxima.icone)}</span>
          <span><span class="mudo">Próxima raiz</span><strong>${escapar(proxima.titulo)}</strong></span>
          ${icone("seta")}
        </a>` : ""}
      </div>
    </article>`;
  }

  // ---------- Exercício ----------

  function renderExercicio(id) {
    const { ex, ram, raiz } = EXERCICIO[id];
    const concluido = estado.feitos[id];

    let andamento = "";
    if (ex.andamento) {
      const { inicial, alvo } = ex.andamento;
      const atual = estado.andamentos[id] || inicial;
      const progride = alvo > inicial;
      const pct = progride ? limitar(Math.round(((atual - inicial) / (alvo - inicial)) * 100), 0, 100) : 100;
      andamento = `<div class="cartao andamento">
        <h2>${icone("metronomo")}Andamento</h2>
        <div class="velocimetro">
          <div><span class="vel-rotulo">Início</span><strong>${inicial}</strong><span class="vel-nome">${nomeAndamento(inicial)}</span></div>
          <div class="vel-atual"><span class="vel-rotulo">Você está em</span><strong>${atual}</strong><span class="vel-nome">${nomeAndamento(atual)}</span></div>
          <div><span class="vel-rotulo">Alvo</span><strong>${alvo}</strong><span class="vel-nome">${nomeAndamento(alvo)}</span></div>
        </div>
        ${progride ? `<div class="barra grossa"><div class="barra-preenchida" style="width:${pct}%"></div></div>` : ""}
        <p class="dica">${progride
          ? "Comece devagar e suba de pouco em pouco. Só aumente quando estiver limpo e relaxado: a velocidade é consequência."
          : `Mantenha ${alvo} bpm com calma, ouvindo cada detalhe do som.`}</p>
        <form class="andamento-form" id="form-andamento">
          <label>Meu andamento atual
            <input type="number" id="inp-andamento" min="20" max="300" value="${atual}" required>
          </label>
          <button class="btn" type="submit">Salvar</button>
        </form>
        <button class="btn primario largo" id="ex-metronomo">${icone("metronomo")}Abrir metrônomo a ${atual} bpm</button>
      </div>`;
    }

    $("#exercicio-conteudo").innerHTML = `<article style="${corRaiz(raiz)}">
      <header class="banda compacta">
        <a class="btn-voltar" href="#/raiz/${encodeURIComponent(raiz.id)}">${icone("voltar")}${escapar(raiz.titulo)}</a>
        <span class="banda-ilus">${ilustracao(raiz.icone)}</span>
        <p class="banda-sobre">${escapar(ram.titulo)}</p>
        <h1>${escapar(ex.titulo)}</h1>
        ${concluido ? `<span class="selo ok">${icone("check")}Concluído em ${escapar(deISO(concluido).toLocaleDateString("pt-BR"))}</span>` : ""}
      </header>

      <div class="corpo">
        ${ex.passos?.length ? `<div class="cartao">
          <h2>${icone("nota")}Como fazer</h2>
          <ol class="passos">${ex.passos.map(p => `<li><span>${escapar(p)}</span></li>`).join("")}</ol>
        </div>` : ""}

        ${andamento}

        <div class="cartao gravador" id="gravador">
          <h2>${icone("microfone")}Minhas gravações</h2>
          <p class="dica">Grave o exercício, ouça com atenção e compare com a primeira vez. É a forma mais rápida de perceber a sua evolução.</p>
          <div class="grav-controle">
            <button class="btn primario grav-btn" id="grav-btn" type="button">${icone("microfone")}Gravar</button>
            <div class="grav-status" id="grav-status" hidden><span class="grav-ponto"></span><span id="grav-tempo">0:00</span><span class="grav-nivel"><span id="grav-nivel"></span></span></div>
          </div>
          <div id="grav-lista"></div>
        </div>

        ${(ex.referencias || []).length ? `<div class="cartao">${htmlReferencias(ex.referencias)}</div>` : ""}

        ${indicacoesDoRamo(ram.id).length ? `<details class="cartao drive">
          <summary class="drive-topo">${icone("livro")}<span><strong>Onde estudar nos métodos</strong><small>${indicacoesDoRamo(ram.id).length} indicações · toque para ver</small></span>${icone("seta", "ram-seta")}</summary>
          <p class="dica">Assuntos de “${escapar(ram.titulo)}”. Toque no nome do método para abrir o PDF e vá à página ou ao exercício indicado.</p>
          ${htmlIndicacoesPorLivro(indicacoesDoRamo(ram.id))}
        </details>` : ""}

        <div class="cartao">
          ${campoPrazo("e:" + id, "Meu prazo para este exercício")}
          ${seloPrazo("e:" + id, !!concluido)}
        </div>

        <div class="barra-acoes">
          ${ex.andamento ? `<button class="btn acao-met" id="ex-metronomo-barra" aria-label="Metrônomo">${icone("metronomo")}</button>` : ""}
          <button class="btn ${concluido ? "" : "primario"}" id="ex-concluir">${icone("check")}${concluido ? "Desmarcar" : "Concluí"}</button>
          <button class="btn" id="ex-praticar">${icone("diario")}Registrar</button>
        </div>
      </div>
    </article>`;
  }

  $("#raiz-conteudo").addEventListener("click", ev => {
    const b = ev.target.closest("[data-aba-ram]");
    if (!b) return;
    const caixa = b.closest(".ramificacao");
    caixa.querySelectorAll("[data-aba-ram]").forEach(x => { const on = x === b; x.classList.toggle("ativa", on); x.setAttribute("aria-selected", on); });
    caixa.querySelectorAll(".ram-painel").forEach(pn => { pn.hidden = pn.dataset.painel !== b.dataset.abaRam; });
  });

  $("#exercicio-conteudo").addEventListener("click", async ev => {
    const id = rotaAtual.id;
    const alvo = ev.target.closest("button");
    if (!alvo) return;
    if (alvo.id === "ex-concluir") {
      if (estado.feitos[id]) {
        if (!(await confirmar("Desmarcar exercício?", "Ele volta a aparecer como pendente.", "Desmarcar"))) return;
        delete estado.feitos[id];
      } else {
        estado.feitos[id] = hojeISO();
        const raiz = EXERCICIO[id].raiz;
        if (progressoRaiz(raiz).completa) celebrar(`Raiz ${raiz.titulo} completa!`, "Todos os exercícios desta raiz foram concluídos.", "trofeu");
        else celebrar("Exercício concluído", EXERCICIO[id].ex.titulo, "check");
      }
      salvar(); renderTela();
    }
    if (alvo.id === "ex-praticar") abrirSessao(null, { raizId: EXERCICIO[id].raiz.id, exercicioId: id });
    if (alvo.id === "ex-metronomo" || alvo.id === "ex-metronomo-barra") {
      const ex = EXERCICIO[id].ex;
      abrirMetronomo(estado.andamentos[id] || ex.andamento.inicial, id);
    }
  });

  $("#exercicio-conteudo").addEventListener("submit", ev => {
    if (ev.target.id !== "form-andamento") return;
    ev.preventDefault();
    salvarAndamento(rotaAtual.id, Number($("#inp-andamento").value));
  });

  function salvarAndamento(exId, bpm) {
    const ex = EXERCICIO[exId]?.ex;
    if (!ex || !bpm) return;
    const anterior = estado.andamentos[exId] || ex.andamento?.inicial || 0;
    estado.andamentos[exId] = limitar(Math.round(bpm), 20, 300);
    estado.historicoBpm = estado.historicoBpm || {};
    const hist = (estado.historicoBpm[exId] = estado.historicoBpm[exId] || []);
    if (!hist.length && anterior && anterior !== estado.andamentos[exId]) hist.push({ d: hojeISO(), b: anterior });
    const ultimo = hist[hist.length - 1];
    if (ultimo && ultimo.d === hojeISO()) ultimo.b = estado.andamentos[exId];
    else hist.push({ d: hojeISO(), b: estado.andamentos[exId] });
    if (hist.length > 40) hist.splice(0, hist.length - 40);
    salvar();
    if (rotaAtual.tela === "ex") renderTela();
    if (ex.andamento && estado.andamentos[exId] >= ex.andamento.alvo && anterior < ex.andamento.alvo) {
      avisar("Andamento alvo alcançado.");
    } else {
      avisar(`Andamento salvo: ${estado.andamentos[exId]} bpm`);
    }
  }

  // ---------- Metrônomo ----------

  const met = { tocando: false, trocando: false, url: null, ultimaBatida: -1, ignorarPausaAte: 0, exId: null };
  const dlgMet = $("#dlg-metronomo");

  function renderMetronomo() {
    const { bpm, compasso } = estado.metronomo;
    $("#met-bpm").textContent = bpm;
    $("#met-nome").textContent = nomeAndamento(bpm);
    $("#met-slider").value = bpm;
    $("#met-compasso").value = String(compasso);
    $("#met-som").value = estado.metronomo.som || "analogico";
    $("#met-sub").value = String(estado.metronomo.sub || 1);
    $("#met-tocar").innerHTML = met.tocando ? `${icone("stop")}Parar` : `${icone("play")}Tocar`;
    $("#met-salvar-bpm").hidden = !met.exId;
    $("#met-pulsos").innerHTML = Array.from({ length: compasso }, (_, i) => `<span class="pulso${i === 0 ? " forte" : ""}"></span>`).join("");
  }

  function abrirMetronomo(bpm, exId = null) {
    if (bpm && Math.round(bpm) !== estado.metronomo.bpm) { estado.metronomo.bpm = limitar(Math.round(bpm), 30, 240); refazerLoop(); }
    met.exId = exId;
    renderMetronomo();
    dlgMet.showModal();
    renderMetMini();
  }

  function definirBpm(bpm) {
    estado.metronomo.bpm = limitar(Math.round(bpm), 30, 240);
    salvar();
    $("#met-bpm").textContent = estado.metronomo.bpm;
    $("#met-nome").textContent = nomeAndamento(estado.metronomo.bpm);
    $("#met-slider").value = estado.metronomo.bpm;
    const mb = $("#met-mini-bpm"); if (mb) mb.textContent = estado.metronomo.bpm;
    refazerLoop();
  }

  // ---------- Som do metrônomo ----------
  // O compasso é gravado num áudio WAV que toca em repetição num elemento <audio>.
  // Assim o iPhone trata o metrônomo como música: continua tocando com a janela
  // fechada, com o app em segundo plano, com a tela bloqueada e no modo silencioso.

  const TAXA = 44100;
  const amostras = {}; // { "analogico:forte": Float32Array, ... }

  function desenharTique(ctx, forte, vol) {
    const n = Math.floor(ctx.sampleRate * 0.06);
    const ruido = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 6);
    const src = ctx.createBufferSource(); src.buffer = ruido;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.value = forte ? 2600 : 1700; bp.Q.value = forte ? 9 : 7;
    const g = ctx.createGain();
    g.gain.setValueAtTime((forte ? 2.6 : 1.8) * vol, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.05);
    src.connect(bp).connect(g).connect(ctx.destination);
    // corpo de madeira: um "toc" grave bem curto
    const osc = ctx.createOscillator(), go = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(forte ? 900 : 620, 0);
    osc.frequency.exponentialRampToValueAtTime(forte ? 520 : 380, 0.03);
    go.gain.setValueAtTime(0.0001, 0);
    go.gain.exponentialRampToValueAtTime((forte ? 0.5 : 0.32) * vol, 0.002);
    go.gain.exponentialRampToValueAtTime(0.0001, 0.035);
    osc.connect(go).connect(ctx.destination);
    src.start(0); src.stop(0.06);
    osc.start(0); osc.stop(0.04);
  }

  function desenharBip(ctx, forte, fraco) {
    const osc = ctx.createOscillator(), ganho = ctx.createGain();
    osc.frequency.value = forte ? 1600 : 1000;
    ganho.gain.setValueAtTime(0.0001, 0);
    ganho.gain.exponentialRampToValueAtTime(fraco ? 0.22 : forte ? 0.9 : 0.55, 0.002);
    ganho.gain.exponentialRampToValueAtTime(0.0001, 0.06);
    osc.connect(ganho).connect(ctx.destination);
    osc.start(0); osc.stop(0.07);
  }

  // Gera os sons uma vez só (sem precisar de toque do usuário)
  const prontasAmostras = (async () => {
    const Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Off) return false;
    const tipos = [["analogico", "forte"], ["analogico", "normal"], ["analogico", "fraco"], ["digital", "forte"], ["digital", "normal"], ["digital", "fraco"]];
    try {
      for (const [som, tipo] of tipos) {
        const ctx = new Off(1, Math.floor(TAXA * 0.08), TAXA);
        if (som === "analogico") desenharTique(ctx, tipo === "forte", tipo === "fraco" ? 0.38 : 1);
        else desenharBip(ctx, tipo === "forte", tipo === "fraco");
        const buf = await new Promise((ok, erro) => {
          const r = ctx.startRendering();
          if (r && r.then) r.then(ok, erro); else ctx.oncomplete = e => ok(e.renderedBuffer);
        });
        amostras[`${som}:${tipo}`] = buf.getChannelData(0).slice();
      }
      return true;
    } catch { return false; }
  })();

  function wavDe(dados) {
    const n = dados.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const txt = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
    txt(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); txt(8, "WAVE"); txt(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, TAXA, true); v.setUint32(28, TAXA * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    txt(36, "data"); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, dados[i])) * 32767, true);
    return new Blob([buf], { type: "audio/wav" });
  }

  // Monta vários compassos (cerca de 30 s) para a emenda da repetição quase nunca aparecer
  function montarLoop() {
    const { bpm, compasso } = estado.metronomo;
    const sub = estado.metronomo.sub || 1;
    const som = (estado.metronomo.som || "analogico") === "digital" ? "digital" : "analogico";
    const tempoSeg = 60 / bpm;
    const compassoSeg = tempoSeg * compasso;
    const nCompassos = Math.max(1, Math.round(30 / compassoSeg));
    const total = Math.round(nCompassos * compassoSeg * TAXA);
    const dados = new Float32Array(total);
    const golpes = nCompassos * compasso * sub;
    for (let k = 0; k < golpes; k++) {
      const ini = Math.round((k * tempoSeg / sub) * TAXA);
      const noTempo = k % sub === 0;
      const tipo = !noTempo ? "fraco" : (k / sub) % compasso === 0 ? "forte" : "normal";
      const a = amostras[`${som}:${tipo}`];
      if (!a) continue;
      for (let i = 0; i < a.length && ini + i < total; i++) dados[ini + i] += a[i];
    }
    let pico = 0; for (let i = 0; i < total; i++) pico = Math.max(pico, Math.abs(dados[i]));
    if (pico > 0.95) { const f = 0.95 / pico; for (let i = 0; i < total; i++) dados[i] *= f; }
    return wavDe(dados);
  }

  const SILENCIO = "data:audio/wav;base64,UklGRsQPAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaAPAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";
  let audioMet = null;
  function elementoMetronomo() {
    if (audioMet) return audioMet;
    audioMet = new Audio();
    audioMet.loop = true;
    audioMet.preload = "auto";
    audioMet.setAttribute("playsinline", "");
    // Pausa vinda da tela de bloqueio ou dos fones: o app acompanha
    audioMet.addEventListener("pause", () => {
      if (!met.tocando || met.trocando || performance.now() < met.ignorarPausaAte) return;
      setTimeout(() => { if (met.tocando && audioMet.paused && !met.trocando && performance.now() >= met.ignorarPausaAte) pararMetronomo(); }, 200);
    });
    return audioMet;
  }

  async function carregarLoop() {
    const a = elementoMetronomo();
    await prontasAmostras;
    if (!met.tocando) return;
    const url = URL.createObjectURL(montarLoop());
    met.trocando = true;
    met.ignorarPausaAte = performance.now() + 1500;
    const antigo = met.url;
    met.url = url;
    a.src = url;
    try { await a.play(); } catch { met.trocando = false; avisar("Toque de novo em Tocar para liberar o som."); pararMetronomo(); return; }
    met.trocando = false;
    if (antigo) setTimeout(() => URL.revokeObjectURL(antigo), 2000);
    atualizarSessaoMet();
  }

  // Mudou o andamento, o compasso, a subdivisão ou o som com o metrônomo tocando
  let refazerT = null;
  function refazerLoop() {
    if (!met.tocando) return;
    clearTimeout(refazerT);
    refazerT = setTimeout(carregarLoop, 250);
  }

  function atualizarSessaoMet() {
    if (!("mediaSession" in navigator) || !met.tocando) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: `Metrônomo · ${estado.metronomo.bpm} bpm`, artist: "CMA", artwork: [{ src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }] });
      navigator.mediaSession.setActionHandler("pause", () => pararMetronomo());
      navigator.mediaSession.setActionHandler("stop", () => pararMetronomo());
      navigator.mediaSession.setActionHandler("play", null);
    } catch {}
  }

  // Luzes dos tempos acompanham o áudio
  function animarPulsos() {
    if (!met.tocando) return;
    const a = audioMet;
    if (a && !a.paused && !met.trocando) {
      const { bpm, compasso } = estado.metronomo;
      const batida = Math.floor(a.currentTime / (60 / bpm) + 0.02);
      if (batida !== met.ultimaBatida) {
        met.ultimaBatida = batida;
        const posicao = ((batida % compasso) + compasso) % compasso;
        document.querySelectorAll("#met-pulsos .pulso").forEach((p, i) => p.classList.toggle("ativo", i === posicao));
        const mini = $("#met-mini");
        if (mini && !mini.hidden) { mini.classList.remove("bate", "forte"); void mini.offsetWidth; mini.classList.add("bate"); if (posicao === 0) mini.classList.add("forte"); }
      }
    }
    requestAnimationFrame(animarPulsos);
  }

  function tocarMetronomo() {
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch {}
    const a = elementoMetronomo();
    met.tocando = true;
    met.ultimaBatida = -1;
    // destrava o elemento de áudio no próprio toque (exigência do iPhone)
    met.trocando = true;
    met.ignorarPausaAte = performance.now() + 1500;
    a.src = SILENCIO;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
    met.trocando = false;
    carregarLoop();
    requestAnimationFrame(animarPulsos);
    renderMetronomo();
    abaixarRadio(true);
    renderMetMini();
  }

  // Metrônomo em segundo plano: ao fechar a janela ele continua tocando,
  // e uma pílula no topo da tela mostra o andamento, abre de novo ou para.
  function renderMetMini() {
    const mini = $("#met-mini");
    if (!mini) return;
    mini.hidden = !(met.tocando && !dlgMet.open);
    $("#met-mini-bpm").textContent = estado.metronomo.bpm;
    const dica = $("#met-dica-fundo");
    if (dica) dica.hidden = !met.tocando;
  }

  function pararMetronomo() {
    met.tocando = false;
    clearTimeout(refazerT);
    if (audioMet) { met.trocando = true; try { audioMet.pause(); } catch {} met.trocando = false; }
    try { if ("mediaSession" in navigator) navigator.mediaSession.metadata = null; } catch {}
    abaixarRadio(false);
    document.querySelectorAll("#met-pulsos .pulso").forEach(p => p.classList.remove("ativo"));
    $("#met-tocar").innerHTML = `${icone("play")}Tocar`;
    renderMetMini();
  }

  $("#met-tocar").addEventListener("click", () => (met.tocando ? pararMetronomo() : tocarMetronomo()));
  $("#met-slider").addEventListener("input", ev => definirBpm(Number(ev.target.value)));
  document.querySelectorAll(".met-ajustes [data-delta]").forEach(b =>
    b.addEventListener("click", () => definirBpm(estado.metronomo.bpm + Number(b.dataset.delta))));
  $("#met-compasso").addEventListener("change", ev => {
    estado.metronomo.compasso = Number(ev.target.value);
    salvar(); renderMetronomo(); refazerLoop();
  });
  $("#met-salvar-bpm").addEventListener("click", () => salvarAndamento(met.exId, estado.metronomo.bpm));
  $("#met-som").addEventListener("change", ev => { estado.metronomo.som = ev.target.value; salvar(); refazerLoop(); });
  $("#met-sub").addEventListener("change", ev => { estado.metronomo.sub = Number(ev.target.value) || 1; salvar(); refazerLoop(); });
  // Toque no ritmo: o app calcula o andamento pelos toques
  const toques = [];
  $("#met-tap").addEventListener("click", () => {
    const agora = performance.now();
    if (toques.length && agora - toques[toques.length - 1] > 2000) toques.length = 0;
    toques.push(agora);
    if (toques.length > 6) toques.shift();
    const b = $("#met-tap");
    b.classList.remove("bateu"); void b.offsetWidth; b.classList.add("bateu");
    if (toques.length >= 2) {
      const media = (toques[toques.length - 1] - toques[0]) / (toques.length - 1);
      definirBpm(60000 / media);
      b.querySelector("small").textContent = `${toques.length} toques`;
    } else b.querySelector("small").textContent = "continue tocando";
  });
  $("#met-fechar").addEventListener("click", () => dlgMet.close());
  dlgMet.addEventListener("close", renderMetMini);
  $("#met-mini-abrir").addEventListener("click", () => abrirMetronomo(null, met.exId));
  $("#met-mini-parar").addEventListener("click", pararMetronomo);
  $("#btn-metronomo-inicio").addEventListener("click", () => abrirMetronomo(null));

  // ---------- Cronômetro ----------

  const timer = () => estado.timer;
  const timerMs = () => timer().acumulado + (timer().inicio ? Date.now() - timer().inicio : 0);
  let tick;

  function renderTimer() {
    const t = timer();
    const total = Math.floor(timerMs() / 1000);
    const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
    const sep = `<span class="dois-pontos">:</span>`;
    $("#timer-visor").innerHTML = (h ? `${pad(h)}${sep}` : "") + `${pad(m)}${sep}${pad(s)}`;

    // A barra mostra o quanto falta para a meta do dia (meta semanal ÷ 7)
    const metaDia = Math.max(5, Math.round(estado.metaSemanal / 7));
    const minutosHoje = (minutosPorDia()[hojeISO()] || 0) + total / 60;
    const pct = Math.min(100, (minutosHoje / metaDia) * 100);
    $("#timer-meta-barra").style.width = `${pct.toFixed(1)}%`;
    $("#timer-rotulo").textContent = pct >= 100 ? "Meta do dia cumprida" : `${Math.floor(minutosHoje)} de ${metaDia} min hoje`;

    const rodando = !!t.inicio;
    const temTempo = rodando || t.acumulado > 0;
    $("#cartao-timer").classList.toggle("rodando", rodando);
    $("#timer-estado").textContent = rodando ? "Gravando" : temTempo ? "Pausado" : "Parado";
    $("#timer-iniciar").lastChild.textContent = temTempo ? "Continuar" : "Começar";
    $("#timer-iniciar").hidden = rodando;
    $("#timer-pausar").hidden = !rodando;
    $("#timer-finalizar").hidden = !temTempo;
    $("#timer-dica").textContent = rodando ? "Em andamento. Respire e mantenha o foco."
      : temTempo ? "Pausado. Continue quando quiser ou finalize para registrar."
      : "Ligue o cronômetro e registre sua prática ao terminar.";

    clearInterval(tick);
    if (rodando) tick = setInterval(renderTimer, 1000);
  }

  $("#timer-iniciar").addEventListener("click", () => {
    timer().inicio = Date.now();
    salvar(); renderTimer();
  });

  $("#timer-pausar").addEventListener("click", () => {
    timer().acumulado = timerMs();
    timer().inicio = null;
    salvar(); renderTimer();
  });

  $("#timer-finalizar").addEventListener("click", () => {
    timer().acumulado = timerMs();
    timer().inicio = null;
    salvar(); renderTimer();
    abrirSessao(null, { minutos: Math.max(1, Math.round(timer().acumulado / 60000)), doTimer: true });
  });

  function zerarTimer() {
    estado.timer = { inicio: null, acumulado: 0 };
  }

  // ---------- Registro de sessão ----------

  const dlg = $("#dlg-sessao");
  let edicao = { id: null, doTimer: false, avaliacao: 0 };

  $("#s-raiz").insertAdjacentHTML("beforeend", RAIZES.map((r, i) =>
    `<option value="${escapar(r.id)}">${i + 1}. ${escapar(r.titulo)}</option>`).join(""));

  function preencherExercicios(raizId, selecionado = "") {
    const raiz = RAIZ[raizId];
    const sel = $("#s-exercicio");
    sel.disabled = !raiz;
    sel.innerHTML = `<option value="">${raiz ? "— nenhum —" : "— escolha a raiz —"}</option>` + (raiz ? (raiz.ramificacoes || []).map(ram =>
      `<optgroup label="${escapar(ram.titulo)}">${(ram.exercicios || []).map(ex =>
        `<option value="${escapar(ex.id)}">${escapar(ex.titulo)}</option>`).join("")}</optgroup>`).join("") : "");
    sel.value = selecionado && EXERCICIO[selecionado]?.raiz.id === raizId ? selecionado : "";
  }

  $("#s-raiz").addEventListener("change", ev => preencherExercicios(ev.target.value));

  function renderAvaliacao() {
    $("#s-avaliacao").innerHTML = AVALIACOES.map((e, i) =>
      `<button type="button" data-v="${i + 1}" class="${edicao.avaliacao >= i + 1 ? "ativo" : ""}${edicao.avaliacao === i + 1 ? " escolhida" : ""}" aria-label="${i + 1} de 5: ${e}" aria-pressed="${edicao.avaliacao === i + 1}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.6l6.1-.8z"/></svg><span>${e}</span></button>`).join("");
    $("#s-avaliacao-texto").textContent = edicao.avaliacao ? `· ${AVALIACOES[edicao.avaliacao - 1]}` : "";
  }
  $("#s-avaliacao").addEventListener("click", ev => {
    const b = ev.target.closest("button");
    if (!b) return;
    const v = Number(b.dataset.v);
    edicao.avaliacao = edicao.avaliacao === v ? 0 : v;
    renderAvaliacao();
  });

  function abrirSessao(id, opcoes = {}) {
    const s = id ? estado.sessoes.find(x => x.id === id) : null;
    edicao = { id, doTimer: !!opcoes.doTimer, avaliacao: s?.avaliacao || 0 };
    $("#dlg-titulo").textContent = s ? "Editar prática" : "Registrar prática";
    $("#s-data").value = s?.data || hojeISO();
    $("#s-data").max = hojeISO();
    $("#s-minutos").value = s?.minutos || opcoes.minutos || "";
    const raizId = s?.raizId || opcoes.raizId || (rotaAtual.tela === "raiz" ? rotaAtual.id : "") ||
      (rotaAtual.tela === "ex" ? EXERCICIO[rotaAtual.id].raiz.id : "");
    $("#s-raiz").value = RAIZ[raizId] ? raizId : "";
    preencherExercicios($("#s-raiz").value, s?.exercicioId || opcoes.exercicioId || (rotaAtual.tela === "ex" ? rotaAtual.id : ""));
    $("#s-notas").value = s?.notas || "";
    renderAvaliacao();
    dlg.returnValue = "";
    dlg.showModal();
  }

  dlg.addEventListener("close", async () => {
    if (dlg.returnValue !== "salvar") {
      if (edicao.doTimer && timer().acumulado > 0 &&
          await confirmar("Descartar o tempo?", "O tempo marcado no cronômetro será zerado sem registrar a prática.", "Descartar")) {
        zerarTimer(); salvar(); renderTimer();
      }
      return;
    }
    const antesMetas = resumoMetas();
    const dados = {
      data: $("#s-data").value || hojeISO(),
      minutos: Math.max(1, Math.round(Number($("#s-minutos").value) || 1)),
      raizId: $("#s-raiz").value || null,
      exercicioId: $("#s-exercicio").value || null,
      avaliacao: edicao.avaliacao || null,
      notas: $("#s-notas").value.trim()
    };
    if (edicao.id) {
      Object.assign(estado.sessoes.find(x => x.id === edicao.id), dados);
    } else {
      estado.sessoes.push({ id: novoId(), ...dados });
    }
    if (edicao.doTimer) zerarTimer();
    salvar();
    renderTela();
    renderTimer();
    if (edicao.id || !comemorarPratica(antesMetas)) avisar(edicao.id ? "Prática atualizada." : "Prática registrada.");
  });

  $("#btn-registrar").addEventListener("click", () => abrirSessao(null));
  $("#btn-registrar-2").addEventListener("click", () => abrirSessao(null));

  // ---------- Diário ----------

  function htmlGraficosDiario() {
    if (!estado.sessoes.length) return "";
    const mapa = minutosPorDia();
    const semanas = [];
    const base = segunda(new Date());
    for (let k = 7; k >= 0; k--) {
      const ini = new Date(base); ini.setDate(ini.getDate() - k * 7);
      let min = 0;
      for (let i = 0; i < 7; i++) { const d = new Date(ini); d.setDate(d.getDate() + i); min += mapa[dataISO(d)] || 0; }
      semanas.push({ ini, min, atual: k === 0 });
    }
    const maior = Math.max(estado.metaSemanal, ...semanas.map(x => x.min), 1);
    const metaPct = (estado.metaSemanal / maior) * 100;
    const total = estado.sessoes.reduce((t, x) => t + x.minutos, 0);
    const notas = estado.sessoes.filter(x => x.avaliacao);
    const media = notas.length ? notas.reduce((t, x) => t + x.avaliacao, 0) / notas.length : 0;
    const barras = semanas.map(w => `<div class="g-col${w.atual ? " atual" : ""}${w.min >= estado.metaSemanal ? " meta" : ""}">
        <span class="g-val">${w.min || ""}</span>
        <div class="g-barra"><span style="height:${Math.round((w.min / maior) * 100)}%"></span></div>
        <span class="g-rot">${w.atual ? "Esta" : w.ini.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
      </div>`).join("");
    const evol = Object.keys(EXERCICIO).filter(id => EXERCICIO[id].ex.andamento && estado.andamentos[id]).map(id => {
      const { ex, raiz } = EXERCICIO[id];
      const { inicial, alvo } = ex.andamento;
      const atual = estado.andamentos[id];
      const hist = (estado.historicoBpm || {})[id] || [];
      const pontos = [inicial, ...hist.map(h => h.b)];
      if (pontos[pontos.length - 1] !== atual) pontos.push(atual);
      const lo = Math.min(inicial, ...pontos), hi = Math.max(alvo, ...pontos);
      const W = 120, H = 34;
      const pts = pontos.map((v, i) => `${(i / Math.max(1, pontos.length - 1)) * W},${H - ((v - lo) / Math.max(1, hi - lo)) * H}`).join(" ");
      const ya = H - ((alvo - lo) / Math.max(1, hi - lo)) * H;
      const pct = alvo > inicial ? limitar(Math.round(((atual - inicial) / (alvo - inicial)) * 100), 0, 100) : 100;
      return `<a class="evol" href="#/ex/${encodeURIComponent(id)}" style="${corRaiz(raiz)}">
        <span class="evol-texto"><strong>${escapar(ex.titulo)}</strong><small>${inicial} → <b>${atual}</b> de ${alvo} bpm · ${pct}%</small></span>
        <svg class="evol-graf" viewBox="-3 -3 ${W + 6} ${H + 6}" aria-hidden="true"><line x1="0" x2="${W}" y1="${ya}" y2="${ya}" class="evol-alvo"/><polyline points="${pts}" class="evol-linha"/>${pontos.length ? `<circle cx="${W}" cy="${H - ((atual - lo) / Math.max(1, hi - lo)) * H}" r="3.5" class="evol-ponto"/>` : ""}</svg>
      </a>`;
    }).join("");
    return `<section class="cartao graficos">
      <div class="g-resumo">
        <div><strong>${formatarMinutos(total)}</strong><span>de estudo</span></div>
        <div><strong>${estado.sessoes.length}</strong><span>${estado.sessoes.length === 1 ? "sessão" : "sessões"}</span></div>
        <div><strong>${media ? media.toFixed(1).replace(".", ",") : "–"}</strong><span>avaliação média</span></div>
      </div>
      <h2>${icone("relogio")}Minutos por semana</h2>
      <div class="g-semanas" style="--meta:${metaPct}%">${barras}<span class="g-meta" title="Meta semanal"></span></div>
      <p class="g-leg"><span class="g-leg-meta"></span>Meta de ${estado.metaSemanal} min por semana</p>
      ${evol ? `<h2>${icone("metronomo")}Evolução do andamento</h2><div class="evol-lista">${evol}</div>` : `<p class="vazio-mini">Salve o seu andamento nos exercícios com metrônomo para acompanhar a evolução aqui.</p>`}
    </section>`;
  }

  function renderDiario() {
    $("#diario-graficos").innerHTML = htmlGraficosDiario();
    const ordenadas = [...estado.sessoes].sort((a, b) => b.data.localeCompare(a.data) || b.id.localeCompare(a.id));
    $("#diario-vazio").hidden = ordenadas.length > 0;
    $("#lista-sessoes").innerHTML = ordenadas.map(s => {
      const raiz = RAIZ[s.raizId];
      const ex = EXERCICIO[s.exercicioId]?.ex;
      return `<li class="sessao" ${raiz ? `style="${corRaiz(raiz)}"` : ""}>
        ${raiz ? `<span class="mini-ilus">${ilustracao(raiz.icone)}</span>` : `<span class="mini-ilus neutra">${icone("nota")}</span>`}
        <div class="sessao-corpo">
          <div class="sessao-topo">
            <span class="sessao-data">${escapar(formatarData(s.data))}</span>
            <span class="sessao-min">${formatarMinutos(s.minutos)}</span>
          </div>
          <div class="sessao-sub">${raiz ? escapar(raiz.titulo) : "Prática geral"}${ex ? ` · ${escapar(ex.titulo)}` : ""}</div>
          ${s.avaliacao ? `<div class="sessao-nota" aria-label="Avaliação ${s.avaliacao} de 5">${AVALIACOES.map((_, i) => `<span class="${i < s.avaliacao ? "on" : ""}"></span>`).join("")}<em>${escapar(AVALIACOES[s.avaliacao - 1])}</em></div>` : ""}
          ${s.notas ? `<p class="sessao-notas">${escapar(s.notas)}</p>` : ""}
          <div class="sessao-acoes">
            <button class="link-acao" data-editar="${escapar(s.id)}">Editar</button>
            <button class="link-acao" data-apagar="${escapar(s.id)}">Apagar</button>
          </div>
        </div>
      </li>`;
    }).join("");
  }

  $("#lista-sessoes").addEventListener("click", async ev => {
    const editar = ev.target.closest("[data-editar]");
    const apagar = ev.target.closest("[data-apagar]");
    if (editar) abrirSessao(editar.dataset.editar);
    if (apagar && await confirmar("Apagar esta prática?", "Ela será removida do seu diário.", "Apagar")) {
      estado.sessoes = estado.sessoes.filter(s => s.id !== apagar.dataset.apagar);
      salvar(); renderTela();
    }
  });

  // ---------- Ajustes ----------

  function renderAjustes() {
    $("#aj-nome").value = estado.nome;
    $("#aj-meta").value = estado.metaSemanal;
    $("#aj-sax").value = estado.sax || "";
    $("#aj-tema").value = estado.tema === "preto" ? "preto" : "verde";
    renderBackup();
    const cartao = $("#cartao-acesso");
    cartao.hidden = !ACESSO;
    if (ACESSO) {
      cartao.innerHTML = estado.desbloqueado
        ? `<h2>Acesso</h2><p class="acesso-ok">${icone("check")}Método CMA completo liberado neste aparelho.</p>`
        : `<h2>Acesso</h2><p class="mudo">Você está na versão grátis: a raiz Escuta está aberta. As outras cinco raízes fazem parte do Método CMA completo.</p>
           <a class="btn largo" href="${escapar(urlConhecer())}" target="_blank" rel="noopener">Conhecer o Método CMA</a>${htmlCodigo()}`;
    }
  }

  $("#form-ajustes").addEventListener("submit", ev => {
    ev.preventDefault();
    estado.nome = $("#aj-nome").value.trim();
    estado.metaSemanal = Math.max(10, Number($("#aj-meta").value) || 150);
    estado.sax = $("#aj-sax").value;
    estado.tema = $("#aj-tema").value;
    aplicarTema();
    salvar();
    avisar("Ajustes salvos.");
  });

  // ---------- Backup ----------

  const diasDesde = iso => iso ? Math.floor((deISO(hojeISO()) - deISO(iso)) / 864e5) : Infinity;

  function renderBackup() {
    const el = $("#backup-estado");
    if (!el) return;
    const d = estado.ultimoBackup;
    if (!d) { el.className = "backup-estado alerta"; el.textContent = "Você ainda não fez nenhum backup."; return; }
    const n = diasDesde(d);
    el.className = "backup-estado" + (n > 14 ? " alerta" : " ok");
    el.textContent = `Último backup: ${deISO(d).toLocaleDateString("pt-BR")}` + (n === 0 ? " (hoje)" : n === 1 ? " (ontem)" : ` (há ${n} dias)`);
  }

  function precisaLembrarBackup() {
    if (estado.sessoes.length < 3) return false;
    if (estado.backupAdiado && diasDesde(estado.backupAdiado) < 7) return false;
    return diasDesde(estado.ultimoBackup) > 14;
  }

  function renderLembreteBackup() {
    const c = $("#backup-lembrete");
    if (!c) return;
    c.hidden = !precisaLembrarBackup();
    if (!c.hidden) $("#backup-lembrete-sub").textContent = estado.ultimoBackup
      ? `O último foi há ${diasDesde(estado.ultimoBackup)} dias. Salve uma cópia nova no Drive ou no WhatsApp.`
      : `Você já tem ${estado.sessoes.length} práticas registradas. Salve uma cópia no Drive ou no WhatsApp para não perder nada.`;
  }

  async function fazerBackup() {
    const copia = { ...estado, timer: { inicio: null, acumulado: 0 }, ultimoBackup: hojeISO() };
    delete copia.backupAdiado;
    const pacote = { app: "CMA", versao: 1, criadoEm: new Date().toISOString(), dados: copia };
    const nome = `CMA-backup-${(estado.nome || "aluno").normalize("NFD").replace(/[^\w]/g, "")}-${hojeISO()}.json`;
    const texto = JSON.stringify(pacote, null, 2);
    let feito = false;
    try {
      const arquivo = new File([texto], nome, { type: "application/json" });
      if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
        await navigator.share({ files: [arquivo], title: "Backup do CMA", text: "Backup do meu progresso no Método CMA" });
        feito = true;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return; // o aluno cancelou
    }
    if (!feito) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([texto], { type: "application/json" }));
      a.download = nome;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    }
    estado.ultimoBackup = hojeISO();
    delete estado.backupAdiado;
    salvar();
    renderBackup(); renderLembreteBackup();
    avisar("Backup feito. Guarde o arquivo num lugar seguro.");
  }

  $("#btn-exportar").addEventListener("click", fazerBackup);
  $("#backup-agora").addEventListener("click", fazerBackup);
  $("#backup-depois").addEventListener("click", () => {
    estado.backupAdiado = hojeISO(); salvar(); renderLembreteBackup();
  });

  $("#inp-importar").addEventListener("change", async ev => {
    const arquivo = ev.target.files[0];
    ev.target.value = "";
    if (!arquivo) return;
    let dados;
    try {
      const bruto = JSON.parse(await arquivo.text());
      dados = bruto && bruto.app === "CMA" && bruto.dados ? bruto.dados : bruto; // aceita também o formato antigo
      if (!dados || typeof dados !== "object" || !Array.isArray(dados.sessoes)) throw new Error("formato");
    } catch {
      avisar("Este arquivo não é um backup do CMA.");
      return;
    }
    const n = dados.sessoes.length, f = Object.keys(dados.feitos || {}).length;
    if (!(await confirmar("Restaurar backup?", `O arquivo tem ${n} prática${n === 1 ? "" : "s"} e ${f} exercício${f === 1 ? "" : "s"} concluído${f === 1 ? "" : "s"}. Os dados deste celular serão substituídos pelos do arquivo.`, "Restaurar"))) return;
    const liberado = estado.desbloqueado;
    estado = { ...estadoPadrao(), ...dados };
    if (liberado) estado.desbloqueado = true; // nunca perde o acesso já liberado
    salvar(); aplicarTema(); renderTela(); renderTimer();
    avisar("Backup restaurado.");
  });

  // ---------- Estudo do dia ----------
  // Roteiro de 3 passos para cada dia: aquecer, fazer o exercício da vez e tocar junto.

  function estudoHoje() {
    if (!estado.estudoDia || estado.estudoDia.data !== hojeISO()) estado.estudoDia = { data: hojeISO(), passos: {}, festa: false };
    return estado.estudoDia;
  }

  function exercicioFeitoHoje() {
    const hoje = hojeISO();
    return Object.values(estado.feitos).includes(hoje) || estado.sessoes.some(s => s.data === hoje && s.exercicioId);
  }

  function passosFeitos() {
    const ed = estudoHoje();
    return { aq: !!ed.passos.aq, ex: !!ed.passos.ex || exercicioFeitoHoje(), tc: !!ed.passos.tc };
  }

  function marcarPasso(chave, valor = true) {
    const ed = estudoHoje();
    ed.passos[chave] = valor;
    salvar();
    const f = passosFeitos();
    if (f.aq && f.ex && f.tc && !ed.festa) {
      ed.festa = true; salvar();
      setTimeout(() => celebrar("Estudo do dia completo!", "Aquecimento, exercício e tocar junto. Até amanhã!", "trofeu"), 400);
    }
    if (rotaAtual.tela === "inicio") renderEstudoDia();
  }

  function playAlongDoDia() {
    if (temBloqueio() || !TOCAR.length) return null;
    const sax = estado.sax;
    let lista = TOCAR.filter(t => !sax || !t.afin.length || t.afin.includes(sax));
    const ind = lista.filter(t => t.ind);
    if (ind.length) lista = ind;
    if (!lista.length) return null;
    const dia = Math.floor(deISO(hojeISO()) / 864e5);
    return lista[dia % lista.length];
  }

  function renderEstudoDia() {
    const caixa = $("#estudo-dia");
    if (!caixa) return;
    const f = passosFeitos();
    const total = [f.aq, f.ex, f.tc].filter(Boolean).length;

    // Passo 2: exercício da vez
    const prox = proximoExercicio();
    let ex;
    if (prox) ex = { href: `#/ex/${encodeURIComponent(prox.ex.id)}`, estilo: corRaiz(prox.raiz), ilus: ilustracao(prox.raiz.icone),
      sobre: `Raiz ${prox.raiz.titulo}`, titulo: prox.ex.titulo, sub: prox.ram.titulo };
    else if (temBloqueio()) { const bloq = RAIZES.find(r => !liberada(r)); ex = { href: `#/raiz/${encodeURIComponent(bloq.id)}`, estilo: corRaiz(bloq), ilus: ilustracao(bloq.icone),
      sobre: "Próximo passo", titulo: `Desbloqueie ${bloq.titulo}`, sub: "Você concluiu a parte grátis" }; }
    else ex = { href: "#/raizes", estilo: "", ilus: icone("trofeu"), sobre: "Percurso completo", titulo: "Revise uma raiz", sub: "Escolha um exercício para aprofundar" };

    // Passo 3: tocar junto (ou escuta ativa com a rádio na versão grátis)
    const pa = playAlongDoDia();
    const hrefPa = pa && urlSegura(urlPasta(pa.id));
    const tc = hrefPa
      ? `<a class="ed-acao" href="${escapar(hrefPa)}" target="_blank" rel="noopener" data-ed-marca="tc">
          <span class="ed-ic">${icone("fone")}</span><span class="ed-texto"><small>3 · Tocar junto</small><strong>${escapar(pa.t)}</strong><span>${escapar(pa.g)} · toque com a banda</span></span>${icone("externo", "ed-seta")}</a>`
      : `<button class="ed-acao" type="button" data-ed-radio>
          <span class="ed-ic">${icone("radio")}</span><span class="ed-texto"><small>3 · Escuta ativa</small><strong>Ouça a Rádio CMA</strong><span>Preste atenção no som e no fraseado dos saxofonistas</span></span>${icone("play", "ed-seta")}</button>`;

    const check = (k, rot) => `<button class="ed-check" type="button" data-ed-check="${k}" aria-pressed="${f[k]}" aria-label="${f[k] ? "Desmarcar" : "Marcar"} ${rot}">${icone("check")}</button>`;

    caixa.innerHTML = `<div class="ed-topo"><span class="ed-rotulo">Estudo do dia</span><span class="ed-conta${total === 3 ? " completo" : ""}">${total === 3 ? `${icone("check")}Completo` : `${total} de 3`}</span></div>
      <div class="ed-barra"><span style="width:${Math.round(total / 3 * 100)}%"></span></div>
      <ol class="ed-passos">
        <li class="ed-passo${f.aq ? " feito" : ""}">${check("aq", "aquecimento")}
          <button class="ed-acao" type="button" data-ed-afinador>
            <span class="ed-ic">${icone("relogio")}</span><span class="ed-texto"><small>1 · Aquecimento</small><strong>Notas longas com o afinador</strong><span>5 minutos de som cheio e afinado</span></span>${icone("seta", "ed-seta")}</button></li>
        <li class="ed-passo destaque${f.ex ? " feito" : ""}" style="${ex.estilo}">${check("ex", "exercício")}
          <a class="ed-acao" href="${ex.href}">
            <span class="ed-ic ilus-caixa">${ex.ilus}</span><span class="ed-texto"><small>2 · ${escapar(ex.sobre)}</small><strong>${escapar(ex.titulo)}</strong><span>${escapar(ex.sub)}</span></span>${icone("seta", "ed-seta")}</a></li>
        <li class="ed-passo${f.tc ? " feito" : ""}">${check("tc", "tocar junto")}${tc}</li>
      </ol>`;
  }

  $("#estudo-dia").addEventListener("click", ev => {
    const c = ev.target.closest("[data-ed-check]");
    if (c) {
      const k = c.dataset.edCheck;
      const atual = passosFeitos()[k];
      if (k === "ex" && atual && exercicioFeitoHoje()) { avisar("Você já fez um exercício hoje."); return; }
      marcarPasso(k, !atual);
      return;
    }
    if (ev.target.closest("[data-ed-afinador]")) { abrirAfinador(); return; }
    if (ev.target.closest("[data-ed-radio]")) { tocarRadio(); marcarPasso("tc"); return; }
    if (ev.target.closest('[data-ed-marca="tc"]')) setTimeout(() => marcarPasso("tc"), 300);
  });

  // ---------- Gravador ----------
  // As gravações ficam no próprio aparelho (IndexedDB), separadas por exercício.

  const GRAV_MAX = 12;
  const grav = { gravando: false, rec: null, stream: null, partes: [], inicio: 0, ex: null, timer: null, ctx: null, analisador: null, audio: null, tocandoId: null, urls: [], fila: null };

  function bancoGravacoes() {
    return new Promise((ok, erro) => {
      if (!window.indexedDB) return erro(new Error("sem indexedDB"));
      const req = indexedDB.open("cma-gravacoes", 1);
      req.onupgradeneeded = () => {
        const os = req.result.createObjectStore("gravacoes", { keyPath: "id" });
        os.createIndex("ex", "ex");
      };
      req.onsuccess = () => ok(req.result);
      req.onerror = () => erro(req.error);
    });
  }

  async function operacaoGrav(modo, fn) {
    const db = await bancoGravacoes();
    return new Promise((ok, erro) => {
      const tx = db.transaction("gravacoes", modo);
      const r = fn(tx.objectStore("gravacoes"));
      tx.oncomplete = () => { ok(r && r.result); db.close(); };
      tx.onerror = () => { erro(tx.error); db.close(); };
    });
  }

  const listarGravacoes = ex => operacaoGrav("readonly", os => os.index("ex").getAll(ex))
    .then(l => (l || []).sort((a, b) => a.quando.localeCompare(b.quando)));
  const guardarGravacao = g => operacaoGrav("readwrite", os => os.put(g));
  const apagarGravacao = id => operacaoGrav("readwrite", os => os.delete(id));

  const formatoDur = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  function tipoGravacao() {
    if (!window.MediaRecorder) return null;
    const tipos = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
    return tipos.find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || "";
  }

  async function renderGravador(exId) {
    const caixa = $("#gravador");
    if (!caixa) return;
    const suporte = tipoGravacao() !== null && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    if (!suporte) {
      $("#grav-btn").disabled = true;
      $("#grav-lista").innerHTML = `<p class="mudo">Este navegador não permite gravar. Atualize o navegador do celular.</p>`;
      return;
    }
    atualizarBotaoGrav();
    let lista = [];
    try { lista = await listarGravacoes(exId); } catch { $("#grav-lista").innerHTML = `<p class="mudo">Não foi possível abrir as gravações neste aparelho.</p>`; return; }
    if (rotaAtual.tela !== "ex" || rotaAtual.id !== exId) return;
    grav.urls.forEach(u => URL.revokeObjectURL(u)); grav.urls = [];
    if (!lista.length) { $("#grav-lista").innerHTML = `<p class="mudo grav-vazio">Nenhuma gravação ainda. Toque em Gravar e toque o exercício.</p>`; return; }
    const primeira = lista[0], ultima = lista[lista.length - 1];
    const itens = lista.slice().reverse().map(g => {
      const d = new Date(g.quando);
      const selo = g.id === primeira.id && lista.length > 1 ? `<span class="grav-selo">Primeira</span>` : g.id === ultima.id && lista.length > 1 ? `<span class="grav-selo novo">Mais recente</span>` : "";
      return `<li class="grav-item ${grav.tocandoId === g.id ? "tocando" : ""}" data-grav="${escapar(g.id)}">
        <button class="grav-play" type="button" data-grav-tocar="${escapar(g.id)}" aria-label="Ouvir gravação">${icone(grav.tocandoId === g.id ? "pause" : "play")}</button>
        <span class="grav-info"><strong>${escapar(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }))} · ${escapar(d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }))} ${selo}</strong>
        <small>${formatoDur(g.dur || 0)}${g.bpm ? ` · ${g.bpm} bpm` : ""}</small></span>
        <button class="grav-apagar" type="button" data-grav-apagar="${escapar(g.id)}" aria-label="Apagar gravação">${icone("lixo")}</button>
      </li>`;
    }).join("");
    $("#grav-lista").innerHTML = `${lista.length > 1 ? `<button class="btn largo grav-comparar" type="button" id="grav-comparar">${icone("fone")}Ouvir antes e depois<small>a primeira e a mais recente, em seguida</small></button>` : ""}
      <ul class="grav-itens">${itens}</ul>
      <p class="dica grav-rodape">As gravações ficam guardadas só neste celular (até ${GRAV_MAX} por exercício; a primeira é sempre mantida).</p>`;
  }

  function atualizarBotaoGrav() {
    const b = $("#grav-btn");
    if (!b) return;
    const aqui = grav.gravando && grav.ex === rotaAtual.id;
    b.innerHTML = aqui ? `${icone("stop")}Parar e salvar` : `${icone("microfone")}Gravar`;
    b.classList.toggle("gravando", aqui);
    $("#grav-status").hidden = !aqui;
    $("#gravador").classList.toggle("ativo", aqui);
  }

  async function iniciarGravacao(exId) {
    pararAudioGrav();
    try {
      grav.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch {
      avisar(NA_PREVIA ? AVISO_PREVIA : "Permita o uso do microfone para gravar.");
      return;
    }
    const tipo = tipoGravacao();
    try { grav.rec = tipo ? new MediaRecorder(grav.stream, { mimeType: tipo }) : new MediaRecorder(grav.stream); }
    catch { grav.rec = new MediaRecorder(grav.stream); }
    grav.partes = [];
    grav.ex = exId;
    grav.rec.ondataavailable = e => { if (e.data && e.data.size) grav.partes.push(e.data); };
    grav.rec.onstop = salvarGravacaoFeita;
    grav.rec.start(1000);
    grav.inicio = Date.now();
    grav.gravando = true;
    abaixarRadio(true);
    // medidor de volume
    try {
      grav.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const fonte = grav.ctx.createMediaStreamSource(grav.stream);
      grav.analisador = grav.ctx.createAnalyser(); grav.analisador.fftSize = 512;
      fonte.connect(grav.analisador);
    } catch { grav.analisador = null; }
    const dados = new Uint8Array(512);
    grav.timer = setInterval(() => {
      const t = $("#grav-tempo"); if (t) t.textContent = formatoDur((Date.now() - grav.inicio) / 1000);
      if (grav.analisador) {
        grav.analisador.getByteTimeDomainData(dados);
        let pico = 0; for (const v of dados) pico = Math.max(pico, Math.abs(v - 128));
        const n = $("#grav-nivel"); if (n) n.style.width = Math.min(100, pico / 1.1) + "%";
      }
      if (Date.now() - grav.inicio > 10 * 60 * 1000) pararGravacao(); // limite de 10 minutos
    }, 100);
    atualizarBotaoGrav();
  }

  function pararGravacao() {
    if (!grav.gravando) return;
    grav.gravando = false;
    clearInterval(grav.timer);
    grav.dur = (Date.now() - grav.inicio) / 1000;
    try { grav.rec.stop(); } catch {}
    grav.stream.getTracks().forEach(t => t.stop());
    if (grav.ctx) { grav.ctx.close().catch(() => {}); grav.ctx = null; }
    if (!met.tocando) abaixarRadio(false);
    atualizarBotaoGrav();
  }

  async function salvarGravacaoFeita() {
    const exId = grav.ex;
    if (!grav.partes.length || grav.dur < 1) { avisar("Gravação muito curta."); return; }
    const blob = new Blob(grav.partes, { type: grav.rec.mimeType || grav.partes[0].type || "audio/webm" });
    grav.partes = [];
    const ex = EXERCICIO[exId] && EXERCICIO[exId].ex;
    const g = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ex: exId, quando: new Date().toISOString(), dur: Math.round(grav.dur), bpm: ex && ex.andamento ? (estado.andamentos[exId] || ex.andamento.inicial) : null, blob };
    try {
      await guardarGravacao(g);
      const lista = await listarGravacoes(exId);
      // mantém a primeira e as mais recentes
      if (lista.length > GRAV_MAX) for (const velha of lista.slice(1, lista.length - GRAV_MAX + 1)) await apagarGravacao(velha.id);
      avisar("Gravação salva.");
    } catch {
      avisar("Não foi possível salvar a gravação (pouco espaço no aparelho?).");
    }
    if (rotaAtual.tela === "ex" && rotaAtual.id === exId) renderGravador(exId);
  }

  function pararAudioGrav() {
    grav.fila = null;
    if (grav.audio) { grav.audio.pause(); grav.audio = null; }
    grav.tocandoId = null;
    document.querySelectorAll(".grav-item.tocando").forEach(li => {
      li.classList.remove("tocando");
      const b = li.querySelector(".grav-play"); if (b) b.innerHTML = icone("play");
    });
    const c = $("#grav-comparar"); if (c) c.classList.remove("ativo");
  }

  async function tocarGravacao(id, aoTerminar) {
    const lista = await listarGravacoes(rotaAtual.id);
    const g = lista.find(x => x.id === id);
    if (!g) return;
    const url = URL.createObjectURL(g.blob); grav.urls.push(url);
    const a = new Audio(url);
    grav.audio = a; grav.tocandoId = id;
    document.querySelectorAll(".grav-item").forEach(li => {
      const on = li.dataset.grav === id;
      li.classList.toggle("tocando", on);
      const b = li.querySelector(".grav-play"); if (b) b.innerHTML = icone(on ? "pause" : "play");
    });
    abaixarRadio(true);
    a.onended = () => {
      const seguinte = aoTerminar;
      pararAudioGrav();
      if (!met.tocando) abaixarRadio(false);
      if (seguinte) seguinte();
    };
    try { await a.play(); } catch { avisar("Não foi possível tocar a gravação."); pararAudioGrav(); }
  }

  $("#exercicio-conteudo").addEventListener("click", async ev => {
    const exId = rotaAtual.id;
    if (ev.target.closest("#grav-btn")) {
      if (grav.gravando) pararGravacao(); else iniciarGravacao(exId);
      return;
    }
    const tocar = ev.target.closest("[data-grav-tocar]");
    if (tocar) {
      const id = tocar.dataset.gravTocar;
      if (grav.tocandoId === id) { pararAudioGrav(); if (!met.tocando) abaixarRadio(false); return; }
      pararAudioGrav();
      if (grav.gravando) { avisar("Pare a gravação antes de ouvir."); return; }
      tocarGravacao(id);
      return;
    }
    if (ev.target.closest("#grav-comparar")) {
      if (grav.gravando) { avisar("Pare a gravação antes de ouvir."); return; }
      pararAudioGrav();
      const lista = await listarGravacoes(exId);
      if (lista.length < 2) return;
      const c = $("#grav-comparar"); if (c) c.classList.add("ativo");
      avisar("Ouvindo a primeira gravação…");
      tocarGravacao(lista[0].id, () => setTimeout(() => {
        if (rotaAtual.id !== exId) return;
        avisar("Agora a mais recente…");
        tocarGravacao(lista[lista.length - 1].id);
      }, 700));
      return;
    }
    const apagar = ev.target.closest("[data-grav-apagar]");
    if (apagar) {
      if (!(await confirmar("Apagar gravação?", "Ela será removida deste aparelho.", "Apagar"))) return;
      if (grav.tocandoId === apagar.dataset.gravApagar) pararAudioGrav();
      await apagarGravacao(apagar.dataset.gravApagar);
      renderGravador(exId);
    }
  });

  window.addEventListener("hashchange", () => { pararAudioGrav(); });

  // Pede ao navegador para não apagar os dados do app (gravações e progresso)
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch {}

  // ---------- Rádio CMA ----------

  const ESTACOES = Array.isArray(CMA.radio) ? CMA.radio : [];
  const RADIO_LINKS = Array.isArray(CMA.radioLinks) ? CMA.radioLinks : [];
  const CATALOGO = ["de1", "de2", "fi1", "nl1"].map(h => `https://${h}.api.radio-browser.info`);
  const radio = { audio: new Audio(), estacao: null, tocando: false, carregando: false, tentativa: 0, abaixado: false };
  radio.audio.preload = "none";
  const prefRadio = (() => { try { return JSON.parse(localStorage.getItem("cma.radio") || "{}"); } catch { return {}; } })();
  const salvarPrefRadio = () => { try { localStorage.setItem("cma.radio", JSON.stringify(prefRadio)); } catch {} };
  if (typeof prefRadio.volume !== "number") prefRadio.volume = 0.6;
  radio.estacao = ESTACOES.find(e => e.id === prefRadio.estacao) || ESTACOES[0] || null;

  function aplicarVolume() {
    radio.audio.volume = limitar(prefRadio.volume * (radio.abaixado ? 0.25 : 1), 0, 1);
  }
  aplicarVolume();

  function renderRadio() {
    const barra = $("#radio");
    if (!ESTACOES.length) { barra.hidden = true; return; }
    const ativa = radio.tocando || radio.carregando;
    barra.hidden = !ativa;
    document.body.classList.toggle("com-radio", ativa);
    atualizarLetreiroRadio();
    barra.classList.toggle("tocando", radio.tocando);
    const btn = $("#radio-play");
    btn.classList.toggle("carregando", radio.carregando);
    btn.innerHTML = icone(radio.tocando || radio.carregando ? "pause" : "play");
    btn.setAttribute("aria-label", radio.tocando ? "Pausar rádio" : "Tocar rádio");
    $("#radio-nome").textContent = radio.carregando ? `Sintonizando ${radio.estacao.nome}…`
      : radio.tocando ? radio.estacao.nome
      : radio.estacao ? radio.estacao.nome : "Toque para ouvir jazz";
    $("#radio-lista").innerHTML = ESTACOES.map(e => `<li><button type="button" class="radio-estacao${e === radio.estacao ? " ativa" : ""}" data-estacao="${escapar(e.id)}">
      ${icone(e === radio.estacao && radio.tocando ? "pause" : "radio")}
      <span><strong>${escapar(e.nome)}</strong><small>${escapar(e.detalhe || "")}</small></span></button></li>`).join("");
    $("#radio-links").innerHTML = RADIO_LINKS.map(l => {
      const url = urlSegura(l.url);
      return url ? `<li><a href="${escapar(url)}" target="_blank" rel="noopener">${escapar(l.titulo)}${icone("externo")}</a></li>` : "";
    }).join("");
    $("#radio-volume").value = Math.round(prefRadio.volume * 100);
  }

  // Procura o endereço atual da estação no catálogo radio-browser.info
  async function buscarNoCatalogo(busca) {
    if (!busca) return [];
    const q = new URLSearchParams({ hidebroken: "true", order: "votes", reverse: "true", limit: "6" });
    for (const [k, v] of Object.entries(busca)) q.set(k, v);
    for (const host of CATALOGO) {
      try {
        const r = await fetch(`${host}/json/stations/search?${q}`, { signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined });
        if (!r.ok) continue;
        const lista = await r.json();
        return lista.map(x => x.url_resolved || x.url).filter(u => /^https:\/\//i.test(u || ""));
      } catch { /* tenta o próximo servidor */ }
    }
    return [];
  }

  function testarStream(url, minhaTentativa) {
    return new Promise((ok, falha) => {
      const a = radio.audio;
      const limpar = () => { a.removeEventListener("playing", aoTocar); a.removeEventListener("error", aoErro); clearTimeout(t); };
      const aoTocar = () => { limpar(); ok(); };
      const aoErro = () => { limpar(); falha(new Error("stream")); };
      const t = setTimeout(() => { limpar(); falha(new Error("tempo")); }, 8000);
      a.addEventListener("playing", aoTocar);
      a.addEventListener("error", aoErro);
      a.src = url;
      a.play().catch(err => { if (radio.tentativa === minhaTentativa && err.name !== "AbortError") { limpar(); falha(err); } });
    });
  }

  async function tocarRadio(estacao = radio.estacao) {
    if (!estacao) return;
    const minha = ++radio.tentativa;
    radio.estacao = estacao;
    prefRadio.estacao = estacao.id; salvarPrefRadio();
    radio.carregando = true; radio.tocando = false; renderRadio();
    const vistos = new Set();
    const tentar = async urls => {
      for (const url of urls) {
        if (vistos.has(url) || radio.tentativa !== minha) continue;
        vistos.add(url);
        try { await testarStream(url, minha); return true; } catch (err) {
          if (err && err.name === "NotAllowedError") throw err;
        }
      }
      return false;
    };
    try {
      let ok = await tentar(estacao.streams || []);
      if (!ok && radio.tentativa === minha) ok = await tentar(await buscarNoCatalogo(estacao.busca));
      if (radio.tentativa !== minha) return;
      radio.carregando = false;
      radio.tocando = ok;
      if (!ok) { radio.audio.removeAttribute("src"); avisar(NA_PREVIA ? AVISO_PREVIA : `${estacao.nome} está fora do ar agora. Tente outra estação.`); }
      else if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: estacao.nome, artist: "Rádio CMA", artwork: [{ src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }] });
      }
    } catch {
      if (radio.tentativa !== minha) return;
      radio.carregando = false; radio.tocando = false;
      avisar("Toque no play para liberar o som.");
    }
    renderRadio();
  }

  function pausarRadio() {
    radio.tentativa++;
    radio.audio.pause();
    radio.audio.removeAttribute("src");
    radio.audio.load();
    radio.tocando = false; radio.carregando = false;
    renderRadio();
  }

  // Abaixa o rádio enquanto o metrônomo toca
  function abaixarRadio(sim) { radio.abaixado = sim; aplicarVolume(); }

  // Pausa/retomada vindas de fora do app (fones, tela de bloqueio)
  radio.audio.addEventListener("pause", () => { if (!radio.carregando && radio.tocando) { radio.tocando = false; renderRadio(); } });
  radio.audio.addEventListener("playing", () => { if (!radio.carregando && !radio.tocando) { radio.tocando = true; renderRadio(); } });

  $("#radio-play").addEventListener("click", () => (radio.tocando || radio.carregando ? pausarRadio() : tocarRadio()));
  $("#radio-abrir").addEventListener("click", () => { renderRadio(); $("#dlg-radio").showModal(); });
  $("#radio-mais").addEventListener("click", () => { renderRadio(); $("#dlg-radio").showModal(); });
  $("#letreiro-radio").addEventListener("click", () => {
    if (!radio.tocando && !radio.carregando) tocarRadio();
    renderRadio(); $("#dlg-radio").showModal();
  });
  document.addEventListener("click", ev => {
    if (ev.target.closest("[data-abrir-radio]")) { renderRadio(); $("#dlg-radio").showModal(); }
  });
  $("#radio-fechar").addEventListener("click", () => $("#dlg-radio").close());
  $("#radio-lista").addEventListener("click", ev => {
    const b = ev.target.closest("[data-estacao]");
    if (!b) return;
    const e = ESTACOES.find(x => x.id === b.dataset.estacao);
    if (e === radio.estacao && (radio.tocando || radio.carregando)) pausarRadio(); else tocarRadio(e);
  });
  $("#radio-volume").addEventListener("input", ev => {
    prefRadio.volume = Number(ev.target.value) / 100; aplicarVolume(); salvarPrefRadio();
  });
  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.setActionHandler("play", () => tocarRadio());
      navigator.mediaSession.setActionHandler("pause", () => pausarRadio());
    } catch {}
  }

  // ---------- Relatório semanal (WhatsApp) ----------

  const PROFESSOR = CMA.professor || {};

  function montarRelatorio() {
    const hoje = deISO(hojeISO());
    const inicio = new Date(hoje); inicio.setDate(inicio.getDate() - 6);
    const isoInicio = dataISO(inicio), isoHoje = dataISO(hoje);
    const naSemana = iso => iso >= isoInicio && iso <= isoHoje;
    const dm = d => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

    const sessoes = estado.sessoes.filter(x => naSemana(x.data));
    const minutos = sessoes.reduce((t, x) => t + x.minutos, 0);
    const dias = new Set(sessoes.map(x => x.data)).size;
    const notas = sessoes.filter(x => x.avaliacao).map(x => x.avaliacao);
    const media = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;
    const pctMeta = Math.round((minutos / estado.metaSemanal) * 100);

    const porRaiz = {};
    for (const x of sessoes) {
      const nome = RAIZ[x.raizId]?.titulo || "Geral";
      porRaiz[nome] = (porRaiz[nome] || 0) + x.minutos;
    }

    const concluidos = Object.entries(estado.feitos)
      .filter(([id, iso]) => EXERCICIO[id] && naSemana(iso))
      .map(([id]) => `• ${EXERCICIO[id].ex.titulo} (${EXERCICIO[id].raiz.titulo})`);

    const exDaSemana = [...new Set(sessoes.map(x => x.exercicioId).filter(id => id && EXERCICIO[id]))];
    const andamentos = exDaSemana
      .filter(id => EXERCICIO[id].ex.andamento && estado.andamentos[id])
      .map(id => `• ${EXERCICIO[id].ex.titulo}: ${estado.andamentos[id]} de ${EXERCICIO[id].ex.andamento.alvo} bpm`);

    const atrasados = Object.entries(estado.prazos)
      .filter(([chave, iso]) => diasAte(iso) < 0 && (chave[0] === "e" ? EXERCICIO[chave.slice(2)] && !feito(chave.slice(2)) : RAIZ[chave.slice(2)] && !progressoRaiz(RAIZ[chave.slice(2)]).completa))
      .map(([chave, iso]) => {
        const id = chave.slice(2);
        const titulo = chave[0] === "e" ? EXERCICIO[id].ex.titulo : `Raiz ${RAIZ[id].titulo}`;
        return `• ${titulo} (venceu em ${deISO(iso).toLocaleDateString("pt-BR")})`;
      });

    const anotacoes = sessoes.filter(x => x.notas).slice(-3)
      .map(x => `• ${dm(deISO(x.data))}: ${x.notas.replace(/\s+/g, " ").slice(0, 200)}`);

    const totalFeitos = Object.keys(estado.feitos).filter(id => EXERCICIO[id]).length;
    const pctTotal = TOTAL_EXERCICIOS ? Math.round((totalFeitos / TOTAL_EXERCICIOS) * 100) : 0;

    const l = [];
    l.push("🎷 *Relatório semanal · CMA*");
    l.push(`*Aluno:* ${estado.nome || "(sem nome)"}`);
    l.push(`*Período:* ${dm(inicio)} a ${dm(hoje)}`);
    l.push("");
    l.push(`⏱ *Prática:* ${formatarMinutos(minutos)} de ${formatarMinutos(estado.metaSemanal)} (${pctMeta}% da meta)`);
    l.push(`📅 *Dias praticados:* ${dias} de 7 · sequência atual de ${calcularSequencia(minutosPorDia())} dia(s)`);
    if (media) l.push(`⭐ *Avaliação média:* ${AVALIACOES[media - 1]}`);
    if (Object.keys(porRaiz).length) {
      l.push("", "*Tempo por raiz:*");
      Object.entries(porRaiz).sort((a, b) => b[1] - a[1]).forEach(([n, m]) => l.push(`• ${n}: ${formatarMinutos(m)}`));
    }
    if (concluidos.length) l.push("", "✅ *Concluídos na semana:*", ...concluidos);
    if (andamentos.length) l.push("", "🎚 *Andamentos (atual de alvo):*", ...andamentos);
    if (atrasados.length) l.push("", "⚠️ *Prazos atrasados:*", ...atrasados);
    if (anotacoes.length) l.push("", "💬 *Anotações:*", ...anotacoes);
    l.push("", `📈 *Percurso:* ${totalFeitos} de ${TOTAL_EXERCICIOS} exercícios (${pctTotal}%)`);
    if (!sessoes.length) l.push("", "Não registrei prática nesta semana.");
    return l.join("\n");
  }

  $("#btn-relatorio").addEventListener("click", async () => {
    if (!estado.nome) {
      avisar("Coloque seu nome em Ajustes antes de enviar.");
      location.hash = "#/ajustes";
      return;
    }
    const numero = String(PROFESSOR.whatsapp || "").replace(/\D/g, "");
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(montarRelatorio())}`;
    window.open(url, "_blank", "noopener");
  });

  // ---------- Afinador ----------

  const NOTAS = ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯", "Sol", "Sol♯", "Lá", "Si♭", "Si"];
  const afin = { ctx: null, stream: null, an: null, buf: null, raf: 0, ligado: false, suave: null };
  const dlgAf = $("#dlg-afinador");

  function detectarFrequencia(buf, sr) {
    let rms = 0;
    for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / buf.length);
    if (rms < 0.012) return -1;
    let r1 = 0, r2 = buf.length - 1;
    const lim = 0.2;
    for (let i = 0; i < buf.length / 2; i++) if (Math.abs(buf[i]) < lim) { r1 = i; break; }
    for (let i = 1; i < buf.length / 2; i++) if (Math.abs(buf[buf.length - i]) < lim) { r2 = buf.length - i; break; }
    const b = buf.slice(r1, r2), n = b.length;
    const c = new Float32Array(n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) c[i] += b[j] * b[j + i];
    let d = 0; while (d < n - 1 && c[d] > c[d + 1]) d++;
    let max = -1, pos = -1;
    for (let i = d; i < n; i++) if (c[i] > max) { max = c[i]; pos = i; }
    if (pos <= 0) return -1;
    const x1 = c[pos - 1], x2 = c[pos], x3 = c[pos + 1] || x2;
    const a = (x1 + x3 - 2 * x2) / 2, bb = (x3 - x1) / 2;
    const t0 = a ? pos - bb / (2 * a) : pos;
    return sr / t0;
  }

  function quadroAfinador() {
    if (!afin.ligado) return;
    afin.an.getFloatTimeDomainData(afin.buf);
    const f = detectarFrequencia(afin.buf, afin.ctx.sampleRate);
    const ref = Number($("#af-ref").value) || 440;
    if (f > 40 && f < 2000) {
      const midi = 69 + 12 * Math.log2(f / ref);
      afin.suave = afin.suave == null ? midi : afin.suave * 0.7 + midi * 0.3;
      const nota = Math.round(afin.suave);
      const cents = Math.round((afin.suave - nota) * 100);
      const desloc = { Mib: 9, Sib: 2 }[$("#af-sax").value] || 0;
      const escrita = nota + desloc;
      $("#af-nota").textContent = NOTAS[((escrita % 12) + 12) % 12];
      $("#af-oitava").textContent = "";
      $("#af-freq").textContent = `${f.toFixed(1)} Hz · som real ${NOTAS[((nota % 12) + 12) % 12]}`;
      $("#af-cents").textContent = cents > 0 ? `+${cents}` : String(cents);
      $("#af-agulha").style.transform = `rotate(${limitar(cents, -50, 50) * 0.9}deg)`;
      const ok = Math.abs(cents) <= 5;
      dlgAf.classList.toggle("afinado", ok);
      $("#af-dica").textContent = ok ? "Afinado!" : cents < 0 ? "Baixo: empurre a boquilha para dentro" : "Alto: puxe a boquilha um pouco para fora";
    }
    afin.raf = requestAnimationFrame(quadroAfinador);
  }

  async function ligarAfinador() {
    try {
      afin.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const st = afin.stream; // um minuto de afinador ligado conta como aquecimento
      setTimeout(() => { if (afin.stream === st && st.active) marcarPasso("aq"); }, 60000);
    } catch {
      avisar(NA_PREVIA ? AVISO_PREVIA : "Libere o microfone para usar o afinador.");
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    afin.ctx = new Ctx();
    await afin.ctx.resume();
    const src = afin.ctx.createMediaStreamSource(afin.stream);
    afin.an = afin.ctx.createAnalyser();
    afin.an.fftSize = 2048;
    afin.buf = new Float32Array(afin.an.fftSize);
    src.connect(afin.an);
    afin.ligado = true; afin.suave = null;
    $("#af-ligar").innerHTML = `${icone("stop")}Parar afinador`;
    $("#af-dica").textContent = "Toque uma nota longa";
    quadroAfinador();
  }

  function desligarAfinador() {
    afin.ligado = false;
    cancelAnimationFrame(afin.raf);
    if (afin.stream) afin.stream.getTracks().forEach(t => t.stop());
    if (afin.ctx) afin.ctx.close().catch(() => {});
    afin.stream = afin.ctx = null;
    dlgAf.classList.remove("afinado");
    $("#af-ligar").innerHTML = `${icone("play")}Ligar o microfone`;
  }

  function abrirAfinador() {
    const av = $("#af-previa");
    if (av) av.hidden = !NA_PREVIA;
    $("#af-sax").value = estado.sax || "";
    dlgAf.showModal();
  }
  $("#af-ligar").addEventListener("click", () => (afin.ligado ? desligarAfinador() : ligarAfinador()));
  $("#af-fechar").addEventListener("click", () => dlgAf.close());
  dlgAf.addEventListener("close", desligarAfinador);
  $("#btn-afinador-inicio").addEventListener("click", abrirAfinador);
  $("#met-afinador").addEventListener("click", () => { pararMetronomo(); dlgMet.close(); abrirAfinador(); });

  // ---------- Busca única ----------

  const dlgBusca = $("#dlg-busca");
  let INDICE_BUSCA = null;
  function montarIndice() {
    const itens = [];
    for (const raiz of RAIZES) {
      itens.push({ tipo: "Raiz", t: raiz.titulo, sub: raiz.resumo || "", href: `#/raiz/${raiz.id}`, raiz });
      for (const ram of raiz.ramificacoes || []) {
        itens.push({ tipo: "Ramificação", t: ram.titulo, sub: raiz.titulo, href: `#/raiz/${raiz.id}`, raiz });
        for (const ex of ram.exercicios || []) itens.push({ tipo: "Exercício", t: ex.titulo, sub: `${raiz.titulo} · ${ram.titulo}`, href: `#/ex/${ex.id}`, raiz });
        for (const r of ram.referencias || []) { const u = urlReferencia(r); if (u) itens.push({ tipo: "Ouvir", t: r.titulo, sub: r.detalhe || raiz.titulo, href: u, externo: true, raiz }); }
      }
    }
    for (const k of Object.keys(LIVROS)) itens.push({ tipo: "Método", t: LIVROS[k].titulo, sub: LIVROS[k].autor || "Material de apoio", href: `#/metodo/${k}` });
    for (const i of INDICACOES) itens.push({ tipo: "Assunto", t: i.assunto, sub: `${LIVROS[i.livro].autor || LIVROS[i.livro].titulo} · ${i.onde}`, href: `#/metodo/${i.livro}`, raiz: RAMO[i.ramo]?.raiz });
    for (const t of TOCAR) itens.push({ tipo: "Play-along", t: t.t, sub: t.g, href: urlPasta(t.id), externo: true, pago: true });
    for (const it of itens) it.chave = semAcento(`${it.t} ${it.sub} ${it.tipo}`);
    return itens;
  }
  function buscar(termo) {
    INDICE_BUSCA = INDICE_BUSCA || montarIndice();
    const q = semAcento(termo.trim());
    const alvo = $("#busca-lista");
    if (q.length < 2) { alvo.innerHTML = `<p class="vazio-mini">Digite pelo menos 2 letras: um exercício, uma música, um saxofonista, um assunto…</p>`; return; }
    const partes = q.split(/\s+/);
    const achados = INDICE_BUSCA.filter(it => partes.every(p => it.chave.includes(p)) && !(it.pago && temBloqueio()));
    const ordem = ["Exercício", "Raiz", "Ramificação", "Play-along", "Ouvir", "Assunto", "Método"];
    achados.sort((a, b) => ordem.indexOf(a.tipo) - ordem.indexOf(b.tipo) || (semAcento(a.t).startsWith(q) ? -1 : 0));
    alvo.innerHTML = achados.length ? achados.slice(0, 40).map(it => {
      const bloqueado = it.raiz && !liberada(it.raiz) && it.tipo !== "Raiz";
      return `<li><a class="busca-item" href="${escapar(it.href)}"${it.externo ? ' target="_blank" rel="noopener"' : ""} ${it.raiz ? `style="${corRaiz(it.raiz)}"` : ""}>
        <span class="busca-tipo">${escapar(it.tipo)}</span>
        <span class="busca-texto"><strong>${escapar(it.t)}</strong><small>${escapar(it.sub)}</small></span>
        ${icone(bloqueado ? "cadeado" : it.externo ? "externo" : "seta")}</a></li>`;
    }).join("") + (achados.length > 40 ? `<p class="vazio-mini">Mostrando 40 de ${achados.length}. Digite mais para refinar.</p>` : "")
      : `<p class="vazio-mini">Nada encontrado para “${escapar(termo.trim())}”.</p>`;
  }
  function abrirBusca() {
    dlgBusca.showModal();
    const inp = $("#busca-geral");
    inp.value = ""; buscar("");
    setTimeout(() => inp.focus(), 50);
  }
  $("#btn-busca").addEventListener("click", abrirBusca);
  $("#busca-geral").addEventListener("input", ev => buscar(ev.target.value));
  $("#busca-fechar").addEventListener("click", () => dlgBusca.close());
  $("#busca-lista").addEventListener("click", ev => { const a = ev.target.closest("a"); if (a && !a.target) dlgBusca.close(); });

  // ---------- Comemorações ----------

  const reduzMovimento = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let confeteTimer = null;

  function celebrar(titulo, sub, ic = "trofeu") {
    const el = $("#comemora");
    $("#comemora-ic").innerHTML = icone(ic);
    $("#comemora-titulo").textContent = titulo;
    $("#comemora-sub").textContent = sub || "";
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("visivel"));
    if (!reduzMovimento()) soltarConfete();
    clearTimeout(confeteTimer);
    confeteTimer = setTimeout(fecharComemoracao, 4200);
  }

  function fecharComemoracao() {
    const el = $("#comemora");
    el.classList.remove("visivel");
    setTimeout(() => { el.hidden = true; }, 250);
  }
  $("#comemora-ok").addEventListener("click", fecharComemoracao);
  $("#comemora").addEventListener("click", ev => { if (ev.target.id === "comemora" || ev.target.id === "confete") fecharComemoracao(); });

  function soltarConfete() {
    const cv = $("#confete"), ctx = cv.getContext && cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const cores = ["#d4a24c", "#f2d48a", "#5b8def", "#ee8a45", "#3fbf8f", "#a678f0", "#ef5f8a"];
    const pedacos = Array.from({ length: 90 }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 60, y: innerHeight * .42,
      vx: (Math.random() - .5) * 9, vy: -Math.random() * 9 - 4,
      r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3,
      w: 6 + Math.random() * 6, h: 3 + Math.random() * 4, c: cores[(Math.random() * cores.length) | 0]
    }));
    const inicio = performance.now();
    (function quadro(t) {
      const dt = Math.min(2, (t - (quadro.u || t)) / 16); quadro.u = t;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of pedacos) {
        p.vy += .28 * dt; p.vx *= .99; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
      if (t - inicio < 2400) requestAnimationFrame(quadro); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(inicio);
  }

  function resumoMetas() {
    const mapa = minutosPorDia();
    const inicioSemana = segunda(new Date());
    let semana = 0;
    for (let i = 0; i < 7; i++) { const d = new Date(inicioSemana); d.setDate(d.getDate() + i); semana += mapa[dataISO(d)] || 0; }
    return { semana, hoje: mapa[hojeISO()] || 0, sequencia: calcularSequencia(mapa) };
  }

  function comemorarPratica(antes) {
    const depois = resumoMetas();
    const metaDia = Math.max(5, Math.round(estado.metaSemanal / 7));
    if (antes.semana < estado.metaSemanal && depois.semana >= estado.metaSemanal)
      return celebrar("Meta da semana batida!", `${depois.semana} minutos de estudo nesta semana.`, "alvo");
    const marcos = [3, 7, 14, 21, 30, 60, 100];
    if (depois.sequencia > antes.sequencia && marcos.includes(depois.sequencia))
      return celebrar(`${depois.sequencia} dias seguidos!`, "Constância é o que faz o som crescer.", "fogo");
    if (antes.hoje < metaDia && depois.hoje >= metaDia)
      return celebrar("Meta do dia cumprida", `${depois.hoje} minutos hoje. Até amanhã!`, "check");
    return false;
  }

  // ---------- Boas-vindas (primeira abertura) ----------

  const dlgBV = $("#dlg-boas-vindas");
  const bv = { passo: 1, sax: "", meta: 150 };
  function mostrarPassoBV() {
    dlgBV.querySelectorAll("[data-passo]").forEach(sec => { sec.hidden = Number(sec.dataset.passo) !== bv.passo; });
    dlgBV.querySelectorAll(".bv-pontos span").forEach((p, i) => p.classList.toggle("ativo", i < bv.passo));
  }
  function abrirBoasVindas() {
    bv.passo = 1; $("#bv-nome").value = estado.nome || "";
    mostrarPassoBV();
    if (!dlgBV.open) dlgBV.showModal();
  }
  function concluirBoasVindas(irEscuta) {
    const nome = $("#bv-nome").value.trim();
    if (nome) estado.nome = nome;
    estado.sax = bv.sax;
    estado.metaSemanal = bv.meta;
    estado.boasVindas = true;
    salvar();
    dlgBV.close();
    if (irEscuta) location.hash = "#/raiz/escuta"; else renderTela();
  }
  dlgBV.addEventListener("click", ev => {
    const b = ev.target.closest("button");
    if (!b) return;
    if (b.dataset.bvSax !== undefined) { bv.sax = b.dataset.bvSax; bv.passo = 3; mostrarPassoBV(); }
    else if (b.dataset.bvMeta) { bv.meta = Number(b.dataset.bvMeta); dlgBV.querySelectorAll("[data-bv-meta]").forEach(x => x.classList.toggle("ativo", x === b)); }
    else if (b.hasAttribute("data-bv-prox")) { bv.passo = Math.min(3, bv.passo + 1); mostrarPassoBV(); }
    else if (b.hasAttribute("data-bv-voltar")) { bv.passo = Math.max(1, bv.passo - 1); mostrarPassoBV(); }
    else if (b.hasAttribute("data-bv-fim")) concluirBoasVindas(true);
    else if (b.hasAttribute("data-bv-pular")) concluirBoasVindas(false);
  });
  dlgBV.addEventListener("cancel", ev => { ev.preventDefault(); concluirBoasVindas(false); });

  // ---------- Inicialização ----------

  hidratarIcones();
  renderRadio();
  if (!estado.boasVindas && !estado.nome && !estado.sessoes.length) setTimeout(abrirBoasVindas, 400);
  lerRota();
  mostrarTela();
  renderTela();
  renderTimer();

  // Atualiza o cronômetro e as datas ao voltar para o app
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) { renderTimer(); renderTela(); }
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    const tinhaVersao = !!navigator.serviceWorker.controller;
    let recarregou = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!tinhaVersao || recarregou) return;
      recarregou = true;
      location.reload();
    });
    navigator.serviceWorker.register("sw.js").then(r => r.update && r.update()).catch(() => {});
  }
})();
