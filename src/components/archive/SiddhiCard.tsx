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
        'glass-chip group flex flex-col',
        className
      )}
    >
      <div className="p-6 md:p-8 flex flex-col gap-4 flex-1">
        {/* Top row: Name + Lock */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl md:text-2xl text-foreground leading-tight tracking-tight group-hover:text-gold transition-colors duration-500 font-light">
              {siddhi.name}
            </h3>
            {/* Sanskrit in JetBrains Mono — the computational feel */}
            <p className="text-xs text-gold-dim mt-1.5 font-mono tracking-wider">{siddhi.sanskrit}</p>
          </div>
          {locked && (
            <div className="shrink-0 w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center border border-gold/10">
              <Lock className="w-3.5 h-3.5 text-gold-dim" />
            </div>
          )}
        </div>

        {/* Summary */}
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 editorial-spacing">
          {siddhi.summary}
        </p>

        {/* Bottom row: Meta — all in monospace for terminal/quantum feel */}
        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gold-subtle">
          <span className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-text-muted">{siddhi.tradition}</span>
          <div className="flex-1" />
          <AuthenticityMeter score={siddhi.authenticityScore} />
        </div>
        <span className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-copper w-fit">{siddhi.level}</span>
      </div>
    </Link>
  );
}
