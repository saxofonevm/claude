/*
 * Naipe — Trilha "Aprender" (protótipo da Unidade 1)
 * Lições curtas em passos: ler, ritmo, ouvir e tocar (o app escuta pelo microfone).
 * Fica em #/trilha e #/trilha/<lição>. O progresso é salvo em localStorage "naipe.trilha.v1".
 */
(function () {
  "use strict";

  // ---------- Conteúdo ----------
  // Notas escritas (clave de sol). passo = posição na pauta a partir do Mi da 1ª linha.
  const NOTA = {
    sol: { nome: "Sol", passo: 2, midi: 67, dedos: 3 },
    la: { nome: "Lá", passo: 3, midi: 69, dedos: 2 },
    si: { nome: "Si", passo: 4, midi: 71, dedos: 1 },
  };

  // Melodia original da lição 6: [nota, tempos]
  const MELODIA = [["si", 2], ["la", 2], ["sol", 4], ["si", 1], ["si", 1], ["la", 1], ["la", 1], ["sol", 4]];

  const LICOES = [
    {
      id: "som", titulo: "O primeiro som", resumo: "Respiração, embocadura e uma nota longa",
      passos: [
        { tipo: "info", titulo: "Antes das notas, o som", texto: ["O saxofone responde ao ar. Um som firme nasce de uma respiração calma e de uma embocadura relaxada.", "Nesta lição você não precisa ler nada. Só soprar e ouvir."] },
        { tipo: "info", titulo: "Embocadura em 3 pontos", lista: ["Dentes de cima apoiados na boquilha, a cerca de 1 cm da ponta.", "Lábio de baixo levemente dobrado sobre os dentes, como uma almofada.", "Cantos da boca firmes, para o ar não escapar. Bochechas sem inflar."], video: "Vídeo do Tiago: embocadura e postura" },
        { tipo: "escolha", pergunta: "Na respiração para tocar, o que deve acontecer com os ombros?", opcoes: ["Sobem a cada respiração", "Ficam parados e relaxados", "Vão para a frente"], certa: 1, explica: "O ar entra pela boca e enche a parte baixa do tronco. Ombro subindo é sinal de tensão." },
        { tipo: "tocar", livre: true, segundos: 3, titulo: "Sua vez: uma nota longa", texto: "Toque qualquer nota e sustente o som por 3 segundos, sem tremer." },
        { tipo: "escolha", pergunta: "Para começar o som, a língua…", opcoes: ["Bate forte na palheta", "Encosta de leve, como quem diz “tu”", "Não participa"], certa: 1, explica: "A língua solta o ar com um “tu” leve. Quem faz o som é o ar." },
      ],
    },
    {
      id: "pauta", titulo: "A pauta e a clave de sol", resumo: "Onde as notas moram",
      passos: [
        { tipo: "info", titulo: "Cinco linhas, quatro espaços", texto: ["A música é escrita na pauta: cinco linhas e quatro espaços, contados de baixo para cima.", "Quanto mais alta a nota na pauta, mais agudo o som."], pauta: [] },
        { tipo: "escolha", pergunta: "Quantas linhas tem a pauta?", opcoes: ["Quatro", "Cinco", "Seis"], certa: 1 },
        { tipo: "info", titulo: "A clave de sol", texto: ["O sinal no começo da pauta é a clave de sol. Ela marca a 2ª linha: a nota escrita nessa linha se chama Sol.", "A partir do Sol você encontra todas as outras."], pauta: [["sol", 4]] },
        { tipo: "escolha", pergunta: "Em qual linha fica a nota Sol?", opcoes: ["1ª linha", "2ª linha", "3ª linha"], certa: 1, pauta: [["sol", 4]] },
        { tipo: "ouvir", pergunta: "Ouça os dois sons. Qual é o mais agudo?", sons: ["sol", "si"], opcoes: ["O primeiro", "O segundo"], certa: 1, explica: "O segundo som era o Si, que fica acima do Sol na pauta." },
      ],
    },
    {
      id: "notas", titulo: "Sol, Lá e Si", resumo: "As três primeiras notas, na pauta e no sax",
      passos: [
        { tipo: "info", titulo: "Três notas, três dedos", texto: ["As primeiras notas usam só a mão esquerda. Cada dedo que você fecha deixa o som mais grave."], dedos: ["si", "la", "sol"] },
        { tipo: "info", titulo: "Na pauta", texto: ["Sol na 2ª linha, Lá no espaço logo acima, Si na 3ª linha. Sobem como degraus."], pauta: [["sol", 4], ["la", 4], ["si", 4]], rotulos: true },
        { tipo: "escolha", pergunta: "Que nota é esta?", pauta: [["la", 4]], opcoes: ["Sol", "Lá", "Si"], certa: 1 },
        { tipo: "escolha", pergunta: "Que nota é esta?", pauta: [["si", 4]], opcoes: ["Sol", "Lá", "Si"], certa: 2 },
        { tipo: "escolha", pergunta: "Quantos dedos da mão esquerda fecham para tocar o Sol?", opcoes: ["Um", "Dois", "Três"], certa: 2 },
        { tipo: "tocar", nota: "si", segundos: 2, titulo: "Toque o Si", texto: "Um dedo fechado. Sustente por 2 segundos." },
        { tipo: "tocar", nota: "la", segundos: 2, titulo: "Toque o Lá", texto: "Dois dedos fechados." },
        { tipo: "tocar", nota: "sol", segundos: 2, titulo: "Toque o Sol", texto: "Três dedos fechados." },
      ],
    },
    {
      id: "pulso", titulo: "O pulso", resumo: "Semibreve, mínima e semínima",
      passos: [
        { tipo: "info", titulo: "A música tem um coração", texto: ["O pulso é a batida regular da música, a mesma que faz você bater o pé.", "Cada figura diz por quantos pulsos (tempos) o som dura."], figuras: true },
        { tipo: "escolha", pergunta: "Quantos tempos dura a mínima?", pauta: [["sol", 2]], opcoes: ["Um", "Dois", "Quatro"], certa: 1 },
        { tipo: "ritmo", titulo: "Bata as semínimas", texto: "Depois da contagem, toque no botão em cada batida: quatro semínimas.", padrao: [1, 1, 1, 1] },
        { tipo: "ritmo", titulo: "Bata as mínimas", texto: "Agora duas mínimas: toque no 1 e no 3 e deixe o som durar.", padrao: [2, 2] },
        { tipo: "escolha", pergunta: "Qual figura dura quatro tempos?", opcoes: ["Semínima", "Mínima", "Semibreve"], certa: 2 },
        { tipo: "ritmo", titulo: "Misture as figuras", texto: "Mínima, semínima, semínima.", padrao: [2, 1, 1] },
      ],
    },
    {
      id: "ler", titulo: "Ler e tocar", resumo: "Nota e duração ao mesmo tempo",
      passos: [
        { tipo: "info", titulo: "Duas perguntas para cada nota", texto: ["Ao ler, pergunte sempre: que nota é? Quanto dura?", "A posição na pauta responde a primeira. O desenho da figura responde a segunda."], pauta: [["si", 2], ["la", 1], ["sol", 1]], rotulos: true },
        { tipo: "escolha", pergunta: "Qual é a primeira nota e quanto ela dura?", pauta: [["la", 2], ["sol", 2]], opcoes: ["Lá, dois tempos", "Sol, dois tempos", "Lá, um tempo"], certa: 0 },
        { tipo: "ritmo", titulo: "Primeiro o ritmo", texto: "Bata o ritmo deste compasso antes de tocar.", pauta: [["si", 2], ["la", 1], ["sol", 1]], padrao: [2, 1, 1] },
        { tipo: "tocar", nota: "si", segundos: 2, titulo: "Agora as notas", texto: "Toque o Si e sustente.", pauta: [["si", 2], ["la", 1], ["sol", 1]] },
        { tipo: "tocar", nota: "la", segundos: 1, titulo: "Lá", texto: "Passe para o Lá." },
        { tipo: "tocar", nota: "sol", segundos: 1, titulo: "Sol", texto: "E termine no Sol." },
      ],
    },
    {
      id: "musica", titulo: "Primeira música", resumo: "“Primeiro Passo”, com Sol, Lá e Si",
      passos: [
        { tipo: "info", titulo: "Primeiro Passo", texto: ["Esta é a sua primeira música. Ela usa só o que você aprendeu: três notas e três figuras.", "Ouça uma vez acompanhando a partitura com os olhos."], melodia: true },
        { tipo: "escolha", pergunta: "Com que nota a música termina?", melodia: true, opcoes: ["Si", "Lá", "Sol"], certa: 2 },
        { tipo: "musica", titulo: "Toque junto com o pulso", texto: "Depois da contagem, toque a música. O app acompanha cada nota pelo microfone." },
      ],
    },
  ];

  const PROXIMAS = ["Unidade 2 · Dó, Ré e a mão direita", "Unidade 3 · Colcheias e ligaduras", "Unidade 4 · A escala de Sol maior", "Unidade 5 · Sua primeira música brasileira"];

  // ---------- Estado ----------
  const CHAVE = "naipe.trilha.v1";
  let prog = { feitas: {}, pontos: 0 };
  try { prog = Object.assign(prog, JSON.parse(localStorage.getItem(CHAVE) || "{}")); } catch { /* sem armazenamento */ }
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(prog)); } catch { /* segue sem salvar */ } };
  const saxDoApp = () => { try { return (JSON.parse(localStorage.getItem("cma.v1") || "{}").sax) || prog.sax || ""; } catch { return prog.sax || ""; } };

  const $ = s => document.querySelector(s);
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const raiz = () => $("#trilha-conteudo");

  // ---------- Desenhos ----------
  const CLAVE = "M12.6 47.5c-2.9 0-5-1.7-5-4 0-1.6 1.2-2.8 2.7-2.8 1.4 0 2.5 1 2.5 2.4 0 1.2-.8 2-1.9 2.2.5.5 1.2.7 2 .7 2.6 0 4-2 3.6-5.6l-.5-4.2c-.9.2-1.9.3-2.9.3-5.300 0-9.5-3.900-9.500-9 0-4.200 2.700-7.300 6.200-10.600l2.300-2.200c-.4-2.400-.6-4-.6-5.800 0-3.900 1.900-7.600 4.600-8.900 1.600 2 2.600 5 2.600 7.800 0 4-1.900 7.100-4.800 10l.900 5.300c.3 0 .7-.1 1-.1 4 0 6.900 3 6.900 6.800 0 3.200-2 5.800-5.200 6.900l.5 4.100c.6 4.700-1.700 7.700-5.400 7.700zm3.100-13.300l-1.300-9.400c-2.300.4-3.800 2.200-3.800 4.200 0 1.400.7 2.500 1.900 3.200-.2.300-.4.500-.6.600-2-1-3.200-2.900-3.200-5.100 0-3.100 2.200-5.600 5.300-6.200l-.7-4.600-1.700 1.600c-3 2.900-5 5.400-5 8.700 0 4.100 3.300 7.300 7.500 7.300.6 0 1.100-.1 1.600-.3zm1.200-9.400l1.200 8.800c2.200-.9 3.600-2.800 3.600-4.900 0-2.200-1.800-3.900-4.800-3.900zm-1.600-9.900c2.300-2.300 3.900-4.900 3.900-7.700 0-1.300-.4-2.600-1.100-3.300-1.900 1-3.300 3.700-3.300 7 0 1.300.2 2.700.5 4z";

  // Pauta com notas: itens = [[nota, tempos], ...]. destaque = índice da nota ativa.
  function svgPauta(itens, { rotulos = false, destaque = -1, compassos = false } = {}) {
    const larg = Math.max(220, 70 + itens.length * 46 + 16);
    let x = 74, tempos = 0, corpo = "";
    itens.forEach(([n, t], i) => {
      const nt = NOTA[n], y = 70 - nt.passo * 5, cheio = t === 1, cls = i === destaque ? "tr-nota ativa" : i < destaque ? "tr-nota feita" : "tr-nota";
      corpo += `<g class="${cls}"><ellipse cx="${x}" cy="${y}" rx="6.6" ry="4.7" transform="rotate(-20 ${x} ${y})" ${cheio ? "" : 'fill="none" stroke-width="2"'} class="${cheio ? "cab cheia" : "cab oca"}"/>${t < 4 ? `<line x1="${x + 6}" y1="${y - 1.5}" x2="${x + 6}" y2="${y - 32}" class="haste"/>` : ""}${rotulos ? `<text x="${x}" y="98" text-anchor="middle" class="tr-rot">${nt.nome}</text>` : ""}</g>`;
      tempos += t; x += 46;
      if (compassos && tempos % 4 === 0 && i < itens.length - 1) { corpo += `<line x1="${x - 20}" y1="30" x2="${x - 20}" y2="70" class="tr-barra"/>`; }
    });
    const linhas = [30, 40, 50, 60, 70].map(y => `<line x1="6" y1="${y}" x2="${larg - 6}" y2="${y}"/>`).join("");
    return `<svg class="tr-pauta" viewBox="0 0 ${larg} ${rotulos ? 106 : 92}" role="img" aria-label="Pauta musical"><g class="tr-linhas">${linhas}<line x1="${larg - 6}" y1="30" x2="${larg - 6}" y2="70"/></g><path class="tr-clave" transform="translate(12 13.5) scale(1.42)" d="${CLAVE}"/>${corpo}</svg>`;
  }

  // Mão esquerda: três chaves, fechadas de cima para baixo.
  function svgDedos(notas) {
    return `<div class="tr-dedos">${notas.map(n => {
      const nt = NOTA[n];
      return `<figure><svg viewBox="0 0 40 96" aria-hidden="true"><rect x="14" y="4" width="12" height="88" rx="6" class="tubo"/>${[0, 1, 2].map(i => `<circle cx="20" cy="${22 + i * 26}" r="9.5" class="${i < nt.dedos ? "chave fechada" : "chave"}"/>`).join("")}</svg><figcaption><strong>${nt.nome}</strong>${nt.dedos} ${nt.dedos === 1 ? "dedo" : "dedos"}</figcaption></figure>`;
    }).join("")}</div>`;
  }

  function htmlFiguras() {
    const fig = (nome, t, n) => `<li>${svgPauta([[n, t]])}<span><strong>${nome}</strong>${t} ${t === 1 ? "tempo" : "tempos"}</span></li>`;
    return `<ul class="tr-figuras">${fig("Semibreve", 4, "sol")}${fig("Mínima", 2, "sol")}${fig("Semínima", 1, "sol")}</ul>`;
  }

  // ---------- Áudio ----------
  let ctx = null;
  function audio() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; ctx = new C(); }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function clique(quando, forte) {
    const a = audio(), o = a.createOscillator(), g = a.createGain();
    o.frequency.value = forte ? 1320 : 880; o.type = "square";
    g.gain.setValueAtTime(0.0001, quando); g.gain.exponentialRampToValueAtTime(forte ? 0.22 : 0.14, quando + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, quando + 0.07);
    o.connect(g).connect(a.destination); o.start(quando); o.stop(quando + 0.09);
  }
  // Som real que o sax produz para a nota escrita (alto: 9 semitons abaixo; tenor: 14 abaixo).
  const somReal = midi => midi - (saxDoApp() === "Sib" ? 14 : 9);
  function tom(midi, quando, dur) {
    const a = audio(), o = a.createOscillator(), g = a.createGain();
    o.type = "triangle"; o.frequency.value = 440 * Math.pow(2, (somReal(midi) - 69) / 12);
    g.gain.setValueAtTime(0.0001, quando); g.gain.exponentialRampToValueAtTime(0.25, quando + 0.03); g.gain.setValueAtTime(0.25, quando + dur - 0.08); g.gain.exponentialRampToValueAtTime(0.0001, quando + dur);
    o.connect(g).connect(a.destination); o.start(quando); o.stop(quando + dur + 0.02);
  }

  // ---------- Microfone ----------
  const mic = { stream: null, an: null, buf: null, raf: 0 };
  function detectar(buf, sr) {
    let rms = 0;
    for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / buf.length) < 0.012) return -1;
    const n = buf.length, c = new Float32Array(n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) c[i] += buf[j] * buf[j + i];
    let d = 0; while (d < n - 1 && c[d] > c[d + 1]) d++;
    let max = -1, pos = -1;
    for (let i = d; i < n; i++) if (c[i] > max) { max = c[i]; pos = i; }
    if (pos <= 0) return -1;
    const x1 = c[pos - 1], x2 = c[pos], x3 = c[pos + 1] || x2, a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    return sr / (a ? pos - b / (2 * a) : pos);
  }
  async function ligarMic() {
    if (mic.stream) return true;
    try {
      mic.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch { return false; }
    const a = audio();
    mic.an = a.createAnalyser(); mic.an.fftSize = 2048; mic.buf = new Float32Array(2048);
    a.createMediaStreamSource(mic.stream).connect(mic.an);
    return true;
  }
  function desligarMic() {
    cancelAnimationFrame(mic.raf);
    if (mic.stream) mic.stream.getTracks().forEach(t => t.stop());
    mic.stream = mic.an = null;
  }
  // Classe da nota ouvida, já convertida para a nota ESCRITA do sax (0 = Dó … 11 = Si), ou -1.
  function notaOuvida() {
    if (!mic.an) return -1;
    mic.an.getFloatTimeDomainData(mic.buf);
    const f = detectar(mic.buf, ctx.sampleRate);
    if (!(f > 60 && f < 1600)) return -1;
    const real = Math.round(69 + 12 * Math.log2(f / 440));
    return (((real + (saxDoApp() === "Sib" ? 2 : 9)) % 12) + 12) % 12;
  }

  // ---------- Telas ----------
  let sessao = null; // { licao, i, erros }
  const temporizadores = [];
  function limpar() {
    temporizadores.splice(0).forEach(clearTimeout);
    desligarMic();
    if (ctx && ctx.state === "running") ctx.suspend();
  }

  function renderTrilha() {
    limpar(); sessao = null;
    const feitas = LICOES.filter(l => prog.feitas[l.id]).length;
    const atual = LICOES.findIndex(l => !prog.feitas[l.id]);
    raiz().innerHTML = `
      <header class="cabecalho">
        <a class="btn-voltar" href="#/inicio">‹ Início</a>
        <p class="sobretitulo">Aprender · versão de teste</p>
        <h1>Do zero à primeira música</h1>
        <p class="mudo">Lições de 3 a 5 minutos. Você lê, bate o ritmo, ouve e toca. O Naipe escuta o seu sax.</p>
      </header>
      <div class="corpo tr-corpo">
        <section class="cartao tr-unidade">
          <div class="tr-unidade-topo"><div><span class="rotulo">Unidade 1</span><h2>Primeiro som</h2></div><span class="tr-conta">${feitas} de ${LICOES.length}</span></div>
          <div class="tr-barra-prog"><span style="width:${Math.round(feitas / LICOES.length * 100)}%"></span></div>
          <ol class="tr-licoes">${LICOES.map((l, i) => {
            const feita = !!prog.feitas[l.id], aberta = feita || i === atual || atual === -1;
            const marca = feita ? "✓" : i + 1;
            const miolo = `<span class="tr-num">${marca}</span><span class="tr-lic-txt"><strong>${esc(l.titulo)}</strong><small>${esc(l.resumo)}</small></span><span class="tr-lic-acao">${feita ? "Refazer" : aberta ? "Começar" : "Bloqueada"}</span>`;
            return `<li class="${feita ? "feita" : aberta ? "atual" : "fechada"}">${aberta ? `<a href="#/trilha/${l.id}">${miolo}</a>` : `<div>${miolo}</div>`}</li>`;
          }).join("")}</ol>
        </section>
        <section class="cartao tr-proximas"><span class="rotulo">Em seguida</span><ul>${PROXIMAS.map(p => `<li>${esc(p)}</li>`).join("")}</ul><p class="mudo">Em construção. Cada unidade termina com uma música.</p></section>
        ${prog.pontos ? `<p class="mudo tr-pontos">${prog.pontos} pontos de estudo nesta trilha</p>` : ""}
      </div>`;
  }

  function renderLicao(id) {
    const licao = LICOES.find(l => l.id === id);
    if (!licao) return renderTrilha();
    limpar();
    sessao = { licao, i: 0, erros: 0 };
    passo();
  }

  function moldura(miolo, { botao = "Continuar", pronto = true } = {}) {
    const { licao, i } = sessao;
    raiz().innerHTML = `
      <div class="tr-licao">
        <div class="tr-topo"><a class="tr-fechar" href="#/trilha" aria-label="Sair da lição">✕</a><div class="tr-barra-prog"><span style="width:${Math.round(i / licao.passos.length * 100)}%"></span></div><span class="tr-conta">${i + 1}/${licao.passos.length}</span></div>
        <div class="tr-passo">${miolo}</div>
        <div class="tr-rodape"><p class="tr-retorno" id="tr-retorno" aria-live="polite"></p><button class="btn primario largo" id="tr-avancar" type="button" ${pronto ? "" : "disabled"}>${botao}</button></div>
      </div>`;
    $("#tr-avancar").addEventListener("click", avancar);
    window.scrollTo(0, 0);
  }
  function liberar(texto, ok = true) {
    const r = $("#tr-retorno"), b = $("#tr-avancar");
    if (r) { r.textContent = texto || ""; r.className = "tr-retorno " + (ok ? "ok" : "nao"); }
    if (b) { b.disabled = false; b.textContent = "Continuar"; }
  }
  function avancar() {
    limparPasso();
    sessao.i++;
    if (sessao.i >= sessao.licao.passos.length) return concluir();
    passo();
  }
  function limparPasso() { temporizadores.splice(0).forEach(clearTimeout); cancelAnimationFrame(mic.raf); }

  const apoio = p => (p.pauta ? svgPauta(p.pauta, { rotulos: p.rotulos }) : "") + (p.melodia ? svgPauta(MELODIA, { compassos: true }) : "") + (p.dedos ? svgDedos(p.dedos) : "") + (p.figuras ? htmlFiguras() : "");

  function passo() {
    const p = sessao.licao.passos[sessao.i];
    ({ info: passoInfo, escolha: passoEscolha, ouvir: passoEscolha, ritmo: passoRitmo, tocar: passoTocar, musica: passoMusica })[p.tipo](p);
  }

  function passoInfo(p) {
    moldura(`<h2>${esc(p.titulo)}</h2>${(p.texto || []).map(t => `<p>${esc(t)}</p>`).join("")}${p.lista ? `<ol class="tr-lista">${p.lista.map(t => `<li>${esc(t)}</li>`).join("")}</ol>` : ""}${apoio(p)}${p.melodia ? `<button class="btn" id="tr-ouvir" type="button">▶ Ouvir a música</button>` : ""}${p.video ? `<div class="tr-video"><span>▶</span>${esc(p.video)}<small>entra aqui na versão final</small></div>` : ""}`);
    const b = $("#tr-ouvir");
    if (b) b.addEventListener("click", () => { let t = audio().currentTime + 0.1; const bt = 60 / 76; MELODIA.forEach(([n, d]) => { tom(NOTA[n].midi, t, d * bt * 0.95); t += d * bt; }); });
  }

  function passoEscolha(p) {
    moldura(`<h2>${esc(p.pergunta)}</h2>${apoio(p)}${p.tipo === "ouvir" ? `<button class="btn" id="tr-ouvir" type="button">▶ Ouvir</button>` : ""}<div class="tr-opcoes">${p.opcoes.map((o, i) => `<button type="button" data-i="${i}">${esc(o)}</button>`).join("")}</div>`, { botao: "Escolha uma resposta", pronto: false });
    const tocarSons = () => { let t = audio().currentTime + 0.1; p.sons.forEach(n => { tom(NOTA[n].midi, t, 0.9); t += 1.1; }); };
    if (p.tipo === "ouvir") $("#tr-ouvir").addEventListener("click", tocarSons);
    raiz().querySelectorAll(".tr-opcoes button").forEach(b => b.addEventListener("click", () => {
      if (raiz().querySelector(".tr-opcoes .certa")) return;
      const i = Number(b.dataset.i);
      if (i === p.certa) {
        b.classList.add("certa");
        raiz().querySelectorAll(".tr-opcoes button").forEach(x => { x.disabled = true; });
        liberar(p.explica || "Isso mesmo.");
      } else {
        b.classList.add("errada"); b.disabled = true; sessao.erros++;
        const r = $("#tr-retorno"); r.textContent = "Ainda não. Olhe de novo e tente outra."; r.className = "tr-retorno nao";
      }
    }));
  }

  function passoRitmo(p) {
    const bpm = 72, bt = 60 / bpm, total = p.padrao.reduce((a, b) => a + b, 0);
    const blocos = p.padrao.map(t => `<span style="flex:${t}">${t}<small>${t === 1 ? "tempo" : "tempos"}</small></span>`).join("");
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p>${apoio(p)}<div class="tr-ritmo-linha" id="tr-linha">${blocos}<i id="tr-cursor"></i></div><p class="tr-conta-voz" id="tr-voz">Toque em “Começar” e ouça a contagem de 4.</p><button class="tr-bater" id="tr-bater" type="button">Começar</button>`, { botao: "Bata o ritmo", pronto: false });
    const bater = $("#tr-bater"), voz = $("#tr-voz");
    let fase = "espera", inicio = 0, toques = [];
    const esperados = []; p.padrao.reduce((t, d) => { esperados.push(t); return t + d; }, 0);
    function comecar() {
      const a = audio(); inicio = a.currentTime + 0.15 + 4 * bt; toques = []; fase = "contagem";
      for (let k = 0; k < 4 + total; k++) clique(a.currentTime + 0.15 + k * bt, k % 4 === 0);
      bater.textContent = "Toque aqui"; bater.classList.add("ativo");
      for (let k = 0; k < 4; k++) temporizadores.push(setTimeout(() => { voz.textContent = `Contagem: ${k + 1}`; }, (0.15 + k * bt) * 1000));
      temporizadores.push(setTimeout(() => { fase = "valendo"; voz.textContent = "Agora!"; const c = $("#tr-cursor"); if (c) { c.style.transition = `left ${total * bt}s linear`; c.style.left = "100%"; } }, (0.15 + 4 * bt - 0.2) * 1000));
      temporizadores.push(setTimeout(avaliar, (0.15 + (4 + total) * bt + 0.25) * 1000));
    }
    function avaliar() {
      fase = "espera"; bater.classList.remove("ativo");
      const usados = new Set(); let soma = 0, certos = 0;
      esperados.forEach(e => {
        let melhor = -1, dist = 9;
        toques.forEach((t, i) => { const d = Math.abs(t - e * bt); if (!usados.has(i) && d < dist) { dist = d; melhor = i; } });
        if (melhor >= 0 && dist < 0.28) { usados.add(melhor); certos++; soma += dist; }
      });
      const extras = toques.length - usados.size;
      if (certos === esperados.length && extras === 0) {
        const media = Math.round(soma / certos * 1000);
        liberar(media < 90 ? "No pulso. Muito bem." : "Certo. Tente ficar ainda mais junto do clique na próxima.");
        bater.textContent = "Repetir"; voz.textContent = "";
      } else {
        sessao.erros++;
        voz.textContent = extras > 0 ? "Você tocou mais vezes do que o ritmo pede. Ouça a contagem e tente de novo." : "Faltou alguma batida ou ela saiu fora do pulso. Tente de novo.";
        bater.textContent = "Tentar de novo";
        const c = $("#tr-cursor"); if (c) { c.style.transition = "none"; c.style.left = "0"; }
      }
    }
    const toque = ev => {
      ev.preventDefault();
      if (fase === "espera") return comecar();
      toques.push(audio().currentTime - inicio);
      bater.classList.add("pulso"); setTimeout(() => bater.classList.remove("pulso"), 90);
    };
    bater.addEventListener("pointerdown", toque);
    bater.addEventListener("keydown", ev => { if (ev.key === " " || ev.key === "Enter") toque(ev); });
  }

  function htmlMic(p) {
    return `<div class="tr-mic"><div class="tr-medidor"><span id="tr-nivel"></span></div><p id="tr-ouvindo" class="tr-ouvindo">Ligue o microfone e toque.</p><button class="btn primario" id="tr-mic" type="button">Ligar o microfone</button>${saxDoApp() ? "" : `<div class="tr-sax"><span>Meu sax é:</span><button type="button" data-sax="Mib">Alto ou barítono</button><button type="button" data-sax="Sib">Tenor ou soprano</button></div>`}<button class="link-acao" id="tr-pular" type="button">Estou sem o sax agora: pular</button></div>`;
  }
  function ligarControlesMic(aoLigar) {
    raiz().querySelectorAll(".tr-sax button").forEach(b => b.addEventListener("click", () => { prog.sax = b.dataset.sax; salvar(); b.parentNode.querySelectorAll("button").forEach(x => x.classList.toggle("ativo", x === b)); }));
    $("#tr-pular").addEventListener("click", () => liberar("Tudo bem. Volte a esta lição com o sax na mão.", false));
    $("#tr-mic").addEventListener("click", async () => {
      audio();
      if (!(await ligarMic())) { $("#tr-ouvindo").textContent = "Não consegui usar o microfone. Libere o acesso nas permissões do navegador."; return; }
      $("#tr-mic").hidden = true; aoLigar();
    });
  }
  const NOMES = ["Dó", "Dó♯", "Ré", "Mi♭", "Mi", "Fá", "Fá♯", "Sol", "Sol♯", "Lá", "Si♭", "Si"];

  function passoTocar(p) {
    const alvo = p.livre ? null : NOTA[p.nota];
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p>${p.pauta ? svgPauta(p.pauta) : alvo ? svgPauta([[p.nota, 4]], { rotulos: true }) : ""}${alvo ? svgDedos([p.nota]) : ""}${htmlMic(p)}`, { botao: "Toque para continuar", pronto: false });
    ligarControlesMic(() => {
      let acumulado = 0, ultimo = performance.now(), anterior = -1, pronto = false;
      const ouvindo = $("#tr-ouvindo"), nivel = $("#tr-nivel");
      ouvindo.textContent = alvo ? `Ouvindo… toque o ${alvo.nome}.` : "Ouvindo… toque uma nota longa.";
      (function quadro() {
        if (!$("#tr-nivel") || pronto) return;
        const agora = performance.now(), dt = (agora - ultimo) / 1000; ultimo = agora;
        const n = notaOuvida(), certa = n >= 0 && (alvo ? n === alvo.midi % 12 : (anterior < 0 || n === anterior));
        if (certa) acumulado += dt; else if (n >= 0 || acumulado < 0.3) acumulado = Math.max(0, acumulado - dt * 2);
        anterior = n >= 0 ? n : anterior;
        nivel.style.width = Math.min(100, acumulado / p.segundos * 100) + "%";
        if (n >= 0 && alvo && !certa) ouvindo.textContent = `Ouvi ${NOMES[n]}. Procure o ${alvo.nome}.`;
        else if (certa) ouvindo.textContent = alvo ? `${alvo.nome}! Sustente…` : "Bom som. Sustente…";
        if (acumulado >= p.segundos) { pronto = true; nivel.style.width = "100%"; ouvindo.textContent = ""; liberar(alvo ? `${alvo.nome} firme. Muito bem.` : "Som firme por 3 segundos. Muito bem."); return; }
        mic.raf = requestAnimationFrame(quadro);
      })();
    });
  }

  function passoMusica(p) {
    const bpm = 66, bt = 60 / bpm;
    moldura(`<h2>${esc(p.titulo)}</h2><p>${esc(p.texto)}</p><div id="tr-partitura">${svgPauta(MELODIA, { compassos: true })}</div><p class="tr-conta-voz" id="tr-voz"></p>${htmlMic(p)}`, { botao: "Toque a música", pronto: false });
    ligarControlesMic(() => {
      const voz = $("#tr-voz"), ouvindo = $("#tr-ouvindo");
      ouvindo.innerHTML = `<button class="btn primario" id="tr-iniciar" type="button">Começar com contagem</button>`;
      $("#tr-iniciar").addEventListener("click", function iniciar() {
        const a = audio(), t0 = a.currentTime + 0.2, total = MELODIA.reduce((s, [, d]) => s + d, 0);
        for (let k = 0; k < 4 + total; k++) clique(t0 + k * bt, k % 4 === 0);
        ouvindo.textContent = "";
        for (let k = 0; k < 4; k++) temporizadores.push(setTimeout(() => { voz.textContent = `Contagem: ${k + 1}`; }, (0.2 + k * bt) * 1000));
        const inicio = t0 + 4 * bt; let pos = 0; const janelas = MELODIA.map(([n, d]) => { const j = { n, de: pos * bt, ate: (pos + d) * bt, bons: 0, quadros: 0 }; pos += d; return j; });
        let atual = -1;
        (function quadro() {
          if (!$("#tr-partitura")) return;
          const t = audio().currentTime - inicio;
          if (t >= total * bt) return fim();
          if (t >= 0) {
            const i = janelas.findIndex(j => t >= j.de && t < j.ate);
            if (i !== atual) { atual = i; $("#tr-partitura").innerHTML = svgPauta(MELODIA, { compassos: true, destaque: i }); voz.textContent = NOTA[MELODIA[i][0]].nome; }
            const j = janelas[i];
            if (t - j.de > 0.12) { j.quadros++; if (notaOuvida() === NOTA[j.n].midi % 12) j.bons++; }
          }
          mic.raf = requestAnimationFrame(quadro);
        })();
        function fim() {
          const certas = janelas.filter(j => j.quadros && j.bons / j.quadros >= 0.4).length;
          $("#tr-partitura").innerHTML = svgPauta(MELODIA, { compassos: true });
          voz.textContent = `${certas} de ${janelas.length} notas no lugar.`;
          if (certas >= Math.ceil(janelas.length * 0.6)) liberar("Você tocou a sua primeira música.");
          else { sessao.erros++; ouvindo.innerHTML = `<button class="btn primario" id="tr-iniciar" type="button">Tentar de novo</button>`; $("#tr-iniciar").addEventListener("click", iniciar); }
        }
      });
    });
  }

  function concluir() {
    const { licao, erros } = sessao, primeira = !prog.feitas[licao.id];
    const ganho = primeira ? 10 + (erros === 0 ? 5 : 0) : 2;
    prog.feitas[licao.id] = true; prog.pontos += ganho; salvar();
    limpar();
    const i = LICOES.indexOf(licao), prox = LICOES[i + 1];
    raiz().innerHTML = `<div class="tr-licao tr-fim"><div class="tr-passo"><div class="tr-selo">✓</div><p class="sobretitulo">Lição concluída</p><h2>${esc(licao.titulo)}</h2><p>${erros === 0 ? "Sem nenhum erro." : "Feita. Errar faz parte de aprender a ler."}</p><p class="tr-ganho">+${ganho} pontos de estudo</p>${!prox ? `<p>Unidade 1 completa. Você já lê e toca três notas com três figuras.</p>` : ""}</div><div class="tr-rodape">${prox ? `<a class="btn primario largo" href="#/trilha/${prox.id}">Próxima: ${esc(prox.titulo)}</a>` : ""}<a class="btn largo" href="#/trilha">Voltar para a trilha</a></div></div>`;
    sessao = null; window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", () => { if (!/^#\/trilha/.test(location.hash)) limpar(); });
  window.NaipeTrilha = { render: id => (id ? renderLicao(id) : renderTrilha()) };
})();
