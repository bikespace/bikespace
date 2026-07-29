'use client';

import {useEffect} from 'react';

const trafficStressUrl = process.env.DATA_LEVEL_OF_TRAFFIC_STRESS ?? '';

function buildServiceWorkerPath() {
  const params = new URLSearchParams({
    ltsDataUrl: trafficStressUrl,
  });

  if (window.location.search.includes('debugPmtilesCache=1')) {
    params.set('debugPmtilesCache', '1');
  }

  return `/sw.js?${params.toString()}`;
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register(buildServiceWorkerPath()).catch(error => {
      // eslint-disable-next-line no-console
      console.warn('Service worker registration failed', error);
    });
  }, []);

  return null;
}
