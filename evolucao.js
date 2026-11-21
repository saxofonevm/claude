/*
 * Naipe — Minha evolução: um áudio por semana tocando, para ouvir a evolução.
 * Cada semana (de segunda a domingo) guarda uma gravação, feita no app ou enviada pelo aluno.
 * Fica só neste aparelho (IndexedDB "naipe-evolucao").
 */
(function () {
  "use strict";
  const MAX_SEG = 120, LIMITE_MB = 30;
  const app = () => window.NaipeApp;
  const esc = s => app().escapar(String(s == null ? "" : s));
  const rec = { mr: null, stream: null, partes: [], ini: 0, t: 0 };
  let tocando = null, audioAtual = null, aviso = ""; // tocando: id da semana, ou "comparar"

  function banco() {
    return new Promise((ok, erro) => {
      if (!window.indexedDB) return erro(new Error("sem armazenamento"));
      const req = indexedDB.open("naipe-evolucao", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("semanas", { keyPath: "semana" });
      req.onsuccess = () => ok(req.result);
      req.onerror = () => erro(req.error);
    });
  }
  async function op(modo, fn) {
    const db = await banco();
    return new Promise((ok, erro) => {
      const tx = db.transaction("semanas", modo), r = fn(tx.objectStore("semanas"));
      tx.oncomplete = () => { ok(r && r.result); db.close(); };
      tx.onerror = () => { erro(tx.error); db.close(); };
    });
  }
  const listar = () => op("readonly", os => os.getAll()).then(l => (l || []).sort((a, b) => a.semana.localeCompare(b.semana)));
  const guardar = g => op("readwrite", os => os.put(g));
  const apagar = s => op("readwrite", os => os.delete(s));

  // Semana = data (ISO) da segunda-feira
  function segundaISO(d = new Date()) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  }
  const dataBR = iso => { const [a, m, d] = iso.split("-"); return `${d}/${m}`; };
  const dur = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  const tipoGrav = () => {
    if (!window.MediaRecorder) return null;
    return ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || "";
  };

  async function render() {
    const el = document.getElementById("minha-evolucao");
    if (!el || !app()) return;
    let lista = [], falhou = false;
    try { lista = await listar(); } catch { falhou = true; }
    const atual = segundaISO(), desta = lista.find(g => g.semana === atual), gravando = rec.mr && rec.mr.state === "recording";
    const ultimoTitulo = (lista[lista.length - 1] || {}).titulo || "";
    el.innerHTML = `<div class="mm-topo"><h3><span class="mm-ic">${app().icone("microfone")}</span>Minha evolução</h3><small>${lista.length ? `${lista.length} ${lista.length === 1 ? "semana" : "semanas"}` : ""}</small></div>
      <p class="mudo ev-texto">Um áudio por semana tocando, de preferência sempre a mesma música ou estudo. Daqui a alguns meses, ouça o primeiro e o mais recente.</p>
      ${falhou ? `<p class="mudo">Este navegador não permite guardar áudios. Tente atualizar o navegador do celular.</p>` : `
      <div class="ev-semana${desta ? " feita" : ""}">
        <span class="rotulo">Esta semana · ${dataBR(atual)}</span>
        ${desta && !gravando ? `<p class="ev-ok">✓ Gravado em ${new Date(desta.quando).toLocaleDateString("pt-BR")} · ${dur(desta.dur || 0)}${desta.titulo ? ` · ${esc(desta.titulo)}` : ""}</p>
          <div class="mm-botoes"><button type="button" class="btn primario" data-ev="ouvir" data-s="${atual}">${tocando === atual ? "■ Parar" : "▶ Ouvir"}</button><button type="button" class="btn" data-ev="regravar">Gravar de novo</button></div>` : `
          <label class="ev-titulo">O que você vai tocar?<input type="text" id="ev-titulo" maxlength="80" placeholder="Ex.: Wave, Estudo 1 do Mule" value="${esc(ultimoTitulo)}"></label>
          <div class="mm-botoes">
            <button type="button" class="btn primario ev-gravar${gravando ? " gravando" : ""}" data-ev="gravar"><span class="s-grav-ponto" aria-hidden="true"></span>${gravando ? "Parar e guardar" : "Gravar"}</button>
            ${gravando ? `<span class="ev-tempo" id="ev-tempo">0:00 de ${dur(MAX_SEG)}</span>` : `<label class="btn ev-enviar">Enviar um áudio<input type="file" id="ev-arquivo" accept="audio/*" hidden></label>`}
          </div>`}
        ${aviso}
      </div>
      ${lista.length >= 2 ? `<button type="button" class="btn largo ev-comparar" data-ev="comparar">${tocando === "comparar" ? "■ Parar" : `▶ Ouvir a primeira (${dataBR(lista[0].semana)}) e a mais recente (${dataBR(lista[lista.length - 1].semana)})`}</button>` : ""}
      ${lista.filter(g => g.semana !== atual).length ? `<ul class="ev-lista">${lista.filter(g => g.semana !== atual).reverse().map(g => `<li>
        <span><strong>Semana de ${dataBR(g.semana)}</strong><small>${dur(g.dur || 0)}${g.titulo ? ` · ${esc(g.titulo)}` : ""}</small></span>
        <span class="mm-acoes"><button type="button" class="link-acao" data-ev="ouvir" data-s="${g.semana}">${tocando === g.semana ? "Parar" : "Ouvir"}</button><button type="button" class="link-acao" data-ev="apagar" data-s="${g.semana}">Apagar</button></span>
      </li>`).join("")}</ul>` : ""}
      <p class="vazio-mini">As gravações ficam só neste aparelho e não entram no backup.</p>`}`;
    const f = document.getElementById("ev-arquivo");
    if (f) f.addEventListener("change", enviar);
  }

  const tituloAtual = () => { const i = document.getElementById("ev-titulo"); return i ? i.value.trim() : ""; };

  async function salvarSemana(blob, segundos, titulo) {
    try {
      await guardar({ semana: segundaISO(), quando: new Date().toISOString(), dur: segundos, titulo, blob });
      aviso = ""; app().avisar("Gravação da semana guardada.");
    } catch { aviso = `<p class="mudo">Não consegui guardar a gravação (pouco espaço no aparelho?).</p>`; }
    render();
  }

  async function enviar(ev) {
    const arq = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if (!arq) return;
    if (arq.size > LIMITE_MB * 1048576) { app().avisar(`Áudio grande demais (máximo ${LIMITE_MB} MB).`); return; }
    const titulo = tituloAtual();
    const segundos = await new Promise(ok => { const a = new Audio(); a.preload = "metadata"; a.onloadedmetadata = () => { ok(isFinite(a.duration) ? a.duration : 0); URL.revokeObjectURL(a.src); }; a.onerror = () => ok(0); a.src = URL.createObjectURL(arq); });
    salvarSemana(arq, segundos, titulo);
  }

  async function gravar() {
    if (rec.mr && rec.mr.state === "recording") { rec.mr.stop(); return; }
    aviso = "";
    const tipo = tipoGrav();
    if (tipo === null) { aviso = `<p class="mudo">Este navegador não grava áudio. Use “Enviar um áudio” com uma gravação do celular.</p>`; render(); return; }
    try { rec.stream = await window.NaipeMic.abrir(); }
    catch (err) { aviso = window.NaipeMic.htmlAviso(err); render(); return; }
    rec.titulo = tituloAtual();
    try { rec.mr = tipo ? new MediaRecorder(rec.stream, { mimeType: tipo }) : new MediaRecorder(rec.stream); }
    catch { rec.mr = new MediaRecorder(rec.stream); }
    rec.partes = [];
    rec.mr.ondataavailable = e => { if (e.data && e.data.size) rec.partes.push(e.data); };
    rec.mr.onstop = () => {
      clearInterval(rec.t);
      if (rec.stream) rec.stream.getTracks().forEach(t => t.stop());
      const seg = (Date.now() - rec.ini) / 1000, partes = rec.partes, mime = rec.mr.mimeType;
      rec.mr = null; rec.stream = null;
      if (seg < 2 || !partes.length) { aviso = `<p class="mudo">A gravação ficou curta demais. Tente de novo.</p>`; render(); return; }
      salvarSemana(new Blob(partes, { type: mime || partes[0].type || "audio/webm" }), seg, rec.titulo);
    };
    rec.mr.start(1000); rec.ini = Date.now();
    rec.t = setInterval(() => {
      const s = (Date.now() - rec.ini) / 1000, el = document.getElementById("ev-tempo");
      if (el) el.textContent = `${dur(s)} de ${dur(MAX_SEG)}`;
      if (s >= MAX_SEG && rec.mr) rec.mr.stop();
    }, 250);
    render();
  }

  function parar() { if (audioAtual) { audioAtual.pause(); URL.revokeObjectURL(audioAtual.src); } audioAtual = null; tocando = null; }
  async function ouvir(semanas, id) {
    const lista = await listar(), fila = semanas.map(s => lista.find(g => g.semana === s)).filter(Boolean);
    tocando = id;
    const proxima = () => {
      const g = fila.shift();
      if (!g || tocando !== id) { if (tocando === id) parar(); render(); return; }
      const a = new Audio(URL.createObjectURL(g.blob));
      audioAtual = a;
      a.onended = () => { URL.revokeObjectURL(a.src); if (audioAtual === a) audioAtual = null; proxima(); };
      a.play().catch(() => { app().avisar("Não consegui tocar a gravação."); parar(); render(); });
    };
    proxima(); render();
  }

  document.addEventListener("click", async ev => {
    const b = ev.target.closest("[data-ev]");
    const caixa = document.getElementById("minha-evolucao");
    if (!b || !caixa || !caixa.contains(b)) return;
    const acao = b.dataset.ev, s = b.dataset.s;
    if (acao === "gravar") return gravar();
    if (acao === "regravar") {
      if (await app().confirmar("Gravar de novo?", "A gravação desta semana será substituída pela nova.", "Gravar de novo")) { await apagar(segundaISO()); render(); }
      return;
    }
    if (acao === "apagar") {
      if (await app().confirmar("Apagar esta gravação?", "Ela será removida deste aparelho.", "Apagar")) { await apagar(s); render(); }
      return;
    }
    const atualId = tocando;
    if (acao === "ouvir") { const era = atualId === s; parar(); if (!era) ouvir([s], s); else render(); }
    if (acao === "comparar") {
      const era = atualId === "comparar"; parar();
      if (!era) { const l = await listar(); ouvir([l[0].semana, l[l.length - 1].semana], "comparar"); } else render();
    }
  });

  window.NaipeEvolucao = { render };
  if (location.hash.startsWith("#/diario")) render();
})();
