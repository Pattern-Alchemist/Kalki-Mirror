'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import dynamic from 'next/dynamic';
import { fadeInUp } from '@/lib/motion/tokens';
import { TIER_BADGE_STYLES, TIER_LABELS } from '@/lib/utils/tier-gate';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw, Wind, Repeat, CheckCircle2 } from 'lucide-react';
import type { BreathPattern } from '@/lib/data/types';

const GatedContent = dynamic(() => import('@/components/monetization/GatedContent').then(m => ({ default: m.GatedContent })), { ssr: false, loading: () => <div className="min-h-[100px]" /> });

/* ── Phase type detection ── */
type PhaseKind = 'inhale' | 'exhale' | 'retain';

function getPhaseKind(name: string): PhaseKind {
  const lower = name.toLowerCase();
  if (lower.includes('inhale')) return 'inhale';
  if (lower.includes('exhale') || lower.includes('humming')) return 'exhale';
  return 'retain';
}

const SCALE_MAP: Record<PhaseKind, number> = { inhale: 1.45, retain: 1.45, exhale: 1.0 };
const EASE_MAP: Record<PhaseKind, [number, number, number, number]> = {
  inhale: [0.25, 0.1, 0.25, 1], retain: [0.0, 0.0, 0.0, 1], exhale: [0.42, 0.0, 0.58, 1],
};

/* ══════════════════════════════════════════════════════════════
   BREATHING CIRCLE
   ══════════════════════════════════════════════════════════════ */
