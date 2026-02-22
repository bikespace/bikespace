/* global self */

const scriptUrl = new URL(self.location.href);
const PMTILES_CACHE = 'pmtiles-cache-v2';
const PMTILES_URLS = [scriptUrl.searchParams.get('ltsDataUrl')].filter(Boolean);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PMTILES_CACHE).then(async cache => {
      await Promise.all(
        PMTILES_URLS.map(async url => {
          try {
            const response = await fetch(url, {cache: 'reload'});
            if (response && response.ok) {
              await cache.put(url, response);
            }
          } catch (error) {
            // ignore prefetch errors to avoid install failure
          }
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith('pmtiles-cache-'))
            .filter(key => key !== PMTILES_CACHE)
            .map(key => caches.delete(key))
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', event => {
  const {request} = event;
  const url = new URL(request.url);

  if (!url.pathname.endsWith('.pmtiles')) return;
  if (request.headers.get('range')) return;

  event.respondWith(
    caches.open(PMTILES_CACHE).then(async cache => {
      const cached = await cache.match(request, {ignoreSearch: true});
      if (cached) return cached;

      const response = await fetch(request);
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
  );
});
