'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import Link from 'next/link';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { AIIdleMessage } from '@/components/ui/AIIdleMessage';

/* ── Types ── */
interface ScreenResult {
  category: string;
  urgency: 'low' | 'medium' | 'high';
  focusAreas: string[];
  suggestedArchetypes: string[];
  summary: string;
}

type ScreenerState = 'idle' | 'loading' | 'result' | 'error' | 'unconfigured';

interface ConsultationScreenerProps {
  name: string;
  message: string;
  onResult?: (result: ScreenResult) => void;
}

const URGENCY_STYLES: Record<string, string> = {
  low: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
  medium: 'border-amber-500/30 text-amber-400 bg-amber-500/5',
  high: 'border-crimson/30 text-crimson bg-crimson/5',
};

/* ── Component ── */
export function ConsultationScreener({ name, message, onResult }: ConsultationScreenerProps) {
  const reduced = useNativeReducedMotion();
  const [state, setState] = useState<ScreenerState>('idle');
  const [result, setResult] = useState<ScreenResult | null>(null);
  const [error, setError] = useState('');

  const screen = useCallback(async () => {
    if (!name.trim() || !message.trim()) return;
    setState('loading');
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/ai/consultation-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });
      if (res.status === 503) { setState('unconfigured'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Screening failed');
      setResult(data);
      setState('result');
      onResult?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The geometry faltered.');
      setState('error');
    }
  }, [name, message, onResult]);

  const categoryLabel = result?.category
    ? result.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  return (
    <div className="space-y-4">
      {/* Trigger */}
      <button
        onClick={screen}
        disabled={state === 'loading' || !name.trim() || !message.trim()}
        className="gold-cta text-xs inline-flex items-center gap-2"
      >
        {state === 'loading' ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 border border-deep-black/40 border-t-deep-black rounded-full animate-spin" />
            Screening...
          </span>
        ) : (
          'AI Pre-Screen'
        )}
      </button>

      {/* Results */}
      <AnimatePresence>
        {state === 'result' && result && (
          <motion.div
            key="result"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            exit={reduced ? { opacity: 0 } : fadeInUp.exit}
            className="glass-panel p-6 space-y-5"
          >
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category badge */}
              <span className="glass-chip px-3 py-1.5 text-xs text-text-secondary">
                {categoryLabel}
              </span>

              {/* Urgency badge */}
              <span className={`px-3 py-1.5 text-xs font-ui tracking-wider uppercase rounded-sm border ${URGENCY_STYLES[result.urgency] || URGENCY_STYLES.medium}`}>
                {result.urgency} urgency
              </span>
            </div>

            <div className="divider-subtle" />

            {/* Summary */}
            <p className="text-sm text-text-secondary leading-relaxed">
              {result.summary}
            </p>

            {/* Focus Areas as chips */}
            {result.focusAreas.length > 0 && (
              <div className="space-y-2">
                <p className="text-caption">Focus Areas</p>
                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={reduced ? {} : staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {result.focusAreas.map((area, i) => (
                    <motion.span
                      key={i}
                      variants={reduced ? {} : staggerItem}
                      className="glass-chip px-3 py-1.5 text-xs text-text-secondary"
                    >
                      {area}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Suggested Archetypes as links */}
            {result.suggestedArchetypes.length > 0 && (
              <div className="space-y-2">
                <p className="text-caption">Suggested Archetypes</p>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedArchetypes.map((archId) => (
                    <Link
                      key={archId}
                      href={`/archetypes#${archId}`}
                      className="glass-chip px-3 py-1.5 text-xs text-gold hover:text-gold-bright transition-colors"
                    >
                      {archId}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {state === 'error' && (
          <motion.p
            key="error"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            className="text-xs text-crimson"
          >
            {error}
          </motion.p>
        )}

        {state === 'unconfigured' && <AIIdleMessage key="unconfigured" />}
      </AnimatePresence>
    </div>
  );
}
