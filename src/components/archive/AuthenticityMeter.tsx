'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { meterFill } from '@/lib/motion/tokens';

interface AuthenticityMeterProps {
  score: number;
}

export function AuthenticityMeter({ score }: AuthenticityMeterProps) {
  const prefersReduced = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden">
      <motion.span
        className="block h-full rounded-full"
        style={{ background: 'var(--gold)', width: prefersReduced ? `${clamped}%` : undefined }}
        variants={!prefersReduced ? meterFill(clamped) : undefined}
        initial="hidden"
        animate="visible"
      />
    </div>
  );
}
