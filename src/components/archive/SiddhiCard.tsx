'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Siddhi } from '@/lib/data/types';
import { TIER_ORDER } from '@/lib/utils/tier-gate';
import { AuthenticityMeter } from './AuthenticityMeter';

interface SiddhiCardProps {
  siddhi: Siddhi;
  className?: string;
}

export function SiddhiCard({ siddhi, className }: SiddhiCardProps) {
  const locked = TIER_ORDER.indexOf(siddhi.minTier) > 0;

  return (
    <Link
      href={`/archive/${siddhi.slug}`}
      className={cn(
        'glass-chip p-4 flex flex-col gap-3 transition-colors duration-300',
        'hover:border-[var(--gold)] hover:border-opacity-60',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg text-gold leading-tight">{siddhi.name}</h3>
          <p className="text-xs text-text-muted mt-0.5">{siddhi.sanskrit}</p>
        </div>
        {locked && <Lock className="w-3.5 h-3.5 text-text-muted shrink-0 mt-1" />}
      </div>

      <span className="section-label w-fit">{siddhi.tradition}</span>

      <AuthenticityMeter score={siddhi.authenticityScore} />

      <span className="text-xs font-ui text-text-secondary bg-surface-elevated px-2 py-0.5 rounded w-fit">
        {siddhi.level}
      </span>
    </Link>
  );
}
