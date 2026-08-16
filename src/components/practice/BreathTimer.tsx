'use client';

import { useReducer, useEffect, useRef } from 'react';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { cn } from '@/lib/utils';
import { allBreathPatterns } from '@/lib/data/breath-patterns';

interface BreathTimerProps {
  patternSlug: string;
  className?: string;
}

const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface TimerState {
  phaseIndex: number;
  secondsLeft: number;
  cycleCount: number;
  running: boolean;
  done: boolean;
}

type TimerAction = { type: 'TICK'; phases: number[]; maxCycles: number } | { type: 'START'; phases: number[] } | { type: 'PAUSE' };

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  if (action.type === 'START') {
    return { phaseIndex: 0, secondsLeft: action.phases[0], cycleCount: 0, running: true, done: false };
  }
  if (action.type === 'PAUSE') {
    return { ...state, running: false };
  }
  if (action.type === 'TICK') {
    const next = state.secondsLeft - 1;
    if (next > 0) return { ...state, secondsLeft: next };
    // Phase done — advance
    const nextPhase = state.phaseIndex + 1;
    if (nextPhase >= action.phases.length) {
      const nextCycle = state.cycleCount + 1;
      if (nextCycle >= action.maxCycles) {
        return { ...state, secondsLeft: 0, running: false, done: true };
      }
      return { phaseIndex: 0, secondsLeft: action.phases[0], cycleCount: nextCycle, running: true, done: false };
    }
    return { ...state, phaseIndex: nextPhase, secondsLeft: action.phases[nextPhase] };
  }
  return state;
}

export function BreathTimer({ patternSlug, className }: BreathTimerProps) {
  const prefersReduced = useNativeReducedMotion();
  const pattern = allBreathPatterns.find((p) => p.slug === patternSlug);

  const durations = pattern?.phases.map((p) => p.duration) ?? [];
  const maxCycles = pattern?.cycles ?? 1;

  const [state, dispatch] = useReducer(timerReducer, {
    phaseIndex: 0, secondsLeft: 0, cycleCount: 0, running: false, done: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!state.running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK', phases: durations, maxCycles });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.running, durations, maxCycles]);

  function start() { dispatch({ type: 'START', phases: durations }); }
  function pause() { dispatch({ type: 'PAUSE' }); }

  if (!pattern) return <p className="text-text-muted text-sm">Pattern not found.</p>;

  const phase = pattern.phases[state.phaseIndex];
  const phaseDuration = phase?.duration ?? 0;
  const progress = phaseDuration > 0 ? 1 - state.secondsLeft / phaseDuration : 0;

  const isHold = phase?.name.toLowerCase().includes('retain');
  const isExhale = phase?.name.toLowerCase().includes('exhale');
  const ringScale = prefersReduced
    ? 1
    : isHold ? 1 : isExhale ? 1 - progress * 0.25 : 0.75 + progress * 0.25;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      <h3 className="font-display text-xl text-gold">{pattern.name}</h3>

      <div className="relative w-52 h-52 flex items-center justify-center">
        <svg viewBox="0 0 240 240" className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="120" cy="120" r={RADIUS} fill="none" stroke="var(--surface-elevated)" strokeWidth="3" />
          <circle
            cx="120" cy="120" r={RADIUS}
            fill="none" stroke="var(--gold)"
            strokeWidth="3" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div
          className="w-24 h-24 rounded-full border border-[var(--gold-dim)] flex items-center justify-center"
          style={!prefersReduced ? { transform: `scale(${ringScale})`, transition: 'transform 0.4s ease' } : undefined}
        >
          <span className="font-ui text-2xl text-gold tabular-nums">
            {state.running || state.done ? state.secondsLeft : '—'}
          </span>
        </div>
      </div>

      <p className="font-ui text-sm text-text-secondary">{phase?.name ?? (state.done ? 'Complete' : 'Ready')}</p>
      <p className="font-ui text-xs text-text-muted">Cycle {Math.min(state.cycleCount + 1, pattern.cycles)} / {pattern.cycles}</p>

      <button
        className="gold-cta text-sm px-8 py-3"
        onClick={state.running ? pause : start}
        disabled={state.done}
      >
        {state.done ? 'Finished' : state.running ? 'Pause' : 'Begin'}
      </button>
    </div>
  );
}
