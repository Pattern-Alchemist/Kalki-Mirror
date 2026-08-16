'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BackButton } from '@/components/nav/BackButton';
import { CautionBadge } from '@/components/archive/CautionBadge';
import { CitationCard } from '@/components/dossier/CitationCard';
import { UnattestedState } from '@/components/dossier/UnattestedState';
import { ArchiveRefsLedger } from '@/components/dossier/ArchiveRefsLedger';
import { PrescriptionBlueprint } from '@/components/dossier/PrescriptionBlueprint';
import { TransitReadout } from '@/components/dossier/TransitReadout';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import type { Tier, CautionLevel } from '@/lib/data/types';

// ─── Dossier response type (mirrors /api/initiate) ──────────────────────────

interface Dossier {
  timestamp: string;
  status: string;
  transit: {
    positions: any[];
    frictions: any[];
    yantra_context: string;
  };
  patterns: Array<{
    slug: string;
    name: string;
    subtitle: string;
    description: string;
    signs: string[];
    practice: string;
  }>;
  archetypes: Array<{
    id: string;
    name: string;
    sanskrit: string;
    pattern: string;
    bija: string;
    cautionLevel: CautionLevel;
    image: string;
  }>;
  rag: {
    retrieval_method: string;
    prescription_pool_size: number;
    citation_pool_size: number;
    archive_refs: string[];
    archive_refs_caution: Record<string, string>;
  };
  prescribed_sadhana: Array<{
    slug: string;
    name: string;
    sanskrit: string;
    summary: string;
    primaryMantra: string;
    warnings: string[];
    level: string;
    cautionLevel: string;
  }>;
  karmic_loop: string | null;
  tantric_citation: {
    text: string;
    source_slug: string;
    caution: string;
  } | null;
  yantra_prompt: {
    system_prompt_length: number;
    user_prompt_length: number;
    folio_blocks_injected: number;
    archetype_list_size: number;
  };
  meta: {
    total_folios_available: number;
    open_folios: number;
    archetype_count: number;
    chunk_count: number;
  };
}

// ─── Moon Signs — each maps to its mid-degree for the API ────────────────────

