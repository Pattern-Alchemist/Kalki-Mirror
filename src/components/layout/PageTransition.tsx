'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Wraps page children in a subtle fade-in + slight upward drift.
 * Applied at the layout level so every route transition
 * gets a consistent cinematic entrance.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