function BreathingCircle({
  phaseName, phaseKind, duration, countdown, isActive, isComplete, reduced,
}: {
  phaseName: string; phaseKind: PhaseKind; duration: number;
  countdown: number; isActive: boolean; isComplete: boolean; reduced: boolean;
}) {
  const targetScale = SCALE_MAP[phaseKind];
  const ease = EASE_MAP[phaseKind];

  const glowOpacity = phaseKind === 'inhale'
    ? 0.5 + (countdown / duration) * 0.3
    : phaseKind === 'retain'
      ? 0.6 + Math.sin(Date.now() / 800) * 0.15
      : 0.2 + (countdown / duration) * 0.3;

  const glowBoxShadow = isActive
    ? `0 0 40px rgba(197,164,75,${glowOpacity * 0.4}), 0 0 80px rgba(197,164,75,${glowOpacity * 0.15}), inset 0 0 40px rgba(197,164,75,${glowOpacity * 0.1})`
    : '0 0 30px rgba(197,164,75,0.1), inset 0 0 20px rgba(197,164,75,0.03)';

  if (reduced) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-[200px] h-[200px] md:w-[260px] md:h-[260px] flex items-center justify-center">
          <div className="absolute inset-0 rounded-full" style={{ border: '2px solid rgba(197,164,75,0.4)', boxShadow: '0 0 30px rgba(197,164,75,0.15), inset 0 0 30px rgba(197,164,75,0.05)' }} />
          <div className="w-3/5 h-3/5 rounded-full" style={{ background: 'radial-gradient(circle, rgba(197,164,75,0.12) 0%, rgba(197,164,75,0.03) 70%, transparent 100%)' }} />
        </div>
        <p className="font-display text-xl md:text-2xl text-gold tracking-[0.06em] font-light">{phaseName}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-[200px] h-[200px] md:w-[260px] md:h-[260px] flex items-center justify-center">
        <motion.div
          className="absolute rounded-full"
          style={{ inset: '-20px', background: 'radial-gradient(circle, rgba(197,164,75,0.15) 0%, transparent 70%)' }}
          animate={isActive && !isComplete ? { scale: [1, 1.06, 1], opacity: [glowOpacity * 0.5, glowOpacity, glowOpacity * 0.5] } : { opacity: 0.15 }}
          transition={{ duration: phaseKind === 'retain' ? 1.6 : duration, repeat: isActive && !isComplete ? Infinity : 0, ease: 'easeInOut' }}
        />
        <motion.div
          className="relative w-full h-full rounded-full"
          style={{ border: '2px solid rgba(197,164,75,0.5)', boxShadow: glowBoxShadow }}
          animate={isActive && !isComplete ? { scale: targetScale } : { scale: 1 }}
          transition={{ duration, ease }}
        >
          <motion.div
            className="absolute rounded-full"
            style={{ inset: '15%', background: 'radial-gradient(circle, rgba(197,164,75,0.2) 0%, rgba(197,164,75,0.05) 60%, transparent 100%)' }}
            animate={isActive && !isComplete ? { scale: targetScale, opacity: phaseKind === 'exhale' ? 0.3 : 0.7 } : { scale: 1, opacity: 0.3 }}
            transition={{ duration, ease }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-3 h-3 rounded-full bg-gold/60"
              animate={isActive && !isComplete ? { scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] } : {}}
              transition={{ duration: phaseKind === 'retain' ? 2 : duration, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={phaseName} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="font-display text-xl md:text-2xl text-gold tracking-[0.06em] font-light">
          {phaseName}
        </motion.p>
      </AnimatePresence>
      {isActive && !isComplete && (
        <motion.p key={countdown} initial={{ opacity: 0.6, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="font-mono text-4xl md:text-5xl text-foreground tabular-nums tracking-[0.08em]">
          {Math.ceil(countdown)}
        </motion.p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PHASE TIMELINE
   ══════════════════════════════════════════════════════════════ */
function PhaseTimeline({ phases, currentPhaseIndex, isActive }: {
  phases: { name: string; duration: number }[]; currentPhaseIndex: number; isActive: boolean;
}) {
  const maxDuration = Math.max(...phases.map((p) => p.duration));
  return (
    <div className="w-full max-w-lg mx-auto space-y-2">
      {phases.map((phase, i) => {
        const isCurrent = isActive && i === currentPhaseIndex;
        const isPast = isActive && i < currentPhaseIndex;
        const isFuture = !isActive || i > currentPhaseIndex;
        const barWidth = Math.max(12, (phase.duration / maxDuration) * 100);
        return (
          <div key={i} className="flex items-center gap-3">
            <span className={cn('font-mono text-[0.7rem] tracking-[0.08em] w-28 md:w-40 text-right shrink-0 transition-colors duration-500', isCurrent ? 'text-gold' : isPast ? 'text-gold/40' : 'text-text-muted/40')}>
              {phase.name}
            </span>
            <div className="flex-1 h-2 bg-surface/40 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-500', isCurrent && 'bg-gold neon-chip-glow', isPast && 'bg-gold/30', isFuture && 'bg-gold/8')} style={{ width: `${barWidth}%` }} />
            </div>
            <span className={cn('font-mono text-[0.7rem] tracking-[0.08em] w-10 shrink-0 transition-colors duration-500', isCurrent ? 'text-gold' : 'text-text-muted/40')}>
              {phase.duration}s
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BREATH FOLIO CLIENT
   ══════════════════════════════════════════════════════════════ */
export default function BreathFolioClient({ pattern }: { pattern: BreathPattern }) {
  const reduced = useNativeReducedMotion();
  const tierLabel = TIER_LABELS[pattern.minTier];

  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(pattern.phases[0]?.duration ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase = pattern.phases[currentPhaseIndex];
  const currentPhaseKind = currentPhase ? getPhaseKind(currentPhase.name) : 'inhale';
  const totalPhasesPerCycle = pattern.phases.length;

  const tick = useCallback(() => {
    setCountdown((prev) => {
      const next = prev - 0.1;
      if (next <= 0) {
        setCurrentPhaseIndex((pi) => {
          const nextPi = pi + 1;
          if (nextPi >= totalPhasesPerCycle) {
            setCurrentCycle((c) => {
              const nextC = c + 1;
              if (nextC > pattern.cycles) { setIsRunning(false); setIsComplete(true); return c; }
              return nextC;
            });
            setCurrentPhaseIndex(0);
            return pattern.phases[0].duration;
          }
          return pattern.phases[nextPi].duration;
        });
        return 0;
      }
      return Math.round(next * 10) / 10;
    });
  }, [pattern.phases, pattern.cycles, totalPhasesPerCycle]);

  const handleStart = useCallback(() => {
    if (isComplete) { setCurrentCycle(1); setCurrentPhaseIndex(0); setCountdown(pattern.phases[0].duration); setIsComplete(false); }
    setIsRunning(true);
  }, [isComplete, pattern.phases]);

  const handlePause = useCallback(() => { setIsRunning(false); }, []);
  const handleReset = useCallback(() => { setIsRunning(false); setIsComplete(false); setCurrentCycle(1); setCurrentPhaseIndex(0); setCountdown(pattern.phases[0].duration); }, [pattern.phases]);

  useEffect(() => {
    if (isRunning && !isComplete) { intervalRef.current = setInterval(tick, 100); }
    else if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isComplete, tick]);

  // isComplete implies isRunning=false everywhere: the tick() function
  // already stops the timer when it sets completion, and handleStart()
  // resets both together — no sync effect needed.

  return (
    <div className="bg-deep-black min-h-screen">
      {/* ── HEADER ── */}
      <header className="border-b border-gold/5">
        <div className="w-full max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-12">
          <BackButton href="/breathwork" label="Back to Prāṇāyāma Laboratory" className="mb-8" />
          <motion.p className="font-mono text-[0.8125rem] tracking-[0.2em] uppercase text-copper mb-6" initial={reduced ? { opacity: 1 } : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            [ PRĀṆĀYĀMA / BREATHWORK LABORATORY ]
          </motion.p>
          <motion.h1 className="font-display text-4xl md:text-5xl text-foreground leading-[0.95] tracking-[0.06em] mb-4 font-light" initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            {pattern.name}
          </motion.h1>
          <motion.div className="flex flex-wrap items-center gap-3" initial={reduced ? { opacity: 1 } : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <span className={cn('text-[0.65rem] font-mono tracking-[0.15em] uppercase px-2.5 py-1 border rounded-sm', TIER_BADGE_STYLES[pattern.minTier])}>
              {tierLabel}
            </span>
            <span className="flex items-center gap-1.5 text-text-muted text-[0.75rem] font-mono tracking-[0.08em]"><Repeat className="w-3.5 h-3.5" />{pattern.cycles} cycles</span>
            <span className="flex items-center gap-1.5 text-text-muted text-[0.75rem] font-mono tracking-[0.08em]"><Wind className="w-3.5 h-3.5" />{pattern.phases.length}{pattern.phases.length === 1 ? ' phase' : ' phases'}</span>
          </motion.div>
        </div>
      </header>

      {/* ── VISUALIZER SECTION ── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 pt-16 pb-20">
        <GatedContent minTier={pattern.minTier} label={`${pattern.name} — Visualizer`} teaser={`The animated breathing visualizer for ${pattern.name} is available to ${tierLabel} practitioners and above.`}>
          <motion.div initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible}>
            <div className="text-center mb-10">
              <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-text-muted">Cycle {currentCycle} of {pattern.cycles}</p>
            </div>
            <div className="flex justify-center mb-12">
              <BreathingCircle phaseName={currentPhase?.name ?? ''} phaseKind={currentPhaseKind} duration={currentPhase?.duration ?? 4} countdown={countdown} isActive={isRunning} isComplete={isComplete} reduced={!!reduced} />
            </div>
            <AnimatePresence>
              {isComplete && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mb-10">
                  <div className="inline-flex items-center gap-3 glass-chip px-6 py-4">
                    <CheckCircle2 className="w-5 h-5 text-gold" />
                    <span className="font-display text-lg text-foreground font-light tracking-[0.04em]">Session complete — {pattern.cycles} cycles finished.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-center gap-3 mb-16">
              {!isRunning ? (
                <button onClick={handleStart} className="glass-chip px-6 py-2.5 text-sm font-mono tracking-[0.1em] uppercase text-gold hover:border-gold/30 transition-colors duration-300 flex items-center gap-2" aria-label={isComplete ? 'Restart session' : 'Start session'}>
                  <Play className="w-4 h-4" />{isComplete ? 'Restart' : 'Start'}
                </button>
              ) : (
                <button onClick={handlePause} className="glass-chip px-6 py-2.5 text-sm font-mono tracking-[0.1em] uppercase text-gold hover:border-gold/30 transition-colors duration-300 flex items-center gap-2" aria-label="Pause session">
                  <Pause className="w-4 h-4" />Pause
                </button>
              )}
              <button onClick={handleReset} className="glass-chip px-6 py-2.5 text-sm font-mono tracking-[0.1em] uppercase text-text-muted hover:text-foreground hover:border-gold/20 transition-colors duration-300 flex items-center gap-2" aria-label="Reset session">
                <RotateCcw className="w-4 h-4" />Reset
              </button>
            </div>
            <motion.div initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
              <p className="section-label mb-6" style={{ letterSpacing: '0.4em' }}>Phase Map</p>
              <PhaseTimeline phases={pattern.phases} currentPhaseIndex={currentPhaseIndex} isActive={isRunning} />
            </motion.div>
          </motion.div>
        </GatedContent>
      </section>

      {/* ── DESCRIPTION ── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-24">
        <motion.div initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-6">Practice Notes</p>
          <p className="text-text-secondary text-lg leading-relaxed editorial-spacing">{pattern.description}</p>
        </motion.div>
        <motion.div className="mt-16" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-6" style={{ letterSpacing: '0.4em' }}>Phase Breakdown</p>
          <div className="glass-chip p-6 md:p-8 overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-gold/10"><th className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-text-muted pb-3 pr-4">Phase</th><th className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-text-muted pb-3 pr-4">Duration</th><th className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-text-muted pb-3">Type</th></tr></thead>
              <tbody>
                {pattern.phases.map((phase, i) => (
                  <tr key={i} className="border-b border-gold/5 last:border-0">
                    <td className="py-3 pr-4 font-mono text-sm text-foreground">{phase.name}</td>
                    <td className="py-3 pr-4 font-mono text-sm text-gold-dim">{phase.duration}s</td>
                    <td className="py-3 font-mono text-[0.75rem] tracking-[0.08em] uppercase text-text-muted">{getPhaseKind(phase.name)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-4 border-t border-gold/10 flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="font-mono text-[0.75rem] text-text-muted">One cycle: <span className="text-gold-dim">{pattern.phases.reduce((a, p) => a + p.duration, 0)}s</span></span>
              <span className="font-mono text-[0.75rem] text-text-muted">Total: <span className="text-gold-dim">{(pattern.phases.reduce((a, p) => a + p.duration, 0) * pattern.cycles).toFixed(0)}s</span></span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ CINEMATIC STRIP ═══ */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ascetic-walking-mountain-path" alt="Meditation platform overlooking the Himalayas" kenBurns="normal" filmGrain={false} />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* ═══ CLOSING CTA ═══ */}
      <section className="relative py-24 md:py-36">
        <ScrollParallax speed={-0.06} disabled>
          <CinematicImage src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior" alt="Ancient stone ashram interior" className="absolute inset-0" scrim="full" vignette />
        </ScrollParallax>
        <div className="absolute inset-0 pointer-events-none z-[1] cta-overlay-dark" />
        <ParallaxText speed={-0.04} className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <p className="section-label mb-6">Continue the Practice</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">The breath is mapped.{' '}<span style={{ display: 'block' }}>The sādhana awaits.</span></h2>
          <p className="text-foreground/70 text-lg mb-12 editorial-spacing text-shadow-deep">Book a session with Kaustubh for a precise breathwork prescription — or explore the full prāṇāyāma laboratory.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/consultations" className="gold-cta">Consult the Archivist</Link>
            <Link href="/breathwork" className="ghost-cta">All Patterns</Link>
          </div>
        </ParallaxText>
      </section>
    </div>
  );
}
