/* Doable Budget: service worker. Cache-first app shell, so the app opens with no signal after the first visit.
   build.js fills in VERSION and SHELL. A new VERSION = a new cache; old caches are removed on activate. */
const VERSION = '1.0.0-602662ac';
const CACHE = 'doable-budget-' + VERSION;
const SHELL = ["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-192.png","icons/icon-maskable-512.png","icons/apple-touch-icon.png","icons/favicon-32.png","fonts/instrument-serif.woff2","fonts/instrument-serif-italic.woff2","fonts/inter-var.woff2"];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('doable-budget-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const shell = await cache.match('./') || await cache.match('index.html');
      if (shell) return shell;
    }
    return fetch(req);
  })());
});
