'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis, getSiddhiBySlug } from '@/lib/data/siddhis';
import { allSequences } from '@/lib/data/sequences';
import {
  getDossierByPhone,
  type ConsultationDossier,
  type DossierStatus,
  type OutcomeStatus,
} from './actions';

// ─── Status badge styles ──────────────────────────────────────────────────────

const DOSSIER_STATUS_STYLES: Record<DossierStatus, string> = {
  NEW: 'bg-gold/15 text-gold border-gold/30',
  SCHEDULED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const OUTCOME_STATUS_STYLES: Record<OutcomeStatus, string> = {
  PENDING: 'bg-gold/15 text-gold border-gold/30',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  DISCONTINUED: 'bg-red-500/15 text-red-400 border-red-500/30',
};

// ─── Timeline entry type ────────────────────────────────────────────────────────

interface TimelineEntry {
  label: string;
  detail: string;
  date: string | null;
  icon: 'circle' | 'diamond' | 'star' | 'check' | 'arrow';
  active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateShort(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function safeParseJSON<T>(str: string | null): T[] {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── Timeline icon renderer ────────────────────────────────────────────────────

function TimelineIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? 'var(--copper)' : 'var(--gold-dim, #8B7355)';
  switch (type) {
    case 'diamond':
      return (
        <span
          className="block w-3 h-3 rotate-45 border shrink-0"
          style={{
            borderColor: color,
            backgroundColor: active ? color : 'transparent',
          }}
        />
      );
    case 'star':
      return (
        <span
          className="block w-4 h-4 shrink-0"
          style={{ color }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0l2.2 4.6L16 5.4l-3.6 3.5.9 4.9L8 11.4 3.7 13.8l.9-4.9L1 5.4l5.8-.8z" />
          </svg>
        </span>
      );
    case 'check':
      return (
        <span
          className="flex items-center justify-center w-4 h-4 rounded-full border shrink-0"
          style={{ borderColor: color, backgroundColor: active ? color : 'transparent' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={active ? '#0a0a0a' : color} strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
      );
    case 'arrow':
      return (
        <span
          className="block w-3 h-3 rotate-45 border-r-2 border-b-2 shrink-0"
          style={{ borderColor: color }}
        />
      );
    default:
      return (
        <span
          className="block w-2.5 h-2.5 rounded-full border shrink-0"
          style={{
            borderColor: color,
            backgroundColor: active ? color : 'transparent',
          }}
        />
      );
  }
}

// ─── Blueprint grid overlay ──────────────────────────────────────────────────

function BlueprintGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, var(--copper) 0px, var(--copper) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, var(--copper) 0px, var(--copper) 1px, transparent 1px, transparent 40px)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DossierPage() {
  const reduced = useReducedMotion();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dossier, setDossier] = useState<ConsultationDossier | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = useCallback(async () => {
    setError(null);
    setNotFound(false);
    setDossier(null);

    const trimmed = phone.trim();
    if (!trimmed || trimmed.length < 7) {
      setError('Please enter a valid WhatsApp number.');
      return;
    }

    setLoading(true);
    try {
      const result = await getDossierByPhone(trimmed);

      if ('error' in result) {
        if (result.error === 'NOT_FOUND') {
          setNotFound(true);
        } else {
          setError(result.error);
        }
      } else {
        setDossier(result.dossier);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleLookup();
    },
    [handleLookup]
  );

  // Build timeline entries
  const buildTimeline = (d: ConsultationDossier): TimelineEntry[] => {
    const entries: TimelineEntry[] = [];

    entries.push({
      label: 'Consultation Requested',
      detail: `Submitted by ${d.name}`,
      date: d.createdAt,
      icon: 'circle',
      active: true,
    });

    if (d.scheduledFor) {
      const isPast = new Date(d.scheduledFor) < new Date();
      entries.push({
        label: 'Session Scheduled',
        detail: `Scheduled for ${formatDate(d.scheduledFor)}`,
        date: d.scheduledFor,
        icon: 'diamond',
        active: isPast || d.status === 'COMPLETED',
      });
    }

    if (d.completedAt) {
      entries.push({
        label: 'Session Completed',
        detail: `Completed on ${formatDate(d.completedAt)}`,
        date: d.completedAt,
        icon: 'check',
        active: true,
      });
    }

    if (d.followUpDate) {
      const isPast = new Date(d.followUpDate) < new Date();
      entries.push({
        label: 'Follow-up Scheduled',
        detail: `${formatDate(d.followUpDate)}`,
        date: d.followUpDate,
        icon: 'arrow',
        active: isPast,
      });
    }

    return entries;
  };

  // Parse prescription data
  const patternSlugs = dossier ? safeParseJSON(dossier.patternDiagnosis) : [];
  const siddhiSlugs = dossier ? safeParseJSON(dossier.prescribedSiddhis) : [];
  const sequenceSlug = dossier?.prescribedSequence;
  const sequence = sequenceSlug
    ? allSequences.find((s) => s.slug === sequenceSlug)
    : null;

  return (
    <div className="bg-deep-black min-h-screen">
      {/* ═══════ CINEMATIC HERO ═══════ */}
      <section className="relative min-h-[90vh] md:min-h-[100vh] overflow-hidden">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-ritual-chamber-alt"
          alt="The Dossier — cinematic hero"
          fill
          kenBurns="slow"
          scrim="bottom"
          vignette
          volumetric
          dust
          priority
        />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-deep-black via-deep-black/30 to-deep-black/40" />
        <div className="absolute inset-0 flex items-end pb-20 md:pb-28 z-10">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
            <p className="section-label mb-4">CONSULTATION OUTCOME TRACKING</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-wide hero-heading">
              The Dossier
            </h1>
            <p className="mt-6 max-w-2xl text-lg md:text-xl text-white/60 leading-relaxed editorial-spacing">
              Your pattern diagnosis. Your prescribed path. Your evolution.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ ATMOSPHERIC TRANSITION ═══════ */}
      <div className="atmospheric-bg h-24 -mt-10 relative z-10" />

      {/* ═══════ PHONE LOOKUP ═══════ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 md:py-24">
        <BackButton href="/" label="Back to Home" className="mb-12" />

        <motion.div
          className="max-w-2xl mx-auto"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
        >
          <p className="section-label mb-6">Retrieve Your Dossier</p>
          <p className="text-text-secondary text-base leading-relaxed mb-8 editorial-spacing">
            Enter the WhatsApp number you used when booking your consultation.
            This is the key to accessing your dossier.
          </p>

          <div className="glass-panel p-6 md:p-8">
            <BlueprintGrid>
              <div className="space-y-4">
                <label
                  htmlFor="phone-lookup"
                  className="font-mono text-[0.8125rem] tracking-[0.15em] uppercase text-copper block"
                >
                  WhatsApp Number
                </label>
                <input
                  id="phone-lookup"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-black/40 border border-gold/10 rounded-sm px-4 py-3 text-foreground placeholder:text-text-muted font-mono text-sm focus:outline-none focus:border-gold/40 transition-colors duration-300"
                  disabled={loading}
                />
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLookup}
                    disabled={loading}
                    className="gold-cta text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
                        Retrieving...
                      </span>
                    ) : (
                      'Retrieve Dossier'
                    )}
                  </button>
                  {error && (
                    <p className="text-red-400 text-xs font-mono">{error}</p>
                  )}
                </div>
              </div>
            </BlueprintGrid>
          </div>
        </motion.div>

        {/* ═══════ NOT FOUND STATE ═══════ */}
        <AnimatePresence>
          {notFound && (
            <motion.div
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto mt-12 text-center"
            >
              <div className="glass-panel p-8 md:p-10">
                <div className="w-16 h-16 mx-auto mb-6 border border-gold/20 rounded-full flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-gold-dim"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h3 className="font-display text-xl text-foreground mb-3">
                  No Consultation Found
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-8 editorial-spacing">
                  No consultation found. Book a session with Kaustubh to begin.
                </p>
                <WhatsAppCTA variant="inline" label="Book a Session" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ DOSSIER CONTENT ═══════ */}
        <AnimatePresence>
          {dossier && (
            <motion.div
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl mx-auto mt-16 space-y-16"
            >
              {/* ── Status Badges ── */}
              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
                animate={staggerContainer.visible}
              >
                <motion.span
                  variants={staggerItem}
                  className={`font-mono text-[0.8125rem] tracking-[0.12em] uppercase px-3 py-1.5 rounded-sm border ${DOSSIER_STATUS_STYLES[dossier.status]}`}
                >
                  {dossier.status}
                </motion.span>
                {dossier.outcome && (
                  <motion.span
                    variants={staggerItem}
                    className={`font-mono text-[0.8125rem] tracking-[0.12em] uppercase px-3 py-1.5 rounded-sm border ${OUTCOME_STATUS_STYLES[dossier.outcome]}`}
                  >
                    Outcome: {dossier.outcome.replace(/_/g, ' ')}
                  </motion.span>
                )}
                <motion.span
                  variants={staggerItem}
                  className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-text-muted"
                >
                  ID: {dossier.id.slice(0, 8)}…
                </motion.span>
              </motion.div>

              {/* ── Consultation Details ── */}
              <motion.section
                initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                whileInView={fadeInUp.visible}
                viewport={{ once: true }}
              >
                <p className="section-label mb-6">Consultation Record</p>
                <div className="glass-panel p-6 md:p-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper mb-1">
                        Subject
                      </p>
                      <p className="text-foreground text-sm">{dossier.name}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper mb-1">
                        Contact
                      </p>
                      <p className="text-foreground text-sm font-mono">
                        {dossier.phone}
                      </p>
                    </div>
                  </div>
                  <div className="divider-gold" />
                  <div>
                    <p className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper mb-2">
                      Request
                    </p>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {dossier.request}
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* ── Timeline ── */}
              <motion.section
                initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                whileInView={fadeInUp.visible}
                viewport={{ once: true }}
              >
                <p className="section-label mb-6">Timeline</p>
                <div className="space-y-0">
                  {buildTimeline(dossier).map((entry, i) => (
                    <div key={i} className="flex gap-6">
                      {/* Copper connector spine */}
                      <div className="flex flex-col items-center shrink-0">
                        <TimelineIcon type={entry.icon} active={entry.active} />
                        {i < buildTimeline(dossier).length - 1 && (
                          <div
                            className="w-px flex-1 min-h-[3rem]"
                            style={{
                              backgroundColor: entry.active
                                ? 'var(--copper)'
                                : 'rgba(139, 115, 85, 0.3)',
                            }}
                          />
                        )}
                      </div>

                      {/* Entry content */}
                      <div
                        className={`pb-8 flex-1 ${entry.active ? '' : 'opacity-50'}`}
                      >
                        <p className="font-mono text-[0.8125rem] tracking-[0.12em] uppercase text-copper mb-1">
                          {entry.label}
                        </p>
                        <p className="text-foreground text-sm mb-1">
                          {entry.detail}
                        </p>
                        <p className="font-mono text-[0.75rem] text-text-muted tracking-[0.1em]">
                          {formatDateShort(entry.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* ── Diagnosis: Pattern Badges ── */}
              {patternSlugs.length > 0 && (
                <motion.section
                  initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                  whileInView={fadeInUp.visible}
                  viewport={{ once: true }}
                >
                  <p className="section-label mb-6">Diagnosis</p>
                  <div className="glass-panel p-6 md:p-8">
                    <p className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper mb-4">
                      Identified Patterns
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {patternSlugs.map((slug) => {
                        const pattern = allPatterns.find(
                          (p) => p.slug === slug
                        );
                        if (!pattern) return null;
                        return (
                          <Link
                            key={slug}
                            href={`/patterns/${slug}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-gold/20 bg-gold/5 hover:bg-gold/10 hover:border-gold/40 transition-all duration-500 group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                            <span className="text-sm text-foreground group-hover:text-gold transition-colors duration-500 font-light">
                              {pattern.name}
                            </span>
                            <span className="font-mono text-[0.7rem] tracking-[0.1em] text-text-muted hidden sm:inline">
                              →
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* ── Prescribed Path ── */}
              {(sequence || siddhiSlugs.length > 0) && (
                <motion.section
                  initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                  whileInView={fadeInUp.visible}
                  viewport={{ once: true }}
                >
                  <p className="section-label mb-6">Prescribed Path</p>

                  {sequence && (
                    <div className="glass-panel p-6 md:p-8 mb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="block w-3 h-3 rotate-45 border border-gold/40 shrink-0"
                          style={{ backgroundColor: 'rgba(212, 168, 83, 0.15)' }}
                        />
                        <p className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper">
                          Assigned Sequence
                        </p>
                      </div>
                      <Link
                        href={`/sequences/${sequence.slug}`}
                        className="group block"
                      >
                        <h3 className="font-display text-xl text-foreground group-hover:text-gold transition-colors duration-500 font-light">
                          {sequence.name}
                        </h3>
                        <p className="font-mono text-[0.8125rem] text-gold-dim tracking-[0.12em] mt-1">
                          {sequence.subtitle}
                        </p>
                        <p className="text-text-secondary text-sm leading-relaxed mt-3 max-w-xl">
                          {sequence.description}
                        </p>
                        <p className="font-mono text-[0.75rem] text-copper tracking-[0.1em] mt-4">
                          Total Duration: {sequence.totalDuration} &middot;{' '}
                          {sequence.steps.length} stages
                        </p>
                      </Link>
                    </div>
                  )}

                  {siddhiSlugs.length > 0 && (
                    <div className="glass-panel p-6 md:p-8">
                      <p className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper mb-4">
                        Prescribed Siddhis
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {siddhiSlugs.map((slug) => {
                          const siddhi = getSiddhiBySlug(slug);
                          if (!siddhi) return null;
                          return (
                            <Link
                              key={slug}
                              href={`/archive/${slug}`}
                              className="relative group"
                            >
                              <div className="glass-chip p-5 hover:border-gold/30 transition-colors duration-500 h-full">
                                <p className="text-sm text-foreground group-hover:text-gold transition-colors duration-500 font-light">
                                  {siddhi.name}
                                </p>
                                <p className="font-mono text-[0.7rem] tracking-[0.1em] text-gold-dim mt-1">
                                  {siddhi.sanskrit}
                                </p>
                                <p className="font-mono text-[0.7rem] tracking-[0.1em] text-copper mt-2">
                                  {siddhi.level}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.section>
              )}

              {/* ── Archivist Notes ── */}
              {dossier.sessionNotes && (
                <motion.section
                  initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                  whileInView={fadeInUp.visible}
                  viewport={{ once: true }}
                >
                  <p className="section-label mb-6">Archivist Notes</p>
                  <div className="glass-panel p-6 md:p-8">
                    <BlueprintGrid>
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="block w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: 'var(--copper)' }}
                        />
                        <p className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper">
                          Session Notes — Post-Consultation
                        </p>
                      </div>
                      <p className="text-text-secondary leading-relaxed editorial-spacing whitespace-pre-wrap">
                        {dossier.sessionNotes}
                      </p>
                    </BlueprintGrid>
                  </div>
                </motion.section>
              )}

              {/* ── Continue Your Practice ── */}
              {(patternSlugs.length > 0 || siddhiSlugs.length > 0) && (
                <motion.section
                  initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                  whileInView={fadeInUp.visible}
                  viewport={{ once: true }}
                >
                  <p className="section-label mb-6">Continue Your Practice</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Patterns to explore */}
                    {patternSlugs.length > 0 && (
                      <div className="glass-panel p-6 md:p-8">
                        <p className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper mb-4">
                          Your Patterns
                        </p>
                        <div className="space-y-3">
                          {patternSlugs.map((slug) => {
                            const pattern = allPatterns.find(
                              (p) => p.slug === slug
                            );
                            if (!pattern) return null;
                            return (
                              <Link
                                key={slug}
                                href={`/patterns/${slug}`}
                                className="flex items-center gap-3 group py-1"
                              >
                                <div className="w-px h-4 shrink-0" style={{ backgroundColor: 'var(--copper)', opacity: 0.5 }} />
                                <span className="text-sm text-foreground group-hover:text-gold transition-colors duration-500 font-light">
                                  {pattern.name}
                                </span>
                                <span className="font-mono text-[0.65rem] text-text-muted ml-auto">
                                  →
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Siddhis to practice */}
                    {siddhiSlugs.length > 0 && (
                      <div className="glass-panel p-6 md:p-8">
                        <p className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper mb-4">
                          Your Prescribed Sādhanas
                        </p>
                        <div className="space-y-3">
                          {siddhiSlugs.map((slug) => {
                            const siddhi = getSiddhiBySlug(slug);
                            if (!siddhi) return null;
                            return (
                              <Link
                                key={slug}
                                href={`/archive/${slug}`}
                                className="flex items-center gap-3 group py-1"
                              >
                                <div className="w-px h-4 shrink-0" style={{ backgroundColor: 'var(--copper)', opacity: 0.5 }} />
                                <span className="text-sm text-foreground group-hover:text-gold transition-colors duration-500 font-light">
                                  {siddhi.name}
                                </span>
                                <span className="font-mono text-[0.65rem] text-text-muted ml-auto">
                                  {siddhi.level}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {/* ── Follow-up CTA ── */}
              {dossier.outcome !== 'RESOLVED' && (
                <motion.div
                  className="text-center pt-8"
                  initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                  whileInView={fadeInUp.visible}
                  viewport={{ once: true }}
                >
                  <WhatsAppCTA
                    variant="inline"
                    label="Follow Up with the Archivist"
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ═══════ PARALLAX INTERLUDE ═══════ */}
      <ScrollParallax speed={-0.1} className="mt-12">
        <div className="cinematic-strip relative h-[30vh] md:h-[40vh] overflow-hidden">
          <CinematicImage
            src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/meditation-platform-overlooking.jpeg"
            alt="Meditation platform overlooking the Himalayas"
            fill
            scrim="full"
            vignette
            filmGrain={false}
          />
        </div>
      </ScrollParallax>

      {/* ═══════ CLOSING CTA ═══════ */}
      <section className="relative py-24 md:py-36">
        <ScrollParallax speed={-0.06} disabled>
          <CinematicImage
            src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-codex-scroll.jpeg"
            alt="Ancient codex"
            className="absolute inset-0"
            scrim="full"
            vignette
          />
        </ScrollParallax>
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: 'rgba(0,0,0,0.75)' }}
        />
        <ParallaxText
          speed={-0.04}
          className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center"
        >
          <p className="section-label mb-6">The Archive Remembers</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">
            Every session is recorded.<br />
            Every pattern is tracked.
          </h2>
          <p className="text-foreground/70 text-lg mb-12 editorial-spacing">
            The dossier is your living record — a map of where you&apos;ve been,
            where you are, and where the sādhana leads.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <WhatsAppCTA variant="inline" label="Consult the Archivist" />
            <Link href="/patterns" className="ghost-cta">
              Pattern Atlas
            </Link>
          </div>
        </ParallaxText>
      </section>

      {/* ═══════ BINDU PULSE FOOTER ═══════ */}
      <footer className="relative pb-28 md:pb-20 mt-16">
        <div className="atmospheric-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center">
            <div
              className="w-3 h-3 bg-gold/40 rounded-full"
              style={{ animation: 'binduPulse 2s ease-in-out infinite' }}
            />
          </div>
          <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper">
            THE DOSSIER — CONSULTATION OUTCOME TRACKING
          </p>
        </div>
      </footer>
    </div>
  );
}
