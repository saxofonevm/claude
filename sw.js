// Service worker: permite usar o app offline.
// Estratégia "stale-while-revalidate": abre na hora com a cópia salva e
// busca a versão nova em segundo plano (aparece na próxima abertura).
const CACHE = "cma-v4";
const ARQUIVOS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "icones.js",
  "conteudo.js",
  "metodos.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
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
  ev.respondWith(
    caches.open(CACHE).then(async cache => {
      const salvo = await cache.match(req, { ignoreSearch: true });
      const rede = fetch(req)
        .then(resp => { if (resp.ok) cache.put(req, resp.clone()); return resp; })
        .catch(() => salvo);
      return salvo || rede;
    })
  );
});
