import {setWorkerUrl} from 'maplibre-gl';

// maplibre-gl v6 loads its web worker from a separate file. Referencing it with
// new URL(..., import.meta.url) makes webpack emit the worker as a hashed asset
// and return its served URL.
// Import this module (for its side effect) before creating a map.
setWorkerUrl(
  new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).toString()
);
