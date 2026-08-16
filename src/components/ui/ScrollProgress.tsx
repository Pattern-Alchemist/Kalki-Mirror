'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';

/**
 * ScrollProgress — a luminous gold progress bar fixed at the top of the viewport,
 * just below the nav. Uses useScroll + useSpring for buttery 60fps tracking.
 * Features a subtle gold glow that intensifies as you scroll deeper,
 * plus a leading ember pulse at the progress edge.
 * Respects prefers-reduced-motion (hidden entirely).
 */
export function ScrollProgress() {
  const reduced = useNativeReducedMotion();
  const { scrollYProgress } = useScroll();

  // Spring-smooth the progress for premium feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    mass: 0.5,
  });

  // Ember opacity — pulses gently, more visible at higher scroll
  const emberOpacity = useTransform(
    smoothProgress,
    [0, 0.05, 0.95, 1],
    [0, 0.8, 0.8, 0]
  );

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
      {/* Leading ember — bright gold dot at the progress edge */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          left: smoothProgress,
          x: '-50%',
          opacity: emberOpacity,
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: 'var(--gold-bright)',
            boxShadow: '0 0 6px rgba(212,175,55,0.8), 0 0 16px rgba(212,175,55,0.4), 0 0 30px rgba(232,200,85,0.2)',
            animation: 'emberPulse 2s ease-in-out infinite',
          }}
        />
      </motion.div>
    </div>
  );
}
