'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';

const PRESETS = [
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '20 min', seconds: 1200 },
  { label: '30 min', seconds: 1800 },
  { label: '45 min', seconds: 2700 },
  { label: '60 min', seconds: 3600 },
];

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function MeditationTimerPage() {
  const reduced = useReducedMotion();
  const [totalSeconds, setTotalSeconds] = useState(PRESETS[1].seconds);
  const [remaining, setRemaining] = useState(PRESETS[1].seconds);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'running' | 'paused' | 'complete'>('idle');
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bellRef = useRef<AudioContext | null>(null);

  const playBell = useCallback(() => {
    try {
      if (!bellRef.current) bellRef.current = new AudioContext();
      const ctx = bellRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 528;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 3);
    } catch { /* Audio not available */ }
  }, []);

  const startTimer = useCallback(() => {
    if (remaining <= 0) setRemaining(totalSeconds);
    setRunning(true);
    setPhase('running');
  }, [remaining, totalSeconds]);

  const pauseTimer = useCallback(() => {
    setRunning(false);
    setPhase('paused');
  }, []);

  const resetTimer = useCallback(() => {
    setRunning(false);
    setPhase('idle');
    setRemaining(totalSeconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [totalSeconds]);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            setRunning(false);
            setPhase('complete');
            playBell();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, playBell]);

  const setPreset = useCallback((seconds: number) => {
    setRunning(false);
    setPhase('idle');
    setTotalSeconds(seconds);
    setRemaining(seconds);
  }, []);

  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

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
            <p className="section-label mb-4">Meditation</p>
            <h1 className="font-display text-4xl md:text-6xl text-foreground leading-[0.95] tracking-[0.06em] engraved-heading font-light">
              Silent Sitting
            </h1>
            <p className="text-text-secondary text-lg mt-4 editorial-spacing">
              A simple timer for unstructured meditation practice.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16 md:py-24">
        {/* Preset selector */}
        <motion.section className="mb-16" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="text-caption mb-5">Duration</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPreset(p.seconds)}
                disabled={phase === 'running'}
                className={`px-5 py-2.5 text-[0.65rem] font-ui tracking-[0.12em] uppercase rounded-sm transition-all duration-300 ${
                  totalSeconds === p.seconds && phase !== 'running'
                    ? 'bg-gold text-deep-black'
                    : 'bg-surface text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setShowCustom(!showCustom)}
              className={`px-5 py-2.5 text-[0.65rem] font-ui tracking-[0.12em] uppercase rounded-sm transition-all duration-300 ${
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
                type="number"
                min="1"
                max="180"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { const m = parseInt(customMinutes); if (m > 0) { setPreset(m * 60); setShowCustom(false); } } }}
                placeholder="Minutes"
                className="w-32 bg-surface border border-gold/10 rounded-sm px-4 py-2.5 text-sm text-foreground font-body placeholder:text-text-muted/50 focus:outline-none focus:border-gold/30 transition-colors"
              />
              <button
                onClick={() => { const m = parseInt(customMinutes); if (m > 0) { setPreset(m * 60); setShowCustom(false); } }}
                className="px-4 py-2.5 bg-gold text-deep-black text-xs font-ui tracking-wider uppercase rounded-sm hover:bg-gold-bright transition-colors"
              >
                Set
              </button>
            </div>
          )}
        </motion.section>

        {/* Timer display */}
        <motion.section
          className="text-center mb-16"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          {/* Breathing circle */}
          <div className="relative inline-flex items-center justify-center mb-12">
            <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
              <circle
                cx="140" cy="140" r="126"
                fill="none"
                stroke="rgba(197, 160, 89, 0.04)"
                strokeWidth="0.5"
              />
              <circle
                cx="140" cy="140" r="126"
                fill="none"
                stroke={phase === 'complete' ? '#C5A059' : phase === 'running' ? 'rgba(197, 160, 89, 0.25)' : 'rgba(197, 160, 89, 0.1)'}
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 126}`}
                strokeDashoffset={`${2 * Math.PI * 126 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className={`absolute flex flex-col items-center ${phase === 'running' ? 'animate-breathe-slow' : ''}`}>
              {phase === 'complete' ? (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5" className="mb-3"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  <p className="font-display text-lg text-gold">Session Complete</p>
                </>
              ) : phase === 'paused' ? (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5" className="mb-4"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  <p className="font-display text-sm text-gold-dim tracking-wider uppercase">Paused</p>
                </>
              ) : null}
              <span className={`font-display tabular-nums transition-all duration-300 ${
                phase === 'complete' ? 'text-4xl text-gold text-glow mt-2' :
                phase === 'running' ? 'text-6xl md:text-7xl text-foreground' :
                'text-6xl md:text-7xl text-foreground'
              }`}>
                {formatTime(remaining)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {phase === 'idle' || phase === 'paused' ? (
              <button onClick={startTimer} className="gold-cta text-[0.65rem]">
                {phase === 'paused' ? 'Resume' : 'Begin'}
              </button>
            ) : phase === 'running' ? (
              <button onClick={pauseTimer} className="ghost-cta text-[0.65rem]">
                Pause
              </button>
            ) : null}
            <button
              onClick={resetTimer}
              disabled={phase === 'idle'}
              className="ghost-cta text-[0.65rem] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}