'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';

interface AnimatedCounterProps {
  target: number;
  suffix?: string; // e.g. '%', '+'
  duration?: number; // seconds
  className?: string;
}

/**
 * AnimatedCounter — counts from 0 to `target` when it enters the viewport.
 * Uses framer-motion useMotionValue for buttery 60fps number animation.
 * Respects prefers-reduced-motion (shows final number instantly).
 */
export function AnimatedCounter({
  target,
  suffix = '',
  duration = 1.6,
  className = '',
}: AnimatedCounterProps) {
  const reduced = useNativeReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (!inView || reduced) {
      count.set(target);
      return;
    }
    const controls = animate(count, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [inView, target, duration, count, reduced]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
