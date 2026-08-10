'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';

export default function NotFound() {
  const reduced = useReducedMotion();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-deep-black px-6 relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="atmospheric-bg absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="page-vignette absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 text-center max-w-lg">
        {/* Yantra spinner */}
        <motion.div
          className="mx-auto mb-10 w-28 h-28 relative"
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.7, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="/kalki-yantra.svg"
            alt=""
            className="w-full h-full opacity-30"
            style={!reduced ? { animation: 'yantraDraw 2.4s ease-out forwards' } : undefined}
            aria-hidden="true"
          />
          {/* Pulsing bindu at center */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gold/50 rounded-full"
            style={!reduced ? { animation: 'binduPulse 1.2s ease-in-out infinite' } : undefined}
            aria-hidden="true"
          />
        </motion.div>

        {/* 404 number */}
        <motion.p
          className="font-mono text-7xl md:text-8xl text-gold/20 font-light tracking-[0.3em] mb-4 select-none"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          404
        </motion.p>

        <motion.p
          className="section-label mb-6"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.35, duration: 0.8 }}
        >
          PATH NOT FOUND
        </motion.p>

        <motion.h1
          className="font-display text-3xl md:text-4xl text-foreground font-light tracking-wide mb-6 engraved-heading"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.45, duration: 0.8 }}
        >
          This path does not exist.
        </motion.h1>

        <motion.p
          className="text-text-muted mb-10 max-w-md mx-auto editorial-spacing"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.55, duration: 0.8 }}
        >
          The siddhi, pattern, or page you seek is not in this archive.
          Not all paths lead to Shambhala — but you can return to the threshold.
        </motion.p>

        <motion.div
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.65, duration: 0.8 }}
        >
          <Link href="/" className="gold-cta">Return to the Threshold</Link>
        </motion.div>
      </div>
    </div>
  );
}
