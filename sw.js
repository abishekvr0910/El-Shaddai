// El Shaddai Service Worker - Stale-while-revalidate strategy
// Version: increment on each deployment to force update
const CACHE_NAME = 'elshaddai-v1';
const STATIC_CACHE = 'elshaddai-static-v1';
const DYNAMIC_CACHE = 'elshaddai-dynamic-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/logo-96.webp',
  '/assets/logo-192.webp',
  '/assets/favicon.svg',
  '/assets/coffee-spices.webp',
  '/assets/cafe-community-hero.jpg',
  '/fonts/Manrope-400.woff2',
  '/fonts/Manrope-600.woff2',
  '/fonts/Manrope-700.woff2',
  '/fonts/CormorantGaramond-600.woff2',
  '/fonts/CormorantGaramond-700.woff2',
  '/fonts/material-symbols-outlined.woff2'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - stale-while-revalidate for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except fonts from same origin)
  if (url.origin !== location.origin && !url.pathname.match(/\.(woff2?|ttf)$/)) return;

  // Navigation requests - network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Static assets (fonts, images, CSS, JS) - cache first
  if (request.destination === 'font' ||
      request.destination === 'image' ||
      request.destination === 'style' ||
      request.destination === 'script' ||
      url.pathname.match(/\.(woff2?|ttf|webp|jpg|jpeg|png|svg|ico|css|js)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // API/WhatsApp/Google Maps - network only, no caching
  if (url.hostname.includes('wa.me') ||
      url.hostname.includes('google.com') ||
      url.pathname.startsWith('/api/')) {
    return; // Let browser handle normally
  }

  // Default: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// Handle messages from client (skip waiting, etc.)
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'getVersion') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});