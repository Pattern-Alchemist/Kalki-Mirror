'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Root template — wraps every page in a fade-slide transition.
 * Unlike layout.tsx (persists across navigations), template.tsx
 * re-mounts on every route change, making AnimatePresence work.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
