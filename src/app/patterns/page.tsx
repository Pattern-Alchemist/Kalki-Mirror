'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { PatternCard } from '@/components/patterns/PatternCard';
import { allPatterns } from '@/lib/data/patterns';
import { staggerContainer, staggerItem } from '@/lib/motion/tokens';

export default function PatternsPage() {
  const reduced = useReducedMotion();
  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image="/assets/tantra/Surreal_labyrinth_black_stone_te…_202608031904.jpeg"
        title="Pattern Atlas"
        subtitle="The emotional patterns that run your life — and the sādhanas designed to dissolve them."
        sectionLabel="The Mirror Method"
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          animate={staggerContainer.visible}
        >
          {allPatterns.map((p) => (
            <motion.div key={p.slug} variants={staggerItem}>
              <PatternCard pattern={p} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
