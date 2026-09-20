'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics/track';

// =============================================================
// AUDIT #5 — Universal page view tracker
// -------------------------------------------------------------
// Fires a 'page_view' event on every route change. This is the
// backbone of funnel analytics — without it, we cannot measure
// drop-off between /pricing → /consultations → /redeem.
//
// Mounted once in the root layout (alongside WebVitalsBeacon).
// Uses a ref to skip the initial SSR mount (the first client-side
// fire covers it) and to debounce rapid route changes.
// =============================================================

export function PageViewTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);
  const lastFireRef = useRef<number>(0);

  useEffect(() => {
    if (!pathname) return;
    // Skip if the path hasn't actually changed (React strict mode double-fire)
    if (pathname === lastPathRef.current) return;
    // Debounce: don't fire more than once per 500ms
    const now = Date.now();
    if (now - lastFireRef.current < 500) return;

    lastPathRef.current = pathname;
    lastFireRef.current = now;

    track('page_view', {
      properties: {
        path: pathname,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      },
    });
  }, [pathname]);

  return null;
}
