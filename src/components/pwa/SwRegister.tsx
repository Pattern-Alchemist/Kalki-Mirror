'use client';

/**
 * Tier-3 ⑤ — PWA service-worker registration (roadmap #15).
 *
 * Production-only, load-time, fire-and-forget: the SW is an offline
 * enhancement, never a requirement. Development stays SW-free so
 * hot reload is never haunted by a stale worker.
 */

import { useEffect } from 'react';

export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {
          // Registration failure is silent by design — the site is
          // fully functional without the offline shell.
        });
    };

    if (document.readyState === 'complete') {
      register();
      return;
    }
    window.addEventListener('load', register, { once: true });
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
