'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Siddhi } from '@/lib/data/types';
import { TIER_ORDER } from '@/lib/utils/tier-gate';
import { AuthenticityMeter } from './AuthenticityMeter';
import { CautionBadge, getCautionLevel } from './CautionBadge';
import { MagneticCard } from '@/components/ui/MagneticCard';

interface SiddhiCardProps {
  siddhi: Siddhi;
  className?: string;
}

export function SiddhiCard({ siddhi, className }: SiddhiCardProps) {
  const locked = TIER_ORDER.indexOf(siddhi.minTier) > 0;
  const caution = getCautionLevel(siddhi.level);

  return (
    <MagneticCard className={className}>
      <Link
        href={`/archive/${siddhi.slug}`}
        className='glass-chip group flex flex-col'
      >
        <div className="p-6 md:p-8 flex flex-col gap-4 flex-1">
          {/* Top row: Name + Lock + Caution */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <h3 className="font-display text-xl md:text-2xl text-foreground leading-tight tracking-tight group-hover:text-gold transition-colors duration-500 font-light">
                  {siddhi.name}
                </h3>
                {locked && (
                  <span className="shrink-0 w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center border border-gold/10">
                    <Lock className="w-3 h-3 text-gold-dim" />
                  </span>
                )}
              </div>
              <p className="text-sm text-gold-dim font-mono tracking-wider">{siddhi.sanskrit}</p>
            </div>
          </div>

          {/* Summary */}
          <p className="text-base text-text-secondary leading-relaxed line-clamp-3 editorial-spacing">
            {siddhi.summary}
          </p>

          {/* Bottom row: Metadata ledger */}
          <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gold/5">
            <CautionBadge level={caution} />
            <span className="font-mono text-[0.75rem] tracking-[0.1em] uppercase text-text-muted">{siddhi.category}</span>
            <div className="flex-1" />
            <AuthenticityMeter score={siddhi.authenticityScore} />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.75rem] tracking-[0.12em] uppercase text-copper">{siddhi.tradition}</span>
            <div className="flex-1" />
            <span className="font-mono text-[0.75rem] tracking-[0.12em] uppercase text-text-muted">{siddhi.level}</span>
          </div>
        </div>
      </Link>
    </MagneticCard>
  );
}
