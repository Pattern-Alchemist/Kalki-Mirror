'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';
import { CinematicImage } from '@/components/ui/CinematicImage';

export default function NotFound() {
  const reduced = useReducedMotion();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-deep-black overflow-hidden">
      {/* Cinematic background */}
      <CinematicImage
        src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/dark-temple-interior'
        alt='Dark temple corridor'
        fill
        scrim="full"
        vignette
        kenBurns="slow"
        dust
      />
      <div className="absolute inset-0 bg-deep-black/60" />

      <div className="relative z-10 text-center max-w-lg px-6">
        {/* Yantra spinner */}
        <motion.div
          className="mx-auto mb-10 w-24 h-24 relative"
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.7, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="/kalki-yantra.svg"
            alt=""
            className="w-full h-full opacity-20"
            style={!reduced ? { animation: 'yantraDraw 2.4s ease-out forwards' } : undefined}
            aria-hidden="true"
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gold/40 rounded-full"
            style={!reduced ? { animation: 'binduPulse 1.2s ease-in-out infinite' } : undefined}
            aria-hidden="true"
          />
        </motion.div>

        {/* 404 number */}
        <motion.p
          className="font-mono text-7xl md:text-8xl text-gold/15 font-light tracking-[0.3em] mb-4 select-none"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}
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
          className="font-display text-3xl md:text-4xl text-white font-light tracking-wide mb-6 hero-heading"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.45, duration: 0.8 }}
        >
          This path does not exist.
        </motion.h1>

        <motion.p
          className="text-foreground/60 mb-10 max-w-md mx-auto editorial-spacing"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.55, duration: 0.8 }}
        >
          The siddhi, pattern, or page you seek is not in this archive.
          Not all paths lead to Shambhala — but you can return to the threshold.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.65, duration: 0.8 }}
        >
          <Link href="/" className="gold-cta">Return to the Threshold</Link>
          <Link href="/archive" className="ghost-cta">Browse the Archive</Link>
        </motion.div>

        <motion.div
          className="mt-14 flex items-center justify-center gap-6 text-text-muted/30"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          <Link href="/patterns" className="text-[0.65rem] font-mono tracking-[0.15em] uppercase hover:text-gold-dim transition-colors duration-500">Patterns</Link>
          <span className="text-text-muted/15">{'·'}</span>
          <Link href="/archetypes" className="text-[0.65rem] font-mono tracking-[0.15em] uppercase hover:text-gold-dim transition-colors duration-500">Mahavidyas</Link>
          <span className="text-text-muted/15">{'·'}</span>
          <Link href="/consultations" className="text-[0.65rem] font-mono tracking-[0.15em] uppercase hover:text-gold-dim transition-colors duration-500">Consult</Link>
        </motion.div>
      </div>
    </div>
  );
}
