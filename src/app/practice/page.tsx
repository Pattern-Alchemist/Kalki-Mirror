'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { BreathTimer } from '@/components/practice/BreathTimer';
import { allBreathPatterns } from '@/lib/data/breath-patterns';
import { BackButton } from '@/components/nav/BackButton';
import { AIBreathworkGenerator } from '@/components/ai/AIBreathworkGenerator';
import { ResonanceToggle } from '@/components/ui/ResonanceToggle';
import { fadeInUp } from '@/lib/motion/tokens';

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

        {/* Japa Section */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <div className="divider-subtle mb-16" />
          <p className="section-label mb-4">Mantra Practice</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6 engraved-heading">Japa Mālā</h2>
          <p className="text-editorial mb-10">
            Count your mantra repetitions. The mālā persists in your browser.
          </p>
          <Link href="/practice/japa" className="gold-cta inline-block">Open Japa Counter</Link>
        </motion.section>

        {/* Meditation Section */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <div className="divider-subtle mb-16" />
          <p className="section-label mb-4">Meditation</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6 engraved-heading">Silent Sitting Timer</h2>
          <p className="text-editorial mb-10">
            A simple timer for unstructured meditation practice.
          </p>
          <Link href="/practice/timer" className="gold-cta inline-block">Open Timer</Link>
        </motion.section>
      </div>
    </div>
  );
}
