'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';

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
 * CRITICAL PERFORMANCE: Children are rendered in a plain div immediately (SSR/FCP safe).
 * The framer-motion parallax wrapper is only attached after hydration via useState.
 * This prevents ScrollParallax from blocking LCP or hiding above-fold content.
 */
export function ScrollParallax({
 children,
 speed = -0.15,
 className = '',
 disabled = false,
}: ScrollParallaxProps) {
 const reduced = useNativeReducedMotion();
 const ref = useRef<HTMLDivElement>(null);
 // After hydration, enable the motion wrapper. Before hydration, render children plain.
 const [hydrated, setHydrated] = useState(false);
 useEffect(() => { setHydrated(true); }, []);

 // When disabled, reduced motion, or not yet hydrated, render children in a plain div
 if (disabled || reduced || !hydrated) {
 return <div className={className}>{children}</div>;
 }

 return <ScrollParallaxInner ref={ref} speed={speed} className={className}>{children}</ScrollParallaxInner>;
}

/** Inner component that uses framer-motion hooks — only mounted after hydration */
function ScrollParallaxInner({
 children, speed, className, ref,
}: ScrollParallaxProps & { ref: React.RefObject<HTMLDivElement | null> }) {
 const { scrollYProgress } = useScroll({
 target: ref,
 offset: ['start end', 'end start'],
 });

 const range = 100 * Math.abs(speed);
 const y = useTransform(
 scrollYProgress,
 [0, 1],
 speed < 0 ? [range, -range] : [-range, range]
 );
 const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);
 const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.04, 1, 1.04]);

 return (
 <div ref={ref} className={`overflow-hidden ${className}`}>
 <motion.div style={{ y, opacity, scale }} will-change="transform, opacity">
 {children}
 </motion.div>
 </div>
 );
}

/**
 * ParallaxText — applies parallax to text content only (no scale).
 * Same hydration-safe pattern: renders children immediately, attaches motion after mount.
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
 const reduced = useNativeReducedMotion();
 const ref = useRef<HTMLDivElement>(null);
 const [hydrated, setHydrated] = useState(false);
 useEffect(() => { setHydrated(true); }, []);

 if (reduced || !hydrated) {
 return <div className={className}>{children}</div>;
 }

 return <ParallaxTextInner ref={ref} speed={speed} className={className}>{children}</ParallaxTextInner>;
}

function ParallaxTextInner({
 children, speed, className, ref,
}: ParallaxTextProps & { ref: React.RefObject<HTMLDivElement | null> }) {
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
 const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

 return (
 <div ref={ref} className={className}>
 <motion.div style={{ y, opacity }} will-change="transform, opacity">
 {children}
 </motion.div>
 </div>
 );
}
