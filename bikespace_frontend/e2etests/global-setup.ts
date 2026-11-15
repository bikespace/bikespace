import type {FullConfig} from '@playwright/test';

// The e2e frontend runs on `next dev`, which compiles each route the first
// time it is requested. Compiling a new route can make Next.js fully reload
// pages that are already open, which wipes in-memory state (e.g. dashboard
// filters) in whichever test is running in another worker at the time.
// Request every route the tests visit once, before any test starts, so no
// compilation happens mid-run.
const routesToWarmUp = [
  '/',
  '/about',
  '/dashboard',
  '/parking-map',
  '/profile',
  '/submission',
];

// first-time compilation of a route can be slow, especially the dashboard
const warmUpTimeoutMs = 120 * 1000;

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) return;

  // sequential: concurrent first-time compiles are no faster on `next dev`
  for (const route of routesToWarmUp) {
    const url = new URL(route, baseURL).toString();
    const res = await fetch(url, {
      signal: AbortSignal.timeout(warmUpTimeoutMs),
    });
    if (!res.ok) {
      throw new Error(`e2e warm-up: GET ${url} returned ${res.status}`);
    }
  }
}
