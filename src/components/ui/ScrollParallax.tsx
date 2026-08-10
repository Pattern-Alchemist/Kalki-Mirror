'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface ScrollParallaxProps {
  children: React.ReactNode;
  /** Parallax speed multiplier. Negative = moves opposite to scroll (recedes). Default: -0.15 */
  speed?: number;
  /** Additional CSS classes for the outer container */
  className?: string;
  /** Disable parallax entirely (useful for mobile performance) */
  disabled?: boolean;
}

/**
 * ScrollParallax — wraps children in a scroll-linked transform.
 * Uses Framer Motion's useScroll + useTransform for buttery 60fps parallax.
 * Respects prefers-reduced-motion automatically.
 */
export function ScrollParallax({
  children,
  speed = -0.15,
  className = '',
  disabled = false,
}: ScrollParallaxProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Map scroll progress [0, 1] → pixel offset based on speed
  const range = 100 * Math.abs(speed);
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    speed < 0 ? [range, -range] : [-range, range]
  );

  // Fade: slightly transparent at edges, fully opaque in center
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.6, 1, 1, 0.6]
  );

  // Scale: subtle zoom effect — slightly larger when entering viewport
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1.04, 1, 1.04]
  );

  if (reduced || disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        style={{ y, opacity, scale }}
        will-change="transform, opacity"
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * ParallaxText — applies parallax to text content only (no scale).
 * Lighter version for text-heavy sections.
 */
interface ParallaxTextProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxText({
  children,
  speed = -0.08,
  className = '',
}: ParallaxTextProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const range = 60 * Math.abs(speed);
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    speed < 0 ? [range, -range] : [-range, range]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0]
  );

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={{ y, opacity }}
        will-change="transform, opacity"
      >
        {children}
      </motion.div>
    </div>
  );
}
