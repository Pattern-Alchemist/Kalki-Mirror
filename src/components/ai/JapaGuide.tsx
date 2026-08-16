'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { fadeInUp } from '@/lib/motion/tokens';
import { AIIdleMessage } from '@/components/ui/AIIdleMessage';

/* ── Types ── */
interface JapaGuideResult {
  guide: string;
  deity: string;
  focus: string;
  intention: string;
  postSessionReflection: string;
}

type GuideState = 'collapsed' | 'loading' | 'expanded' | 'error' | 'unconfigured';

interface JapaGuideProps {
  mantra: string;
  count: number;
}

/* ── Component ── */
export function JapaGuide({ mantra, count }: JapaGuideProps) {
  const reduced = useNativeReducedMotion();
  const [state, setState] = useState<GuideState>('collapsed');
  const [data, setData] = useState<JapaGuideResult | null>(null);
  const [error, setError] = useState('');

  const fetchGuide = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const res = await fetch('/api/ai/japa-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mantra, count }),
      });
      if (res.status === 503) { setState('unconfigured'); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Guide generation failed');
      setData(json);
      setState('expanded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The geometry faltered.');
      setState('error');
    }
  }, [mantra, count]);

  const toggle = useCallback(() => {
    if (state === 'collapsed') {
      fetchGuide();
    } else {
      setState('collapsed');
    }
  }, [state, fetchGuide]);

  return (
    <div className="space-y-3">
      {/* Trigger */}
      <button
        onClick={toggle}
        className="ghost-cta text-xs inline-flex items-center gap-2"
        aria-expanded={state === 'expanded'}
      >
        {state === 'collapsed' && 'AI Japa Guide'}
        {state === 'loading' && (
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
            Generating...
          </span>
        )}
        {state === 'expanded' && 'Close Guide'}
        {state === 'error' && 'Retry'}
        {state === 'unconfigured' && 'AI Calibrating'}
      </button>

      <AnimatePresence>
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
              {/* Guide text */}
              <div>
                <p className="section-label mb-2">Session Guide</p>
                <p className="text-editorial text-text-secondary leading-relaxed">
                  {data.guide}
                </p>
              </div>

              <div className="divider-subtle" />

              {/* Metadata grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-caption">Deity / Principle</p>
                  <p className="text-sm text-foreground">{data.deity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-caption">Focus Point</p>
                  <p className="text-sm text-foreground">{data.focus}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-caption">Intention</p>
                  <p className="text-sm text-foreground">{data.intention}</p>
                </div>
              </div>

              <div className="divider-subtle" />

              {/* Post-session reflection */}
              <div className="space-y-2">
                <p className="text-caption">Post-Session Reflection</p>
                <blockquote className="border-l-2 border-copper/40 pl-4 py-2">
                  <p className="text-sm text-foreground italic leading-relaxed">
                    {data.postSessionReflection}
                  </p>
                </blockquote>
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
