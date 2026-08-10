'use client';

import Link from 'next/link';
import type { Pattern } from '@/lib/data/types';
import { MagneticCard } from '@/components/ui/MagneticCard';

interface PatternCardProps {
  pattern: Pattern;
  className?: string;
}

export function PatternCard({ pattern, className }: PatternCardProps) {
  return (
    <MagneticCard className={className}>
      <Link
        href={`/patterns/${pattern.slug}`}
        className='glass-chip group flex flex-col'
      >
        <div className="p-6 md:p-8">
          <h3 className="font-display text-xl md:text-2xl text-foreground leading-tight tracking-tight mb-2 group-hover:text-gold transition-colors duration-500 font-light">
            {pattern.name}
          </h3>
          {/* Subtitle in JetBrains Mono — pattern intelligence aesthetic */}
          <p className="text-sm text-gold-dim mb-6 font-mono tracking-wider">{pattern.subtitle}</p>
          <div className="divider-subtle mb-5" />
          {/* Warning signs — use Cinnabar for critical patterns */}
          <ul className="space-y-2">
            {pattern.signs.slice(0, 3).map((s, i) => (
              <li key={i} className="text-sm text-text-secondary font-ui tracking-wide leading-relaxed">
                &middot; {s}
              </li>
            ))}
          </ul>
          {/* Bottom metadata tag — monospace terminal style */}
          <div className="mt-5 pt-3 border-t border-gold/5">
            <span className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper">
              YANTRA PATTERN &middot; {pattern.relatedSiddhis.length} SIDDHIS LINKED
            </span>
          </div>
        </div>
      </Link>
    </MagneticCard>
  );
}
