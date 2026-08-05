'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';
import { CinematicImage } from '@/components/ui/CinematicImage';

export function ThresholdHero() {
  const prefersReduced = useReducedMotion();
  const v = prefersReduced
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : fadeInUp;

  return (
    <section className="relative h-screen min-h-[600px] w-full flex items-center justify-center overflow-hidden">
      <CinematicImage
        src="/assets/tantra/temple-midnight.jpeg"
        alt="Observatory under the night sky"
        kenBurns="slow"
        scrim="full"
        priority
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">
        <motion.h1
          className="font-display text-5xl md:text-7xl gold-foil-text leading-tight"
          variants={v}
          initial="hidden"
          animate="visible"
        >
          AstroKalki
        </motion.h1>

        <motion.p
          className="text-text-secondary text-lg mt-6 font-body"
          variants={v}
          initial="hidden"
          animate="visible"
          transition={prefersReduced ? {} : { delay: 0.15 }}
        >
          The same pain. Different face. Same pattern.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-10"
          variants={v}
          initial="hidden"
          animate="visible"
          transition={prefersReduced ? {} : { delay: 0.3 }}
        >
          <Link href="/archive" className="gold-cta">Enter the Archive</Link>
          <Link href="/practice" className="ghost-cta">Begin Your Practice</Link>
        </motion.div>
      </div>
    </section>
  );
}
