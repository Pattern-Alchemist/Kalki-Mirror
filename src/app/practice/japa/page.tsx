'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';
import { JapaGuide } from '@/components/ai/JapaGuide';

const STORAGE_KEY = 'kalki-japa-state';

interface JapaState {
  count: number;
  target: number;
  mantra: string;
  history: { date: string; count: number; mantra: string }[];
}

const DEFAULT_MANTRAS = [
  'Om Mani Padme Hum',
  'Om Namah Shivaya',
  'Hare Krishna Mahamantra',
  'Om Sri Mahalakshmyai Namah',
  'Om Gam Ganapataye Namah',
];

function loadState(): JapaState {
  if (typeof window === 'undefined') return { count: 0, target: 108, mantra: DEFAULT_MANTRAS[0], history: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { count: 0, target: 108, mantra: DEFAULT_MANTRAS[0], history: [] };
}

function saveState(state: JapaState) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export default function JapaPage() {
  const reduced = useReducedMotion();
  const [state, setState] = useState<JapaState>(loadState);
  const [customMantra, setCustomMantra] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const increment = useCallback(() => {
    setState(prev => ({
      ...prev,
      count: prev.count + 1,
    }));
    setPulse(true);
    setTimeout(() => setPulse(false), 150);
  }, []);

  const reset = useCallback(() => {
    if (state.count > 0) {
      setState(prev => ({
        ...prev,
        count: 0,
        history: [...prev.history.slice(-19), { date: new Date().toISOString(), count: prev.count, mantra: prev.mantra }],
      }));
    }
  }, [state.count]);

  const completeMala = useCallback(() => {
    setState(prev => ({
      ...prev,
      count: 0,
      history: [...prev.history.slice(-19), { date: new Date().toISOString(), count: prev.count, mantra: prev.mantra }],
    }));
  }, []);

  const progress = state.count > 0 ? (state.count / state.target) * 100 : 0;
  const isComplete = state.count >= state.target;

  return (
    <div className="bg-deep-black min-h-screen">
      {/* Hero bar */}
      <header className="border-b border-gold/5">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-32 pb-12">
          <motion.div initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible}>
            <Link href="/practice" className="inline-flex items-center gap-2 text-gold-dim hover:text-gold text-xs font-ui tracking-[0.12em] uppercase mb-8 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back to Sadhana
            </Link>
            <p className="section-label mb-4">Mantra Practice</p>
            <h1 className="font-display text-4xl md:text-6xl text-foreground leading-[0.95] tracking-[0.06em] engraved-heading font-light">
              Japa Mala
            </h1>
            <p className="text-text-secondary text-lg mt-4 editorial-spacing">
              Count your mantra repetitions. The mala persists in your browser.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16 md:py-24">
        {/* Mantra selector */}
        <motion.section className="mb-16" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="text-caption mb-5">Select Mantra</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {DEFAULT_MANTRAS.map((m) => (
              <button
                key={m}
                onClick={() => setState(prev => ({ ...prev, mantra: m }))}
                className={`px-4 py-2 text-[0.65rem] font-ui tracking-[0.12em] uppercase rounded-sm transition-all duration-300 ${
                  state.mantra === m
                    ? 'bg-gold text-deep-black'
                    : 'bg-surface text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                }`}
              >
                {m}
              </button>
            ))}
            <button
              onClick={() => setShowCustom(!showCustom)}
              className={`px-4 py-2 text-[0.65rem] font-ui tracking-[0.12em] uppercase rounded-sm transition-all duration-300 ${
                showCustom
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'bg-surface text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
              }`}
            >
              Custom
            </button>
          </div>
          {showCustom && (
            <div className="flex gap-3 mt-3">
              <input
                type="text"
                value={customMantra}
                onChange={(e) => setCustomMantra(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && customMantra.trim()) { setState(prev => ({ ...prev, mantra: customMantra.trim() })); setShowCustom(false); } }}
                placeholder="Enter your mantra..."
                className="flex-1 bg-surface border border-gold/10 rounded-sm px-4 py-2.5 text-sm text-foreground font-body placeholder:text-text-muted/50 focus:outline-none focus:border-gold/30 transition-colors"
              />
              <button
                onClick={() => { if (customMantra.trim()) { setState(prev => ({ ...prev, mantra: customMantra.trim() })); setShowCustom(false); } }}
                className="px-4 py-2.5 bg-gold text-deep-black text-xs font-ui tracking-wider uppercase rounded-sm hover:bg-gold-bright transition-colors"
              >
                Set
              </button>
            </div>
          )}
        </motion.section>

        {/* Target selector */}
        <motion.section className="mb-16" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="text-caption mb-5">Mala Length</p>
          <div className="flex gap-2">
            {[54, 108, 216, 1008].map((t) => (
              <button
                key={t}
                onClick={() => setState(prev => ({ ...prev, target: t }))}
                className={`px-5 py-2.5 text-[0.65rem] font-ui tracking-[0.12em] uppercase rounded-sm transition-all duration-300 ${
                  state.target === t
                    ? 'bg-gold text-deep-black'
                    : 'bg-surface text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.section>

        {/* AI Japa Guide */}
        <motion.section className="mb-16" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <JapaGuide mantra={state.mantra} count={state.target} />
        </motion.section>

        {/* Counter */}
        <motion.section
          className="text-center mb-16"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          {/* Current mantra display */}
          <p className="font-display text-xl md:text-2xl text-gold-dim mb-10 tracking-[0.04em] italic">
            &ldquo;{state.mantra}&rdquo;
          </p>

          {/* Progress ring */}
          <div className="relative inline-flex items-center justify-center mb-10">
            <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
              <circle
                cx="120" cy="120" r="108"
                fill="none"
                stroke="rgba(197, 160, 89, 0.06)"
                strokeWidth="1"
              />
              <circle
                cx="120" cy="120" r="108"
                fill="none"
                stroke={isComplete ? '#C5A059' : 'rgba(197, 160, 89, 0.3)'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 108}`}
                strokeDashoffset={`${2 * Math.PI * 108 * (1 - progress / 100)}`}
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <button
              onClick={increment}
              className={`absolute inset-0 flex items-center justify-center rounded-full transition-transform duration-150 ${pulse ? 'scale-95' : 'scale-100'}`}
            >
              <span className={`font-display text-7xl md:text-8xl tabular-nums transition-colors duration-300 ${
                isComplete ? 'text-gold text-glow' : 'text-foreground'
              }`}>
                {state.count}
              </span>
            </button>
          </div>

          <p className="text-caption mb-8">of {state.target} repetitions</p>

          {/* Tap / click button */}
          <button
            onClick={increment}
            className={`relative w-32 h-32 rounded-full border transition-all duration-300 mx-auto block mb-10 ${
              isComplete
                ? 'border-gold bg-gold/10 shadow-[0_0_60px_rgba(197,160,89,0.2)]'
                : 'border-gold/20 bg-surface hover:border-gold/40 hover:shadow-[0_0_40px_rgba(197,160,89,0.08)]'
            } ${pulse ? 'scale-95' : 'scale-100'}`}
          >
            <span className="font-display text-lg text-gold-dim">Tap</span>
          </button>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={reset}
              disabled={state.count === 0}
              className="ghost-cta text-[0.65rem] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            {isComplete && (
              <button
                onClick={completeMala}
                className="gold-cta text-[0.65rem]"
              >
                Complete Mala
              </button>
            )}
          </div>
        </motion.section>

        {/* History */}
        {state.history.length > 0 && (
          <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
            <div className="divider-subtle mb-16" />
            <p className="text-caption mb-6">Session History</p>
            <div className="space-y-3">
              {state.history.slice().reverse().map((entry, i) => (
                <div key={i} className="glass-chip p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground font-display">{entry.count} repetitions</p>
                    <p className="text-xs text-text-muted mt-1">{entry.mantra}</p>
                  </div>
                  <p className="text-xs text-text-muted font-mono">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}