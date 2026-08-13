'use client';

import { useEffect, useState } from 'react';

/**
 * Root template — wraps every page in a subtle fade transition.
 * Re-mounts on every route change (unlike layout.tsx).
 * Uses CSS animations instead of Framer Motion to avoid
 * hydration mismatches and unnecessary JS.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (reduced) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        animation: 'pageEnter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      {children}
    </div>
  );
}