'use client';

import { useReducedMotion } from 'framer-motion';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

const STEPS = [
  'Pattern Recognition',
  'Emotional Origin',
  'Karmic Reinforcement',
  'Behavioral Expression',
  'Conscious Intervention',
];

export function MirrorMethodSteps({ className }: { className?: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={cn('flex gap-6 overflow-x-auto pb-4 scrollbar-none', className)}
      variants={prefersReduced ? undefined : staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {STEPS.map((label, i) => (
        <motion.div
          key={label}
          className="flex flex-col items-center gap-2 shrink-0"
          variants={prefersReduced ? undefined : staggerItem}
        >
          <span className="w-10 h-10 rounded-full border border-[var(--gold-dim)] flex items-center justify-center font-ui text-sm text-gold">
            {i + 1}
          </span>
          <span className="text-xs text-text-secondary font-ui text-center max-w-[100px]">{label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
