'use client';

import {useEffect} from 'react';

const SERVICE_WORKER_PATH = '/sw.js';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register(SERVICE_WORKER_PATH).catch(error => {
      // eslint-disable-next-line no-console
      console.warn('Service worker registration failed', error);
    });
  }, []);

  return null;
}
