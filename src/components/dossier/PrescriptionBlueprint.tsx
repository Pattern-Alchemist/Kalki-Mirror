'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';

interface SadhanaItem {
  slug: string;
  name: string;
  sanskrit: string;
  summary: string;
  primaryMantra: string;
  warnings: string[];
  level: string;
  cautionLevel: string;
}

interface PrescriptionBlueprintProps {
  sadhanas: SadhanaItem[];
}

/**
 * Prescription Blueprint Card (Zone C).
 *
 * Renders the OPEN-only prescribed sādhanas inside a dark
 * Blueprint card with thin copper grid lines.
 * Each sādhana shows name, summary, mantra, warnings,
 * and a source slug metadata tag.
 */
export function PrescriptionBlueprint({ sadhanas }: PrescriptionBlueprintProps) {
  const reduced = useReducedMotion();

  if (sadhanas.length === 0) return null;

  return (
    <motion.div
      className="relative"
      initial={reduced ? { opacity: 0.8 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true }}
    >
      {/* Zone label */}
      <p className="text-caption mb-6" style={{ color: 'var(--gold-dim)' }}>
        PRESCRIBED MICRO-SĀDHANA — OPEN TIER ONLY
      </p>

      <div className="space-y-6">
        {sadhanas.map((s, i) => (
          <div
            key={s.slug}
            className="relative p-8 md:p-10 border overflow-hidden"
            style={{
              background: 'var(--surface)',
              borderColor: 'rgba(89, 74, 66, 0.25)',
            }}
          >
            {/* Copper grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(var(--copper) 1px, transparent 1px), linear-gradient(90deg, var(--copper) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            {/* Content above grid */}
            <div className="relative z-10">
              {/* Sādhana header */}
              <div className="flex flex-wrap items-baseline gap-3 mb-4">
                <h4 className="font-display text-xl text-foreground tracking-wide">
                  {s.name}
                </h4>
                <span
                  className="font-mono text-xs tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {s.sanskrit}
                </span>
              </div>

              {/* Summary */}
              <p className="text-editorial mb-6 max-w-2xl">{s.summary}</p>

              {/* Mantra */}
              {s.primaryMantra && (
                <div className="mb-6">
                  <p
                    className="font-mono text-xs tracking-[0.12em] uppercase mb-2"
                    style={{ color: 'var(--gold-dim)' }}
                  >
                    Primary Mantra
                  </p>
                  <p
                    className="font-display text-lg text-foreground italic tracking-wide"
                    style={{ color: 'var(--ivory)' }}
                  >
                    {s.primaryMantra}
                  </p>
                </div>
              )}

              {/* Warnings */}
              {s.warnings.length > 0 && (
                <div className="mb-6">
                  <p
                    className="font-mono text-xs tracking-[0.12em] uppercase mb-2"
                    style={{ color: 'var(--gold-dim)' }}
                  >
                    Contraindications
                  </p>
                  <ul className="space-y-1.5">
                    {s.warnings.map((w, wi) => (
                      <li
                        key={wi}
                        className="text-sm text-text-secondary flex items-start gap-2"
                      >
                        <span style={{ color: 'var(--gold)', opacity: 0.5 }}>&#x2022;</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Source slug metadata tag */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <Link
                  href={`/archive/${s.slug}`}
                  className="font-mono text-[0.65rem] tracking-[0.12em] uppercase transition-colors duration-300 hover:underline"
                  style={{ color: 'var(--gold-dim)' }}
                >
                  SOURCE: {s.slug.replace(/-/g, ' ')} / {s.cautionLevel}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
