'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Returns true if the user prefers reduced motion.
 * Uses native matchMedia via useSyncExternalStore — live-updates
 * when the OS-level setting changes, SSR-safe, and free of
 * cascading re-renders.
 *
 * Usage:
 *   const reduced = useNativeReducedMotion();
 */
export function useNativeReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
