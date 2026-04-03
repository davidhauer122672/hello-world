/**
 * Coastal Key Mobile App — Service Worker
 * Enables offline capability, caching, and PWA installability.
 */

const CACHE_NAME = 'ck-mobile-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/styles/luxury.css',
  '/src/components/app-shell.js',
  '/src/components/home.js',
  '/src/components/leads.js',
  '/src/components/ai-skills.js',
  '/src/components/content.js',
  '/src/components/market.js',
  '/src/components/systems.js',
  '/src/components/settings.js',
  '/src/utils/api.js',
  '/src/utils/auth.js',
  '/src/utils/state.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // API calls: network-first with cache fallback
  if (event.request.url.includes('/v1/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
