const CACHE_NAME = 'v0.1.97'; // Increment with every deployment
const CACHE_ASSETS = [
  '/',
  '/index.html'
];

// Install event: Cache initial assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching files');
      return Promise.all(
        CACHE_ASSETS.map(async (asset) => {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn(`[Service Worker] Failed to cache ${asset}`, err);
          }
        })
      );
    })
  );
});

// Fetch event: Serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((fetchResponse) => {
          if (
            event.request.method === 'GET' &&
            event.request.url.startsWith(self.location.origin)
          ) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          }
          return fetchResponse;
        })
        .catch((err) => {
          console.warn('[Service Worker] Fetch failed:', event.request.url, err);
          return caches.match('/index.html');
        });
    })
  );
});


// Activate event: Remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim(); // Take control of all open clients immediately
});


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skip waiting triggered');
    self.skipWaiting();
  }
});
