'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, useInView, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { SiddhiCard } from '@/components/archive/SiddhiCard';
import { CautionBadge, getCautionLevel } from '@/components/archive/CautionBadge';
import { allSiddhis, SIDDHI_COUNT } from '@/lib/data/siddhis';
import { TEN_MAHAVIDYAS, ACCESS_LABELS, type CautionLevel as ArchCaution } from '@/lib/data/archetypes';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/motion/tokens';
import type { SiddhiLevel, Tier } from '@/lib/data/types';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/nav/BackButton';
import { AISearchBar } from '@/components/ai/AISearchBar';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { CinematicImage } from '@/components/ui/CinematicImage';

// ─── Zone Images (Cloudinary) ────────────────────────────────────────
const CLOUD = 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/archive-zone';
const ZONE_THRESHOLD = `${CLOUD}/threshold`;
const ZONE_READING_ROOM = `${CLOUD}/reading-room`;
const ZONE_DEEP = `${CLOUD}/deep-archive`;

const CATEGORIES = ['All', 'Mantra', 'Yantra', 'Prāṇāyāma', 'Ritual', 'Tantra', 'Meditation', 'Dhāraṇā'];
const CAUTION_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'OPEN', label: 'Open' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'HIGH', label: 'High' },
  { value: 'SEALED', label: 'Sealed' },
];

const TIER_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Tiers' },
  { value: 'prithvi', label: 'Antechamber' },
  { value: 'jal', label: 'Initiate' },
  { value: 'agni', label: 'Practitioner' },
  { value: 'akash', label: 'The Vault' },
];

// ─── Knowledge Light brightness by siddhi level ──────────────────
const LIGHT_OPACITY: Record<SiddhiLevel, number> = {
  Foundation: 0.7,
  Intermediate: 0.45,
  Advanced: 0.2,
  Restricted: 0.06,
};

// ─── 48 Knowledge Lights ──────────────────────────────────────────
/**
 * A field of 48 tiny warm light dots distributed in a loose grid.
 * Brightness maps to siddhi level — Foundation glows warmest,
 * Restricted barely visible. Subtle pulse on scroll-reveal.
 */
function KnowledgeLights({ siddhis }: { siddhis: typeof allSiddhis }) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-10% 0px' });

  // Pre-compute positions in a 12×4 grid with organic jitter
  const positions = useMemo(() => {
    // Deterministic pseudo-random jitter using slug hash
    const jitter = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      return (Math.abs(h) % 100) / 100;
    };

    return siddhis.map((s, i) => {
      const col = i % 12;
      const row = Math.floor(i / 12);
      const jx = (jitter(s.slug) - 0.5) * 6; // ±3% horizontal jitter
      const jy = (jitter(s.slug + 'y') - 0.5) * 8; // ±4% vertical jitter
      return {
        id: s.slug,
        left: `${(col / 11) * 90 + 5 + jx}%`,
        top: `${(row / 3) * 80 + 10 + jy}%`,
        opacity: LIGHT_OPACITY[s.level],
        size: s.level === 'Foundation' ? 3 : s.level === 'Restricted' ? 1.5 : 2,
      };
    });
  }, [siddhis]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {positions.map((p, i) => {
        const delay = i * 0.06;
        const visible = inView ? 1 : 0;
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              backgroundColor: 'var(--gold)',
            }}
            initial={reduced ? { opacity: p.opacity } : { opacity: 0, scale: 0 }}
            animate={reduced
              ? { opacity: p.opacity }
              : {
                  opacity: p.opacity * visible,
                  scale: visible,
                }
            }
            transition={{
              delay,
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            // Continuous subtle pulse after reveal
            {...(!reduced ? {
              whileInView: {
                opacity: [p.opacity * 0.6, p.opacity, p.opacity * 0.6],
                transition: {
                  duration: 4 + (i % 5),
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.15,
                },
              },
              viewport: { once: false, margin: '-20% 0px' },
            } : {})}
          />
        );
      })}
    </div>
  );
}

