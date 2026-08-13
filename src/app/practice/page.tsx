'use client';

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BackButton } from '@/components/nav/BackButton';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import { allSiddhis } from '@/lib/data/siddhis';
import { logSession, getSessions, getSessionStats } from './actions';
import type { SessionRecord, SessionStats } from './actions';
import Link from 'next/link';
import {
  Timer,
  Play,
  Pause,
  Square,
  Flame,
  Calendar,
  Clock,
  Trophy,
  Activity,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ══════════════════════════════════════════════════════════════ */

const MOOD_LABELS = ['Heavy', 'Low', 'Neutral', 'Good', 'Excellent'] as const;
const MOOD_MIN = 1;
const MOOD_MAX = 5;
const DURATION_OPTIONS = [15, 30, 45, 60];
const HEATMAP_DAYS = 90;
const HEATMAP_WEEKS = 13;
const HEATMAP_DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimerTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ── Siddhi grouped by level — built once outside component ── */
function buildSiddhisByLevel() {
  const grouped = new Map<string, Array<{ slug: string; name: string }>>();
  allSiddhis.forEach((s) => {
    const level = s.level;
    if (!grouped.has(level)) grouped.set(level, []);
    grouped.get(level)!.push({ slug: s.slug, name: s.name });
  });
  return grouped;
}

const SIDDHIS_BY_LEVEL = buildSiddhisByLevel();

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════ */

/* ── Stat Card ── */
function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="glass-panel p-4 md:p-6 flex flex-col items-center text-center gap-2"
      variants={staggerItem}
      initial={reduced ? { opacity: 1 } : staggerItem.hidden}
      whileInView={reduced ? { opacity: 1 } : staggerItem.visible}
      viewport={{ once: true, margin: '-40px' }}
    >
      <Icon className="w-5 h-5 text-gold-dim mb-1" strokeWidth={1.5} />
      <span className="text-text-muted text-[0.65rem] font-mono tracking-[0.15em] uppercase">
        {label}
      </span>
      <span className="text-2xl md:text-3xl font-display text-ivory">
        <AnimatedCounter target={value} suffix={suffix || ''} />
      </span>
    </motion.div>
  );
}

