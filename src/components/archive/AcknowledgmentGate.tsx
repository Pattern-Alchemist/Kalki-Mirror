'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';

interface AcknowledgmentGateProps {
  title: string;
  cautionLevel: string;
  children: React.ReactNode;
}

export function AcknowledgmentGate({ title, cautionLevel, children }: AcknowledgmentGateProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const reduced = useReducedMotion();

  const handleAcknowledge = useCallback(() => {
    setAcknowledged(true);
  }, []);

  if (acknowledged) {
    return <>{children}</>;
  }

  const isSealed = cautionLevel === 'SEALED' || cautionLevel === 'Restricted';

  return (
    <AnimatePresence>
      {!acknowledged && (
        <motion.div
          className="relative p-10 md:p-14 glass-panel text-center"
          style={{ borderColor: 'rgba(138, 37, 44, 0.2)' }}
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          exit={{ opacity: 0, duration: 0.4 }}
        >
          {/* Vault seal icon */}
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto rounded-full border border-copper/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-copper">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="1.5" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="1.5" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
            </div>
          </div>

          <h3 className="font-display text-2xl md:text-3xl text-foreground mb-4 font-light tracking-wide">
            {isSealed ? 'The Vault' : 'Acknowledgment Required'}
          </h3>

          <p className="text-editorial max-w-xl mx-auto mb-4">
            {isSealed
              ? `${title} is sealed as heritage scholarship. This material documents destructive or preta-siddhi rites preserved for academic and historical study. KALKI does not endorse, enable, or operationalize these rites.`
              : `This document carries a ${cautionLevel} caution rating. The material below is presented as heritage documentation — scholarly attestation of a living tradition. It is not instructional.`}
          </p>

          <p className="text-sm text-text-muted mb-8 max-w-lg mx-auto">
            Not instructional. Does not endorse practice without transmission.
            {isSealed && ' YANTRA is hard-constrained to never prescribe sealed material as micro-sādhana.'}
          </p>

          <button
            onClick={handleAcknowledge}
            className={isSealed
              ? 'ghost-cta'
              : 'gold-cta'}
            style={isSealed ? { borderColor: 'rgba(138, 37, 44, 0.3)', color: 'var(--crimson)' } : undefined}
          >
            {isSealed ? 'I Understand — Enter the Archive' : 'I Understand — Proceed'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
