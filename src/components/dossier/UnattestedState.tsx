'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';

/**
 * Unattested State — the honest empty state.
 *
 * When YANTRA generates a synthesis but no direct textual witness
 * was retrieved from the accessible archive, this component
 * proves the oracle refuses to fabricate.
 *
 * This single empty-state builds more trust with the seed audience
 * (academics, systems thinkers) than any marketing copy.
 */
export function UnattestedState() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="relative"
      initial={reduced ? { opacity: 0.8 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true }}
    >
      <div
        className="p-8 md:p-10 border"
        style={{
          borderColor: 'var(--crimson)',
          borderOpacity: 0.35,
          background: 'rgba(138, 37, 44, 0.03)',
        }}
      >
        {/* Cinnabar label */}
        <p
          className="font-mono text-xs tracking-[0.15em] uppercase mb-4"
          style={{ color: 'var(--crimson)' }}
        >
          ORACLE STATEMENT UNATTESTED IN ACCESSIBLE ARCHIVE
        </p>

        {/* Explanation */}
        <p className="text-editorial max-w-xl">
          YANTRA generated this synthesis from pattern-matching, but no direct textual witness was retrieved from your current Covenant tier.
        </p>

        {/* Integrity marker */}
        <div className="mt-6 flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--crimson)', opacity: 0.6 }}
          />
          <p className="text-caption">
            GROUNDING RULE 1 ENFORCED — NO FABRICATION
          </p>
        </div>
      </div>
    </motion.div>
  );
}
