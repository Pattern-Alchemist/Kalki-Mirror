'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { useMediaQuery } from '@/hooks/useClientEnv';
import Link from 'next/link';
import { SiddhiCard } from '@/components/archive/SiddhiCard';
import { CautionBadge, getCautionLevel } from '@/components/archive/CautionBadge';
import { siddhiCategoryLabel } from '@/lib/data/tantra-categories';
import type { Siddhi, SiddhiLevel } from '@/lib/data/types';
import type { Archetype } from '@/lib/data/archetypes';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/nav/BackButton';
const AISearchBar = dynamic(() => import('@/components/ai/AISearchBar').then(m => ({ default: m.AISearchBar })), { ssr: false, loading: () => <div className="h-12" /> });
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';

export interface CategoryFacet {
  name: string;
  count: number;
}

export interface ArchivePageProps {
  siddhis: Siddhi[];
  siddhiCount: number;
  mahaVidyas: Archetype[];
  /** Data-derived category facets — only categories that hold folios. */
  categoryFacets: CategoryFacet[];
}

/* ─── Zone Images (Cloudinary) ──────────────────────────────────────── */
const CLOUD_BASE = 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good';

function zoneSrc(w: number, path: string) {
  return `${CLOUD_BASE},w_${w},c_limit/kalki-mirror/${path}`;
}
function zoneSrcSet(path: string) {
  return [640, 768, 1024, 1280, 1920].map(w => `${zoneSrc(w, path)} ${w}w`).join(', ');
}
const ZONE_THRESHOLD = 'archive/banyan-archive-hero';
const ZONE_READING_ROOM = 'archive/sacred-geometry-manuscript';
const ZONE_DEEP = 'tantra/ancient-observatory';

const CAUTION_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'OPEN', label: 'Open' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'HIGH', label: 'High' },
  { value: 'SEALED', label: 'Sealed' },
];

const TIER_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Tiers' },
  { value: 'prithvi', label: 'Prithvi' },
  { value: 'jal', label: 'Jal' },
  { value: 'agni', label: 'Agni' },
  { value: 'akash', label: 'Akash' },
];

