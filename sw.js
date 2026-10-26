// Cache hors-ligne : le site est statique, tout est mis en cache à l'installation.
const CACHE = 'holdem-v1';
const FILES = ['./', 'index.html', 'style.css', 'content.js', 'engine.js', 'game.js', 'bots.js', 'ranges.js', 'play.js', 'train.js', 'situations.js', 'app.js', 'manifest.json', 'icon.svg'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // réseau d'abord (pour recevoir les mises à jour), cache en secours hors-ligne
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
