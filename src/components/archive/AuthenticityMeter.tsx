'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { meterFill } from '@/lib/motion/tokens';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface AuthenticityMeterProps {
  score: number;
}

export function AuthenticityMeter({ score }: AuthenticityMeterProps) {
  const prefersReduced = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.75rem] text-text-muted tracking-[0.12em] uppercase">Authenticity Score</span>
        <AnimatedCounter target={clamped} className="font-mono text-sm text-gold tracking-[0.1em]" suffix="%" />
      </div>
      <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden">
        <motion.span
          className="block h-full rounded-full"
          style={{ background: 'var(--gold)', width: prefersReduced ? `${clamped}%` : undefined }}
          variants={!prefersReduced ? meterFill(clamped) : undefined}
          initial="hidden"
          animate="visible"
        />
      </div>
    </div>
  );
}
