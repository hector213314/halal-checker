// Service Worker pour HalalCheck
const CACHE_NAME = 'halal-check-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Erreur cache:', err);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie de cache
self.addEventListener('fetch', event => {
  // Pour l'API Open Food Facts - toujours essayer le réseau d'abord
  if (event.request.url.includes('openfoodfacts.org')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone la réponse pour la mettre en cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Si pas de réseau, chercher dans le cache
          return caches.match(event.request);
        })
    );
  } else {
    // Pour les fichiers de l'app - cache d'abord
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});