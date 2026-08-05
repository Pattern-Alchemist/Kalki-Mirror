'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';
import { CautionBadge } from '@/components/archive/CautionBadge';
import type { CautionLevel } from '@/lib/data/types';

interface CitationCardProps {
  text: string;
  sourceSlug: string;
  caution: CautionLevel;
}

/**
 * Citation Card — museum exhibit placard.
 *
 * Renders a retrieved folio excerpt as a scholarly citation
 * with deep link into the archive and caution badge.
 * The link respects tier-gating: clicking a HIGH/SEALED folio
 * will trigger the AcknowledgmentGate on the archive page.
 */
export function CitationCard({ text, sourceSlug, caution }: CitationCardProps) {
  const reduced = useReducedMotion();

  // Truncate very long excerpts for the card display
  const displayText = text.length > 280 ? text.slice(0, 280) + '...' : text;

  return (
    <motion.div
      className="relative"
      initial={reduced ? { opacity: 0.8 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true }}
    >
      {/* Placard body */}
      <div
        className="relative p-8 md:p-10 border"
        style={{
          borderColor: 'var(--border-gold)',
          background: 'rgba(197, 160, 89, 0.02)',
        }}
      >
        {/* Top-left corner accent */}
        <div
          className="absolute top-0 left-0 w-4 h-4 border-t border-l"
          style={{ borderColor: 'var(--gold)' }}
        />
        {/* Bottom-right corner accent */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 border-b border-r"
          style={{ borderColor: 'var(--gold)' }}
        />

        {/* Label */}
        <p className="text-caption mb-5" style={{ color: 'var(--gold-dim)' }}>
          TEXTUAL WITNESS
        </p>

        {/* Excerpt — Bhasma italicized */}
        <blockquote
          className="font-display italic text-foreground leading-relaxed mb-8 text-base md:text-lg"
          style={{ lineHeight: 1.8 }}
        >
          &ldquo;{displayText}&rdquo;
        </blockquote>

        {/* Source + Caution + Deep Link row */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/archive/${sourceSlug}`}
            className="font-mono text-xs tracking-wider transition-colors duration-300 hover:underline"
            style={{ color: 'var(--gold)' }}
          >
            {sourceSlug.replace(/-/g, ' ')}
          </Link>

          <CautionBadge level={caution} />
        </div>
      </div>
    </motion.div>
  );
}
