const CACHE_NAME = 'dreamquest-v1';

// Recursos críticos a serem cacheados instataneamente pelo Service Worker
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

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

// Estratégia de Cache First, fallback para Network (indicado para a regra Offline-First do App TWA/PWA)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Retorna do Cache
        }
        
        // Se não tem no cache, clona o request para a network
        let fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((networkResponse) => {
            // Verifica se a resposta é válida
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            let responseToCache = networkResponse.clone();

            // Salva no cache para a próxima vez
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(() => {
          // Se falhar a rede total (offline real) e for navegação, pode retornar o shell
          if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
          }
        });
      })
  );
});
