'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { CautionBadge } from '@/components/archive/CautionBadge';
import type { Tier, CautionLevel } from '@/lib/data/types';

// Tier ordering for access comparison
const TIER_ORDER: Record<Tier, number> = {
  prithvi: 0,
  jal: 1,
  agni: 2,
  akash: 3,
};

// Minimum tier required to access each caution level
const CAUTION_MIN_TIER: Record<CautionLevel, Tier> = {
  OPEN: 'prithvi',
  MODERATE: 'jal',
  HIGH: 'agni',
  SEALED: 'akash',
};

interface ArchiveRefsLedgerProps {
  refs: string[];
  refsCaution: Record<string, string>;
  userTier: Tier;
}

/**
 * Archive Refs Ledger — Textual Witnesses footnotes.
 *
 * Monospace list of every folio YANTRA consulted.
 * Tier-gating in action: if the user's tier is below the folio's
 * caution requirement, the link is replaced with a [REDACTED] tag.
 * This drives upgrades by showing users exactly what they're missing.
 */
export function ArchiveRefsLedger({ refs, refsCaution, userTier }: ArchiveRefsLedgerProps) {
  const reduced = useReducedMotion();
  const userTierLevel = TIER_ORDER[userTier];

  if (refs.length === 0) return null;

  return (
    <motion.div
      className="mt-16"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true }}
    >
      {/* Section header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
        <p className="text-caption whitespace-nowrap">TEXTUAL WITNESSES CONSULTED</p>
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
      </div>

      {/* Witness list */}
      <motion.ol
        className="space-y-3"
        initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
        whileInView={staggerContainer.visible}
        viewport={{ once: true }}
      >
        {refs.map((slug, i) => {
          const caution = (refsCaution[slug] || 'OPEN') as CautionLevel;
          const minTier = CAUTION_MIN_TIER[caution];
          const hasAccess = userTierLevel >= TIER_ORDER[minTier];
          const index = String(i + 1).padStart(2, '0');

          return (
            <motion.li
              key={slug}
              className="font-mono text-sm flex flex-wrap items-center gap-3 px-4 py-2.5 border"
              style={{
                borderColor: 'var(--border-subtle)',
                background: hasAccess ? 'transparent' : 'rgba(138, 37, 44, 0.03)',
              }}
              variants={staggerItem}
            >
              {/* Index */}
              <span style={{ color: 'var(--text-muted)' }}>[{index}]</span>

              {hasAccess ? (
                /*
                 * Tier-gated deep link.
                 * If the folio is HIGH/SEALED and the user has access,
                 * the archive page will still show the AcknowledgmentGate.
                 */
                <>
                  <Link
                    href={`/archive/${slug}`}
                    className="transition-colors duration-300 hover:underline"
                    style={{ color: 'var(--gold)' }}
                  >
                    {slug.replace(/-/g, ' ')}
                  </Link>
                  <CautionBadge level={caution} />
                </>
              ) : (
                /* Redacted — user's tier is too low */
                <>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {slug.replace(/-/g, ' ')}
                  </span>
                  <CautionBadge level={caution} />
                  <span
                    className="font-mono text-[0.65rem] tracking-wider uppercase"
                    style={{ color: 'var(--crimson)', opacity: 0.8 }}
                  >
                    -&gt; [REDACTED FOR CURRENT TIER]
                  </span>
                </>
              )}
            </motion.li>
          );
        })}
      </motion.ol>

      {/* Integrity footer */}
      <div className="mt-8 flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--gold)', opacity: 0.4 }}
        />
        <p className="text-caption">
          {refs.length} folio{refs.length !== 1 ? 's' : ''} consulted &middot;{' '}
          {refs.filter(r => {
            const c = (refsCaution[r] || 'OPEN') as CautionLevel;
            return userTierLevel >= TIER_ORDER[CAUTION_MIN_TIER[c]];
          }).length} accessible in your Covenant
        </p>
      </div>
    </motion.div>
  );
}
