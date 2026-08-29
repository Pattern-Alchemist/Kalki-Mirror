'use client';

import { useSyncExternalStore } from 'react';

/**
 * Client-environment hooks built on useSyncExternalStore.
 *
 * These replace the legacy `useEffect(() => setState(...))` hydration
 * pattern that trips `react-hooks/set-state-in-effect` and causes
 * cascading re-renders. All hooks are SSR-safe: the server snapshot
 * is returned during SSR and hydration, then React re-renders once
 * with the real client snapshot — no hydration mismatch.
 */

const noopSubscribe = () => () => {};

/**
 * True only after client hydration has completed.
 * SSR + first client render see `false`.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Subscribe to a CSS media query. Returns its `matches` value.
 * Server snapshot is always `false`.
 *
 * @example
 *   const isMobile = useMediaQuery('(max-width: 767px)');
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * True when the device reports touch capability.
 * Server snapshot is always `false`. Capability is sampled once
 * per subscription and does not emit change events (matches legacy
 * behavior: 'ontouchstart' in window || navigator.maxTouchPoints > 0).
 */
export function useIsTouchDevice(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () =>
      typeof navigator !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    () => false,
  );
}
