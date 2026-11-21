/*
 * Naipe — Meus materiais: os arquivos e links do próprio aluno.
 * Os arquivos ficam só neste aparelho (IndexedDB "naipe-materiais"); nada é enviado para servidor.
 */
(function () {
  "use strict";
  const LIMITE_MB = 60;
  const app = () => window.NaipeApp;
  const esc = s => app().escapar(String(s == null ? "" : s));
  let urlAberta = null, formLink = false;

  function banco() {
    return new Promise((ok, erro) => {
      if (!window.indexedDB) return erro(new Error("sem armazenamento"));
      const req = indexedDB.open("naipe-materiais", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("itens", { keyPath: "id" });
      req.onsuccess = () => ok(req.result);
      req.onerror = () => erro(req.error);
    });
  }
  async function op(modo, fn) {
    const db = await banco();
    return new Promise((ok, erro) => {
      const tx = db.transaction("itens", modo), r = fn(tx.objectStore("itens"));
      tx.oncomplete = () => { ok(r && r.result); db.close(); };
      tx.onerror = () => { erro(tx.error); db.close(); };
    });
  }
  const listar = () => op("readonly", os => os.getAll()).then(l => (l || []).sort((a, b) => b.quando.localeCompare(a.quando)));
  const guardar = item => op("readwrite", os => os.put(item));
  const apagar = id => op("readwrite", os => os.delete(id));
  const pegar = id => op("readonly", os => os.get(id));
  const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const tipoDe = item => item.url ? "link" : /pdf/.test(item.tipo) ? "pdf" : /^image\//.test(item.tipo) ? "imagem" : /^audio\//.test(item.tipo) ? "audio" : "arquivo";
  const ROTULO = { link: "Link", pdf: "PDF", imagem: "Imagem", audio: "Áudio", arquivo: "Arquivo" };
  const tamanho = b => b > 1048576 ? `${(b / 1048576).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

  function linkTermos() {
    const url = ((window.CMA || {}).termosUso || "").trim();
    return url ? `<a href="${esc(url)}" target="_blank" rel="noopener">Termos de Uso</a>` : `<a href="#" data-mm="termos">Termos de Uso</a>`;
  }

  async function render() {
    const el = document.getElementById("meus-arquivos");
    if (!el || !app()) return;
    let itens = [], falhou = false;
    try { itens = await listar(); } catch { falhou = true; }
    el.innerHTML = `<div class="mm-topo"><h3><span class="mm-ic">${app().icone("pasta")}</span>Meus arquivos</h3><small>${itens.length ? `${itens.length} ${itens.length === 1 ? "item" : "itens"}` : ""}</small></div>
      <p class="mm-aviso">Os arquivos que você envia são de sua responsabilidade. ${linkTermos()}</p>
      ${falhou ? `<p class="mudo">Este navegador não permite guardar arquivos. Tente atualizar o navegador do celular.</p>` : `
      <div class="mm-botoes">
        <label class="btn primario mm-enviar">${app().icone("mais")}Enviar arquivo<input type="file" id="mm-arquivo" accept="application/pdf,image/*,audio/*" hidden></label>
        <button type="button" class="btn" data-mm="link-abrir">Adicionar link</button>
      </div>
      ${formLink ? `<form class="mm-form" id="mm-form-link">
        <label>Nome<input type="text" id="mm-link-nome" maxlength="120" placeholder="Ex.: Playback de Wave" required></label>
        <label>Endereço (link)<input type="url" id="mm-link-url" placeholder="https://" required></label>
        <div class="linha-botoes"><button type="button" class="btn" data-mm="link-cancelar">Cancelar</button><button class="btn primario" type="submit">Guardar link</button></div>
      </form>` : ""}
      ${itens.length ? `<ul class="mm-lista">${itens.map(it => {
        const t = tipoDe(it);
        return `<li class="mm-item tipo-${t}">
          <span class="mm-tipo">${ROTULO[t]}</span>
          <span class="mm-nome"><strong>${esc(it.nome)}</strong><small>${new Date(it.quando).toLocaleDateString("pt-BR")}${it.tamanho ? ` · ${tamanho(it.tamanho)}` : ""}</small></span>
          <span class="mm-acoes"><button type="button" class="link-acao" data-mm="abrir" data-id="${esc(it.id)}">${t === "audio" ? "Ouvir" : "Abrir"}</button><button type="button" class="link-acao" data-mm="apagar" data-id="${esc(it.id)}">Apagar</button></span>
          ${t === "audio" ? `<audio class="mm-audio" id="mm-audio-${esc(it.id)}" controls hidden></audio>` : ""}
        </li>`;
      }).join("")}</ul>` : `<p class="vazio-mini">Guarde aqui as suas partituras, gravações e links de estudo. Tudo fica só neste aparelho e não entra no backup.</p>`}`}`;
    const inp = document.getElementById("mm-arquivo");
    if (inp) inp.addEventListener("change", enviar);
    const f = document.getElementById("mm-form-link");
    if (f) f.addEventListener("submit", salvarLink);
  }

  async function enviar(ev) {
    const arq = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if (!arq) return;
    if (arq.size > LIMITE_MB * 1048576) { app().avisar(`Arquivo grande demais (máximo ${LIMITE_MB} MB).`); return; }
    try {
      await guardar({ id: novoId(), nome: arq.name, tipo: arq.type || "", tamanho: arq.size, quando: new Date().toISOString(), blob: arq });
      app().avisar("Arquivo guardado em Meus materiais.");
    } catch { app().avisar("Não consegui guardar o arquivo (pouco espaço no aparelho?)."); }
    render();
  }

  async function salvarLink(ev) {
    ev.preventDefault();
    const nome = document.getElementById("mm-link-nome").value.trim(), url = document.getElementById("mm-link-url").value.trim();
    if (!/^https?:\/\//i.test(url)) { app().avisar("O link precisa começar com http:// ou https://"); return; }
    await guardar({ id: novoId(), nome: nome || url, url, quando: new Date().toISOString() });
    formLink = false; app().avisar("Link guardado."); render();
  }

  document.addEventListener("click", async ev => {
    const b = ev.target.closest("[data-mm]");
    if (!b || !document.getElementById("meus-arquivos") || !document.getElementById("meus-arquivos").contains(b)) return;
    const acao = b.dataset.mm, id = b.dataset.id;
    if (acao === "termos") { ev.preventDefault(); app().avisar("Os Termos de Uso estarão disponíveis em breve."); return; }
    if (acao === "link-abrir") { formLink = true; render(); return; }
    if (acao === "link-cancelar") { formLink = false; render(); return; }
    if (acao === "apagar") {
      if (await app().confirmar("Apagar este item?", "Ele será removido deste aparelho.", "Apagar")) { await apagar(id); render(); }
      return;
    }
    if (acao === "abrir") {
      const it = await pegar(id);
      if (!it) return;
      if (it.url) { window.open(it.url, "_blank", "noopener"); return; }
      if (urlAberta) URL.revokeObjectURL(urlAberta);
      urlAberta = URL.createObjectURL(it.blob);
      if (tipoDe(it) === "audio") {
        const a = document.getElementById(`mm-audio-${id}`);
        if (a) { a.hidden = false; a.src = urlAberta; a.play().catch(() => {}); }
        return;
      }
      const aba = window.open(urlAberta, "_blank");
      if (!aba) { const l = document.createElement("a"); l.href = urlAberta; l.download = it.nome; document.body.appendChild(l); l.click(); l.remove(); }
    }
  });

  window.NaipeMateriais = { render };
  if (location.hash.startsWith("#/diario")) render(); // o app já abriu direto no Diário
})();
