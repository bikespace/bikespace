/* global self */

const scriptUrl = new URL(self.location.href);
const PMTILES_CACHE = 'pmtiles-cache-02-27-2026';
const PMTILES_URLS = [scriptUrl.searchParams.get('ltsDataUrl')].filter(Boolean);
const DEBUG_PMTILES_CACHE =
  scriptUrl.searchParams.get('debugPmtilesCache') === '1';

function logDebug(...args) {
  if (!DEBUG_PMTILES_CACHE) return;
  // eslint-disable-next-line no-console
  console.info('[sw:pmtiles-cache]', ...args);
}

function parseSingleByteRange(rangeHeader, size) {
  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return null;

  // Only support a single byte range (PMTiles requests are single-range).
  const rawRange = rangeHeader.replace('bytes=', '').split(',')[0]?.trim();
  if (!rawRange) return null;

  const [startToken, endToken] = rawRange.split('-');
  if (typeof startToken !== 'string' || typeof endToken !== 'string') return null;

  let start = 0;
  let end = size - 1;

  if (startToken === '') {
    // Suffix-byte-range-spec, e.g. "bytes=-500".
    const suffixLength = Number(endToken);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(size - suffixLength, 0);
  } else {
    start = Number(startToken);
    if (!Number.isFinite(start) || start < 0) return null;

    if (endToken !== '') {
      end = Number(endToken);
      if (!Number.isFinite(end) || end < 0) return null;
    }
  }

  if (start >= size || start > end) {
    return {unsatisfiable: true};
  }

  return {
    unsatisfiable: false,
    start,
    end: Math.min(end, size - 1),
  };
}

async function getRangeResponseFromCache(cachedResponse, rangeHeader) {
  const fullBlob = await cachedResponse.blob();
  const totalSize = fullBlob.size;
  const parsed = parseSingleByteRange(rangeHeader, totalSize);

  if (!parsed) return null;

  if (parsed.unsatisfiable) {
    return new Response(null, {
      status: 416,
      headers: {
        'Content-Range': `bytes */${totalSize}`,
        'Accept-Ranges': 'bytes',
      },
    });
  }

  const partialBlob = fullBlob.slice(parsed.start, parsed.end + 1);
  const headers = new Headers(cachedResponse.headers);
  const contentType =
    headers.get('Content-Type') || 'application/octet-stream';

  headers.set('Content-Type', contentType);
  headers.set(
    'Content-Range',
    `bytes ${parsed.start}-${parsed.end}/${totalSize}`
  );
  headers.set('Content-Length', String(parsed.end - parsed.start + 1));
  headers.set('Accept-Ranges', 'bytes');

  return new Response(partialBlob, {
    status: 206,
    statusText: 'Partial Content',
    headers,
  });
}

async function getCacheSnapshot() {
  const cache = await caches.open(PMTILES_CACHE);
  const keys = await cache.keys();
  const cachedUrls = keys.map(request => request.url);

  return {
    cacheName: PMTILES_CACHE,
    expectedUrls: PMTILES_URLS,
    cachedUrls,
    missingUrls: PMTILES_URLS.filter(url => !cachedUrls.includes(url)),
  };
}

self.addEventListener('install', event => {
  logDebug('install started', {PMTILES_URLS});
  event.waitUntil(
    caches.open(PMTILES_CACHE).then(async cache => {
      await Promise.all(
        PMTILES_URLS.map(async url => {
          try {
            const response = await fetch(url, {cache: 'reload'});
            if (response && response.ok) {
              await cache.put(url, response);
              logDebug('cached during install', {
                url,
                status: response.status,
              });
            } else {
              logDebug('did not cache during install', {
                url,
                status: response ? response.status : null,
              });
            }
          } catch (error) {
            logDebug('prefetch failed during install', {
              url,
              error: String(error),
            });
          }
        })
      );

      logDebug('install finished snapshot', await getCacheSnapshot());
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

  event.respondWith(
    caches.open(PMTILES_CACHE).then(async cache => {
      const rangeHeader = request.headers.get('range');
      const cached = await cache.match(request, {ignoreSearch: true});
      if (cached && rangeHeader) {
        const partialResponse = await getRangeResponseFromCache(
          cached,
          rangeHeader
        );

        if (partialResponse) {
          logDebug('range request served from cache', {
            url: request.url,
            range: rangeHeader,
            status: partialResponse.status,
          });
          return partialResponse;
        }

        logDebug('range request not parseable, falling back to network', {
          url: request.url,
          range: rangeHeader,
        });
      }

      if (cached) {
        logDebug('cache hit', {url: request.url});
        return cached;
      }

      const response = await fetch(request);
      if (response && response.ok) {
        cache.put(request, response.clone());
        logDebug('cache miss then stored', {
          url: request.url,
          status: response.status,
        });
      } else {
        logDebug('cache miss with non-ok response', {
          url: request.url,
          status: response ? response.status : null,
        });
      }
      return response;
    })
  );
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'PMTILES_CACHE_STATUS_REQUEST') return;

  event.waitUntil(
    (async () => {
      const snapshot = await getCacheSnapshot();
      const source = event.source;

      if (source && typeof source.postMessage === 'function') {
        source.postMessage({
          type: 'PMTILES_CACHE_STATUS_RESPONSE',
          payload: snapshot,
        });
      }

      logDebug('cache status requested', snapshot);
    })()
  );
});
