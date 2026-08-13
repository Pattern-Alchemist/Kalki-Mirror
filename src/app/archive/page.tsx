'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion';
import Link from 'next/link';
import { SiddhiCard } from '@/components/archive/SiddhiCard';
import { CautionBadge, getCautionLevel } from '@/components/archive/CautionBadge';
import { allSiddhis, SIDDHI_COUNT } from '@/lib/data/siddhis';
import { resolveCategory } from '@/lib/data/tantra-categories';
import { TEN_MAHAVIDYAS } from '@/lib/data/archetypes';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/motion/tokens';
import type { SiddhiLevel } from '@/lib/data/types';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/nav/BackButton';
const AISearchBar = dynamic(() => import('@/components/ai/AISearchBar').then(m => ({ default: m.AISearchBar })), { ssr: false, loading: () => <div className="h-12" /> });
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';

/* ─── Zone Images (Cloudinary) ──────────────────────────────────────── */
const CLOUD_BASE = 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good';

function zoneSrc(w: number, path: string) {
  return `${CLOUD_BASE},w_${w},c_limit/kalki-mirror/${path}`;
}
function zoneSrcSet(path: string) {
  return [640, 768, 1024, 1280, 1920].map(w => `${zoneSrc(w, path)} ${w}w`).join(', ');
}
const ZONE_THRESHOLD = 'home/forgotten-forest-shrine';
const ZONE_READING_ROOM = 'archive/sacred-geometry-manuscript';
const ZONE_DEEP = 'tantra/ancient-observatory';

const CATEGORIES = ['All', 'Mantra', 'Yantra', 'Prāṇāyāma', 'Pūjā', 'Tantra', 'Dhyāna', 'Dhāraṇā', 'Dhūni', 'Śmaśāna', 'Aghora'];
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

/* ─── Knowledge Light brightness by siddhi level ────────────────── */
const LIGHT_OPACITY: Record<SiddhiLevel, number> = {
  Foundation: 0.7,
  Intermediate: 0.45,
  Advanced: 0.2,
  Restricted: 0.06,
};

