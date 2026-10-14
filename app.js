(() => {
  "use strict";

  const CHAVE = "saxestudo.v1";
  const CATEGORIAS = ["Notas longas", "Escalas", "Técnica", "Repertório", "Leitura", "Improvisação", "Teoria", "Percepção"];
  const AVALIACOES = ["😣", "😕", "🙂", "😄", "🤩"];
  const DIAS_CURTOS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const LICOES = Array.isArray(window.LICOES) ? window.LICOES : [];
  const NIVEIS = [...new Set(LICOES.map(l => l.nivel))];

  // ---------- Estado e armazenamento ----------

  const estadoPadrao = () => ({
    nome: "",
    metaSemanal: 150,
    sessoes: [],          // { id, data: "AAAA-MM-DD", minutos, categorias[], licaoId, avaliacao, notas }
    licoesFeitas: {},     // { [licaoId]: "AAAA-MM-DD" }
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

  function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function segunda(d) {
    const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
    return r;
  }

  function formatarData(iso) {
    const d = deISO(iso);
    const hoje = hojeISO();
    const ontem = new Date(); ontem.setDate(ontem.getDate() - 1);
    if (iso === hoje) return "Hoje";
    if (iso === dataISO(ontem)) return "Ontem";
    return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
  }

  function formatarMinutos(min) {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
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

  // ---------- Navegação ----------

  function irPara(tela) {
    document.querySelectorAll(".tela").forEach(t => t.classList.toggle("ativa", t.id === `tela-${tela}`));
    const aba = tela === "licao" ? "licoes" : tela;
    document.querySelectorAll(".abas button").forEach(b => b.classList.toggle("ativa", b.dataset.tela === aba));
    window.scrollTo(0, 0);
  }

  document.querySelectorAll(".abas button").forEach(b => b.addEventListener("click", () => irPara(b.dataset.tela)));

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
    const semana = $("#semana");
    semana.innerHTML = "";
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicioSemana); d.setDate(d.getDate() + i);
      const iso = dataISO(d);
      const min = mapa[iso] || 0;
      totalSemana += min;
      const el = document.createElement("div");
      el.className = "dia" + (min ? " praticou" : "") + (iso === hojeISO() ? " hoje" : "");
      el.innerHTML = `${DIAS_CURTOS[i]}<div class="dia-ponto" title="${min} min">${min ? "✓" : ""}</div>`;
      semana.appendChild(el);
    }

    $("#stat-semana").textContent = totalSemana;
    $("#stat-sequencia").textContent = calcularSequencia(mapa);
    $("#stat-licoes").textContent = LICOES.filter(l => estado.licoesFeitas[l.id]).length;

    const pct = Math.min(100, Math.round((totalSemana / estado.metaSemanal) * 100));
    $("#meta-barra").style.width = pct + "%";
    $("#meta-texto").textContent = `${totalSemana} / ${estado.metaSemanal} min` + (pct >= 100 ? " 🎉" : "");
  }

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

  $("#s-categorias").innerHTML = CATEGORIAS.map(c =>
    `<label class="chip"><input type="checkbox" value="${escapar(c)}"><span>${escapar(c)}</span></label>`).join("");

  $("#s-licao").insertAdjacentHTML("beforeend", LICOES.map(l =>
    `<option value="${escapar(l.id)}">${escapar(l.nivel)} · ${escapar(l.titulo)}</option>`).join(""));

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
    $("#s-licao").value = s?.licaoId || opcoes.licaoId || "";
    $("#s-notas").value = s?.notas || "";
    const cats = s?.categorias || [];
    $("#s-categorias").querySelectorAll("input").forEach(i => { i.checked = cats.includes(i.value); });
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
      categorias: [...$("#s-categorias").querySelectorAll("input:checked")].map(i => i.value),
      licaoId: $("#s-licao").value || null,
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
    renderTudo();
    renderTimer();
    avisar(edicao.id ? "Prática atualizada." : "Prática registrada! 🎷");
  });

  $("#btn-registrar").addEventListener("click", () => abrirSessao(null));
  $("#btn-registrar-2").addEventListener("click", () => abrirSessao(null));

  // ---------- Diário ----------

  function renderDiario() {
    const lista = $("#lista-sessoes");
    const ordenadas = [...estado.sessoes].sort((a, b) => b.data.localeCompare(a.data) || b.id.localeCompare(a.id));
    $("#diario-vazio").hidden = ordenadas.length > 0;
    lista.innerHTML = ordenadas.map(s => {
      const licao = LICOES.find(l => l.id === s.licaoId);
      const tags = [...(s.categorias || [])];
      if (licao) tags.push("📚 " + licao.titulo);
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
      salvar(); renderTudo();
    }
  });

  // ---------- Lições ----------

  let filtroNivel = "Todos";

  function renderFiltros() {
    $("#filtros-nivel").innerHTML = ["Todos", ...NIVEIS].map(n =>
      `<button class="filtro ${n === filtroNivel ? "ativo" : ""}" data-nivel="${escapar(n)}">${escapar(n)}</button>`).join("");
  }

  $("#filtros-nivel").addEventListener("click", ev => {
    const b = ev.target.closest("[data-nivel]");
    if (!b) return;
    filtroNivel = b.dataset.nivel;
    renderLicoes();
  });

  function renderLicoes() {
    renderFiltros();
    const niveis = filtroNivel === "Todos" ? NIVEIS : [filtroNivel];
    $("#lista-licoes").innerHTML = LICOES.length ? niveis.map(nivel => {
      const doNivel = LICOES.filter(l => l.nivel === nivel);
      const feitas = doNivel.filter(l => estado.licoesFeitas[l.id]).length;
      return `<h3 class="grupo-nivel">${escapar(nivel)} · ${feitas}/${doNivel.length}</h3>` +
        doNivel.map(l => `<button class="licao-item ${estado.licoesFeitas[l.id] ? "feita" : ""}" data-licao="${escapar(l.id)}">
          <span class="licao-check">${estado.licoesFeitas[l.id] ? "✓" : ""}</span>
          <span><strong>${escapar(l.titulo)}</strong><span class="mudo">${escapar(l.resumo)}</span></span>
        </button>`).join("");
    }).join("") : `<p class="vazio">Nenhuma lição publicada ainda.</p>`;
  }

  $("#lista-licoes").addEventListener("click", ev => {
    const b = ev.target.closest("[data-licao]");
    if (b) abrirLicao(b.dataset.licao);
  });

  const ICONES_MATERIAL = { video: "▶️", partitura: "🎼", audio: "🎧", link: "🔗" };

  function urlSegura(url) {
    try {
      const u = new URL(url, location.href);
      return ["http:", "https:"].includes(u.protocol) ? u.href : null;
    } catch { return null; }
  }

  let licaoAberta = null;

  function abrirLicao(id) {
    const l = LICOES.find(x => x.id === id);
    if (!l) return;
    licaoAberta = id;
    const feita = estado.licoesFeitas[l.id];
    const materiais = (l.materiais || []).map(m => ({ ...m, url: urlSegura(m.url) })).filter(m => m.url);
    $("#licao-conteudo").innerHTML = `<article class="licao-detalhe">
      <p class="mudo">${escapar(l.nivel)}</p>
      <h2>${escapar(l.titulo)}</h2>
      <p>${escapar(l.resumo)}</p>
      ${l.objetivos?.length ? `<div class="cartao"><h3>Objetivos</h3><ul>${l.objetivos.map(o => `<li>${escapar(o)}</li>`).join("")}</ul></div>` : ""}
      ${l.exercicios?.length ? `<div class="cartao"><h3>Exercícios</h3><ol>${l.exercicios.map(o => `<li>${escapar(o)}</li>`).join("")}</ol></div>` : ""}
      ${materiais.length ? `<div class="cartao"><h3>Materiais</h3>${materiais.map(m =>
        `<a class="material" href="${escapar(m.url)}" target="_blank" rel="noopener">
          <span>${ICONES_MATERIAL[m.tipo] || ICONES_MATERIAL.link}</span><span>${escapar(m.titulo || m.url)}</span><span>↗</span>
        </a>`).join("")}</div>` : ""}
      <div class="linha-botoes">
        <button class="btn" id="licao-praticar">Registrar prática</button>
        <button class="btn ${feita ? "" : "primario"}" id="licao-concluir">${feita ? "✓ Concluída" : "Marcar como concluída"}</button>
      </div>
      ${feita ? `<p class="mudo" style="text-align:right">Concluída em ${escapar(deISO(feita).toLocaleDateString("pt-BR"))}</p>` : ""}
    </article>`;
    irPara("licao");
  }

  $("#licao-conteudo").addEventListener("click", ev => {
    if (ev.target.id === "licao-concluir") {
      if (estado.licoesFeitas[licaoAberta]) delete estado.licoesFeitas[licaoAberta];
      else { estado.licoesFeitas[licaoAberta] = hojeISO(); avisar("Lição concluída! 👏"); }
      salvar(); renderTudo(); abrirLicao(licaoAberta);
    }
    if (ev.target.id === "licao-praticar") abrirSessao(null, { licaoId: licaoAberta });
  });

  $("#licao-voltar").addEventListener("click", () => irPara("licoes"));

  // ---------- Ajustes ----------

  function renderAjustes() {
    $("#aj-nome").value = estado.nome;
    $("#aj-meta").value = estado.metaSemanal;
  }

  $("#form-ajustes").addEventListener("submit", ev => {
    ev.preventDefault();
    estado.nome = $("#aj-nome").value.trim();
    estado.metaSemanal = Math.max(10, Number($("#aj-meta").value) || 150);
    salvar(); renderTudo();
    avisar("Ajustes salvos.");
  });

  $("#btn-exportar").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sax-estudo-backup-${hojeISO()}.json`;
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
      salvar(); renderTudo(); renderTimer();
      avisar("Backup importado.");
    } catch {
      avisar("Arquivo de backup inválido.");
    }
  });

  // ---------- Inicialização ----------

  function renderTudo() {
    renderInicio();
    renderDiario();
    renderLicoes();
    renderAjustes();
  }

  renderTudo();
  renderTimer();

  // Atualiza o cronômetro e o "Hoje" ao voltar para o app
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) { renderTimer(); renderInicio(); renderDiario(); }
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
