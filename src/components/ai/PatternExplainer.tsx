'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { AIBlockSkeleton } from '@/components/ui/Skeleton';

/* ── Types ── */
interface PatternExplanation {
  name: string;
  explanation: string;
  modernAnalogy: string;
  signs: string[];
  practice: string;
}

type ExplainerState = 'collapsed' | 'loading' | 'expanded' | 'error' | 'unconfigured';

interface PatternExplainerProps {
  patternSlug: string;
  context?: string;
}

/* ── Component ── */
export function PatternExplainer({ patternSlug, context }: PatternExplainerProps) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<ExplainerState>('collapsed');
  const [data, setData] = useState<PatternExplanation | null>(null);
  const [error, setError] = useState('');

  const fetchExplanation = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const res = await fetch('/api/ai/pattern-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patternSlug, context: context || undefined }),
      });
      if (res.status === 503) { setState('unconfigured'); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Explanation failed');
      setData(json);
      setState('expanded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The geometry faltered.');
      setState('error');
    }
  }, [patternSlug, context]);

  const toggle = useCallback(() => {
    if (state === 'collapsed') {
      fetchExplanation();
    } else {
      setState('collapsed');
    }
  }, [state, fetchExplanation]);

  return (
    <div className="space-y-3">
      {/* Trigger button */}
      <button
        onClick={toggle}
        className="ghost-cta text-xs inline-flex items-center gap-2"
        aria-expanded={state === 'expanded'}
      >
        {state === 'collapsed' && 'AI Pattern Reading'}
        {state === 'loading' && (
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
            Reading pattern...
          </span>
        )}
        {state === 'expanded' && 'Close Reading'}
        {state === 'error' && 'Retry Reading'}
        {state === 'unconfigured' && 'AI Calibrating'}
      </button>

      {/* Loading skeleton */}
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
              <div className="w-8 h-8 relative shrink-0">
                <img src="/kalki-yantra.svg" alt="" className="w-full h-full opacity-25" style={!reduced ? { animation: 'yantraDraw 2.4s ease-out forwards' } : undefined} aria-hidden="true" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gold/50 rounded-full" style={!reduced ? { animation: 'binduPulse 1.2s ease-in-out infinite' } : undefined} aria-hidden="true" />
              </div>
              <p className="text-xs text-text-muted font-mono tracking-[0.1em]">Mapping pattern against the Archive...</p>
            </div>
            <AIBlockSkeleton lines={5} />
          </motion.div>
        )}

        {/* Expanded content */}
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
              {/* Name */}
              <div>
                <p className="section-label mb-2">Pattern</p>
                <h4 className="font-display text-xl text-foreground engraved-heading">
                  {data.name}
                </h4>
              </div>

              <div className="divider-subtle" />

              {/* Explanation */}
              <div className="text-editorial text-text-secondary whitespace-pre-line leading-relaxed">
                {data.explanation}
              </div>

              {/* Modern Analogy */}
              {data.modernAnalogy && (
                <div className="border-l-2 border-gold/30 pl-4 py-2 bg-gold/[0.03]">
                  <p className="text-caption mb-2">Modern Analogy</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {data.modernAnalogy}
                  </p>
                </div>
              )}

              {/* Signs as chips */}
              {data.signs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-caption">Signs of This Pattern</p>
                  <motion.div
                    className="flex flex-wrap gap-2"
                    variants={reduced ? {} : staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {data.signs.map((sign, i) => (
                      <motion.span
                        key={i}
                        variants={reduced ? {} : staggerItem}
                        className="glass-chip px-3 py-1.5 text-xs text-text-secondary"
                      >
                        {sign}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* Practice */}
              {data.practice && (
                <div className="space-y-2">
                  <p className="text-caption">Prescribed Sādhana</p>
                  <blockquote className="border-l-2 border-copper/40 pl-4 py-2">
                    <p className="text-sm text-foreground italic leading-relaxed">
                      {data.practice}
                    </p>
                  </blockquote>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Error state inline */}
        {state === 'error' && (
          <motion.p
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            className="text-xs text-crimson"
          >
            {error}
          </motion.p>
        )}

        {/* Unconfigured state inline */}
        {state === 'unconfigured' && (
          <motion.p
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            className="text-xs text-gold-dim"
          >
            The AI engine is calibrating. The geometry awaits its activation.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
