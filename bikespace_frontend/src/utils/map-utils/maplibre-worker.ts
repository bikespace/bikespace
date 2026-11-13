import {getVersion, setWorkerUrl} from 'maplibre-gl';

// maplibre-gl v6 locates its web worker relative to its own import.meta.url,
// which the bundler rewrites to a build-time file:// path, so the worker would
// fail to start. Point it at the copy that scripts/copy-maplibre-worker.mjs
// puts in public/ before every dev or build run. The version query string
// stops browsers using a cached worker from an older maplibre-gl.
// Import this module (for its side effect) before creating a map.
setWorkerUrl(`/maplibre-gl-worker.mjs?v=${getVersion()}`);
