'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { fadeInUp } from '@/lib/motion/tokens';
import { AIBlockSkeleton } from '@/components/ui/Skeleton';
import { AIIdleMessage } from '@/components/ui/AIIdleMessage';

/* ── Types ── */
interface ExplainResult {
  explanation: string;
  keyTerms: string[];
}

type ExplainerState = 'idle' | 'loading' | 'result' | 'error' | 'unconfigured';

interface CodexExplainerProps {
  initialText?: string;
}

/* ── Component ── */
export function CodexExplainer({ initialText }: CodexExplainerProps) {
  const reduced = useNativeReducedMotion();
  const [content, setContent] = useState(initialText || '');
  const [style, setStyle] = useState<'beginner' | 'technical'>('beginner');
  const [state, setState] = useState<ExplainerState>('idle');
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [error, setError] = useState('');

  const explain = useCallback(async () => {
    if (!content.trim()) return;
    setState('loading');
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, style }),
      });
      if (res.status === 503) { setState('unconfigured'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Explanation failed');
      setResult(data);
      setState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The geometry faltered.');
      setState('error');
    }
  }, [content, style]);

  return (
    <div className="glass-panel p-6 sm:p-8 space-y-5">
      <div>
        <p className="section-label mb-3">Codex Intelligence</p>
        <p className="text-text-muted text-xs">Select or paste text from the Codex for an AI interpretation.</p>
      </div>

      {/* Text input */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste or type a passage from the Codex..."
        rows={4}
        className="w-full bg-surface/50 border border-border-subtle rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-text-muted/50 focus:outline-none focus:border-gold/30 font-body resize-none transition-colors duration-500"
        aria-label="Codex text to explain"
      />

      {/* Controls row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Style toggle */}
        <div className="flex items-center gap-1 bg-surface/50 rounded-sm p-1 border border-border-subtle">
          <button
            onClick={() => setStyle('beginner')}
            className={`px-3 py-1.5 text-xs font-ui tracking-wide uppercase transition-all duration-300 rounded-sm ${
              style === 'beginner'
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Beginner
          </button>
          <button
            onClick={() => setStyle('technical')}
            className={`px-3 py-1.5 text-xs font-ui tracking-wide uppercase transition-all duration-300 rounded-sm ${
              style === 'technical'
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Technical
          </button>
        </div>

        {/* Explain button */}
        <button
          onClick={explain}
          disabled={!content.trim() || state === 'loading'}
          className="gold-cta text-xs sm:ml-auto"
        >
          {state === 'loading' ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 border border-deep-black/40 border-t-deep-black rounded-full animate-spin" />
              Interpreting...
            </span>
          ) : (
            'Explain'
          )}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {state === 'loading' && (
          <motion.div
            key="loading"
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
              <p className="text-xs text-text-muted font-mono tracking-[0.1em]">The Codex is being analyzed…</p>
            </div>
            <AIBlockSkeleton lines={6} />
          </motion.div>
        )}

        {state === 'result' && result && (
          <motion.div
            key="result"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            exit={reduced ? { opacity: 0 } : fadeInUp.exit}
            className="space-y-5"
          >
            <div className="divider-subtle" />

            {/* Explanation */}
            <div className="text-editorial text-text-secondary whitespace-pre-line leading-relaxed">
              {result.explanation}
            </div>

            {/* Key Terms */}
            {result.keyTerms.length > 0 && (
              <div className="space-y-2">
                <p className="text-caption">Key Terms</p>
                <ul className="space-y-1.5">
                  {result.keyTerms.map((term, i) => (
                    <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-gold/50 mt-1.5 text-[6px]">◆</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
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
