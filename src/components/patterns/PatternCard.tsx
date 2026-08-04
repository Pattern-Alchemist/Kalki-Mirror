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
        'block bg-surface p-5 rounded transition-transform duration-300 hover:-translate-y-1',
        'border border-border-subtle hover:border-[var(--gold)]',
        className
      )}
    >
      <h3 className="font-display text-lg text-gold leading-tight">{pattern.name}</h3>
      <p className="text-text-secondary text-sm mt-1">{pattern.subtitle}</p>
      <ul className="mt-3 space-y-1">
        {pattern.signs.slice(0, 2).map((s, i) => (
          <li key={i} className="text-xs text-text-muted font-ui">• {s}</li>
        ))}
      </ul>
    </Link>
  );
}