/* ─── Filter chip — shared by every facet row ─────────────────────── */
function FilterPill({
  active, onClick, label, count, mono = false, className,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  mono?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-2 text-[0.8125rem] rounded-sm border whitespace-nowrap transition-all duration-300 active:scale-[0.97] min-h-[44px]',
        mono ? 'font-mono tracking-[0.08em] uppercase' : 'font-ui tracking-[0.08em] uppercase',
        active
          ? 'bg-gold text-deep-black border-gold font-medium shadow-[0_0_18px_rgba(212,175,55,0.22)]'
          : 'bg-surface/40 text-foreground/75 border-gold/15 hover:text-gold-dim hover:border-gold/40 hover:bg-surface/60',
        className,
      )}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={cn(
            'text-[0.6875rem] font-mono leading-none px-1.5 py-1 rounded-sm tabular-nums',
            active ? 'bg-deep-black/15 text-deep-black/80' : 'bg-gold/10 text-gold-dim',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Knowledge Light brightness by siddhi level ────────────────── */
const LIGHT_OPACITY: Record<SiddhiLevel, number> = {
  Foundation: 0.7,
  Intermediate: 0.45,
  Advanced: 0.2,
  Restricted: 0.06,
};

/* ─── Knowledge Lights (reduced on mobile for performance) ─────── */
function KnowledgeLights({ siddhis }: { siddhis: Siddhi[] }) {
  const reduced = useNativeReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-10% 0px' });
  // On mobile, only show Foundation lights (fewer animations)
  const isMobile = useMediaQuery('(max-width: 767px)');

  const displaySiddhis = isMobile ? siddhis.filter(s => s.level === 'Foundation').slice(0, 12) : siddhis;

  const positions = useMemo(() => {
    const jitter = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      return (Math.abs(h) % 100) / 100;
    };

    return displaySiddhis.map((s, i) => {
      const col = i % 12;
      const row = Math.floor(i / 12);
      const jx = (jitter(s.slug) - 0.5) * 6;
      const jy = (jitter(s.slug + 'y') - 0.5) * 8;
      return {
        id: s.slug,
        left: `${(col / 11) * 90 + 5 + jx}%`,
        top: `${(row / 3) * 80 + 10 + jy}%`,
        opacity: LIGHT_OPACITY[s.level],
        size: s.level === 'Foundation' ? 3 : s.level === 'Restricted' ? 1.5 : 2,
      };
    });
  }, [displaySiddhis]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {positions.map((p, i) => {
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
              : { opacity: p.opacity * visible, scale: visible }
            }
            transition={{
              delay: i * 0.06,
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            {...(!reduced && !isMobile ? {
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

/* ─── Zone Divider ────────────────────────────────────────────────── */
function ZoneDivider({ label, subtitle, index }: { label: string; subtitle: string; index: number }) {
  const reduced = useNativeReducedMotion();
  return (
    <motion.div
      className="py-16 md:py-24 text-center"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: 0.05 }}
    >
      <span className="block font-mono text-[0.65rem] tracking-[0.3em] text-text-muted/50 mb-4">
        {String(index).padStart(2, '0')}
      </span>
      <p className="section-label mb-4" style={{ letterSpacing: '0.6em' }}>
        {label}
      </p>
      <p className="font-display text-lg md:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed">
        {subtitle}
      </p>
      <div className="divider-gold max-w-[200px] mx-auto mt-8" />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   AKASHIC ARCHIVE — Main Page
   ══════════════════════════════════════════════════════════════ */
export default function ArchivePage({ siddhis: allSiddhis, siddhiCount, mahaVidyas, categoryFacets }: ArchivePageProps) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [cautionFilter, setCautionFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [showCount, setShowCount] = useState(12);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const reduced = useNativeReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Scroll-driven background crossfade ── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Zone 1 (Threshold): visible from 0% → fades out by ~18%
  const thresholdOpacity = useTransform(scrollYProgress, [0, 0.10, 0.18], [1, 1, 0]);
  // Zone 2 (Reading Room): fades in ~14% → fully visible → fades out ~68%
  const readingRoomOpacity = useTransform(
    scrollYProgress,
    [0.12, 0.22, 0.62, 0.72, 0.80],
    [0, 1, 1, 1, 0]
  );
  // Zone 3 (Deep Archive): fades in ~74% → stays to end
  const deepOpacity = useTransform(scrollYProgress, [0.74, 0.84, 1], [0, 1, 1]);
  // Subtle slow zoom across entire scroll
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  /* Filtered set + live facet counts. Each facet row's counts reflect the
     OTHER two dimensions (standard faceted-search semantics), so a visitor
     always sees what each chip would yield before tapping it — no more
     dead-end "Showing 0 of 0" surprises. */
  const { filtered, catCounts, cautionCounts, tierCounts } = useMemo(() => {
    const q = search.toLowerCase();
    const matchSearch = (s: Siddhi) =>
      !q || s.name.toLowerCase().includes(q) || s.sanskrit.toLowerCase().includes(q);
    const catOf = (s: Siddhi) => siddhiCategoryLabel(s.category);
    const cautionOf = (s: Siddhi) => getCautionLevel(s.level);

    const catCounts: Record<string, number> = {};
    const cautionCounts: Record<string, number> = {};
    const tierCounts: Record<string, number> = {};

    for (const s of allSiddhis) {
      if (!matchSearch(s)) continue;
      const passCat = filter === 'All' || catOf(s) === filter;
      const passCaution = cautionFilter === 'all' || cautionOf(s) === cautionFilter;
      const passTier = tierFilter === 'all' || s.minTier === tierFilter;
      if (passCaution && passTier) catCounts[catOf(s)] = (catCounts[catOf(s)] ?? 0) + 1;
      if (passCat && passTier) cautionCounts[cautionOf(s)] = (cautionCounts[cautionOf(s)] ?? 0) + 1;
      if (passCat && passCaution) tierCounts[s.minTier] = (tierCounts[s.minTier] ?? 0) + 1;
    }

    const filtered = allSiddhis.filter((s) => {
      if (!matchSearch(s)) return false;
      if (filter !== 'All' && catOf(s) !== filter) return false;
      if (cautionFilter !== 'all' && cautionOf(s) !== cautionFilter) return false;
      if (tierFilter !== 'all' && s.minTier !== tierFilter) return false;
      return true;
    });

    return {
      filtered,
      catCounts,
      cautionCounts,
      tierCounts,
    };
  }, [filter, search, cautionFilter, tierFilter, allSiddhis]);

  const visible = useMemo(() => filtered.slice(0, showCount), [filtered, showCount]);
  const hasMore = showCount < filtered.length;

  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setShowCount(12);
  };

  const hasActiveFilters = filter !== 'All' || cautionFilter !== 'all' || tierFilter !== 'all' || search !== '';
  const clearAllFilters = () => {
    setFilter('All');
    setCautionFilter('all');
    setTierFilter('all');
    setSearch('');
    setShowCount(12);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { OPEN: 0, MODERATE: 0, HIGH: 0, SEALED: 0 };
    allSiddhis.forEach(s => { c[getCautionLevel(s.level)]++; });
    return c;
  }, [allSiddhis]);

  return (
    <>
    <div ref={containerRef} className="relative bg-deep-black min-h-screen">

      {/* ═══ FIXED BACKGROUND LAYER — Crossfading 3 zones ═══ */}
      {!reduced && (
        <div className="fixed inset-0 z-0 overflow-hidden">
          <motion.div className="absolute inset-0" style={{ opacity: thresholdOpacity, scale: bgScale }}>
            { }
            <img
              src={zoneSrc(1920, ZONE_THRESHOLD)}
              alt=""
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
              sizes="100vw"
              srcSet={zoneSrcSet(ZONE_THRESHOLD)}
              style={{ filter: 'contrast(1.05) saturate(0.8) brightness(0.90) sepia(0.04)' }}
              draggable={false}
            />
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: readingRoomOpacity, scale: bgScale }}>
            { }
            <img
              src={zoneSrc(1920, ZONE_READING_ROOM)}
              alt=""
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
              sizes="100vw"
              srcSet={zoneSrcSet(ZONE_READING_ROOM)}
              style={{ filter: 'contrast(1.05) saturate(0.8) brightness(0.85) sepia(0.04)' }}
              draggable={false}
            />
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: deepOpacity, scale: bgScale }}>
            { }
            <img
              src={zoneSrc(1920, ZONE_DEEP)}
              alt=""
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
              sizes="100vw"
              srcSet={zoneSrcSet(ZONE_DEEP)}
              style={{ filter: 'contrast(1.08) saturate(0.75) brightness(0.78) sepia(0.06)' }}
              draggable={false}
            />
          </motion.div>
          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 3,
              background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 100%)',
            }}
          />
          {/* Film grain */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.035]"
            style={{
              zIndex: 4,
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: '128px 128px',
              mixBlendMode: 'overlay',
            }}
          />
        </div>
      )}

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="relative z-10">

        {/* ═══════════════════════════════════════════════════════════
            ZONE 1 — THE THRESHOLD
            Entering. Almost empty darkness. Architectural entrance.
            ═══════════════════════════════════════════════════════════ */}
        <section className="min-h-screen flex flex-col justify-end">
          {/* Dark scrim for hero text readability */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 70%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.6) 100%)',
            }}
          />

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 md:pb-24 w-full">
            <BackButton href="/" label="Back to Home" className="mb-10" />

            <motion.div
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="section-label mb-6">The Reading Room</p>
              <h1
                className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.95] tracking-[0.06em] mb-6 engraved-heading font-light max-w-3xl"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
              >
                The Akashic Archive
              </h1>
              <p
                className="text-text-secondary text-lg md:text-xl max-w-2xl editorial-spacing text-shadow-deep"
              >
                {siddhiCount} siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access.
              </p>
              <p
                className="text-text-muted text-base max-w-2xl mt-4 editorial-spacing text-shadow-deep leading-relaxed"
              >
                Each folio in the Akashic Archive represents a specific sādhana — a practice with a
                traceable lineage, a defined methodology, and measurable outcomes. Unlike modern
                self-help frameworks that generalize from anecdote, these techniques have been
                field-tested across centuries of continuous practice within living Tantric traditions.
                The Archive does not claim universality; it claims specificity — each siddhi is tagged
                with its source text, its caution level, and the emotional pattern it was designed to
                address. This is a reference system built for precision, not inspiration.
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

            {/* Scroll hint */}
            <motion.div
              className="mt-20 md:mt-28 flex flex-col items-center gap-3"
              initial={reduced ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              <motion.div
                className="w-px h-12 bg-gradient-to-b from-gold/40 to-transparent"
                animate={!reduced ? { opacity: [0.3, 0.8, 0.3], scaleY: [1, 1.2, 1] } : undefined}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="font-mono text-[0.625rem] tracking-[0.3em] text-text-muted/40 uppercase">
                Descend
              </span>
            </motion.div>
          </div>
        </section>

        {/* ── Zone Divider 01→02 ── */}
        <ZoneDivider
          label="THE READING ROOM"
          subtitle="Scrolls of practice, arranged by tradition. Each folio scored for authenticity and lineage. Filter by category, caution level, or tier to find the sādhana that matches your current edge."
          index={1}
        />

        {/* ═══════════════════════════════════════════════════════════
            ZONE 2 — THE ARCHIVE (THE READING ROOM)
            Discovering. Rich shelves, golden knowledge lights.
            The Siddhi grid lives here.
            ═══════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[200vh]">
          {/* Semi-transparent dark scrim for card readability over the crossfading bg */}
          <div className="absolute inset-0 bg-deep-black/30 z-[1] pointer-events-none" />

          {/* 48 Knowledge Lights — ambient glow layer */}
          <KnowledgeLights siddhis={allSiddhis} />

          {/* Content — scrolls over the background */}
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-8 md:py-16">

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

              {/* ── Faceted filter panel ─────────────────────────────
                  Data-driven chips with live counts; only categories that
                  hold folios are offered, and every chip shows what it
                  yields. Identical groups render on mobile (disclosure)
                  and desktop (always visible). */}
              {(() => {
                const filterGroups = (
                  <div className="flex flex-col gap-5">
                    {/* Category row */}
                    <div>
                      <p className="font-mono text-[0.625rem] tracking-[0.2em] uppercase text-foreground/50 mb-2">Tradition</p>
                      <div className="flex flex-wrap gap-2">
                        <FilterPill
                          active={filter === 'All'}
                          onClick={() => handleFilterChange(setFilter, 'All')}
                          label="All"
                          count={categoryFacets.reduce((n, f) => n + (catCounts[f.name] ?? 0), 0)}
                        />
                        {categoryFacets.map((f) => (
                          <FilterPill
                            key={f.name}
                            active={filter === f.name}
                            onClick={() => handleFilterChange(setFilter, f.name)}
                            label={f.name}
                            count={catCounts[f.name] ?? 0}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Caution row */}
                    <div>
                      <p className="font-mono text-[0.625rem] tracking-[0.2em] uppercase text-foreground/50 mb-2">Caution Level</p>
                      <div className="flex flex-wrap gap-2">
                        {CAUTION_FILTERS.map((c) => (
                          <FilterPill
                            key={c.value}
                            mono
                            active={cautionFilter === c.value}
                            onClick={() => handleFilterChange(setCautionFilter, c.value)}
                            label={c.label}
                            count={c.value === 'all'
                              ? CAUTION_FILTERS.slice(1).reduce((n, c2) => n + (cautionCounts[c2.value] ?? 0), 0)
                              : cautionCounts[c.value] ?? 0}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Tier row */}
                    <div>
                      <p className="font-mono text-[0.625rem] tracking-[0.2em] uppercase text-foreground/50 mb-2">Access Tier</p>
                      <div className="flex flex-wrap gap-2">
                        {TIER_FILTERS.map((t) => (
                          <FilterPill
                            key={t.value}
                            mono
                            active={tierFilter === t.value}
                            onClick={() => handleFilterChange(setTierFilter, t.value)}
                            label={t.label}
                            count={t.value === 'all'
                              ? TIER_FILTERS.slice(1).reduce((n, t2) => n + (tierCounts[t2.value] ?? 0), 0)
                              : tierCounts[t.value] ?? 0}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );

                return (
                  <>
                    {/* Mobile: disclosure toggle — reliable button-based
                        (native <details> felt unresponsive on iOS) with a
                        live result count always visible. */}
                    <div className="md:hidden">
                      <button
                        type="button"
                        onClick={() => setMobileFiltersOpen((v) => !v)}
                        aria-expanded={mobileFiltersOpen}
                        aria-controls="archive-filter-panel"
                        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 min-h-[44px] border border-gold/20 bg-surface/40 rounded-sm text-sm font-ui tracking-[0.12em] uppercase text-foreground/85 active:scale-[0.99] transition-all"
                      >
                        <span className="flex items-center gap-2.5">
                          Filters
                          {hasActiveFilters && (
                            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gold text-deep-black text-[0.625rem] font-mono font-semibold">
                              {[filter !== 'All', cautionFilter !== 'all', tierFilter !== 'all', search !== ''].filter(Boolean).length}
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="font-mono text-[0.6875rem] tracking-[0.1em] text-gold-dim normal-case">{filtered.length} folios</span>
                          <span className={cn('text-gold/60 text-xs transition-transform duration-300', mobileFiltersOpen && 'rotate-180')}>{'\u25BC'}</span>
                        </span>
                      </button>
                      {mobileFiltersOpen && (
                        <div id="archive-filter-panel" className="mt-3 p-4 border border-gold/15 bg-deep-black/60 rounded-sm">
                          {filterGroups}
                          {hasActiveFilters && (
                            <button
                              type="button"
                              onClick={clearAllFilters}
                              className="mt-5 w-full py-2.5 min-h-[44px] border border-gold/25 rounded-sm text-[0.75rem] font-mono tracking-[0.15em] uppercase text-gold-dim active:scale-[0.99] transition-transform"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Desktop: always-visible rows */}
                    <div className="hidden md:block">{filterGroups}</div>
                  </>
                );
              })()}

              {/* Result line + active filter summary */}
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-[0.75rem] tracking-[0.12em] uppercase text-foreground/60">
                  Showing <span className="text-gold-dim">{visible.length}</span> of{' '}
                  <span className="text-gold-dim">{filtered.length}</span> {filtered.length === 1 ? 'folio' : 'folios'}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="font-mono text-[0.6875rem] tracking-[0.15em] uppercase text-gold-dim/90 hover:text-gold underline underline-offset-4 decoration-gold/30 transition-colors"
                  >
                    Clear filters ×
                  </button>
                )}
              </div>
            </div>

            {/* Siddhi Grid */}
            <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide mb-8 engraved-heading">Archive Folios</h2>

            {filtered.length === 0 ? (
              /* Empty state — explains WHY the shelf is empty and offers a
                 one-tap way back instead of a silent "Showing 0 of 0". */
              <div className="border border-gold/15 bg-surface/20 rounded-sm px-6 py-16 text-center max-w-xl mx-auto">
                <p className="font-display text-2xl md:text-3xl text-foreground tracking-wide mb-4 engraved-heading">The shelf is empty here</p>
                <p className="text-text-secondary text-sm leading-relaxed editorial-spacing mb-8">
                  The Akashic Archive holds {allSiddhis.length} folios, but none match every
                  filter you have selected. Loosen one filter — or clear them all — to
                  see what the reading room offers.
                </p>
                <button type="button" onClick={clearAllFilters} className="gold-cta text-sm">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </section>

        {/* ── Zone Divider 02→03 ── */}
        <ZoneDivider
          label="THE DEEP ARCHIVE"
          subtitle="Beyond the folios, the architecture of consciousness itself. Ten Mahāvidyās — ten faces of the same divine feminine principle — each governing a distinct karmic loop that shapes how you relate to power, desire, attachment, and dissolution."
          index={2}
        />

        {/* ═══════════════════════════════════════════════════════════
            ZONE 3 — THE DEEP ARCHIVE
            Descending. Darkest, most mysterious. Mahavidyas dwell here.
            ═══════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen">
          {/* Extra darkness for this zone */}
          <div className="absolute inset-0 bg-deep-black/30 z-[1] pointer-events-none" />

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
                  style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
                >
                  Ten Mahāvidyās{' — '} Ten Karmic Loops
                </motion.h2>
                <motion.p
                  className="text-text-muted text-base max-w-xl mt-4 editorial-spacing text-shadow-deep leading-relaxed"
                  initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                  whileInView={fadeInUp.visible}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: 0.15 }}
                >
                  In the KALKI framework, the ten Mahāvidyās are not deities to be worshipped — they are
                  diagnostic archetypes. Each one maps a specific karmic loop: Kali governs dissolution
                  and the fear of annihilation; Tara governs the hunger for rescue and the refusal to
                  self-save; Bhuvaneshwari governs the need to control space and territory. Identifying
                  your dominant Mahāvidyā is the first step toward prescribing the exact sādhana that
                  dissolves that loop at its root.
                </motion.p>
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
              {mahaVidyas.map((a, i) => (
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
        </section>

      </div>

      {/* ═══ CINEMATIC STRIP ═══ */}
      <div className="mt-16">
        <ScrollParallax speed={-0.15} className="cinematic-strip">
          <CinematicImage
            cloudinaryId='kalki-mirror/archive/stone-gateway-hero'
            alt='Ancient stone gateway in forest -- enter the archive'
            kenBurns="normal"
            filmGrain={false}
          />
          <div className="cinematic-strip-overlay" />
        </ScrollParallax>
      </div>

      {/* ═══ CLOSING CTA ═══ */}
      <section className="relative py-24 md:py-36">
        <ScrollParallax speed={-0.06} disabled>
          <CinematicImage
            src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior'
            alt='Ancient stone ashram interior — the repository of forbidden tantric knowledge'
            className="absolute inset-0"
            scrim="full"
            vignette
          />
        </ScrollParallax>
        <div className="absolute inset-0 pointer-events-none z-[1] cta-overlay-dark" />
        <ParallaxText speed={-0.04} className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <p className="section-label mb-6">The Archive is Open</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">
            Every folio has a sādhana.{' '}
            <span style={{ display: 'block' }}>Every sādhana has a gate.</span>
          </h2>
          <p className="text-foreground/70 text-lg mb-12 editorial-spacing text-shadow-deep">
            The Archive is not a library. It is a living system of practice. Each siddhi is a door — and behind every door, a specific discipline awaits.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <WhatsAppCTA variant="inline" message="I want to begin my practice from the Archive." />
            <Link href="/patterns" className="ghost-cta">Pattern Atlas</Link>
          </div>
        </ParallaxText>
      </section>

      {/* ═══ BINDU PULSE FOOTER ═══ */}
      <div className="relative pb-28 md:pb-20 mt-16">
        <div className="atmospheric-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-gold/40 rounded-full bindu-pulse" />
          </div>
          <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper">
            AKASHIC ARCHIVE — LIVING SYSTEM OF PRACTICE
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
