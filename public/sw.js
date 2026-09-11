// ALAA CHEM LAB - High-Performance Service Worker
// Provides App Shell precaching, offline capability, asset caching, and background sync foundations.

const CACHE_VERSION = 'alaa-chem-lab-v1.0.0';
const STATIC_CACHE_NAME = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `dynamic-${CACHE_VERSION}`;

// Core assets for immediate application shell
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

// Install Event: Precaches App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event: Purge old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event: Cache-First for static assets, Network-First with Cache Fallback for navigation & APIs
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests or chrome-extension URLs
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Handle API requests: Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If successful network response, clone to dynamic cache
          if (response.status === 200) {
            const resClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.put(request, resClone));
          }
          return response;
        })
        .catch(async () => {
          // Fallback to cached API response if available
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({
              error: 'Offline Mode: Network connection unavailable',
              offline: true,
              timestamp: new Date().toISOString()
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            }
          );
        })
    );
    return;
  }

  // For static assets (scripts, styles, fonts, images): Cache-First, fallback to network
  if (
    url.pathname.match(/\.(js|css|svg|png|jpg|jpeg|woff|woff2|ico|json)$/) ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Stale-while-revalidate in background
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => { /* ignore network error when offline */ });
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, resClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Navigation requests (HTML pages): Network-First, fallback to App Shell index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const resClone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, resClone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
          return caches.match('/');
        })
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Listen for custom skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
