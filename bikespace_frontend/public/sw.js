/* global self */

const PMTILES_CACHE = 'pmtiles-cache-v2';
const PMTILES_URLS = [
  'https://pub-04bdbe3e39bc434bb5fae50c14232971.r2.dev/lts_toronto_filtered_1_4.pmtiles',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PMTILES_CACHE).then(cache => cache.addAll(PMTILES_URLS))
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