const MOON_SIGNS = [
  { value: 'aries',      label: 'Aries',       sanskrit: 'Meṣa',       midDegree: 15 },
  { value: 'taurus',     label: 'Taurus',      sanskrit: 'Vṛṣabha',    midDegree: 45 },
  { value: 'gemini',     label: 'Gemini',      sanskrit: 'Mithuna',    midDegree: 75 },
  { value: 'cancer',     label: 'Cancer',      sanskrit: 'Karka',      midDegree: 105 },
  { value: 'leo',        label: 'Leo',         sanskrit: 'Siṃha',      midDegree: 135 },
  { value: 'virgo',      label: 'Virgo',       sanskrit: 'Kanyā',      midDegree: 165 },
  { value: 'libra',      label: 'Libra',       sanskrit: 'Tulā',       midDegree: 195 },
  { value: 'scorpio',    label: 'Scorpio',     sanskrit: 'Vṛścika',    midDegree: 225 },
  { value: 'sagittarius', label: 'Sagittarius', sanskrit: 'Dhanu',     midDegree: 255 },
  { value: 'capricorn',  label: 'Capricorn',   sanskrit: 'Makara',     midDegree: 285 },
  { value: 'aquarius',   label: 'Aquarius',    sanskrit: 'Kumbha',     midDegree: 315 },
  { value: 'pisces',     label: 'Pisces',      sanskrit: 'Mīna',       midDegree: 345 },
] as const;

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DossierPage() {
  const reduced = useReducedMotion() ?? false;

  // Form state
  const [query, setQuery] = useState('');
  const [moonSign, setMoonSign] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [natalMoon, setNatalMoon] = useState('');
  const [tier, setTier] = useState<Tier>('prithvi');

  // Dossier state
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runInitiation = useCallback(async () => {
    if (!query.trim() && !moonSign && !natalMoon) return;
    setLoading(true);
    setError(null);

    try {
      const body: Record<string, unknown> = { tier };
      if (query.trim()) body.behavioralQuery = query.trim();
      if (natalMoon) {
        body.natalMoonDeg = parseFloat(natalMoon);
      } else if (moonSign) {
        const sign = MOON_SIGNS.find(s => s.value === moonSign);
        if (sign) body.natalMoonDeg = sign.midDegree;
      }

      const res = await fetch('/api/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Initiation failed');

      setDossier(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The geometry requires recalibration.');
    } finally {
      setLoading(false);
    }
  }, [query, natalMoon, moonSign, tier]);

  return (
    <div className="bg-deep-black min-h-screen relative">
      {/* Cinematic hero background */}
      <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-forgotten-chamber"
          alt="A forgotten ritual chamber deep within an ancient temple, candles and yantras scattered on stone surfaces"
          scrim="full"
          filmGrain={false}
        />
      </div>
      {/* Atmospheric background — CSS gradients layered above the CinematicImage scrim */}
      <div className="atmospheric-bg fixed inset-0 pointer-events-none opacity-40 z-[1]" aria-hidden="true" />

      {/* ═══════════════════════════════════════════════════════════════
          FULL-PAGE INITIATION CEREMONY OVERLAY
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="initiation-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Deep void backdrop */}
            <div className="absolute inset-0 bg-deep-black/95" />
            {/* Radial atmospheric glow behind yantra */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 50% 50% at 50% 45%, rgba(212,175,55,0.04) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col items-center px-6">
              {/* Spinning Yantra — large, centered */}
              <motion.div
                className="w-40 h-40 md:w-52 md:h-52 relative mb-10"
                initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <img
                  src="/kalki-yantra.svg"
                  alt=""
                  className="w-full h-full"
                  style={!reduced ? {
                    animation: 'yantraDraw 2.4s ease-out forwards, yantraSpin 12s linear 2.4s infinite',
                    opacity: 0.35,
                  } : { opacity: 0.35 }}
                  aria-hidden="true"
                />
                {/* Bindu — pulsing center point */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gold/40 rounded-full"
                  style={!reduced ? {
                    animation: 'binduPulse 1.2s ease-in-out 2.4s infinite',
                    boxShadow: '0 0 20px rgba(212,175,55,0.3), 0 0 60px rgba(212,175,55,0.1)',
                  } : undefined}
                  aria-hidden="true"
                />
                {/* Outer ring glow */}
                <div
                  className="absolute inset-[-12px] rounded-full border border-gold/10"
                  style={!reduced ? { animation: 'binduPulse 2.4s ease-in-out 1s infinite' } : undefined}
                  aria-hidden="true"
                />
              </motion.div>

              {/* Ceremony text — sequential reveal */}
              <motion.p
                className="section-label mb-4"
                initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                animate={fadeInUp.visible}
                transition={{ delay: 0.3 }}
              >
                THE INITIATION CEREMONY
              </motion.p>

              <motion.p
                className="text-text-muted text-sm font-mono tracking-[0.15em] text-center max-w-md"
                initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                animate={fadeInUp.visible}
                transition={{ delay: 0.5 }}
              >
                Mapping coordinates against the Akashic Archive…
              </motion.p>

              {/* Animated progress dots — 7 dots in mandala arrangement */}
              <div className="flex justify-center gap-2.5 mt-10">
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--gold)', opacity: 0.3 }}
                    animate={reduced ? {} : {
                      opacity: [0.15, 0.9, 0.15],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      delay: i * 0.18,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              {/* Phase indicators — cycling through ceremonial stages */}
              <motion.div
                className="mt-8 h-4"
                initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <CeremonyPhases reduced={reduced} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ────────────────────────────────────── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 pt-10 md:pt-16">
        <BackButton href="/" label="Back to Home" className="mb-12" />

        <motion.div
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
        >
          <p className="section-label mb-6">The Initiation Sequence</p>
          <h1 className="font-display text-3xl md:text-5xl text-foreground tracking-[0.06em] font-light leading-[1] mb-4 engraved-heading">
            The Dossier
          </h1>
          <p className="text-editorial max-w-2xl">
            A grounded psychological blueprint synthesized from your behavioral coordinates, transit geometry, and the Tantric archive. Every claim traces to a textual witness — or declares itself unattested.
          </p>
        </motion.div>
      </div>

      {/* ── Input Form ────────────────────────────────── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 mt-16">
        <motion.div
          className="glass-panel p-8 md:p-10"
          initial={reduced ? { opacity: 0.8 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <p className="text-caption mb-6" style={{ color: 'var(--gold-dim)' }}>
            INPUT COORDINATES
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); runInitiation(); }}
            className="contents"
          >
          {/* Behavioral Query */}
          <div className="mb-6">
            <label
              htmlFor="behavioral-query"
              className="block font-mono text-xs tracking-[0.12em] uppercase mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Behavioral Query
            </label>
            <textarea
              id="behavioral-query"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Describe the karmic loop you observe in your life..."
              rows={3}
              className="w-full bg-transparent border px-4 py-3 font-body text-sm text-foreground placeholder:text-text-muted resize-none focus:outline-none transition-colors duration-300"
              style={{ borderColor: 'var(--border-subtle)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            />
          </div>

          {/* Moon Sign + Tier row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label
                htmlFor="moon-sign"
                className="block font-mono text-xs tracking-[0.12em] uppercase mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Your Moon Sign (Rāśi)
              </label>
              <p className="text-[0.6875rem] text-text-muted mb-3 leading-relaxed">
                The zodiac sign the Moon occupied at your birth. Check a free birth chart online if unsure.
              </p>
              <select
                id="moon-sign"
                value={moonSign}
                onChange={e => setMoonSign(e.target.value)}
                className="w-full bg-transparent border px-4 py-3 font-body text-sm text-foreground focus:outline-none transition-colors duration-300 appearance-none cursor-pointer"
                style={{
                  borderColor: moonSign ? 'var(--gold)' : 'var(--border-subtle)',
                  background: 'var(--background)',
                }}
              >
                <option value="">Select your Moon Sign…</option>
                {MOON_SIGNS.map(s => (
                  <option key={s.value} value={s.value}>{s.label} — {s.sanskrit}</option>
                ))}
              </select>

              {/* Advanced: precise degree toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="mt-3 text-[0.625rem] font-mono tracking-[0.1em] inline-flex items-center gap-1.5 transition-colors duration-300"
                style={{ color: showAdvanced ? 'var(--gold)' : 'var(--text-muted)' }}
              >
                <span style={{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▸</span>
                {showAdvanced ? 'HIDE PRECISE DEGREE' : 'KNOW YOUR EXACT DEGREE?'}
              </button>
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <input
                      id="natal-moon"
                      type="number"
                      min="0"
                      max="360"
                      step="0.1"
                      value={natalMoon}
                      onChange={e => setNatalMoon(e.target.value)}
                      placeholder="e.g. 45.2"
                      className="w-full bg-transparent border px-4 py-3 font-mono text-sm text-foreground placeholder:text-text-muted focus:outline-none transition-colors duration-300 mt-2"
                      style={{ borderColor: natalMoon ? 'var(--gold)' : 'var(--border-subtle)' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                    />
                    <p className="text-[0.625rem] text-text-muted mt-1.5 leading-relaxed">
                      Overrides the sign selection above. 0° = Aries start, 360° = Pisces end.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label
                htmlFor="tier-select"
                className="block font-mono text-xs tracking-[0.12em] uppercase mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                Covenant Tier (test)
              </label>
              <select
                id="tier-select"
                value={tier}
                onChange={e => setTier(e.target.value as Tier)}
                className="w-full bg-transparent border px-4 py-3 font-mono text-sm text-foreground focus:outline-none transition-colors duration-300 appearance-none cursor-pointer"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--background)',
                }}
              >
                <option value="prithvi">Prithvi</option>
                <option value="jal">Jal</option>
                <option value="agni">Agni</option>
                <option value="akash">Akash</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            onClick={(e) => { e.preventDefault(); runInitiation(); }}
            disabled={loading || (!query.trim() && !moonSign && !natalMoon)}
            tabIndex={loading || (!query.trim() && !moonSign && !natalMoon) ? -1 : 0}
            aria-disabled={loading || (!query.trim() && !moonSign && !natalMoon)}
            className="gold-cta w-full md:w-auto disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
          >
            {loading ? 'COMPUTING GEOMETRY...' : 'INITIATE DOSSIER'}
          </button>

          </form>

          {error && (
            <p className="mt-4 text-sm" style={{ color: 'var(--crimson)' }}>{error}</p>
          )}
        </motion.div>
      </div>

      {/* ── The Dossier Output ── */}
      <AnimatePresence mode="wait">
        {dossier && (
          <motion.div
            key="dossier"
            className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 mt-20 pb-32"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Timestamp + Integrity marker */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <p className="text-caption">
                {new Date(dossier.timestamp).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: dossier.rag.retrieval_method === 'grounded'
                    ? 'var(--gold)' : 'var(--crimson)',
                  opacity: 0.6,
                }}
              />
              <p className="text-caption">
                {dossier.rag.retrieval_method === 'grounded' ? 'RAG-GROUNDED' : 'PATTERN FALLBACK'}
              </p>
            </div>

            {/* ═══════════════════════════════════════
                ZONE A: THE HEADER (THE DIAGNOSIS)
               ═══════════════════════════════════════ */}
            <section className="mb-20">
              <motion.div
                initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                animate={fadeInUp.visible}
              >
                {/* Pattern Name */}
                {dossier.patterns.length > 0 && (
                  <>
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground tracking-[0.08em] font-light leading-[0.95] mb-6 engraved-heading">
                      {dossier.patterns[0].name.toUpperCase()}
                    </h2>
                    {dossier.patterns[0].subtitle && (
                      <p className="text-text-secondary text-lg mb-4">
                        {dossier.patterns[0].subtitle}
                      </p>
                    )}
                  </>
                )}

                {/* Archetype Badge(s) */}
                {dossier.archetypes.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {dossier.archetypes.map(a => (
                      <div
                        key={a.id}
                        className="inline-flex items-center gap-2.5 px-4 py-2 border"
                        style={{ borderColor: 'var(--gold)', opacity: 0.85 }}
                      >
                        <span className="font-mono text-xs tracking-[0.12em]" style={{ color: 'var(--gold)' }}>
                          {a.sanskrit.toUpperCase()} / {a.pattern.toUpperCase()}
                        </span>
                        <CautionBadge level={a.cautionLevel} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Archetype Cinematic Image — full dramatic reveal */}
                {dossier.archetypes.length > 0 && dossier.archetypes[0].image && (
                  <motion.div
                    className="mt-6 relative h-[35vh] md:h-[45vh] overflow-hidden"
                    initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  >
                    <CinematicImage
                      src={dossier.archetypes[0].image}
                      alt={dossier.archetypes[0].name}
                      kenBurns="slow"
                      scrim="bottom"
                      vignette
                      volumetric
                      filmGrain={false}
                    />
                    {/* Archetype name overlay at bottom of image */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-8">
                      <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--gold)' }}>
                        Activated Archetype
                      </p>
                      <p className="font-display text-2xl md:text-3xl text-white font-light tracking-[0.06em]">
                        {dossier.archetypes[0].name}
                      </p>
                      <p className="font-mono text-xs mt-1" style={{ color: 'var(--gold-dim)' }}>
                        {dossier.archetypes[0].sanskrit} — Bīja: {dossier.archetypes[0].bija}
                      </p>
                    </div>
                    {/* Gold corner accents */}
                    <div className="absolute top-0 left-0 w-10 h-10 border-t border-l z-10" style={{ borderColor: 'var(--gold)', opacity: 0.3 }} />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t border-r z-10" style={{ borderColor: 'var(--gold)', opacity: 0.3 }} />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b border-l z-10" style={{ borderColor: 'var(--gold)', opacity: 0.3 }} />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r z-10" style={{ borderColor: 'var(--gold)', opacity: 0.3 }} />
                  </motion.div>
                )}
              </motion.div>

              {/* Transit Geometry readout */}
              <TransitReadout
                frictions={dossier.transit.frictions}
                positions={dossier.transit.positions}
              />
            </section>

            <div className="divider-gold mb-20" />

            {/* ═══════════════════════════════════════
                ZONE B: THE KARMIC LOOP (THE ANALYSIS)
               ═══════════════════════════════════════ */}
            <section className="mb-20">
              <p className="text-caption mb-6" style={{ color: 'var(--gold-dim)' }}>
                PATTERN ANALYSIS
              </p>

              {dossier.karmic_loop ? (
                <motion.div
                  className="pl-6 md:pl-8 border-l-2 py-2"
                  style={{ borderColor: 'var(--copper)' }}
                  initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                  whileInView={fadeInUp.visible}
                  viewport={{ once: true }}
                >
                  <p className="text-editorial max-w-2xl">
                    {dossier.karmic_loop}
                  </p>
                </motion.div>
              ) : (
                <p className="text-text-muted text-sm font-mono">
                  NO PATTERN CLASSIFICATION AVAILABLE — INSUFFICIENT COORDINATES
                </p>
              )}

              {/* Behavioral indicators */}
              {dossier.patterns.length > 0 && dossier.patterns[0].signs.length > 0 && (
                <motion.div
                  className="mt-8"
                  initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
                  whileInView={staggerContainer.visible}
                  viewport={{ once: true }}
                >
                  <p className="text-caption mb-4" style={{ color: 'var(--text-muted)' }}>
                    BEHAVIORAL INDICATORS DETECTED
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dossier.patterns[0].signs.map((sign) => (
                      <motion.span
                        key={sign}
                        className="font-mono text-[0.65rem] tracking-wider uppercase px-3 py-1.5 border"
                        style={{
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--text-secondary)',
                        }}
                        variants={staggerItem}
                      >
                        {sign}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </section>

            <div className="divider-gold mb-20" />

            {/* ═══════════════════════════════════════
                ZONE C: THE PRESCRIPTION (OPEN SADHANA)
               ═══════════════════════════════════════ */}
            <section className="mb-20">
              <PrescriptionBlueprint sadhanas={dossier.prescribed_sadhana} />
            </section>

            <div className="divider-gold mb-20" />

            {/* ═══════════════════════════════════════
                ZONE D: THE TRUST LOOP (CITATIONS & WITNESSES)
               ═══════════════════════════════════════ */}
            <section className="mb-12">
              <p className="text-caption mb-8" style={{ color: 'var(--gold-dim)' }}>
                TEXTUAL GROUNDING
              </p>

              {dossier.tantric_citation ? (
                <CitationCard
                  text={dossier.tantric_citation.text}
                  sourceSlug={dossier.tantric_citation.source_slug}
                  caution={dossier.tantric_citation.caution as CautionLevel}
                />
              ) : (
                <UnattestedState />
              )}
            </section>

            {/* Archive Refs Ledger */}
            <ArchiveRefsLedger
              refs={dossier.rag.archive_refs}
              refsCaution={dossier.rag.archive_refs_caution || {}}
              userTier={tier}
            />

            {/* ── Meta footer ── */}
            <div className="mt-20 pt-8 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-caption mb-1">FOLIOS IN ARCHIVE</p>
                  <p className="font-mono text-lg text-foreground"><AnimatedCounter target={dossier.meta.total_folios_available} /></p>
                </div>
                <div>
                  <p className="text-caption mb-1">CHUNKS INJECTED</p>
                  <p className="font-mono text-lg text-foreground"><AnimatedCounter target={dossier.yantra_prompt.folio_blocks_injected} /></p>
                </div>
                <div>
                  <p className="text-caption mb-1">ARCHETYPES</p>
                  <p className="font-mono text-lg text-foreground"><AnimatedCounter target={dossier.meta.archetype_count} /></p>
                </div>
                <div>
                  <p className="text-caption mb-1">RETRIEVAL</p>
                  <p
                    className="font-mono text-lg"
                    style={{
                      color: dossier.rag.retrieval_method === 'grounded'
                        ? 'var(--gold)' : 'var(--crimson)',
                    }}
                  >
                    {dossier.rag.retrieval_method.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Ceremony Phase Cycler ──────────────────────────────────────────────────
const CEREMONY_PHASES = [
  'Aligning natal coordinates…',
  'Scanning transit geometry…',
  'Querying the Akashic Archive…',
  'Cross-referencing textual witnesses…',
  'Synthesizing pattern intelligence…',
  'Calibrating the Dossier…',
];

function CeremonyPhases({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setPhase(p => (p + 1) % CEREMONY_PHASES.length);
    }, 2400);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={phase}
        className="text-[0.65rem] font-mono tracking-[0.15em] text-center"
        style={{ color: 'var(--gold-dim)' }}
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {CEREMONY_PHASES[phase]}
      </motion.p>
    </AnimatePresence>
  );
}
