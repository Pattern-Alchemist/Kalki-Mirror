'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax } from '@/components/ui/ScrollParallax';
import { BreathTimer } from '@/components/practice/BreathTimer';
import { allBreathPatterns } from '@/lib/data/breath-patterns';
import { BackButton } from '@/components/nav/BackButton';
const AIBreathworkGenerator = dynamic(() => import('@/components/ai/AIBreathworkGenerator').then(m => ({ default: m.AIBreathworkGenerator })), { ssr: false, loading: () => <div className="h-32" /> });
import { ResonanceToggle } from '@/components/ui/ResonanceToggle';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { Timer, CircleDot } from 'lucide-react';

const FREE_PATTERNS = ['nadi-shuddhi-basic', 'bhramari', 'ujjayi-pranayama'];

export default function PracticePage() {
  const [active, setActive] = useState(FREE_PATTERNS[0]);
  const reduced = useReducedMotion();

  const freePatterns = allBreathPatterns.filter((p) => FREE_PATTERNS.includes(p.slug));
  const lockedPatterns = allBreathPatterns.filter((p) => !FREE_PATTERNS.includes(p.slug));

  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-meditation-platform'
        title="Sādhana Tools"
        subtitle="Guided breathwork, japa counting, and meditation."
        sectionLabel="Practice"
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20 md:py-28 space-y-28">
        <div className="flex items-center justify-between">
          <BackButton href="/" label="Back to Home" />
          <ResonanceToggle />
        </div>

        {/* ── Cinematic Break — Altar ── */}
        <ScrollParallax speed={-0.1}>
          <div className="relative h-[35vh] md:h-[45vh] overflow-hidden">
            <CinematicImage
              src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-cremation-ground-alt'
              alt="Meditation altar with ceremonial objects"
              kenBurns="slow"
              scrim="full"
              vignette
              volumetric
            />
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <ParallaxOverlays reduced={reduced} />
            </div>
          </div>
        </ScrollParallax>

        {/* Breathwork Section */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-4">Breathwork</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-12 engraved-heading">Prāṇāyāma Timer</h2>

          {/* Pattern tabs */}
          <div className="flex flex-wrap gap-2 mb-12">
            {freePatterns.map((p) => (
              <button
                key={p.slug}
                onClick={() => setActive(p.slug)}
                className={`px-5 py-2.5 text-[0.65rem] font-ui tracking-[0.15em] uppercase rounded-sm transition-all duration-400 ${
                  active === p.slug
                    ? 'bg-gold text-deep-black'
                    : 'bg-surface text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                }`}
              >
                {p.name}
              </button>
            ))}
            {lockedPatterns.map((p) => (
              <button
                key={p.slug}
                disabled
                className="px-5 py-2.5 text-[0.65rem] font-ui tracking-[0.15em] uppercase rounded-sm bg-surface text-text-muted/40 cursor-not-allowed border border-gold/5"
                title={`${p.name} — unlock with ${p.minTier} tier`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <BreathTimer patternSlug={active} />

          {/* AI Breathwork Generator */}
          <div className="mt-12">
            <AIBreathworkGenerator />
          </div>
        </motion.section>

        {/* ── Cinematic Divider Strip ── */}
        <ScrollParallax speed={-0.08}>
          <div className="relative h-[25vh] md:h-[35vh] overflow-hidden">
            <CinematicImage
              src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-dark-temple-interior'
              alt="Temple interior with lamp light"
              kenBurns="normal"
              scrim="full"
              fog
            />
          </div>
        </ScrollParallax>

        {/* Japa Section — with visual preview card */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-4">Mantra Practice</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-12 engraved-heading">Japa Mālā</h2>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-editorial mb-6">
                Count your mantra repetitions with precision. The mālā persists in your browser across sessions, tracking your daily rounds and total count. Each bead represents one full recitation — a single thread in the tapestry of your practice.
              </p>
              <p className="text-editorial mb-8">
                Select from traditional mantras or enter your own. The counter supports multiple mālās of 108 beads, with haptic and visual feedback at each bead boundary.
              </p>
              <Link href="/practice/japa" className="gold-cta inline-block">Open Japa Counter</Link>
            </div>
            <motion.div
              className="glass-panel p-8 md:p-10 text-center"
              initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              <CircleDot className="w-10 h-10 text-gold/40 mx-auto mb-4" />
              <p className="font-display text-6xl md:text-7xl text-gold font-light mb-2">108</p>
              <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted">Beads Per Mālā</p>
              <div className="mt-6 flex justify-center gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gold/20" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Meditation Section — with visual preview card */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <div className="divider-subtle mb-16" />
          <p className="section-label mb-4">Meditation</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-12 engraved-heading">Silent Sitting Timer</h2>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="md:order-2">
              <p className="text-editorial mb-6">
                A minimal timer for unstructured meditation practice. Set your duration, begin sitting, and let the timer handle the rest. A gentle bell signals the end of the session — no jarring alarms, no interruptions to your stillness.
              </p>
              <p className="text-editorial mb-8">
                The interface disappears during practice, leaving only the breathing indicator and remaining time. Designed to support, never distract.
              </p>
              <Link href="/practice/timer" className="gold-cta inline-block">Open Timer</Link>
            </div>
            <motion.div
              className="glass-panel p-8 md:p-10 text-center md:order-1"
              initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              <Timer className="w-10 h-10 text-gold/40 mx-auto mb-4" />
              <p className="font-display text-6xl md:text-7xl text-gold font-light mb-2">21</p>
              <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted">Minutes Default</p>
              <div className="mt-6 w-16 h-16 mx-auto rounded-full border border-gold/20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-gold/50 rounded-full" style={{ animation: 'breatheSlow 6s ease-in-out infinite' }} />
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

/* Sub-component for the cinematic break overlay */
function ParallaxOverlays({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      className="text-center"
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="section-label mb-3">The Practice</p>
      <p className="font-display text-2xl md:text-4xl text-foreground/90 font-light tracking-wide" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
        Where pattern meets discipline
      </p>
    </motion.div>
  );
}