/* ── Calendar Heatmap ── */
function CalendarHeatmap({ sessions }: { sessions: SessionRecord[] }) {
  const reduced = useReducedMotion();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Build day→count map
  const dayCountMap = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((s) => {
      const d = new Date(s.createdAt);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString();
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [sessions]);

  // Build grid cells: 13 weeks × 7 days
  const cells = useMemo(() => {
    const grid: Array<{ date: Date; count: number; isFuture: boolean; key: string }[]> = [];
    // Find the Monday that starts the 90-day window
    const start = new Date(today);
    start.setDate(start.getDate() - (HEATMAP_DAYS - 1));
    // Adjust to previous Monday
    const dayOfWeek = start.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + mondayOffset);

    for (let week = 0; week < HEATMAP_WEEKS; week++) {
      const weekCells: Array<{ date: Date; count: number; isFuture: boolean; key: string }> = [];
      for (let day = 0; day < 7; day++) {
        const cellDate = new Date(start);
        cellDate.setDate(start.getDate() + week * 7 + day);
        cellDate.setHours(0, 0, 0, 0);
        const key = cellDate.toISOString();
        const count = dayCountMap.get(key) || 0;
        const isFuture = cellDate > today;
        weekCells.push({ date: cellDate, count, isFuture, key });
      }
      grid.push(weekCells);
    }
    return grid;
  }, [dayCountMap, today]);

  function getCellColor(count: number, isFuture: boolean): string {
    if (isFuture) return 'bg-zinc-900/30';
    if (count === 0) return 'bg-zinc-800/40';
    if (count === 1) return 'bg-gold/20';
    if (count === 2) return 'bg-gold/40';
    return 'bg-gold/70';
  }

  return (
    <motion.div
      className="glass-panel p-4 md:p-6"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={reduced ? { opacity: 1 } : fadeInUp.visible}
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-gold-dim" strokeWidth={1.5} />
        <span className="section-label text-[0.65rem]">90-DAY PRACTICE MAP</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mb-4 text-[0.6rem] font-mono text-text-muted">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-zinc-800/40" />
        <div className="w-3 h-3 rounded-sm bg-gold/20" />
        <div className="w-3 h-3 rounded-sm bg-gold/40" />
        <div className="w-3 h-3 rounded-sm bg-gold/70" />
        <span>More</span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-grid gap-[3px] min-w-fit">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1">
            {HEATMAP_DAY_LABELS.map((label, i) => (
              <div key={i} className="h-[10px] md:h-[12px] flex items-center">
                <span className="text-[0.5rem] font-mono text-text-muted/50 leading-none">
                  {label}
                </span>
              </div>
            ))}
          </div>
          {/* Weeks */}
          {cells.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, di) => (
                <div
                  key={cell.key}
                  className={cn(
                    'w-[10px] md:w-[12px] h-[10px] md:h-[12px] rounded-sm transition-colors duration-200',
                    getCellColor(cell.count, cell.isFuture)
                  )}
                  title={`${cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${cell.isFuture ? ' (future)' : ` — ${cell.count} session${cell.count !== 1 ? 's' : ''}`}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Mood Selector ── */
function MoodSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="block text-[0.6rem] font-mono tracking-[0.15em] text-text-muted uppercase">
        {label}
      </span>
      <div className="flex gap-1.5 flex-wrap">
        {MOOD_LABELS.map((mood, i) => {
          const num = i + 1;
          const isActive = value === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(isActive ? 0 : num)}
              className={cn(
                'px-2.5 py-1.5 text-[0.65rem] font-mono tracking-wider rounded border transition-all duration-200',
                isActive
                  ? 'border-gold/50 bg-gold/15 text-gold'
                  : 'border-zinc-700/40 bg-zinc-800/20 text-text-muted hover:border-zinc-600/50 hover:text-text-secondary'
              )}
            >
              {mood}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Session Timer ── */
function SessionTimer({
  onTimerStop,
}: {
  onTimerStop: (minutes: number) => void;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const reduced = useReducedMotion();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStart = useCallback(() => {
    setIsRunning(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    const mins = Math.max(1, Math.round(elapsed / 60));
    onTimerStop(mins);
    setSeconds(0);
    setElapsed(0);
  }, [elapsed, onTimerStop]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
    setElapsed(0);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  return (
    <motion.div
      className="glass-panel p-6 text-center"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={reduced ? { opacity: 1 } : fadeInUp.visible}
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <Timer className="w-4 h-4 text-gold-dim" strokeWidth={1.5} />
        <span className="section-label text-[0.65rem]">SESSION TIMER</span>
      </div>

      {/* Timer display */}
      <motion.div
        className="font-mono text-4xl md:text-5xl text-ivory tracking-widest mb-8 tabular-nums"
        key={seconds}
        animate={reduced ? {} : { scale: isRunning ? [1, 1.02, 1] : 1 }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {formatTimerTime(seconds)}
      </motion.div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isRunning ? (
          <button
            type="button"
            onClick={handleStart}
            className="gold-cta text-sm inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handlePause}
              className="ghost-cta text-sm inline-flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-mono tracking-wider uppercase border border-gold/50 bg-gold/10 text-gold rounded hover:bg-gold/20 transition-colors duration-200"
            >
              <Square className="w-3 h-3" />
              Stop & Log
            </button>
          </>
        )}
        {(isRunning || elapsed > 0) && (
          <button
            type="button"
            onClick={handleReset}
            className="text-text-muted hover:text-text-secondary transition-colors p-2"
            aria-label="Reset timer"
          >
            <span className="text-[0.6rem] font-mono tracking-wider">RESET</span>
          </button>
        )}
      </div>

      {isRunning && (
        <motion.p
          className="mt-4 text-[0.6rem] font-mono text-gold-dim tracking-wider"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          PRACTICE IN PROGRESS
        </motion.p>
      )}
    </motion.div>
  );
}

/* ── Recent Session Card ── */
function RecentSessionCard({ session }: { session: SessionRecord }) {
  const reduced = useReducedMotion();
  const moodLabel = (v: number | null) => {
    if (v == null) return '—';
    return MOOD_LABELS[v - 1];
  };

  return (
    <motion.div
      className="glass-chip p-4 flex flex-col gap-2"
      variants={staggerItem}
      initial={reduced ? { opacity: 1 } : staggerItem.hidden}
      whileInView={reduced ? { opacity: 1 } : staggerItem.visible}
      viewport={{ once: true, margin: '-20px' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-display text-ivory truncate">
            {session.siddhiName}
          </p>
          <p className="text-[0.6rem] font-mono text-text-muted tracking-wider mt-0.5">
            {formatDate(new Date(session.createdAt))}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-gold-dim shrink-0">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          <span className="text-[0.7rem] font-mono">{session.durationMin}m</span>
        </div>
      </div>

      {/* Mood row */}
      {(session.moodBefore != null || session.moodAfter != null) && (
        <div className="flex items-center gap-2 text-[0.6rem] font-mono tracking-wider">
          <span className="text-text-muted">{moodLabel(session.moodBefore)}</span>
          <ArrowRight className="w-3 h-3 text-gold-dim/50" />
          <span className="text-text-secondary">{moodLabel(session.moodAfter)}</span>
        </div>
      )}

      {/* Journal excerpt */}
      {session.journal && (
        <p className="text-[0.7rem] text-text-muted leading-relaxed line-clamp-2 italic">
          &ldquo;{session.journal}&rdquo;
        </p>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */

export default function PracticeLoggerPage() {
  const reduced = useReducedMotion();

  // ── Data state ──
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Form state ──
  const [selectedSiddhi, setSelectedSiddhi] = useState('');
  const [selectedSiddhiName, setSelectedSiddhiName] = useState('');
  const [durationMin, setDurationMin] = useState(15);
  const [moodBefore, setMoodBefore] = useState<number>(0);
  const [moodAfter, setMoodAfter] = useState<number>(0);
  const [journal, setJournal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Siddhi dropdown state ──
  const [siddhiDropdownOpen, setSiddhiDropdownOpen] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set(['Foundation']));
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Load data on mount ──
  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, sessionsData] = await Promise.all([
          getSessionStats(),
          getSessions(HEATMAP_DAYS),
        ]);
        setStats(statsData);
        setSessions(sessionsData);
      } catch (err) {
        console.error('[KALKI] Failed to load practice data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSiddhiDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Handle timer stop ──
  const handleTimerStop = useCallback((minutes: number) => {
    setDurationMin(minutes);
  }, []);

  // ── Handle siddhi selection ──
  const handleSiddhiSelect = useCallback((slug: string, name: string) => {
    setSelectedSiddhi(slug);
    setSelectedSiddhiName(name);
    setSiddhiDropdownOpen(false);
  }, []);

  // ── Toggle level expansion ──
  const toggleLevel = useCallback((level: string) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }, []);

  // ── Handle form submit ──
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedSiddhi || isSubmitting) return;

      setIsSubmitting(true);
      setSubmitMessage(null);

      const result = await logSession({
        siddhiSlug: selectedSiddhi,
        siddhiName: selectedSiddhiName,
        durationMin,
        journal: journal.trim() || undefined,
        moodBefore: moodBefore >= MOOD_MIN && moodBefore <= MOOD_MAX ? moodBefore : undefined,
        moodAfter: moodAfter >= MOOD_MIN && moodAfter <= MOOD_MAX ? moodAfter : undefined,
      });

      if (result.success) {
        setSubmitMessage({ type: 'success', text: 'Session recorded. The geometry deepens.' });
        // Reset form
        setJournal('');
        setMoodBefore(0);
        setMoodAfter(0);
        // Refresh data
        const [statsData, sessionsData] = await Promise.all([
          getSessionStats(),
          getSessions(HEATMAP_DAYS),
        ]);
        setStats(statsData);
        setSessions(sessionsData);
      } else {
        setSubmitMessage({ type: 'error', text: result.error || 'Failed to record session.' });
      }

      setIsSubmitting(false);
    },
    [selectedSiddhi, selectedSiddhiName, durationMin, journal, moodBefore, moodAfter, isSubmitting]
  );

  const totalHours = stats ? Math.round((stats.totalMinutes / 60) * 10) / 10 : 0;

  return (
    <main className="min-h-screen bg-deep-black">
      {/* ═══ HERO — The Practice Floor ═══ */}
      <section className="relative min-h-[90vh] md:min-h-[100vh] flex items-center atmospheric-bg overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212,175,55,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-32 pb-20">
          <BackButton href="/" label="Return" />

          <motion.div
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.15 }}
            className="mt-8 max-w-2xl"
          >
            <span className="section-label block mb-4" style={{ letterSpacing: '0.6em' }}>
              Sadhana Logger
            </span>
            <h1 className="hero-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              The Practice<br />Floor
            </h1>
            <p className="text-editorial text-lg md:text-xl text-text-secondary mt-6 max-w-xl leading-relaxed">
              Every session is a thread in the tapestry of transformation.
              Track your sādhana with precision — duration, mood, continuity.
              The data reveals what the mind cannot see.
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <span className="text-[0.55rem] font-mono tracking-[0.3em] text-text-muted/40 uppercase">
              Scroll
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-gold/30 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      {stats && (
        <section className="py-12 md:py-16">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
              variants={staggerContainer}
              initial={reduced ? 'visible' : 'hidden'}
              whileInView={reduced ? 'visible' : 'visible'}
              viewport={{ once: true, margin: '-60px' }}
            >
              <StatCard icon={Activity} label="Total Sessions" value={stats.totalSessions} />
              <StatCard icon={Clock} label="Total Hours" value={totalHours} />
              <StatCard icon={Flame} label="Current Streak" value={stats.currentStreak} suffix="d" />
              <StatCard icon={Trophy} label="Longest Streak" value={stats.longestStreak} suffix="d" />
            </motion.div>
            {stats.topPractice && (
              <motion.p
                className="text-center text-[0.6rem] font-mono tracking-[0.15em] text-text-muted mt-6"
                initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                whileInView={reduced ? { opacity: 1 } : fadeInUp.visible}
                viewport={{ once: true }}
              >
                Dominant practice: <span className="text-gold-dim">{stats.topPractice}</span>
              </motion.p>
            )}
          </div>
        </section>
      )}

      {/* ═══ DIVIDER ═══ */}
      <div className="max-w-[200px] mx-auto">
        <div className="divider-gold" />
      </div>

      {/* ═══ HEATMAP + TIMER ROW ═══ */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-4 md:gap-6">
            {/* Calendar Heatmap */}
            <CalendarHeatmap sessions={sessions} />

            {/* Session Timer */}
            <SessionTimer onTimerStop={handleTimerStop} />
          </div>
        </div>
      </section>

      {/* ═══ DIVIDER ═══ */}
      <div className="max-w-[200px] mx-auto">
        <div className="divider-gold" />
      </div>

      {/* ═══ QUICK LOG ═══ */}
      <section className="py-12 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.div
            className="text-center mb-10"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={reduced ? { opacity: 1 } : fadeInUp.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            <span className="section-label block mb-3" style={{ letterSpacing: '0.5em' }}>
              Quick Log
            </span>
            <h2 className="engraved-heading text-2xl md:text-3xl">Record a Session</h2>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="glass-panel p-6 md:p-8 max-w-2xl mx-auto space-y-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={reduced ? { opacity: 1 } : fadeInUp.visible}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: 0.1 }}
          >
            {/* Siddhi Selector */}
            <div className="space-y-2">
              <label className="block text-[0.6rem] font-mono tracking-[0.15em] text-text-muted uppercase">
                Practice
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setSiddhiDropdownOpen(!siddhiDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded border border-zinc-700/40 bg-zinc-800/20 text-sm text-ivory hover:border-zinc-600/50 transition-colors duration-200"
                >
                  <span className={selectedSiddhiName ? 'text-ivory' : 'text-text-muted'}>
                    {selectedSiddhiName || 'Select a practice...'}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-text-muted transition-transform duration-200',
                      siddhiDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {siddhiDropdownOpen && (
                    <motion.div
                      className="absolute top-full left-0 right-0 mt-1 z-50 border border-zinc-700/40 bg-zinc-900/95 backdrop-blur-xl rounded max-h-72 overflow-y-auto"
                      initial={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {Array.from(SIDDHIS_BY_LEVEL.entries()).map(([level, siddhis]) => (
                        <div key={level}>
                          <button
                            type="button"
                            onClick={() => toggleLevel(level)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-[0.6rem] font-mono tracking-[0.15em] uppercase text-gold-dim hover:bg-zinc-800/40 transition-colors"
                          >
                            <ChevronRight
                              className={cn(
                                'w-3 h-3 transition-transform duration-200',
                                expandedLevels.has(level) && 'rotate-90'
                              )}
                            />
                            {level}
                            <span className="ml-auto text-text-muted/50">
                              {siddhis.length}
                            </span>
                          </button>
                          <AnimatePresence>
                            {expandedLevels.has(level) && (
                              <motion.div
                                initial={reduced ? {} : { height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={reduced ? {} : { height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                {siddhis.map((s) => (
                                  <button
                                    key={s.slug}
                                    type="button"
                                    onClick={() => handleSiddhiSelect(s.slug, s.name)}
                                    className={cn(
                                      'w-full text-left px-6 py-2 text-xs text-text-secondary hover:text-ivory hover:bg-zinc-800/30 transition-colors duration-150',
                                      selectedSiddhi === s.slug && 'text-gold bg-gold/5'
                                    )}
                                  >
                                    {s.name}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="block text-[0.6rem] font-mono tracking-[0.15em] text-text-muted uppercase">
                Duration
              </label>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationMin(d)}
                    className={cn(
                      'flex-1 py-2.5 text-sm font-mono rounded border transition-all duration-200',
                      durationMin === d
                        ? 'border-gold/50 bg-gold/15 text-gold'
                        : 'border-zinc-700/40 bg-zinc-800/20 text-text-muted hover:border-zinc-600/50 hover:text-text-secondary'
                    )}
                  >
                    {d}m
                  </button>
                ))}
              </div>
              {durationMin !== 15 && durationMin !== 30 && durationMin !== 45 && durationMin !== 60 && (
                <p className="text-[0.6rem] font-mono text-gold-dim tracking-wider">
                  Timer filled: {durationMin} minutes
                </p>
              )}
            </div>

            {/* Mood Before / After */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MoodSelector
                label="Mood Before"
                value={moodBefore || undefined}
                onChange={(v) => setMoodBefore(v)}
              />
              <MoodSelector
                label="Mood After"
                value={moodAfter || undefined}
                onChange={(v) => setMoodAfter(v)}
              />
            </div>

            {/* Journal */}
            <div className="space-y-2">
              <label className="block text-[0.6rem] font-mono tracking-[0.15em] text-text-muted uppercase">
                Journal <span className="text-text-muted/40">(optional)</span>
              </label>
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="What arose during practice? What dissolved?"
                className="w-full px-4 py-3 rounded border border-zinc-700/40 bg-zinc-800/20 text-sm text-ivory placeholder:text-text-muted/40 resize-none focus:outline-none focus:border-gold/30 transition-colors duration-200"
              />
            </div>

            {/* Submit message */}
            <AnimatePresence>
              {submitMessage && (
                <motion.p
                  className={cn(
                    'text-[0.7rem] font-mono tracking-wider text-center',
                    submitMessage.type === 'success' ? 'text-gold' : 'text-red-400/80'
                  )}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -5 }}
                >
                  {submitMessage.text}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={!selectedSiddhi || isSubmitting}
              className="gold-cta w-full text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Recording...' : 'Log Session'}
            </button>
          </motion.form>
        </div>
      </section>

      {/* ═══ DIVIDER ═══ */}
      <div className="max-w-[200px] mx-auto">
        <div className="divider-gold" />
      </div>

      {/* ═══ RECENT SESSIONS ═══ */}
      <section className="py-12 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.div
            className="text-center mb-10"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={reduced ? { opacity: 1 } : fadeInUp.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            <span className="section-label block mb-3" style={{ letterSpacing: '0.5em' }}>
              Practice Record
            </span>
            <h2 className="engraved-heading text-2xl md:text-3xl">Recent Sessions</h2>
          </motion.div>

          {sessions.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 max-h-[600px] overflow-y-auto pr-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(212,175,55,0.2) transparent',
              }}
              variants={staggerContainer}
              initial={reduced ? 'visible' : 'hidden'}
              whileInView={reduced ? 'visible' : 'visible'}
              viewport={{ once: true, margin: '-60px' }}
            >
              {sessions.slice(0, 10).map((s) => (
                <RecentSessionCard key={s.id} session={s} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="glass-panel p-8 text-center max-w-md mx-auto"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              whileInView={reduced ? { opacity: 1 } : fadeInUp.visible}
              viewport={{ once: true }}
            >
              <p className="text-text-muted text-sm font-mono tracking-wider">
                No sessions recorded yet.
              </p>
              <p className="text-text-muted/50 text-xs mt-2">
                Begin your practice. The floor is waiting.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══ CINEMATIC STRIP — Closing Statement ═══ */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(212,175,55,0.04) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={reduced ? { opacity: 1 } : fadeInUp.visible}
            viewport={{ once: true, margin: '-80px' }}
          >
            <p className="gold-foil-text text-lg md:text-xl font-display max-w-xl mx-auto leading-relaxed mb-6">
              The practice floor does not judge.
              It receives. It records. And over time,
              it reveals the shape of your transformation
              — one session at a time.
            </p>
            <div className="divider-gold max-w-[120px] mx-auto mb-8" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/practice/timer" className="gold-cta text-sm">
                Silent Sitting Timer
              </Link>
              <Link href="/practice/japa" className="ghost-cta text-sm">
                Japa Mala Counter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}