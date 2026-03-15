// Service Worker to CLEAR ALL CACHES
// This runs in the background and aggressively clears caches

self.addEventListener('install', (event) => {
  console.log('🔥 Cache clearing service worker installed');
  
  // Clear all caches immediately
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('🗑️ Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ All caches cleared');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('✅ Cache clearing service worker activated');
  
  // Clear all caches again on activation
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Intercept all fetch requests and NEVER cache
self.addEventListener('fetch', (event) => {
  // Always fetch from network, never from cache
  event.respondWith(
    fetch(event.request).catch(() => {
      // If network fails, still don't use cache
      return new Response('Network error', { status: 408 });
    })
  );
});
