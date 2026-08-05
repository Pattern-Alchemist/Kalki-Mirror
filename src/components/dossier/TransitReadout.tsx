'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';

interface Friction {
  type: string;
  planet1: string;
  planet2: string;
  orb: number;
  severity: string;
  psychologicalFriction: string;
}

interface Position {
  planet: string;
  sanskrit: string;
  longitude: number;
  nakshatra: string;
  retrograde: boolean;
}

interface TransitReadoutProps {
  frictions: Friction[];
  positions?: Position[];
}

const SEVERITY_MAP: Record<string, string> = {
  acute: 'I',
  moderate: 'II',
  subtle: 'III',
};

/**
 * Transit Geometry Readout (Zone A sub-component).
 *
 * Monospace readout of active planetary frictions.
 * Styled like a classified telemetry printout.
 */
export function TransitReadout({ frictions, positions }: TransitReadoutProps) {
  const reduced = useReducedMotion();

  if (frictions.length === 0 && !positions?.length) return null;

  const activeFrictions = frictions.filter(f => f.severity !== 'none');

  return (
    <motion.div
      className="mt-8"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      animate={fadeInUp.visible}
      transition={{ delay: 0.25 }}
    >
      <p className="text-caption mb-4" style={{ color: 'var(--gold-dim)' }}>
        ACTIVE TRANSIT GEOMETRY
      </p>

      <div className="space-y-4">
        {activeFrictions.length > 0 ? (
          activeFrictions.map((f, i) => {
            const roman = SEVERITY_MAP[f.severity] || f.severity;
            return (
              <div
                key={`${f.planet1}-${f.planet2}-${i}`}
                className="font-mono text-sm flex flex-col gap-1 px-4 py-3 border"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: 'rgba(26, 36, 54, 0.3)',
                }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span style={{ color: 'var(--ivory)' }}>{f.planet1.toUpperCase()}</span>
                  <span style={{ color: 'var(--text-muted)' }}>//</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{f.planet2}</span>
                  {f.orb !== undefined && (
                    <>
                      <span style={{ color: 'var(--text-muted)' }}>//</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{f.orb.toFixed(1)}° orb</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[0.65rem] tracking-wider uppercase"
                    style={{ color: f.severity === 'acute' ? 'var(--crimson)' : 'var(--gold-dim)' }}
                  >
                    SEVERITY: {roman}
                  </span>
                </div>
                {f.psychologicalFriction && (
                  <p className="text-text-secondary text-xs mt-1" style={{ lineHeight: 1.7 }}>
                    {f.psychologicalFriction}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div
            className="font-mono text-xs px-4 py-3 border"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            NO ACUTE FRICTION DETECTED — TRANSIT FIELD QUIESCENT
          </div>
        )}
      </div>

      {/* RAG integrity badge */}
      <div className="mt-4 flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--gold)', opacity: 0.4 }}
        />
        <p className="text-caption">
          {positions?.length || 0} bodies computed &middot; {activeFrictions.length} active friction{activeFrictions.length !== 1 ? 's' : ''}
        </p>
      </div>
    </motion.div>
  );
}
