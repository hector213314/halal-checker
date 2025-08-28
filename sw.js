const CACHE_NAME = 'halal-check-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // Simple stratégie : network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(() => caches.match(event.request))
  );
});
