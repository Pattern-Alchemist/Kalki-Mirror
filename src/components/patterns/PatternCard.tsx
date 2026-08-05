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
        'glass-chip group flex flex-col',
        className
      )}
    >
      <div className="p-6 md:p-8">
        <h3 className="font-display text-xl md:text-2xl text-foreground leading-tight tracking-tight mb-2 group-hover:text-gold transition-colors duration-500">
          {pattern.name}
        </h3>
        <p className="text-sm text-gold-dim mb-6 italic">{pattern.subtitle}</p>
        <div className="divider-subtle mb-5" />
        <ul className="space-y-2">
          {pattern.signs.slice(0, 3).map((s, i) => (
            <li key={i} className="text-xs text-text-secondary font-ui tracking-wide">
              &middot; {s}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
