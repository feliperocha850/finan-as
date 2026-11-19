// Guarda a página para abrir mesmo com internet ruim. Os dados nunca ficam aqui: vêm sempre do banco.
const VERSAO = 'financas-1795122250881';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone-192.png', './icone-512.png', './icone-180.png'];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys()
    .then((chaves) => Promise.all(chaves.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // banco e fontes passam direto
  // Rede primeiro (pega a versão nova); sem rede, usa a guardada.
  ev.respondWith(fetch(req).then((r) => {
    if (r.ok) { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put(req, copia)); }
    return r;
  }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))));
});
