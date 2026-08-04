'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';

interface TimelineEntry {
  year: string;
  title: string;
  description: string;
}

interface TimelineProps {
  entries: TimelineEntry[];
}

export function Timeline({ entries }: TimelineProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="relative ml-4 md:ml-8"
      initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
      whileInView={staggerContainer.visible}
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Vertical line */}
      <div className="absolute left-0 top-2 bottom-2 w-px bg-gold-dim/40" aria-hidden="true" />

      <div className="space-y-10">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.year}
            variants={staggerItem}
            className="relative pl-8"
          >
            {/* Dot */}
            <div className="absolute left-0 top-1.5 w-2.5 h-2.5 -translate-x-[4.5px] rounded-full border-2 border-gold bg-deep-black" aria-hidden="true" />
            <p className="section-label mb-1">{entry.year}</p>
            <h3 className="font-display text-lg text-foreground mb-2">{entry.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{entry.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}