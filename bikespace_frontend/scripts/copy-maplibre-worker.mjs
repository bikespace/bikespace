// Copies maplibre-gl's web worker into public/ so it is served as-is.
//
// maplibre-gl v6 loads its worker from a separate file that it finds relative
// to its own import.meta.url, which the bundler rewrites to a build-time path.
// Bundling the worker as an asset doesn't work either: Next's minifier fails
// to parse it. Serving a copy from public/ avoids both problems.
// See src/utils/map-utils/maplibre-worker.ts.
import {copyFileSync, mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const frontendDir = join(dirname(fileURLToPath(import.meta.url)), '..');

const maplibreDir = dirname(require.resolve('maplibre-gl/package.json'));
const source = join(maplibreDir, 'dist', 'maplibre-gl-worker.mjs');
const target = join(frontendDir, 'public', 'maplibre-gl-worker.mjs');

mkdirSync(dirname(target), {recursive: true});
copyFileSync(source, target);
console.log(`Copied maplibre-gl worker to ${target}`);
