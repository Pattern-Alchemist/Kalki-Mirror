'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics/track';

// =============================================================
// AUDIT2 #33 — Global error pipeline
// -------------------------------------------------------------
// Captures unhandled errors + unhandled promise rejections from the
// browser. Routes them to /api/events as 'client_error' events.
// The admin /admin/analytics dashboard auto-surfaces them via the
// existing analytics snapshot.
//
// Mounted once in the root layout. Invisible (renders null).
// Dedupes: the same error message fires at most once per session
// to avoid log flooding.
// =============================================================

export function ErrorCapture() {
  const seenErrorsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const key = `${event.message}:${event.filename}:${event.lineno}`;
      if (seenErrorsRef.current.has(key)) return;
      seenErrorsRef.current.add(key);

      track('client_error', {
        properties: {
          message: event.message?.slice(0, 500),
          filename: event.filename?.slice(0, 200),
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack?.slice(0, 1000),
          path: typeof window !== 'undefined' ? window.location.pathname : '/',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : undefined,
        },
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason === 'string' ? reason : reason?.message || 'Unhandled promise rejection';
      const key = `promise:${message}`;
      if (seenErrorsRef.current.has(key)) return;
      seenErrorsRef.current.add(key);

      track('client_error', {
        properties: {
          message: message.slice(0, 500),
          stack: reason?.stack?.slice(0, 1000),
          path: typeof window !== 'undefined' ? window.location.pathname : '/',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : undefined,
        },
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
