'use client';

// =============================================================
// VOL. 2 #3 — useIsMobile + useBreakpoint
// -------------------------------------------------------------
// Lightweight responsive hook. SSR-safe (returns false on the
// first render, then updates after mount to avoid hydration
// mismatch warnings).
//
// Default breakpoint: 768px (Tailwind md).
// =============================================================

import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}

export function useBreakpoint(): 'sm' | 'md' | 'lg' | 'xl' {
  const [bp, setBp] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 640) setBp('sm');
      else if (w < 768) setBp('md');
      else if (w < 1024) setBp('lg');
      else setBp('xl');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return bp;
}
