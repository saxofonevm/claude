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

  // ---------- Estado e armazenamento ----------

  const estadoPadrao = () => ({
    nome: "",
    metaSemanal: 150,
    sessoes: [],       // { id, data, minutos, raizId, exercicioId, avaliacao, notas }
    feitos: {},        // { [exercicioId]: "AAAA-MM-DD" }
    prazos: {},        // { "r:<raizId>" | "e:<exercicioId>": "AAAA-MM-DD" }
    andamentos: {},    // { [exercicioId]: bpm atual }
    metronomo: { bpm: 80, compasso: 4 },
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
    for (const raiz of RAIZES) {
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
    const validas = ["inicio", "raizes", "raiz", "ex", "metodos", "metodo", "diario", "ajustes"];
    rotaAtual = validas.includes(tela) ? { tela, id: id && decodeURIComponent(id) } : { tela: "inicio", id: null };
    if (rotaAtual.tela === "raiz" && !RAIZ[rotaAtual.id]) rotaAtual = { tela: "raizes", id: null };
    if (rotaAtual.tela === "ex" && !EXERCICIO[rotaAtual.id]) rotaAtual = { tela: "raizes", id: null };
    if (rotaAtual.tela === "metodo" && !LIVROS[rotaAtual.id]) rotaAtual = { tela: "metodos", id: null };
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
      case "ex": renderExercicio(rotaAtual.id); break;
      case "metodos": renderMetodos(); break;
      case "metodo": renderMetodo(rotaAtual.id); break;
      case "diario": renderDiario(); break;
      case "ajustes": renderAjustes(); break;
    }
  }

  window.addEventListener("hashchange", () => {
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
    const larg = 340, origem = { x: 170, y: 160 };
    const pontas = RAIZES.map((_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      return { x: 36 + t * (larg - 72), y: 262 + Math.sin(t * Math.PI) * 20 };
    });
    const raizes = RAIZES.map((raiz, i) => {
      const { x, y } = pontas[i];
      const d = `M${origem.x} ${origem.y} C${origem.x} ${origem.y + 50}, ${x} ${y - 70}, ${x} ${y}`;
      const p = progressoRaiz(raiz);
      return `<a href="#/raiz/${encodeURIComponent(raiz.id)}" aria-label="Raiz ${i + 1}: ${escapar(raiz.titulo)}, ${p.pct}% concluída" style="color:${escapar(raiz.cor)}">
        <path d="${d}" class="raiz-base"/>
        ${p.pct ? `<path d="${d}" pathLength="100" class="raiz-cor" stroke-dasharray="${p.pct} 100"/>` : ""}
        <circle cx="${x}" cy="${y}" r="7" class="${p.feitos ? "no cheio" : "no"}"/>
        <text x="${x}" y="${y + 24}" text-anchor="middle" class="raiz-nome">${escapar(raiz.curto || raiz.titulo)}</text>
        <text x="${x}" y="${y + 38}" text-anchor="middle" class="raiz-pct">${p.pct}%</text>
      </a>`;
    }).join("");
    const chaves = [[161, 68], [159, 82], [157, 96], [155, 110], [153, 123]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" class="sax-chave"/>`).join("");
    return `<svg viewBox="0 0 ${larg} 330" role="img" aria-label="Seu percurso: um saxofone e as seis raízes do CMA">
      <defs>
        <linearGradient id="latao" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fbe3a4"/><stop offset=".45" stop-color="#d9a547"/><stop offset="1" stop-color="#8a5a1c"/>
        </linearGradient>
        <radialGradient id="brilho-sax" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#d4a24c" stop-opacity=".35"/><stop offset="1" stop-color="#d4a24c" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="166" cy="96" r="96" fill="url(#brilho-sax)"/>
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
      </g>
      ${raizes}
    </svg>`;
  }

  function renderInicio() {
    const hora = new Date().getHours();
    const cumprimento = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    $("#saudacao").textContent = estado.nome ? `${cumprimento}, ${estado.nome}.` : `${cumprimento}.`;
    $("#hero-data").textContent = maiuscula(new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }));
    const diaDoAno = Math.floor(deISO(hojeISO()) / 864e5);
    $("#frase-dia").textContent = FRASES[diaDoAno % FRASES.length];

    const totalFeitos = Object.keys(estado.feitos).filter(id => EXERCICIO[id]).length;
    const pctTotal = TOTAL_EXERCICIOS ? Math.round((totalFeitos / TOTAL_EXERCICIOS) * 100) : 0;
    $("#arvore").innerHTML = arvoreSVG();
    $("#percurso-pct").textContent = `${pctTotal}%`;
    $("#arvore-legenda").textContent = pctTotal === 0
      ? "Cada exercício concluído aprofunda uma raiz. Comece pela Escuta."
      : pctTotal === 100 ? "Percurso completo. Todas as raízes do CMA foram trabalhadas."
      : `${totalFeitos} de ${TOTAL_EXERCICIOS} exercícios concluídos. Toque em uma raiz para abri-la.`;

    const prox = proximoExercicio();
    const cont = $("#continuar");
    if (prox) {
      cont.href = `#/ex/${encodeURIComponent(prox.ex.id)}`;
      cont.setAttribute("style", corRaiz(prox.raiz));
      cont.innerHTML = `<span class="continuar-ilus">${ilustracao(prox.raiz.icone)}</span>
        <span class="continuar-texto">
          <span class="continuar-rotulo">Continuar</span>
          <strong>${escapar(prox.ex.titulo)}</strong>
          <span>${escapar(prox.raiz.titulo)} · ${escapar(prox.ram.titulo)}</span>
        </span>
        ${icone("seta", "continuar-seta")}`;
    } else {
      cont.href = "#/raizes";
      cont.removeAttribute("style");
      cont.innerHTML = `<span class="continuar-texto"><span class="continuar-rotulo">Percurso completo</span><strong>Todos os exercícios concluídos.</strong><span>Revise as raízes e combine os próximos passos com o professor.</span></span>`;
    }

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

    renderTimer();
  }

  // ---------- Raízes ----------

  function renderRaizes() {
    $("#lista-raizes").innerHTML = RAIZES.map((raiz, i) => {
      const p = progressoRaiz(raiz);
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
    return `<div class="referencias"><h4>${icone("nota")}Ouça as referências</h4><div class="ref-grade">${validas.map(r =>
      `<a class="ref" href="${escapar(r.href)}" target="_blank" rel="noopener">
        ${icone(r.busca && !r.url ? "youtube" : "externo", "ref-ic")}
        <span class="ref-texto"><strong>${escapar(r.titulo)}</strong>${r.detalhe ? `<span>${escapar(r.detalhe)}</span>` : ""}</span>
      </a>`).join("")}</div></div>`;
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
    if (!livros.length && !pasta) {
      return `<div class="cartao drive">${cabeca}<p class="mudo">Os métodos desta raiz serão publicados em breve pelo professor.</p></div>`;
    }
    return `<div class="cartao drive">${cabeca}
      ${livros.length ? `<p class="mudo">Em cada ramificação abaixo, abra “Nos métodos” para ver a página exata de cada assunto.</p>
      <div class="livros-chips">${livros.map(k => `<a class="livro-chip" href="#/metodo/${encodeURIComponent(k)}">
        <strong>${escapar(LIVROS[k].autor || LIVROS[k].titulo)}</strong><span>${escapar(LIVROS[k].autor ? LIVROS[k].titulo : "")}</span><em>${contagem[k]}</em>
      </a>`).join("")}</div>` : ""}
      ${pasta ? `<a class="material" href="${escapar(pasta)}" target="_blank" rel="noopener">
        ${icone("pasta")}<span>Abrir a pasta desta raiz no Drive</span>${icone("externo", "material-seta")}
      </a>` : ""}
    </div>`;
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
        <circle class="anel-valor" cx="60" cy="60" r="50" pathLength="100" stroke-dasharray="${pct} 100"/>
      </svg>
      <span class="anel-texto"><strong>${pct}%</strong><small>${escapar(rotulo)}</small></span>
    </div>`;
  }

  function renderRaiz(raiz) {
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
        ${(raiz.ramificacoes || []).map((ram, j) => `<section class="cartao ramificacao">
          <p class="ram-num">Ramificação ${dois(j + 1)}</p>
          <h3>${escapar(ram.titulo)}</h3>
          ${ram.descricao ? `<p class="mudo">${escapar(ram.descricao)}</p>` : ""}
          <div class="exercicios">
            ${(ram.exercicios || []).map(ex => `<a class="exercicio-item ${feito(ex.id) ? "feito" : ""}" href="#/ex/${encodeURIComponent(ex.id)}">
              <span class="check">${feito(ex.id) ? icone("check") : ""}</span>
              <span class="exercicio-nome"><strong>${escapar(ex.titulo)}</strong>${ex.andamento ? `<span class="mudo">${icone("metronomo")}${ex.andamento.inicial} → ${ex.andamento.alvo} bpm</span>` : ""}</span>
              ${seloPrazo("e:" + ex.id, feito(ex.id))}
              ${icone("seta", "seta")}
            </a>`).join("")}
          </div>
          ${htmlReferencias(ram.referencias)}
          ${htmlNosMetodos(ram.id, false)}
        </section>`).join("")}

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

        ${(ex.referencias || []).length ? `<div class="cartao">${htmlReferencias(ex.referencias)}</div>` : ""}

        ${indicacoesDoRamo(ram.id).length ? `<div class="cartao">
          <h2>${icone("livro")}Onde estudar nos métodos</h2>
          <p class="dica">Assuntos de “${escapar(ram.titulo)}”. Toque no nome do método para abrir o PDF e vá à página ou ao exercício indicado.</p>
          ${htmlIndicacoesPorLivro(indicacoesDoRamo(ram.id))}
        </div>` : ""}

        <div class="cartao">
          ${campoPrazo("e:" + id, "Meu prazo para este exercício")}
          ${seloPrazo("e:" + id, !!concluido)}
        </div>

        <div class="acoes-exercicio">
          <button class="btn largo ${concluido ? "" : "primario"}" id="ex-concluir">${icone("check")}${concluido ? "Desmarcar como concluído" : "Concluí este exercício"}</button>
          <button class="btn largo" id="ex-praticar">${icone("diario")}Registrar prática</button>
        </div>
      </div>
    </article>`;
  }

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
        avisar(progressoRaiz(raiz).completa ? `Raiz ${raiz.titulo} completa.` : "Exercício concluído.");
      }
      salvar(); renderTela();
    }
    if (alvo.id === "ex-praticar") abrirSessao(null, { raizId: EXERCICIO[id].raiz.id, exercicioId: id });
    if (alvo.id === "ex-metronomo") {
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
    salvar();
    if (rotaAtual.tela === "ex") renderTela();
    if (ex.andamento && estado.andamentos[exId] >= ex.andamento.alvo && anterior < ex.andamento.alvo) {
      avisar("Andamento alvo alcançado.");
    } else {
      avisar(`Andamento salvo: ${estado.andamentos[exId]} bpm`);
    }
  }

  // ---------- Metrônomo ----------

  const met = { ctx: null, tocando: false, proximo: 0, batida: 0, intervalo: null, exId: null };
  const dlgMet = $("#dlg-metronomo");

  function renderMetronomo() {
    const { bpm, compasso } = estado.metronomo;
    $("#met-bpm").textContent = bpm;
    $("#met-nome").textContent = nomeAndamento(bpm);
    $("#met-slider").value = bpm;
    $("#met-compasso").value = String(compasso);
    $("#met-tocar").innerHTML = met.tocando ? `${icone("stop")}Parar` : `${icone("play")}Tocar`;
    $("#met-salvar-bpm").hidden = !met.exId;
    $("#met-pulsos").innerHTML = Array.from({ length: compasso }, (_, i) => `<span class="pulso${i === 0 ? " forte" : ""}"></span>`).join("");
  }

  function abrirMetronomo(bpm, exId = null) {
    if (bpm) estado.metronomo.bpm = limitar(Math.round(bpm), 30, 240);
    met.exId = exId;
    renderMetronomo();
    dlgMet.showModal();
  }

  function definirBpm(bpm) {
    estado.metronomo.bpm = limitar(Math.round(bpm), 30, 240);
    salvar();
    $("#met-bpm").textContent = estado.metronomo.bpm;
    $("#met-nome").textContent = nomeAndamento(estado.metronomo.bpm);
    $("#met-slider").value = estado.metronomo.bpm;
  }

  function clique(tempo, forte) {
    const osc = met.ctx.createOscillator();
    const ganho = met.ctx.createGain();
    osc.frequency.value = forte ? 1600 : 1000;
    ganho.gain.setValueAtTime(0.0001, tempo);
    ganho.gain.exponentialRampToValueAtTime(forte ? 0.9 : 0.55, tempo + 0.002);
    ganho.gain.exponentialRampToValueAtTime(0.0001, tempo + 0.06);
    osc.connect(ganho).connect(met.ctx.destination);
    osc.start(tempo);
    osc.stop(tempo + 0.07);
  }

  function agendar() {
    const { bpm, compasso } = estado.metronomo;
    while (met.proximo < met.ctx.currentTime + 0.12) {
      const posicao = met.batida % compasso;
      clique(met.proximo, posicao === 0);
      const atraso = Math.max(0, (met.proximo - met.ctx.currentTime) * 1000);
      setTimeout(() => {
        document.querySelectorAll("#met-pulsos .pulso").forEach((p, i) => p.classList.toggle("ativo", i === posicao));
      }, atraso);
      met.proximo += 60 / bpm;
      met.batida++;
    }
  }

  function tocarMetronomo() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { avisar("Este navegador não suporta áudio."); return; }
    met.ctx = met.ctx || new Ctx();
    met.ctx.resume();
    met.tocando = true;
    met.batida = 0;
    met.proximo = met.ctx.currentTime + 0.05;
    agendar();
    met.intervalo = setInterval(agendar, 25);
    renderMetronomo();
  }

  function pararMetronomo() {
    met.tocando = false;
    clearInterval(met.intervalo);
    document.querySelectorAll("#met-pulsos .pulso").forEach(p => p.classList.remove("ativo"));
    $("#met-tocar").innerHTML = `${icone("play")}Tocar`;
  }

  $("#met-tocar").addEventListener("click", () => (met.tocando ? pararMetronomo() : tocarMetronomo()));
  $("#met-slider").addEventListener("input", ev => definirBpm(Number(ev.target.value)));
  document.querySelectorAll(".met-ajustes [data-delta]").forEach(b =>
    b.addEventListener("click", () => definirBpm(estado.metronomo.bpm + Number(b.dataset.delta))));
  $("#met-compasso").addEventListener("change", ev => {
    estado.metronomo.compasso = Number(ev.target.value);
    met.batida = 0;
    salvar(); renderMetronomo();
  });
  $("#met-salvar-bpm").addEventListener("click", () => salvarAndamento(met.exId, estado.metronomo.bpm));
  $("#met-fechar").addEventListener("click", () => dlgMet.close());
  dlgMet.addEventListener("close", pararMetronomo);
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
      `<button type="button" data-v="${i + 1}" class="${edicao.avaliacao >= i + 1 ? "ativo" : ""}" aria-label="${i + 1} de 5: ${e}">${i + 1}</button>`).join("");
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
    avisar(edicao.id ? "Prática atualizada." : "Prática registrada.");
  });

  $("#btn-registrar").addEventListener("click", () => abrirSessao(null));
  $("#btn-registrar-2").addEventListener("click", () => abrirSessao(null));

  // ---------- Diário ----------

  function renderDiario() {
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
  }

  $("#form-ajustes").addEventListener("submit", ev => {
    ev.preventDefault();
    estado.nome = $("#aj-nome").value.trim();
    estado.metaSemanal = Math.max(10, Number($("#aj-meta").value) || 150);
    salvar();
    avisar("Ajustes salvos.");
  });

  $("#btn-exportar").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cma-backup-${hojeISO()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $("#inp-importar").addEventListener("change", async ev => {
    const arquivo = ev.target.files[0];
    ev.target.value = "";
    if (!arquivo) return;
    try {
      const dados = JSON.parse(await arquivo.text());
      if (!Array.isArray(dados.sessoes)) throw new Error("formato");
      if (!(await confirmar("Importar backup?", "Os dados deste aparelho serão substituídos pelos do arquivo.", "Importar"))) return;
      estado = { ...estadoPadrao(), ...dados };
      salvar(); renderTela(); renderTimer();
      avisar("Backup importado.");
    } catch {
      avisar("Arquivo de backup inválido.");
    }
  });

  // ---------- Inicialização ----------

  hidratarIcones();
  lerRota();
  mostrarTela();
  renderTela();
  renderTimer();

  // Atualiza o cronômetro e as datas ao voltar para o app
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) { renderTimer(); renderTela(); }
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
