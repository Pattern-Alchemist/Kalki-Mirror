'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';

/* ── Types ── */
interface BreathworkPhase {
  name: string;
  durationSec: number;
  instruction: string;
  breathCount?: number;
}

interface BreathworkResult {
  name: string;
  description: string;
  phases: BreathworkPhase[];
  benefits: string[];
  caution: string | null;
}

type GeneratorState = 'idle' | 'loading' | 'result' | 'error' | 'unconfigured';

const BREATHWORK_TYPES = [
  { value: 'calming', label: 'Calming' },
  { value: 'energizing', label: 'Energizing' },
  { value: 'focus', label: 'Focus' },
  { value: 'nadi-shuddhi', label: 'Nāḍī Śuddhi' },
  { value: 'bhramari', label: 'Bhramarī' },
  { value: 'custom', label: 'Custom' },
] as const;

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

/* ── Component ── */
export function AIBreathworkGenerator() {
  const reduced = useReducedMotion();
  const [type, setType] = useState<string>('calming');
  const [duration, setDuration] = useState(10);
  const [state, setState] = useState<GeneratorState>('idle');
  const [result, setResult] = useState<BreathworkResult | null>(null);
  const [error, setError] = useState('');

  const generate = useCallback(async () => {
    setState('loading');
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/ai/breathwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, duration }),
      });
      if (res.status === 503) { setState('unconfigured'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Protocol generation failed');
      setResult(data);
      setState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The geometry faltered.');
      setState('error');
    }
  }, [type, duration]);

  const totalPhaseDuration = result?.phases.reduce((a, p) => a + p.durationSec, 0) || 0;

  return (
    <div className="glass-panel p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div>
        <p className="section-label mb-3">Prāṇāyāma Protocol</p>
        <p className="text-text-muted text-xs">Generate a breathwork sequence tailored to your intention and duration.</p>
      </div>

      {/* Type selector */}
      <div className="space-y-2">
        <p className="text-caption">Intention</p>
        <div className="flex flex-wrap gap-2">
          {BREATHWORK_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`glass-chip px-3 py-1.5 text-xs font-ui tracking-wide uppercase transition-all duration-300 cursor-pointer ${
                type === t.value
                  ? 'border-gold/60 text-gold neon-chip-glow'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-caption">Duration</p>
          <span className="font-mono text-xs text-gold-dim">{duration} min</span>
        </div>
        <input
          type="range"
          min={3}
          max={60}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full h-1 bg-surface rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:border-0
            [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(212,175,55,0.3)]
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-0"
          aria-label="Duration in minutes"
        />
        <div className="flex justify-between text-[10px] text-text-muted font-mono">
          <span>3</span>
          <span>60</span>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={state === 'loading'}
        className="gold-cta w-full text-xs"
      >
        {state === 'loading' ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 border border-deep-black/40 border-t-deep-black rounded-full animate-spin" />
            Generating Protocol...
          </span>
        ) : (
          'Generate Protocol'
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
            className="space-y-5"
          >
            <div className="divider-gold" />

            {/* Name & Description */}
            <div className="space-y-2">
              <h3 className="font-display text-xl text-foreground engraved-heading">{result.name}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{result.description}</p>
            </div>

            {/* Caution */}
            {result.caution && (
              <div className="border border-crimson/30 bg-crimson/5 px-4 py-3 rounded-sm">
                <p className="text-xs text-crimson leading-relaxed">
                  <span className="text-caption text-crimson block mb-1">Caution</span>
                  {result.caution}
                </p>
              </div>
            )}

            {/* Phases timeline */}
            <div className="space-y-3">
              <p className="text-caption">Protocol — {formatDuration(totalPhaseDuration)}</p>
              <motion.div
                className="space-y-0"
                variants={reduced ? {} : staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {result.phases.map((phase, i) => (
                    <motion.div
                      key={i}
                      variants={reduced ? {} : staggerItem}
                      className="flex gap-4"
                    >
                      {/* Timeline bar */}
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-2 h-2 rounded-full bg-gold/40" />
                        {i < result.phases.length - 1 && (
                          <div className="w-px flex-1 bg-gold/10 min-h-[2rem]" />
                        )}
                      </div>
                      {/* Phase content */}
                      <div className="pb-5 flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 mb-1">
                          <h4 className="text-sm text-foreground font-body font-medium">{phase.name}</h4>
                          <span className="font-mono text-[10px] text-gold-dim">{formatDuration(phase.durationSec)}</span>
                          {phase.breathCount && (
                            <span className="font-mono text-[10px] text-text-muted">{phase.breathCount} cycles</span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed">{phase.instruction}</p>
                      </div>
                    </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Benefits */}
            {result.benefits.length > 0 && (
              <div className="space-y-2">
                <p className="text-caption">Benefits</p>
                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={reduced ? {} : staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {result.benefits.map((benefit, i) => (
                    <motion.span
                      key={i}
                      variants={reduced ? {} : staggerItem}
                      className="glass-chip px-3 py-1.5 text-xs text-text-secondary"
                    >
                      {benefit}
                    </motion.span>
                  ))}
                </motion.div>
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
