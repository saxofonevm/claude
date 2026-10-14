(() => {
  "use strict";

  const CHAVE = "cma.v1";
  const AVALIACOES = ["😣", "😕", "🙂", "😄", "🤩"];
  const DIAS_CURTOS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const ICONES_MATERIAL = { video: "▶️", partitura: "🎼", audio: "🎧", pdf: "📄", pasta: "📁", link: "🔗" };

  // ---------- Conteúdo (conteudo.js) ----------

  const RAIZES = (window.CMA && Array.isArray(window.CMA.raizes)) ? window.CMA.raizes : [];
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

  function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function segunda(d) {
    const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
    return r;
  }

  function diasAte(iso) {
    const hoje = deISO(hojeISO());
    return Math.round((deISO(iso) - hoje) / 864e5);
  }

  function formatarData(iso) {
    const dias = diasAte(iso);
    if (dias === 0) return "Hoje";
    if (dias === -1) return "Ontem";
    return deISO(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
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

  // ---------- Progresso e prazos ----------

  const feito = exId => !!estado.feitos[exId];

  function progressoRaiz(raiz) {
    const exs = exerciciosDaRaiz(raiz);
    const feitos = exs.filter(e => feito(e.id)).length;
    return { feitos, total: exs.length, pct: exs.length ? Math.round((feitos / exs.length) * 100) : 0 };
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
    return `<label class="campo-prazo">${escapar(rotulo)}
      <span class="campo-prazo-linha">
        <input type="date" data-prazo="${escapar(chave)}" value="${escapar(estado.prazos[chave] || "")}">
        ${estado.prazos[chave] ? `<button class="link-acao" data-limpar-prazo="${escapar(chave)}">Remover</button>` : ""}
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
        if (p.total && p.feitos === p.total) continue;
        itens.push({ iso, titulo: RAIZ[id].titulo, contexto: `Raiz · ${p.feitos}/${p.total} exercícios`, href: `#/raiz/${id}`, icone: RAIZ[id].icone });
      } else if (tipo === "e" && EXERCICIO[id] && !feito(id)) {
        const { ex, raiz } = EXERCICIO[id];
        itens.push({ iso, titulo: ex.titulo, contexto: raiz.titulo, href: `#/ex/${id}`, icone: raiz.icone });
      }
    }
    return itens.sort((a, b) => a.iso.localeCompare(b.iso));
  }

  // ---------- Navegação (rotas por #hash) ----------

  let rotaAtual = { tela: "inicio", id: null };

  function lerRota() {
    const [, tela = "inicio", id = null] = location.hash.replace(/^#/, "").split("/");
    const validas = ["inicio", "raizes", "raiz", "ex", "diario", "ajustes"];
    rotaAtual = validas.includes(tela) ? { tela, id: id && decodeURIComponent(id) } : { tela: "inicio", id: null };
    if (rotaAtual.tela === "raiz" && !RAIZ[rotaAtual.id]) rotaAtual = { tela: "raizes", id: null };
    if (rotaAtual.tela === "ex" && !EXERCICIO[rotaAtual.id]) rotaAtual = { tela: "raizes", id: null };
  }

  function mostrarTela() {
    const telaId = rotaAtual.tela === "ex" ? "exercicio" : rotaAtual.tela;
    document.querySelectorAll(".tela").forEach(t => t.classList.toggle("ativa", t.id === `tela-${telaId}`));
    const aba = ["raiz", "ex"].includes(rotaAtual.tela) ? "raizes" : rotaAtual.tela;
    document.querySelectorAll(".abas a").forEach(a => a.classList.toggle("ativa", a.dataset.aba === aba));
  }

  function renderTela() {
    switch (rotaAtual.tela) {
      case "inicio": renderInicio(); break;
      case "raizes": renderRaizes(); break;
      case "raiz": renderRaiz(RAIZ[rotaAtual.id]); break;
      case "ex": renderExercicio(rotaAtual.id); break;
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

  function renderInicio() {
    const hora = new Date().getHours();
    const cumprimento = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    $("#saudacao").textContent = estado.nome ? `${cumprimento}, ${estado.nome}! Bora tocar?` : `${cumprimento}! Bora tocar?`;

    const mapa = minutosPorDia();
    const inicioSemana = segunda(new Date());
    let totalSemana = 0;
    let html = "";
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicioSemana); d.setDate(d.getDate() + i);
      const iso = dataISO(d);
      const min = mapa[iso] || 0;
      totalSemana += min;
      html += `<div class="dia${min ? " praticou" : ""}${iso === hojeISO() ? " hoje" : ""}">${DIAS_CURTOS[i]}<div class="dia-ponto" title="${min} min">${min ? "✓" : ""}</div></div>`;
    }
    $("#semana").innerHTML = html;

    $("#stat-semana").textContent = totalSemana;
    $("#stat-sequencia").textContent = calcularSequencia(mapa);
    $("#stat-exercicios").textContent = `${Object.keys(estado.feitos).filter(id => EXERCICIO[id]).length}/${TOTAL_EXERCICIOS}`;

    const pct = Math.min(100, Math.round((totalSemana / estado.metaSemanal) * 100));
    $("#meta-barra").style.width = pct + "%";
    $("#meta-texto").textContent = `${totalSemana} / ${estado.metaSemanal} min` + (pct >= 100 ? " 🎉" : "");

    const prazos = proximosPrazos().slice(0, 6);
    $("#prazos-vazio").hidden = prazos.length > 0;
    $("#lista-prazos").innerHTML = prazos.map(p => {
      const s = statusPrazo(p.iso, false);
      return `<li><a class="prazo-item" href="${p.href}">
        <span class="prazo-icone" aria-hidden="true">${p.icone || ""}</span>
        <span class="prazo-texto"><strong>${escapar(p.titulo)}</strong><span class="mudo">${escapar(p.contexto)} · ${escapar(deISO(p.iso).toLocaleDateString("pt-BR"))}</span></span>
        <span class="selo ${s.classe}">${escapar(s.texto)}</span>
      </a></li>`;
    }).join("");
  }

  // ---------- Raízes ----------

  function renderRaizes() {
    $("#lista-raizes").innerHTML = RAIZES.map((raiz, i) => {
      const p = progressoRaiz(raiz);
      return `<a class="raiz-card" href="#/raiz/${encodeURIComponent(raiz.id)}" style="--cor:${escapar(raiz.cor || "var(--destaque)")}">
        <span class="raiz-num">${i + 1}</span>
        <span class="raiz-corpo">
          <span class="raiz-titulo">${raiz.icone ? escapar(raiz.icone) + " " : ""}${escapar(raiz.titulo)}</span>
          <span class="mudo">${escapar(raiz.resumo)}</span>
          <span class="raiz-rodape">
            <span class="barra fina"><span class="barra-preenchida" style="width:${p.pct}%"></span></span>
            <span class="mudo">${p.feitos}/${p.total}</span>
            ${seloPrazo("r:" + raiz.id, p.total > 0 && p.feitos === p.total)}
          </span>
        </span>
      </a>`;
    }).join("") || `<p class="vazio">Nenhuma raiz publicada ainda.</p>`;
  }

  function htmlReferencias(refs) {
    const validas = (refs || []).map(r => ({ ...r, href: urlReferencia(r) })).filter(r => r.href);
    if (!validas.length) return "";
    return `<div class="referencias"><h4>Referências</h4>${validas.map(r =>
      `<a class="material" href="${escapar(r.href)}" target="_blank" rel="noopener">
        <span aria-hidden="true">${r.busca && !r.url ? "▶️" : ICONES_MATERIAL[r.tipo] || ICONES_MATERIAL.link}</span>
        <span><strong>${escapar(r.titulo)}</strong>${r.detalhe ? `<span class="mudo">${escapar(r.detalhe)}</span>` : ""}</span>
        <span aria-hidden="true">↗</span>
      </a>`).join("")}</div>`;
  }

  function htmlDrive(drive) {
    const pasta = drive && urlSegura(drive.pasta || "");
    const arquivos = ((drive && drive.arquivos) || []).map(a => ({ ...a, href: urlSegura(a.url) })).filter(a => a.href);
    if (!pasta && !arquivos.length) {
      return `<div class="cartao"><h3>📁 Métodos e PDFs</h3><p class="mudo">Os materiais desta raiz serão publicados em breve pelo professor.</p></div>`;
    }
    return `<div class="cartao"><h3>📁 Métodos e PDFs</h3>
      ${arquivos.map(a => `<a class="material" href="${escapar(a.href)}" target="_blank" rel="noopener">
        <span aria-hidden="true">${ICONES_MATERIAL[a.tipo] || ICONES_MATERIAL.pdf}</span><span>${escapar(a.titulo || "Arquivo")}</span><span aria-hidden="true">↗</span>
      </a>`).join("")}
      ${pasta ? `<a class="material" href="${escapar(pasta)}" target="_blank" rel="noopener">
        <span aria-hidden="true">${ICONES_MATERIAL.pasta}</span><span>Abrir pasta no Google Drive</span><span aria-hidden="true">↗</span>
      </a>` : ""}
    </div>`;
  }

  function renderRaiz(raiz) {
    const indice = RAIZES.indexOf(raiz);
    const p = progressoRaiz(raiz);
    $("#raiz-conteudo").innerHTML = `<article class="detalhe" style="--cor:${escapar(raiz.cor || "var(--destaque)")}">
      <p class="sobretitulo">Raiz ${indice + 1} de ${RAIZES.length}</p>
      <h2 class="detalhe-titulo">${raiz.icone ? escapar(raiz.icone) + " " : ""}${escapar(raiz.titulo)}</h2>
      <p>${escapar(raiz.descricao || raiz.resumo)}</p>

      <div class="cartao">
        <div class="cartao-topo"><h3>Seu progresso</h3><span class="mudo">${p.feitos}/${p.total} exercícios</span></div>
        <div class="barra"><div class="barra-preenchida cor-raiz" style="width:${p.pct}%"></div></div>
        ${campoPrazo("r:" + raiz.id, "Meu prazo para concluir esta raiz")}
        ${seloPrazo("r:" + raiz.id, p.total > 0 && p.feitos === p.total)}
      </div>

      ${htmlDrive(raiz.drive)}

      <h3 class="secao">Ramificações</h3>
      ${(raiz.ramificacoes || []).map(ram => `<section class="cartao ramificacao">
        <h3>${escapar(ram.titulo)}</h3>
        ${ram.descricao ? `<p class="mudo">${escapar(ram.descricao)}</p>` : ""}
        ${(ram.exercicios || []).map(ex => `<a class="exercicio-item ${feito(ex.id) ? "feito" : ""}" href="#/ex/${encodeURIComponent(ex.id)}">
          <span class="check" aria-hidden="true">${feito(ex.id) ? "✓" : ""}</span>
          <span class="exercicio-nome">${escapar(ex.titulo)}${ex.andamento ? ` <span class="mudo">· ${ex.andamento.inicial}→${ex.andamento.alvo} bpm</span>` : ""}</span>
          ${seloPrazo("e:" + ex.id, feito(ex.id))}
          <span class="seta" aria-hidden="true">›</span>
        </a>`).join("")}
        ${htmlReferencias(ram.referencias)}
      </section>`).join("")}

      ${RAIZES[indice + 1] ? `<a class="btn largo" href="#/raiz/${encodeURIComponent(RAIZES[indice + 1].id)}">Próxima raiz: ${escapar(RAIZES[indice + 1].titulo)} ›</a>` : ""}
    </article>`;
  }

  // ---------- Exercício ----------

  function renderExercicio(id) {
    const { ex, ram, raiz } = EXERCICIO[id];
    $("#exercicio-voltar").href = `#/raiz/${encodeURIComponent(raiz.id)}`;
    $("#exercicio-voltar").textContent = `‹ ${raiz.titulo}`;
    const concluido = estado.feitos[id];

    let andamento = "";
    if (ex.andamento) {
      const { inicial, alvo } = ex.andamento;
      const atual = estado.andamentos[id] || inicial;
      const pct = alvo > inicial ? limitar(Math.round(((atual - inicial) / (alvo - inicial)) * 100), 0, 100) : 100;
      andamento = `<div class="cartao">
        <div class="cartao-topo"><h3>Andamento</h3><span class="mudo">${inicial} → ${alvo} bpm</span></div>
        <p class="mudo">${alvo > inicial
          ? "Comece devagar e suba aos poucos. Só aumente quando estiver limpo e relaxado."
          : `Mantenha o andamento em ${alvo} bpm com calma e controle.`}</p>
        ${alvo > inicial ? `<div class="andamento-linha">
          <span class="andamento-atual"><strong>${atual}</strong> bpm</span>
          <span class="barra"><span class="barra-preenchida cor-raiz" style="width:${pct}%"></span></span>
          <span class="mudo">${alvo}</span>
        </div>` : ""}
        <form class="andamento-form" id="form-andamento">
          <label>Meu andamento atual
            <input type="number" id="inp-andamento" min="20" max="300" value="${atual}" required>
          </label>
          <button class="btn" type="submit">Salvar</button>
        </form>
        <button class="btn primario largo" id="ex-metronomo">🎵 Metrônomo a ${atual} bpm</button>
      </div>`;
    }

    $("#exercicio-conteudo").innerHTML = `<article class="detalhe" style="--cor:${escapar(raiz.cor || "var(--destaque)")}">
      <p class="sobretitulo">${escapar(raiz.icone || "")} ${escapar(raiz.titulo)} · ${escapar(ram.titulo)}</p>
      <h2 class="detalhe-titulo">${escapar(ex.titulo)}</h2>

      ${ex.passos?.length ? `<div class="cartao"><h3>Como fazer</h3><ol class="passos">${ex.passos.map(p => `<li>${escapar(p)}</li>`).join("")}</ol></div>` : ""}

      ${andamento}

      ${(ex.referencias || []).length ? `<div class="cartao">${htmlReferencias(ex.referencias)}</div>` : ""}

      <div class="cartao">
        ${campoPrazo("e:" + id, "Meu prazo para este exercício")}
        ${seloPrazo("e:" + id, !!concluido)}
      </div>

      <div class="linha-botoes">
        <button class="btn" id="ex-praticar">Registrar prática</button>
        <button class="btn ${concluido ? "" : "primario"}" id="ex-concluir">${concluido ? "✓ Concluído" : "Marcar como concluído"}</button>
      </div>
      ${concluido ? `<p class="mudo direita">Concluído em ${escapar(deISO(concluido).toLocaleDateString("pt-BR"))}</p>` : ""}
    </article>`;
  }

  $("#exercicio-conteudo").addEventListener("click", ev => {
    const id = rotaAtual.id;
    if (ev.target.id === "ex-concluir") {
      if (estado.feitos[id]) delete estado.feitos[id];
      else { estado.feitos[id] = hojeISO(); avisar("Exercício concluído! 👏"); }
      salvar(); renderTela();
    }
    if (ev.target.id === "ex-praticar") abrirSessao(null, { raizId: EXERCICIO[id].raiz.id, exercicioId: id });
    if (ev.target.id === "ex-metronomo") {
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
    estado.andamentos[exId] = limitar(Math.round(bpm), 20, 300);
    salvar();
    if (rotaAtual.tela === "ex") renderTela();
    avisar(ex.andamento && estado.andamentos[exId] >= ex.andamento.alvo
      ? "Andamento alvo alcançado! 🎯"
      : `Andamento salvo: ${estado.andamentos[exId]} bpm`);
  }

  // ---------- Metrônomo ----------

  const met = { ctx: null, tocando: false, proximo: 0, batida: 0, intervalo: null, exId: null };
  const dlgMet = $("#dlg-metronomo");

  function renderMetronomo() {
    const { bpm, compasso } = estado.metronomo;
    $("#met-bpm").textContent = bpm;
    $("#met-slider").value = bpm;
    $("#met-compasso").value = String(compasso);
    $("#met-tocar").textContent = met.tocando ? "■ Parar" : "▶ Tocar";
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
    $("#met-tocar").textContent = "▶ Tocar";
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
    $("#timer-visor").textContent = h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;

    const rodando = !!t.inicio;
    const temTempo = rodando || t.acumulado > 0;
    $(".timer").classList.toggle("rodando", rodando);
    $("#timer-iniciar").hidden = rodando;
    $("#timer-iniciar").textContent = temTempo ? "Continuar" : "Começar a praticar";
    $("#timer-pausar").hidden = !rodando;
    $("#timer-finalizar").hidden = !temTempo;

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
      `<button type="button" data-v="${i + 1}" class="${edicao.avaliacao === i + 1 ? "ativo" : ""}" aria-label="Nota ${i + 1} de 5">${e}</button>`).join("");
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

  dlg.addEventListener("close", () => {
    if (dlg.returnValue !== "salvar") {
      if (edicao.doTimer && timer().acumulado > 0 && confirm("Descartar o tempo do cronômetro?")) {
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
    avisar(edicao.id ? "Prática atualizada." : "Prática registrada! 🎷");
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
      const tags = [];
      if (raiz) tags.push(`${raiz.icone || ""} ${raiz.titulo}`.trim());
      if (ex) tags.push(ex.titulo);
      return `<li class="sessao">
        <div class="sessao-topo">
          <span class="sessao-data">${escapar(formatarData(s.data))}${s.avaliacao ? " " + AVALIACOES[s.avaliacao - 1] : ""}</span>
          <span class="sessao-min">${formatarMinutos(s.minutos)}</span>
        </div>
        ${tags.length ? `<div class="tags">${tags.map(t => `<span class="tag">${escapar(t)}</span>`).join("")}</div>` : ""}
        ${s.notas ? `<p class="sessao-notas">${escapar(s.notas)}</p>` : ""}
        <div class="sessao-acoes">
          <button class="link-acao" data-editar="${escapar(s.id)}">Editar</button>
          <button class="link-acao" data-apagar="${escapar(s.id)}">Apagar</button>
        </div>
      </li>`;
    }).join("");
  }

  $("#lista-sessoes").addEventListener("click", ev => {
    const editar = ev.target.closest("[data-editar]");
    const apagar = ev.target.closest("[data-apagar]");
    if (editar) abrirSessao(editar.dataset.editar);
    if (apagar && confirm("Apagar esta prática?")) {
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
      if (!confirm("Substituir os dados deste aparelho pelo backup?")) return;
      estado = { ...estadoPadrao(), ...dados };
      salvar(); renderTela(); renderTimer();
      avisar("Backup importado.");
    } catch {
      avisar("Arquivo de backup inválido.");
    }
  });

  // ---------- Inicialização ----------

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
