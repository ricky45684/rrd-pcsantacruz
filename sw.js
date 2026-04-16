const CACHE = 'rrd-pcsantacruz-v1';
const ASSETS = [
  '/rrd-pcsantacruz/',
  '/rrd-pcsantacruz/index.html',
  '/rrd-pcsantacruz/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Para APIs externas (clima, sismos) siempre red primero
  if (e.request.url.includes('api.open-meteo') ||
      e.request.url.includes('earthquake.usgs') ||
      e.request.url.includes('cartocdn') ||
      e.request.url.includes('unpkg.com') ||
      e.request.url.includes('fonts.googleapis')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Para assets locales: cache primero
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
