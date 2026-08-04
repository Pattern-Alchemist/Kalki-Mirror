'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTier } from '@/components/layout/TierProvider';
import { Tier } from '@/lib/data/types';
import { getTierCTA } from '@/lib/utils/tier-gate';
import { fadeIn } from '@/lib/motion/tokens';

interface GatedContentProps {
  minTier: Tier;
  children: React.ReactNode;
  label?: string;
}

export function GatedContent({ minTier, children, label }: GatedContentProps) {
  const { canAccess, tier } = useTier();
  const reduced = useReducedMotion();
  const allowed = canAccess(minTier);

  if (allowed) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred locked content underneath */}
      <div className="blur-sm select-none pointer-events-none opacity-40" aria-hidden="true">
        {children}
      </div>
      {/* Lock overlay */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-deep-black/60 backdrop-blur-sm rounded"
        initial={reduced ? { opacity: 1 } : fadeIn.hidden}
        animate={fadeIn.visible}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-dim">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <p className="text-text-secondary text-sm">
          {label ?? `${minTier.charAt(0).toUpperCase() + minTier.slice(1)} tier required`}
        </p>
        <span className="gold-cta text-xs py-2 px-6 cursor-default">
          {getTierCTA(minTier)}
        </span>
      </motion.div>
    </div>
  );
}