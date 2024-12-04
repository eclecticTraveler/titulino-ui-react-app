const CACHE_NAME = 'v1.2'; // Increment this with every deployment
const CACHE_ASSETS = [
  '/', 
  '/index.html',
  '/main.js?v=1.2', // Add version query params
  '/styles.css?v=1.2',
];

// Install event: Cache initial assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching initial files');
      return cache.addAll(CACHE_ASSETS); // Pre-cache defined assets
    })
  );
  self.skipWaiting(); // Force the new service worker to activate
});

// Fetch event: Serve from cache if available, otherwise fetch from network and cache it
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) return cachedResponse;

      // Fetch from network and cache the response
      return fetch(event.request)
        .then((fetchResponse) => {
          // Only cache GET requests and same-origin resources
          if (
            event.request.method === 'GET' &&
            event.request.url.startsWith(self.location.origin)
          ) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          }
          return fetchResponse; // For non-GET requests, just return network response
        })
        .catch(() => caches.match('/index.html')); // Fallback to index.html on failure
    })
  );
});

// Activate event: Remove old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]; // Keep only the current cache
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim(); // Take control of all open clients
});
