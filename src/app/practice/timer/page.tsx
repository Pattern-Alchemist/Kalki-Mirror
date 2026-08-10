'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { PageHero } from '@/components/layout/PageHero';
import { ScrollParallax } from '@/components/ui/ScrollParallax';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

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

function AnimatedTimeDisplay({ seconds, phase }: { seconds: number; phase: string }) {
  const reduced = useReducedMotion();
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const h = Math.floor(seconds / 3600);

  return (
    <span className={`font-display tabular-nums transition-all duration-300 ${
      phase === 'complete' ? 'text-4xl text-gold text-glow mt-2' :
      phase === 'running' ? 'text-6xl md:text-7xl text-foreground' :
      'text-6xl md:text-7xl text-foreground'
    }`}>
      {h > 0 && <>{h}<span className="text-gold-dim text-3xl">:</span></>}
      <AnimatedCounter target={m} duration={0.4} />
      <span className="text-gold-dim text-3xl">:</span>
      <AnimatedCounter target={s} duration={0.4} />
    </span>
  );
}

export default function MeditationTimerPage() {
  const reduced = useReducedMotion();
  const [totalSeconds, setTotalSeconds] = useState(PRESETS[1].seconds);
  const [remaining, setRemaining] = useState(PRESETS[1].seconds);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'running' | 'paused' | 'complete'>('idle');
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalMinutesSat, setTotalMinutesSat] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bellRef = useRef<AudioContext | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });

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
            setSessionsCompleted(s => s + 1);
            setTotalMinutesSat(t => t + Math.round(totalSeconds / 60));
            playBell();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, playBell, totalSeconds]);

  const setPreset = useCallback((seconds: number) => {
    setRunning(false);
    setPhase('idle');
    setTotalSeconds(seconds);
    setRemaining(seconds);
  }, []);

  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-observatory-alt'
        title='Silent Sitting'
        subtitle='A simple timer for unstructured meditation practice. Set your duration, begin, and sit.'
        sectionLabel='Meditation'
      />

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16 md:py-24">
        {/* Preset selector */}
        <motion.section className="mb-16"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          whileInView={staggerContainer.visible}
          viewport={{ once: true }}
        >
          <p className="text-caption mb-5">Duration</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((p) => (
              <motion.button
                key={p.label}
                onClick={() => setPreset(p.seconds)}
                disabled={phase === 'running'}
                className={`px-5 py-2.5 text-[0.65rem] font-ui tracking-[0.12em] uppercase rounded-sm transition-all duration-300 ${
                  totalSeconds === p.seconds && phase !== 'running'
                    ? 'bg-gold text-deep-black'
                    : 'bg-surface text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
                variants={staggerItem}
              >
                {p.label}
              </motion.button>
            ))}
            <motion.button
              onClick={() => setShowCustom(!showCustom)}
              className={`px-5 py-2.5 text-[0.65rem] font-ui tracking-[0.12em] uppercase rounded-sm transition-all duration-300 ${
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

        {/* ── Cinematic Divider ── */}
        <ScrollParallax speed={-0.06}>
          <div className="relative h-[20vh] overflow-hidden -mx-6 lg:-mx-10 mb-16">
            <CinematicImage
              src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-labyrinth-alt'
              alt="Meditation path"
              kenBurns="slow"
              scrim="full"
              vignette
              fog
            />
          </div>
        </ScrollParallax>

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
              <AnimatedTimeDisplay seconds={remaining} phase={phase} />
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

        {/* ── Breathing Interlude ── */}
        <ScrollParallax speed={0.03}>
          <div className="relative h-[15vh] overflow-hidden -mx-6 lg:-mx-10 my-16">
            <CinematicImage
              src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-meditation-platform'
              alt="Meditation platform"
              kenBurns="slow"
              scrim="full"
              vignette
            />
          </div>
        </ScrollParallax>

        {/* ── Sitting Statistics ── */}
        <motion.section
          ref={statsRef}
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="divider-gold mb-12" />
          <p className="section-label mb-6">Sitting Statistics</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-chip p-6 text-center">
              <p className="font-display text-3xl text-gold mb-1">
                {statsInView ? <AnimatedCounter target={sessionsCompleted} /> : sessionsCompleted}
              </p>
              <p className="text-caption">Sessions</p>
            </div>
            <div className="glass-chip p-6 text-center">
              <p className="font-display text-3xl text-foreground mb-1">
                {statsInView ? <AnimatedCounter target={totalMinutesSat} suffix=" min" /> : `${totalMinutesSat} min`}
              </p>
              <p className="text-caption">Total Sitting</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}