// Service worker: permite usar o app offline.
// Estratégia "rede primeiro": com internet, sempre busca a versão nova do servidor
// (sem usar cópia velha do navegador); sem internet, usa a cópia salva.
const CACHE = "cma-v62";
const ARQUIVOS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "icones.js",
  "conteudo.js",
  "metodos.js",
  "acervo.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable.png",
  "rit/index.html",
  "rit/css/style.css",
  "rit/js/music.js",
  "rit/js/audio.js",
  "rit/js/app.js",
  "rit/samples/drums.js"
];

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", ev => {
  const req = ev.request;
  const url = new URL(req.url);
  const fonte = /^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (req.method !== "GET" || (url.origin !== location.origin && !fonte)) return;
  if (fonte) {
    ev.respondWith(caches.open(CACHE).then(async cache => {
      const salvo = await cache.match(req);
      if (salvo) return salvo;
      const resp = await fetch(req);
      if (resp.ok) cache.put(req, resp.clone());
      return resp;
    }));
    return;
  }
  ev.respondWith(
    caches.open(CACHE).then(async cache => {
      try {
        const resp = await fetch(req, { cache: "no-cache" });
        if (resp.ok) cache.put(req, resp.clone());
        return resp;
      } catch {
        const salvo = await cache.match(req, { ignoreSearch: true });
        if (salvo) return salvo;
        throw new Error("offline");
      }
    })
  );
});
