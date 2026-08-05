'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { BreathTimer } from '@/components/practice/BreathTimer';
import { allBreathPatterns } from '@/lib/data/breath-patterns';
import { GatedContent } from '@/components/monetization/GatedContent';
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
        image="/assets/tantra/ritual-chamber.jpeg"
        title="Sādhana Tools"
        subtitle="Guided breathwork, japa counting, and meditation."
        sectionLabel="Practice"
      />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">
        {/* Breathwork Section */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-3">Breathwork</p>
          <h2 className="font-display text-3xl text-foreground mb-8">Prāṇāyāma Timer</h2>

          {/* Pattern tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {freePatterns.map((p) => (
              <button
                key={p.slug}
                onClick={() => setActive(p.slug)}
                className={`px-4 py-2 text-xs font-ui tracking-wider uppercase rounded transition-all ${
                  active === p.slug
                    ? 'bg-gold text-deep-black'
                    : 'bg-surface text-text-muted hover:text-gold'
                }`}
              >
                {p.name}
              </button>
            ))}
            {lockedPatterns.map((p) => (
              <button
                key={p.slug}
                disabled
                className="px-4 py-2 text-xs font-ui tracking-wider uppercase rounded bg-surface text-text-muted/50 cursor-not-allowed relative"
                title={`${p.name} — unlock with ${p.minTier} tier`}
              >
                {p.name} 🔒
              </button>
            ))}
          </div>

          <BreathTimer patternSlug={active} />
        </motion.section>

        {/* Japa Section */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-3">Mantra Practice</p>
          <h2 className="font-display text-3xl text-foreground mb-4">Japa Mālā</h2>
          <p className="text-text-secondary mb-6">
            Count your mantra repetitions. The mālā persists in your browser.
          </p>
          <a href="/practice/japa" className="gold-cta inline-block text-sm">Open Japa Counter</a>
        </motion.section>

        {/* Meditation Section */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-3">Meditation</p>
          <h2 className="font-display text-3xl text-foreground mb-4">Silent Sitting Timer</h2>
          <p className="text-text-secondary mb-6">
            A simple timer for unstructured meditation practice.
          </p>
          <a href="/practice/breath" className="gold-cta inline-block text-sm">Open Timer</a>
        </motion.section>
      </div>
    </div>
  );
}