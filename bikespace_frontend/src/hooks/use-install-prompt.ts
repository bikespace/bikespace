import {useSyncExternalStore} from 'react';

import {getInstallPlatform, InstallPlatform} from '@/utils/install-platform';

export type InstallMode =
  | 'pending' // not known yet: prerendered HTML and hydration
  | 'hidden' // desktop, or already installed
  | 'prompt' // the browser's own install prompt is available
  | Exclude<InstallPlatform, 'desktop'>; // manual instructions

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<unknown>;
}

// Kept outside React because the browser can fire these before the landing page
// has rendered, or on another page before a client-side navigation to it. This
// module is imported by ServiceWorkerRegistration so it loads on every page.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isInstalled = false;
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach(subscriber => subscriber());
}

function handleBeforeInstallPrompt(event: Event) {
  // also stops Chrome showing its own mini-infobar
  event.preventDefault();
  deferredPrompt = event as BeforeInstallPromptEvent;
  notifySubscribers();
}

function handleAppInstalled() {
  deferredPrompt = null;
  isInstalled = true;
  notifySubscribers();
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari only; true when opened from the home screen
    (navigator as Navigator & {standalone?: boolean}).standalone === true
  );
}

function getInstallMode(): InstallMode {
  const platform = getInstallPlatform({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
  });

  if (platform === 'desktop' || isInstalled || isStandalone()) return 'hidden';
  return deferredPrompt ? 'prompt' : platform;
}

function getServerInstallMode(): InstallMode {
  return 'pending';
}

function subscribe(subscriber: () => void) {
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
}

export function useInstallMode() {
  return useSyncExternalStore(subscribe, getInstallMode, getServerInstallMode);
}

/** Shows the browser's install prompt. Each stashed event only works once. */
export async function promptInstall() {
  const event = deferredPrompt;
  if (!event) return;

  deferredPrompt = null;
  notifySubscribers();
  await event.prompt();
}

/** Clears module state between tests. */
export function resetInstallPrompt() {
  deferredPrompt = null;
  isInstalled = false;
  notifySubscribers();
}
