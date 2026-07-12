// QU Daily Check-In — offline app shell. Bump CACHE to force an update.
const CACHE = 'qu-checkin-v4';
const ASSETS = [
  './qu-player-checkin.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // never cache POSTs (submits)
  if (req.url.includes('supabase.co')) return;      // roster/submit always hit the network
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((resp) => {
      if (resp && resp.ok) { const cp = resp.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); }
      return resp;
    }).catch(() => caches.match('./qu-player-checkin.html')))
  );
});
