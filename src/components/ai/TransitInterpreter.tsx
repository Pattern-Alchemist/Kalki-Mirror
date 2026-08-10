'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';
import { AIBlockSkeleton } from '@/components/ui/Skeleton';
import { AIIdleMessage } from '@/components/ui/AIIdleMessage';

/* ── Types ── */
interface TransitPosition {
  planet: string;
  sign: string;
  degree: number;
}

interface TransitResult {
  interpretation: string;
  recommendedPractice: string;
  energyNote: string;
}

type TransitState = 'collapsed' | 'loading' | 'expanded' | 'error' | 'unconfigured';

interface TransitInterpreterProps {
  positions: TransitPosition[];
}

/* ── Component ── */
export function TransitInterpreter({ positions }: TransitInterpreterProps) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<TransitState>('collapsed');
  const [data, setData] = useState<TransitResult | null>(null);
  const [error, setError] = useState('');

  const interpret = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const res = await fetch('/api/ai/transit-interpretation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions }),
      });
      if (res.status === 503) { setState('unconfigured'); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Interpretation failed');
      setData(json);
      setState('expanded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The geometry faltered.');
      setState('error');
    }
  }, [positions]);

  const toggle = useCallback(() => {
    if (state === 'collapsed') {
      interpret();
    } else {
      setState('collapsed');
    }
  }, [state, interpret]);

  return (
    <div className="space-y-3">
      {/* Trigger */}
      <button
        onClick={toggle}
        className="ghost-cta text-xs inline-flex items-center gap-2"
        aria-expanded={state === 'expanded'}
      >
        {state === 'collapsed' && 'AI Transit Interpretation'}
        {state === 'loading' && (
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
            Reading the sky...
          </span>
        )}
        {state === 'expanded' && 'Close Interpretation'}
        {state === 'error' && 'Retry'}
        {state === 'unconfigured' && 'AI Calibrating'}
      </button>

      <AnimatePresence>
        {state === 'loading' && (
          <motion.div
            key="skeleton"
            initial={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-10 h-10 relative shrink-0">
                <img src="/kalki-yantra.svg" alt="" className="w-full h-full" style={!reduced ? { animation: 'yantraDraw 2.4s ease-out forwards, yantraSpin 8s linear 2.4s infinite', opacity: 0.35 } : { opacity: 0.35 }} aria-hidden="true" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gold/50 rounded-full" style={!reduced ? { animation: 'binduPulse 1.2s ease-in-out 2.4s infinite', boxShadow: '0 0 8px rgba(212,175,55,0.3)' } : undefined} aria-hidden="true" />
              </div>
              <p className="text-xs text-text-muted font-mono tracking-[0.1em]">Reading the transit geometry…</p>
            </div>
            <AIBlockSkeleton lines={4} />
          </motion.div>
        )}

        {state === 'expanded' && data && (
          <motion.div
            key="expanded"
            initial={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-6 space-y-5">
              {/* Interpretation */}
              <div>
                <p className="section-label mb-2">Transit Reading</p>
                <p className="text-editorial text-text-secondary leading-relaxed">
                  {data.interpretation}
                </p>
              </div>

              <div className="divider-subtle" />

              {/* Recommended Practice */}
              <div className="space-y-1">
                <p className="text-caption">Recommended Practice</p>
                <p className="text-sm text-foreground leading-relaxed">{data.recommendedPractice}</p>
              </div>

              {/* Energy Note */}
              <div className="border-l-2 border-gold/20 pl-4 py-2 bg-gold/[0.03]">
                <p className="text-caption mb-1">Energy Note</p>
                <p className="text-sm text-gold-dim leading-relaxed italic">{data.energyNote}</p>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'error' && (
          <motion.p
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            className="text-xs text-crimson"
          >
            {error}
          </motion.p>
        )}

        {state === 'unconfigured' && <AIIdleMessage />}
      </AnimatePresence>
    </div>
  );
}
