'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';

export default function NotFound() {
  const reduced = useReducedMotion();

  return (
    <div className="relative min-h-[100vh] flex flex-col items-center justify-center bg-deep-black px-6 overflow-hidden">
      {/* Atmospheric layers */}
      <div className="atmospheric-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="page-vignette absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* Faint radial glow behind yantra */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center max-w-lg">
        {/* Yantra spinner */}
        <motion.div
          className="mx-auto mb-12 w-32 h-32 relative"
          initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="/kalki-yantra.svg"
            alt=""
            className="w-full h-full opacity-20"
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

        <motion.div
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          animate={reduced ? { opacity: 1 } : staggerContainer.visible}
        >
          {/* 404 number */}
          <motion.p
            className="font-mono text-8xl md:text-9xl text-gold/15 font-extralight tracking-[0.4em] mb-2 select-none"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={reduced ? { opacity: 1 } : fadeInUp.visible}
            transition={{ delay: 0.15, duration: 1 }}
          >
            404
          </motion.p>

          {/* Thin gold rule */}
          <motion.div
            className="divider-gold max-w-[120px] mx-auto my-8"
            initial={reduced ? { opacity: 0.3, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.3, scaleX: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'center' }}
          />

          {/* Section label */}
          <motion.p
            className="section-label mb-5"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={reduced ? { opacity: 1 } : fadeInUp.visible}
            transition={{ delay: 0.35, duration: 0.8 }}
          >
            PATH NOT FOUND
          </motion.p>

          {/* Headline */}
          <motion.h1
            className="font-display text-3xl md:text-4xl text-foreground font-light tracking-wide mb-5 engraved-heading"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={reduced ? { opacity: 1 } : fadeInUp.visible}
            transition={{ delay: 0.45, duration: 0.8 }}
          >
            This path does not exist.
          </motion.h1>

          {/* Body copy */}
          <motion.p
            className="text-text-muted mb-10 max-w-md mx-auto editorial-spacing"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={reduced ? { opacity: 1 } : fadeInUp.visible}
            transition={{ delay: 0.55, duration: 0.8 }}
          >
            The siddhi, pattern, or page you seek is not in this archive.
            Not all paths lead to Shambhala — but you can return to the threshold.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={reduced ? { opacity: 1 } : fadeInUp.visible}
            transition={{ delay: 0.65, duration: 0.8 }}
          >
            <Link href="/" className="gold-cta">Return to the Threshold</Link>
            <Link href="/archive" className="ghost-cta">Browse the Archive</Link>
          </motion.div>

          {/* Subtle nav hints */}
          <motion.div
            className="mt-14 flex items-center justify-center gap-6 text-text-muted/30"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1.2 }}
          >
            <Link href="/patterns" className="text-[0.6875rem] font-mono tracking-[0.15em] uppercase hover:text-gold-dim transition-colors duration-500">Patterns</Link>
            <span className="text-text-muted/15">{'\u00B7'}</span>
            <Link href="/archetypes" className="text-[0.6875rem] font-mono tracking-[0.15em] uppercase hover:text-gold-dim transition-colors duration-500">Mahavidyas</Link>
            <span className="text-text-muted/15">{'\u00B7'}</span>
            <Link href="/consultations" className="text-[0.6875rem] font-mono tracking-[0.15em] uppercase hover:text-gold-dim transition-colors duration-500">Consult</Link>
            <span className="text-text-muted/15">{'\u00B7'}</span>
            <Link href="/practice" className="text-[0.6875rem] font-mono tracking-[0.15em] uppercase hover:text-gold-dim transition-colors duration-500">Practice</Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom bindu — anchors the page */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={reduced ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <div className="w-10 h-10 border border-gold/10 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-gold/25 rounded-full" style={{ animation: 'binduPulse 2.5s ease-in-out infinite' }} />
        </div>
      </motion.div>
    </div>
  );
}
