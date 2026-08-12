'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { PageHero } from '@/components/layout/PageHero';
import { BackButton } from '@/components/nav/BackButton';
import { ScrollParallax } from '@/components/ui/ScrollParallax';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
const JapaGuide = dynamic(() => import('@/components/ai/JapaGuide').then(m => ({ default: m.JapaGuide })), { ssr: false, loading: () => <div className="h-32" /> });

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
  const counterRef = useRef<HTMLSpanElement>(null);
  const counterInView = useInView(counterRef, { once: false });

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
      <PageHero
        image='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-ritual-chamber-alt'
        title='Japa Mala'
        subtitle='Count your mantra repetitions. The mala persists in your browser — a digital mālā for disciplined sādhana.'
        sectionLabel='Mantra Practice'
      />

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16 md:py-24">
        <BackButton href="/practice" label="Back to Practice" className="mb-10" />
        {/* Mantra selector */}
        <motion.section className="mb-16"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          whileInView={staggerContainer.visible}
          viewport={{ once: true }}
        >
          <p className="text-caption mb-5">Select Mantra</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {DEFAULT_MANTRAS.map((m) => (
              <motion.button
                key={m}
                onClick={() => setState(prev => ({ ...prev, mantra: m }))}
                className={`px-4 py-2 text-[0.65rem] font-ui tracking-[0.12em] uppercase rounded-sm transition-all duration-300 ${
                  state.mantra === m
                    ? 'bg-gold text-deep-black'
                    : 'bg-surface text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                }`}
                variants={staggerItem}
              >
                {m}
              </motion.button>
            ))}
            <motion.button
              onClick={() => setShowCustom(!showCustom)}
              className={`px-4 py-2 text-[0.65rem] font-ui tracking-[0.12em] uppercase rounded-sm transition-all duration-300 ${
                showCustom
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'bg-surface text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
              }`}
              variants={staggerItem}
            >
              Custom
            </motion.button>
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
        <motion.section className="mb-16"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <p className="text-caption mb-5">Mala Length</p>
          <div className="flex flex-wrap gap-2">
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

        {/* ── Cinematic Divider ── */}
        <ScrollParallax speed={-0.06}>
          <div className="relative h-[20vh] overflow-hidden -mx-6 lg:-mx-10 mb-16">
            <CinematicImage
              src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-dark-temple-interior'
              alt="Meditation chamber"
              kenBurns="slow"
              scrim="full"
              vignette
            />
          </div>
        </ScrollParallax>

        {/* ── Second Parallax Interlude ── */}
        <ScrollParallax speed={0.04}>
          <div className="relative h-[15vh] overflow-hidden -mx-6 lg:-mx-10 mb-16">
            <CinematicImage
              src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/meditation-bowl'
              alt="Meditation bowl"
              kenBurns="slow"
              scrim="full"
              vignette
            />
          </div>
        </ScrollParallax>

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
          <div className="relative inline-flex items-center justify-center mb-10 w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
            <svg width="100%" height="100%" viewBox="0 0 240 240" className="transform -rotate-90">
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
              aria-label="Increment japa count"
            >
              <span
                ref={counterRef}
                className={`font-display text-6xl md:text-7xl lg:text-8xl tabular-nums transition-colors duration-300 ${
                  isComplete ? 'text-gold text-glow' : 'text-foreground'
                }`}
              >
                {counterInView ? <AnimatedCounter target={state.count} /> : state.count}
              </span>
            </button>
          </div>

          <p className="text-caption mb-8">
            of <AnimatedCounter target={state.target} /> repetitions
          </p>

          {/* Completion state — golden pulse feedback */}
          {isComplete && (
            <motion.p
              className="text-gold text-sm tracking-[0.2em] uppercase font-mono mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              Mala Complete
            </motion.p>
          )}

          {/* Tap / click button */}
          <button
            onClick={increment}
            className={`relative w-32 h-32 rounded-full border transition-all duration-300 mx-auto block mb-10 ${
              isComplete
                ? 'border-gold bg-gold/10 shadow-[0_0_60px_rgba(197,160,89,0.2)]'
                : 'border-gold/20 bg-surface hover:border-gold/40 hover:shadow-[0_0_40px_rgba(197,160,89,0.08)]'
            } ${pulse ? 'scale-95' : 'scale-100'}`}
            aria-label="Tap to count"
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

        {/* ── Lifetime Stats ── */}
        {state.history.length > 0 && (
          <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
            <div className="divider-gold mb-12" />
            <p className="section-label mb-6">Lifetime Accumulation</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              <div className="glass-chip p-5 text-center">
                <p className="font-display text-3xl text-gold mb-1">
                  <AnimatedCounter target={state.history.reduce((sum, h) => sum + h.count, 0)} />
                </p>
                <p className="text-caption">Total Beads</p>
              </div>
              <div className="glass-chip p-5 text-center">
                <p className="font-display text-3xl text-foreground mb-1">
                  <AnimatedCounter target={state.history.length} />
                </p>
                <p className="text-caption">Sessions</p>
              </div>
              <div className="glass-chip p-5 text-center hidden md:block">
                <p className="font-display text-3xl text-copper mb-1">
                  <AnimatedCounter target={state.history.length > 0 ? Math.round(state.history.reduce((sum, h) => sum + h.count, 0) / state.history.length) : 0} />
                </p>
                <p className="text-caption">Avg / Session</p>
              </div>
            </div>
          </motion.section>
        )}

        {/* History */}
        {state.history.length > 0 && (
          <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
            <div className="divider-subtle mb-8" />
            <p className="text-caption mb-6">Session History</p>
            <div className="space-y-3">
              {state.history.slice().reverse().map((entry, i) => (
                <div key={i} className="glass-chip p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground font-display"><AnimatedCounter target={entry.count} /> repetitions</p>
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

      {/* ── Page Footer ── */}
      <footer className="relative pb-20 md:pb-28 mt-16">
        <div className="atmospheric-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-gold/40 rounded-full" style={{ animation: 'binduPulse 2s ease-in-out infinite' }} />
          </div>
          <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper">
            JAPA MĀLĀ — MANTRA COUNTER
          </p>
        </div>
      </footer>
    </div>
  );
}
