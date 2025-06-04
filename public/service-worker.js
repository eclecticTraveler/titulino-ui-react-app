const CACHE_NAME = 'v0.1.53'; // Increment with every deployment
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/main.js?v=0.1.53',
  '/styles.css?v=0.1.53',
];

// Install event: Cache initial assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching initial files');
      return cache.addAll(CACHE_ASSETS);
    })
  );
  self.skipWaiting(); // Force the new service worker to activate
});

// Fetch event: Serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Serve from cache if available
      if (cachedResponse) return cachedResponse;

      // Fetch from network if not found in cache
      return fetch(event.request)
        .then((fetchResponse) => {
          // Only cache GET requests for resources on the same origin
          if (
            event.request.method === 'GET' &&
            event.request.url.startsWith(self.location.origin)
          ) {
            return caches.open(CACHE_NAME).then((cache) => {
              // Cache the fetched response
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          }
          return fetchResponse;
        })
        .catch(() => caches.match('/index.html')); // Fallback to index.html in case of failure
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