// ─── Zone Divider ──────────────────────────────────────────────────
function ZoneDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-8">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />\n      <span className="font-mono text-[0.6875rem] tracking-[0.25em] uppercase text-gold-dim/50">
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────
export default function ArchivePage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [cautionFilter, setCautionFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [showCount, setShowCount] = useState(12);
  const reduced = useReducedMotion();

  const filtered = useMemo(() => {
    return allSiddhis.filter((s) => {
      const matchCat = filter === 'All' || s.category === filter;
      const q = search.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.sanskrit.toLowerCase().includes(q);
      const caution = getCautionLevel(s.level);
      const matchCaution = cautionFilter === 'all' || caution === cautionFilter;
      const matchTier = tierFilter === 'all' || s.minTier === tierFilter;
      return matchCat && matchSearch && matchCaution && matchTier;
    });
  }, [filter, search, cautionFilter, tierFilter]);

  const visible = useMemo(() => filtered.slice(0, showCount), [filtered, showCount]);
  const hasMore = showCount < filtered.length;

  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setShowCount(12);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { OPEN: 0, MODERATE: 0, HIGH: 0, SEALED: 0 };
    allSiddhis.forEach(s => { c[getCautionLevel(s.level)]++; });
    return c;
  }, []);

  return (
    <div className="bg-deep-black min-h-screen">

      {/* ═══════════════════════════════════════════════════════════
          ZONE 1 — THE THRESHOLD
          Entering. Almost empty darkness. Architectural entrance.
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex flex-col justify-end overflow-hidden">
        {/* Background — Zone 1 */}
        <div className="absolute inset-0 z-0">
          <CinematicImage
            src={ZONE_THRESHOLD}
            alt="The Threshold — entering the Akashic Archive"
            fill
            scrim="full"
            vignette
            fog
            filmGrain={false}
          />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 md:pb-24 w-full">
          <BackButton href="/" label="Back to Home" className="mb-10" />

          <motion.div
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="section-label mb-6">The Reading Room</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.95] tracking-[0.06em] mb-6 engraved-heading font-light max-w-3xl">
              The Akashic Archive
            </h1>
            <p className="text-text-secondary text-lg md:text-xl max-w-2xl editorial-spacing">
              {SIDDHI_COUNT} siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access.
            </p>
          </motion.div>

          {/* Stats ledger */}
          <motion.div
            className="flex flex-wrap gap-6 md:gap-12 mt-12"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            {(['OPEN', 'MODERATE', 'HIGH', 'SEALED'] as const).map((level) => (
              <div key={level} className="flex items-center gap-3">
                <CautionBadge level={level} />
                <AnimatedCounter target={counts[level]} className="font-mono text-[0.8125rem] tracking-[0.12em] text-text-muted" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ZONE 2 — THE ARCHIVE (THE READING ROOM)
          Discovering. Rich shelves, golden knowledge lights.
          The Siddhi grid lives here.
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        {/* Zone transition label */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <ZoneDivider label="Descending into the Archive" />
        </div>

        {/* Parallax background — Reading Room */}
        <div className="relative">
          {/* Fixed background layer with Ken Burns */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0">
              <CinematicImage
                src={ZONE_READING_ROOM}
                alt="The Reading Room"
                fill
                filmGrain={false}
                scrim="full"
                vignette
                fog
              />
            </div>
            {/* Extra darkening scrim for card readability */}
            <div className="absolute inset-0 bg-deep-black/40" />
          </div>

          {/* 48 Knowledge Lights — ambient glow layer */}
          <KnowledgeLights siddhis={allSiddhis} />

          {/* Content — scrolls over the background */}
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-16 md:py-24">

            {/* Search + Filters */}
            <div className="flex flex-col gap-5 mb-12">
              <AISearchBar />

              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Query the Akasha..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowCount(12); }}
                  className="flex-1 bg-surface/50 border border-gold/10 rounded-sm px-5 py-3.5 text-foreground placeholder-text-secondary focus:outline-none focus:border-gold/30 font-body text-sm transition-colors duration-500"
                  aria-label="Search siddhis"
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleFilterChange(setFilter, cat)}
                      className={cn(
                        'px-3.5 py-2 text-[0.8125rem] font-ui tracking-[0.1em] uppercase rounded-sm transition-all duration-400 neon-chip-glow',
                        filter === cat
                          ? 'bg-gold text-deep-black'
                          : 'bg-surface/30 text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  {CAUTION_FILTERS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleFilterChange(setCautionFilter, c.value)}
                      className={cn(
                        'px-3.5 py-2 text-[0.8125rem] font-mono tracking-[0.1em] uppercase rounded-sm transition-all duration-400 neon-chip-glow',
                        cautionFilter === c.value
                          ? 'bg-gold text-deep-black'
                          : 'text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <span className="hidden md:block text-text-muted/30">{'·'}</span>

                <div className="flex flex-wrap gap-2">
                  {TIER_FILTERS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => handleFilterChange(setTierFilter, t.value)}
                      className={cn(
                        'px-3.5 py-2 text-[0.8125rem] font-mono tracking-[0.1em] uppercase rounded-sm transition-all duration-400 neon-chip-glow',
                        tierFilter === t.value
                          ? 'bg-gold text-deep-black'
                          : 'text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-caption mb-12">
              Showing {visible.length} of {filtered.length}
            </p>

            {/* Siddhi Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
              animate={staggerContainer.visible}
            >
              <AnimatePresence mode="popLayout">
                {visible.map((s) => (
                  <motion.div
                    key={s.slug}
                    layout
                    variants={staggerItem}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.96 }}
                  >
                    <SiddhiCard siddhi={s} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setShowCount(prev => prev + 12)}
                  className="ghost-cta text-sm"
                >
                  Load More ({filtered.length - visible.length} remaining)
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ZONE 3 — THE DEEP ARCHIVE
          Descending. Darkest, most mysterious. Mahavidyas dwell here.
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative">
        {/* Zone transition label */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <ZoneDivider label="The Pattern Taxonomy" />
        </div>

        {/* Background — Deep Archive */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <CinematicImage
              src={ZONE_DEEP}
              alt="The Deep Archive"
              fill
              filmGrain={false}
              scrim="full"
              vignette
              fog
            />
          </div>
          {/* Extra darkness for this zone */}
          <div className="absolute inset-0 bg-deep-black/50 z-[1]" />

          {/* Content */}
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-16 md:py-24">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div>
                <motion.p
                  className="section-label mb-4"
                  initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                  whileInView={fadeInUp.visible}
                  viewport={{ once: true, margin: '-60px' }}
                >
                  Ten Karmic Loops
                </motion.p>
                <motion.h2
                  className="font-display text-4xl md:text-5xl text-foreground font-light tracking-[0.06em] engraved-heading"
                  initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                  whileInView={fadeInUp.visible}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: 0.1 }}
                >
                  Ten Mahāvidyās{' — '} Ten Karmic Loops
                </motion.h2>
              </div>
              <motion.div
                initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                whileInView={fadeInUp.visible}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  href="/archetypes"
                  className="ghost-cta inline-block w-fit"
                >
                  Enter the Wheel
                </Link>
              </motion.div>
            </div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-5 gap-4"
              initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
              whileInView={staggerContainer.visible}
              viewport={{ once: true, margin: '-40px' }}
            >
              {TEN_MAHAVIDYAS.map((a, i) => (
                <motion.div key={a.id} variants={staggerItem}>
                  <Link
                    href={`/archetypes#${a.id}`}
                    className="glass-chip p-5 group text-center block"
                  >
                    <p className="font-mono text-[0.75rem] text-gold-dim mb-2 tracking-[0.2em]">
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <p className="font-display text-2xl text-foreground group-hover:text-gold transition-colors duration-500 font-light">
                      {a.name}
                    </p>
                    <p className="font-mono text-[0.75rem] text-text-muted mt-1.5 tracking-[0.1em] line-clamp-2">
                      {a.pattern}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom breathing space — the archive descends into shadow */}
            <div className="h-32 md:h-48" />
          </div>
        </div>
      </section>

    </div>
  );
}
