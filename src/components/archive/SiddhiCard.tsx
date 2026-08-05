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
        'glass-chip overflow-hidden flex flex-col transition-colors duration-300',
        'hover:border-[var(--gold)] hover:border-opacity-60',
        className
      )}
    >
      {/* Content — pure text, no image thumbnail */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl text-foreground leading-tight">{siddhi.name}</h3>
            <p className="text-xs text-text-secondary mt-1 italic">{siddhi.sanskrit}</p>
          </div>
          {locked && (
            <div className="shrink-0 bg-surface-elevated rounded-full p-1.5">
              <Lock className="w-3.5 h-3.5 text-gold" />
            </div>
          )}
        </div>
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{siddhi.summary}</p>
        <div className="flex items-center gap-3 mt-auto pt-2">
          <span className="section-label w-fit">{siddhi.tradition}</span>
          <AuthenticityMeter score={siddhi.authenticityScore} />
        </div>
        <span className="text-xs font-ui text-text-muted bg-surface-elevated px-2 py-0.5 rounded w-fit">
          {siddhi.level}
        </span>
      </div>
    </Link>
  );
}
