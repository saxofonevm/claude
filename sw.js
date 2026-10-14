// Service worker: permite usar o app offline.
// Estratégia "stale-while-revalidate": abre na hora com a cópia salva e
// busca a versão nova em segundo plano (aparece na próxima abertura).
const CACHE = "cma-v1";
const ARQUIVOS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "conteudo.js",
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
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
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