/* ─── Knowledge Lights (reduced on mobile for performance) ─────── */
function KnowledgeLights({ siddhis }: { siddhis: typeof allSiddhis }) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-10% 0px' });
  // On mobile, only show Foundation lights (fewer animations)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

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
  const reduced = useReducedMotion();
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
export default function ArchivePage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [cautionFilter, setCautionFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [showCount, setShowCount] = useState(12);
  const reduced = useReducedMotion();
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

  const filtered = useMemo(() => {
    return allSiddhis.filter((s) => {
      const matchCat = filter === 'All' || s.category === filter || resolveCategory(s.category) === filter.toLowerCase();
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
    <>
    <main ref={containerRef} className="relative bg-deep-black min-h-screen">

      {/* ═══ FIXED BACKGROUND LAYER — Crossfading 3 zones ═══ */}
      {!reduced && (
        <div className="fixed inset-0 z-0 overflow-hidden">
          <motion.div className="absolute inset-0" style={{ opacity: thresholdOpacity, scale: bgScale }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ZONE_THRESHOLD}
              alt=""
              className="w-full h-full object-cover"
              sizes="100vw"
              srcSet={ZONE_THRESHOLD.includes('cloudinary') ? undefined : undefined}
              style={{ filter: 'contrast(1.05) saturate(0.8) brightness(0.90) sepia(0.04)' }}
              draggable={false}
            />
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: readingRoomOpacity, scale: bgScale }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoneSrc(1920, ZONE_READING_ROOM)}
              alt=""
              className="w-full h-full object-cover"
              sizes="100vw"
              srcSet={zoneSrcSet(ZONE_READING_ROOM)}
              style={{ filter: 'contrast(1.05) saturate(0.8) brightness(0.85) sepia(0.04)' }}
              draggable={false}
            />
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: deepOpacity, scale: bgScale }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoneSrc(1920, ZONE_DEEP)}
              alt=""
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
                className="text-text-secondary text-lg md:text-xl max-w-2xl editorial-spacing"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
              >
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
          subtitle="Scrolls of practice, arranged by tradition. Each folio scored for authenticity and lineage."
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

              {/* Mobile: collapsible filter panel — 24 buttons is too many for horizontal scroll */}
              <details className="md:hidden border border-gold/10 rounded-sm mb-4">
                <summary className="px-4 py-3.5 text-sm font-ui tracking-[0.1em] uppercase text-text-muted cursor-pointer list-none flex items-center justify-between min-h-[44px]">
                  <span>Filter Archive</span>
                  <span className="text-gold/40 text-xs">{'\u25BC'}</span>
                </summary>
                <div className="px-4 pb-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleFilterChange(setFilter, cat)}
                        className={cn(
                          'px-3.5 py-2 text-[0.8125rem] font-ui tracking-[0.1em] uppercase rounded-sm transition-all duration-400 min-h-[44px]',
                          filter === cat
                            ? 'bg-gold text-deep-black'
                            : 'bg-surface/30 text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CAUTION_FILTERS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => handleFilterChange(setCautionFilter, c.value)}
                        className={cn(
                          'px-3.5 py-2 text-[0.8125rem] font-mono tracking-[0.1em] uppercase rounded-sm transition-all duration-400 min-h-[44px]',
                          cautionFilter === c.value
                            ? 'bg-gold text-deep-black'
                            : 'text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TIER_FILTERS.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => handleFilterChange(setTierFilter, t.value)}
                        className={cn(
                          'px-3.5 py-2 text-[0.8125rem] font-mono tracking-[0.1em] uppercase rounded-sm transition-all duration-400 min-h-[44px]',
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
              </details>

              {/* Desktop: always-visible filter rows */}
              <div className="hidden md:flex md:items-center gap-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1 snap-x snap-mandatory">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleFilterChange(setFilter, cat)}
                      className={cn(
                        'px-3.5 py-2 text-[0.8125rem] font-ui tracking-[0.1em] uppercase rounded-sm transition-all duration-400 neon-chip-glow min-h-[44px]',
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

              <div className="hidden md:flex md:items-center gap-4">
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1 snap-x snap-mandatory">
                  {CAUTION_FILTERS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleFilterChange(setCautionFilter, c.value)}
                      className={cn(
                        'px-3.5 py-2 text-[0.8125rem] font-mono tracking-[0.1em] uppercase rounded-sm transition-all duration-400 neon-chip-glow min-h-[44px]',
                        cautionFilter === c.value
                          ? 'bg-gold text-deep-black'
                          : 'text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <span className="text-text-muted/30">{'\u00B7'}</span>

                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1 snap-x snap-mandatory">
                  {TIER_FILTERS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => handleFilterChange(setTierFilter, t.value)}
                      className={cn(
                        'px-3.5 py-2 text-[0.8125rem] font-mono tracking-[0.1em] uppercase rounded-sm transition-all duration-400 neon-chip-glow min-h-[44px]',
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
            <h2 className="sr-only">Archive Folios</h2>
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
        </section>

        {/* ── Zone Divider 02→03 ── */}
        <ZoneDivider
          label="THE DEEP ARCHIVE"
          subtitle="Beyond the folios, the architecture of consciousness itself. Ten karmic loops. Ten Mahāvidyās."
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
        </section>

      </div>

      {/* ═══ CINEMATIC STRIP ═══ */}
      <div className="mt-16">
        <ScrollParallax speed={-0.15} className="cinematic-strip">
          <CinematicImage
            src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/'
            alt='Ancient temple corridor'
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
            src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/underground-library'
            alt='Ancient codex with golden illumination'
            className="absolute inset-0"
            scrim="full"
            vignette
          />
        </ScrollParallax>
        <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: 'rgba(0,0,0,0.75)' }} />
        <ParallaxText speed={-0.04} className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <p className="section-label mb-6">The Archive is Open</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">
            Every folio has a sādhana.<br/>Every sādhana has a gate.
          </h2>
          <p className="text-foreground/70 text-lg mb-12 editorial-spacing" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
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
            <div className="w-3 h-3 bg-gold/40 rounded-full" style={{ animation: 'binduPulse 2s ease-in-out infinite' }} />
          </div>
          <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper">
            AKASHIC ARCHIVE — LIVING SYSTEM OF PRACTICE
          </p>
        </div>
      </div>
    </main>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'The Akashic Archive — Siddhi Collection',
          description: allSiddhis.length + ' siddhis across 16 archetypes',
          numberOfItems: allSiddhis.length,
          itemListElement: allSiddhis.slice(0, 20).map(function(s, i) {
            return {
              '@type': 'ListItem',
              position: i + 1,
              name: s.name,
              url: 'https://www.astrokalki.com/archive/' + s.slug,
            };
          }),
        }),
      }}
    />
    </>
  );
}
