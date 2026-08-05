'use client';

import type { CautionLevel } from '@/lib/data/types';
import { cn } from '@/lib/utils';

// Re-export for backward compat — server routes should import from @/lib/data/types directly
export { getCautionLevel } from '@/lib/data/types';

interface CautionBadgeProps {
  level: CautionLevel;
  className?: string;
}

const CAUTION_STYLES: Record<CautionLevel, string> = {
  OPEN: 'text-green-400/80 border-green-400/15 bg-green-400/5',
  MODERATE: 'text-yellow-400/80 border-yellow-400/15 bg-yellow-400/5',
  HIGH: 'border-copper/30 bg-copper/5',
  SEALED: 'text-copper border-copper/30 bg-copper/5',
};

export function CautionBadge({ level, className }: CautionBadgeProps) {
  const isCrimson = level === 'HIGH';
  return (
    <span
      className={cn(
        'text-[0.8125rem] px-2.5 py-1 rounded-sm border tracking-[0.15em] uppercase font-mono',
        CAUTION_STYLES[level],
        className
      )}
      style={isCrimson ? { color: 'var(--crimson)', borderColor: 'rgba(138, 37, 44, 0.35)' } : undefined}
    >
      {level}
    </span>
  );
}
