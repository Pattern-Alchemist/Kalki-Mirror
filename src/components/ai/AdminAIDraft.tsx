'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';

/* ── Types ── */
type DraftType = 'practice' | 'archetype' | 'pattern' | 'research' | 'codex';

interface DraftResult {
  draft: string;
  suggestedCaution: string;
  suggestedTier: string;
  relatedSiddhis: string[];
}

type DraftState = 'idle' | 'loading' | 'result' | 'error' | 'unconfigured';

interface AdminAIDraftProps {
  type: DraftType;
  title: string;
  context?: string;
  onDraft?: (draft: string, caution: string, tier: string, siddhis: string[]) => void;
}

const TYPE_LABELS: Record<DraftType, string> = {
  practice: 'Practice',
  archetype: 'Archetype',
  pattern: 'Pattern',
  research: 'Research',
  codex: 'Codex',
};

const CAUTION_COLORS: Record<string, string> = {
  OPEN: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
  MODERATE: 'border-amber-500/30 text-amber-400 bg-amber-500/5',
  HIGH: 'border-crimson/30 text-crimson bg-crimson/5',
  SEALED: 'border-crimson/50 text-crimson bg-crimson/10',
};

const TIER_LABELS: Record<string, string> = {
  prithvi: 'Prithvi',
  jal: 'Jal',
  agni: 'Agni',
  akash: 'Akash',
};

/* ── Component ── */
export function AdminAIDraft({ type, title, context, onDraft }: AdminAIDraftProps) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<DraftState>('idle');
  const [result, setResult] = useState<DraftResult | null>(null);
  const [error, setError] = useState('');
  const [contextInput, setContextInput] = useState(context || '');

  const generate = useCallback(async () => {
    if (!title.trim()) return;
    setState('loading');
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          context: contextInput.trim() || undefined,
        }),
      });
      if (res.status === 503) { setState('unconfigured'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Draft generation failed');
      setResult(data);
      setState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The geometry faltered.');
      setState('error');
    }
  }, [type, title, contextInput]);

  const apply = useCallback(() => {
    if (!result) return;
    onDraft?.(
      result.draft,
      result.suggestedCaution,
      result.suggestedTier,
      result.relatedSiddhis,
    );
  }, [result, onDraft]);

  return (
    <div className="glass-panel p-6 sm:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label mb-2">AI Draft Generator</p>
          <h4 className="font-display text-lg text-foreground engraved-heading">
            {title}
          </h4>
          <p className="text-xs text-text-muted mt-1">
            {TYPE_LABELS[type]} · Markdown draft with metadata suggestions
          </p>
        </div>
        <span className="glass-chip px-2 py-1 text-[10px] font-mono text-gold-dim shrink-0">
          {type}
        </span>
      </div>

      {/* Optional context */}
      <div className="space-y-2">
        <label htmlFor="admin-draft-context" className="text-caption block">
          Additional Context
        </label>
        <textarea
          id="admin-draft-context"
          value={contextInput}
          onChange={(e) => setContextInput(e.target.value)}
          placeholder="Optional context for the AI..."
          rows={3}
          className="w-full bg-surface/50 border border-border-subtle rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-text-muted/50 focus:outline-none focus:border-gold/30 font-body resize-none transition-colors duration-500"
        />
      </div>

      {/* Generate */}
      <button
        onClick={generate}
        disabled={state === 'loading'}
        className="gold-cta w-full text-xs"
      >
        {state === 'loading' ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 border border-deep-black/40 border-t-deep-black rounded-full animate-spin" />
            Generating Draft...
          </span>
        ) : (
          'Generate Draft'
        )}
      </button>

      {/* Results */}
      <AnimatePresence>
        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            exit={reduced ? { opacity: 0 } : fadeInUp.exit}
            className="flex items-center justify-center py-8"
          >
            <div className="w-5 h-5 border border-gold/30 border-t-gold rounded-full animate-spin" />
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
            <div className="divider-gold" />

            {/* Metadata badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1.5 text-xs font-ui tracking-wider uppercase rounded-sm border ${CAUTION_COLORS[result.suggestedCaution] || CAUTION_COLORS.MODERATE}`}>
                {result.suggestedCaution}
              </span>
              <span className="glass-chip px-3 py-1.5 text-xs text-gold">
                {TIER_LABELS[result.suggestedTier] || result.suggestedTier}
              </span>
            </div>

            {/* Related Siddhis as chips */}
            {result.relatedSiddhis.length > 0 && (
              <div className="space-y-2">
                <p className="text-caption">Related Siddhis</p>
                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={reduced ? {} : staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {result.relatedSiddhis.map((siddhi) => (
                    <motion.span
                      key={siddhi}
                      variants={reduced ? {} : staggerItem}
                      className="glass-chip px-3 py-1.5 text-xs text-text-secondary font-mono"
                    >
                      {siddhi}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Draft content */}
            <div className="space-y-2">
              <p className="text-caption">Generated Draft</p>
              <div className="bg-deep-black/50 border border-border-subtle rounded-sm p-5 max-h-[26rem] overflow-y-auto">
                <pre className="text-sm text-text-secondary whitespace-pre-wrap font-body leading-relaxed">
                  {result.draft}
                </pre>
              </div>
            </div>

            {/* Apply button */}
            <button
              onClick={apply}
              className="gold-cta w-full text-xs"
            >
              Apply Draft
            </button>
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

        {state === 'unconfigured' && (
          <motion.p
            key="unconfigured"
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