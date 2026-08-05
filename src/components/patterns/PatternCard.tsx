'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Pattern } from '@/lib/data/types';

interface PatternCardProps {
  pattern: Pattern;
  className?: string;
}

export function PatternCard({ pattern, className }: PatternCardProps) {
  return (
    <Link
      href={`/patterns/${pattern.slug}`}
      className={cn(
        'block glass-chip overflow-hidden transition-colors duration-300',
        'hover:border-[var(--gold)] hover:border-opacity-60',
        className
      )}
    >
      <div className="p-5">
        <h3 className="font-display text-xl text-foreground leading-tight mb-1">{pattern.name}</h3>
        <p className="text-sm text-gold-dim mb-4">{pattern.subtitle}</p>
        <ul className="space-y-1.5">
          {pattern.signs.slice(0, 3).map((s, i) => (
            <li key={i} className="text-xs text-text-secondary font-ui">&middot; {s}</li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
