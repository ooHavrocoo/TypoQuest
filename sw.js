
const CACHE_NAME = 'typoquest-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;700&display=swap',
  'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
  'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0aed169.mp3',
  'https://cdn.pixabay.com/audio/2022/03/15/audio_5064e43f55.mp3'
];

// Installation : mise en cache des ressources critiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage des vieux caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache : Cache First, then Network
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes vers l'API Gemini pour ne pas cacher des erreurs
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cacher dynamiquement les nouvelles ressources (images, etc)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback si tout échoue (offline total sans cache)
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
