'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true if the user prefers reduced motion.
 * Uses native matchMedia — no framer-motion dependency.
 *
 * Usage:
 *   const reduced = useNativeReducedMotion();
 */
export function useNativeReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
