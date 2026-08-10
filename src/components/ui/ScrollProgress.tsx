'use client';

import { motion, useScroll, useReducedMotion } from 'framer-motion';

/**
 * ScrollProgress — a thin gold progress bar fixed at the top of the viewport,
 * just below the nav. Uses useScroll to track page progress.
 * Respects prefers-reduced-motion (hidden entirely).
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  if (reduced) return null;

  return (
    <motion.div
      className="fixed top-16 md:top-20 left-0 right-0 h-[2px] z-[60] origin-left"
      style={{
        scaleX: scrollYProgress,
        background: 'linear-gradient(90deg, var(--gold) 0%, var(--gold-bright) 100%)',
        opacity: 0.7,
      }}
    />
  );
}
