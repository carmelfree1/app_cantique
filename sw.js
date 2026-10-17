// Changer ce numéro à chaque mise à jour des fichiers pour que les téléphones récupèrent la nouvelle version.
const VERSION = '2026-10-17-1';
const CACHE = 'cantiques-' + VERSION;
const CORE = ['./', 'index.html', 'style.css', 'app.js', 'cantiques.json', 'manifest.webmanifest'];
const EXTRA = ['recueil2.json', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Les fichiers essentiels doivent tous être là ; les icônes ne bloquent jamais l'installation.
    await c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    await Promise.all(EXTRA.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k.indexOf('cantiques-') === 0 && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Cache d'abord (lecture instantanée et hors ligne), puis mise à jour en arrière-plan.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const r = await net;
    return r || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
  })());
});
