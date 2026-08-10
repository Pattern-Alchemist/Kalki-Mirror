'use client';

import { motion, useScroll, useReducedMotion, useSpring } from 'framer-motion';

/**
 * ScrollProgress — a luminous gold progress bar fixed at the top of the viewport,
 * just below the nav. Uses useScroll + useSpring for buttery 60fps tracking.
 * Features a subtle gold glow that intensifies as you scroll deeper.
 * Respects prefers-reduced-motion (hidden entirely).
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Spring-smooth the progress for premium feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    mass: 0.5,
  });

  if (reduced) return null;

  return (
    <div className="fixed top-16 md:top-20 left-0 right-0 h-[3px] z-[60] pointer-events-none">
      {/* Glow layer — soft, diffused gold aura beneath the bar */}
      <motion.div
        className="absolute inset-0"
        style={{
          scaleX: smoothProgress,
          originX: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.15) 30%, rgba(212,175,55,0.25) 100%)',
          height: '12px',
          top: '-4px',
          filter: 'blur(6px)',
        }}
      />
      {/* Core bar — sharp, luminous gold line */}
      <motion.div
        className="absolute inset-0"
        style={{
          scaleX: smoothProgress,
          originX: 0,
          background: 'linear-gradient(90deg, var(--gold-dim) 0%, var(--gold) 40%, var(--gold-bright) 100%)',
          boxShadow: '0 0 8px rgba(212,175,55,0.4), 0 0 20px rgba(212,175,55,0.1)',
        }}
      />
    </div>
  );
}
