'use client';

import { useState, useMemo, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { PatternCard } from '@/components/patterns/PatternCard';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';
import { BackButton } from '@/components/nav/BackButton';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Cloudinary Zone Backgrounds ── */
const ZONE_MIRROR = 'kalki-mirror/pattern-atlas/zone-mirror';
const ZONE_CONFRONTATION = 'kalki-mirror/pattern-atlas/zone-confrontation';
const ZONE_DISSOLUTION = 'kalki-mirror/pattern-atlas/zone-dissolution';

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
function cloudUrl(id: string) {
  if (!CLOUD) return '';
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto:good,w_1920,c_limit/${id}`;
}

/* ── Derived Data ── */
const allArchetypes = Array.from(
  new Set(
    allPatterns.flatMap((p) => {
      const siddhis = p.relatedSiddhis
        .map((slug) => allSiddhis.find((s) => s.slug === slug))
        .filter(Boolean);
      return siddhis.map((s) => s.category);
    })
  )
).filter(Boolean);

const siddhiSlugSet = new Set(allPatterns.flatMap((p) => p.relatedSiddhis));

/* Split patterns into narrative zones */
const ZONE_RECOGNITION = allPatterns.slice(0, 4);
const ZONE_CONFRONTATION_PATTERNS = allPatterns.slice(4, 8);
const ZONE_DISSOLUTION_PATTERNS = allPatterns.slice(8, 12);

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════ */

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
      <h2 className="section-label mb-4" style={{ letterSpacing: '0.6em' }}>
        {label}
      </h2>
      <p className="font-display text-lg md:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed">
        {subtitle}
      </p>
      <div className="divider-gold max-w-[200px] mx-auto mt-8" />
    </motion.div>
  );
}

function PatternZone({ patterns }: { patterns: typeof allPatterns }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
      initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
      whileInView={staggerContainer.visible}
      viewport={{ once: true, margin: '-60px' }}
    >
      {patterns.map((p) => (
        <motion.div key={p.slug} variants={staggerItem}>
          <PatternCard pattern={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function FilteredGrid({ patterns, clearFilters }: { patterns: typeof allPatterns; clearFilters: () => void }) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      {patterns.length > 0 ? (
        <motion.div
          key={patterns.map((p) => p.slug).join('-')}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          animate={staggerContainer.visible}
        >
          {patterns.map((p) => (
            <motion.div key={p.slug} variants={staggerItem} layout>
              <PatternCard pattern={p} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          className="text-center py-24"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="font-mono text-sm text-text-muted tracking-[0.2em] uppercase mb-4">
            No patterns match your query
          </p>
          <button onClick={clearFilters} className="ghost-cta text-sm">
            Reset Filters
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════
   PATTERN ATLAS — Main Page
   ══════════════════════════════════════════════════════════════ */
export default function PatternsPage() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [activeArchetype, setActiveArchetype] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'most-linked' | 'name'>('default');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...allPatterns];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.signs.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (activeArchetype) {
      result = result.filter((p) => {
        const siddhis = p.relatedSiddhis
          .map((slug) => allSiddhis.find((s) => s.slug === slug))
          .filter(Boolean);
        return siddhis.some((s) => s.category === activeArchetype);
      });
    }
    if (sortBy === 'most-linked') {
      result.sort((a, b) => b.relatedSiddhis.length - a.relatedSiddhis.length);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [search, activeArchetype, sortBy]);

  const hasActiveFilters = search.trim() !== '' || activeArchetype !== null;
  const isNarrativeMode = !hasActiveFilters && sortBy === 'default';

  const clearFilters = () => {
    setSearch('');
    setActiveArchetype(null);
    setSortBy('default');
  };

  /* ── Scroll-driven background crossfade ── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const mirrorOpacity = useTransform(scrollYProgress, [0, 0.12, 0.20], [1, 1, 0]);
  const confrontationOpacity = useTransform(
    scrollYProgress,
    [0.14, 0.24, 0.50, 0.58, 0.66],
    [0, 1, 1, 1, 0]
  );
  const dissolutionOpacity = useTransform(scrollYProgress, [0.60, 0.72, 1], [0, 1, 1]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <div ref={containerRef} className="relative bg-deep-black">
      {/* ═══ FIXED BACKGROUND LAYER ═══ */}
      {!reduced && (
        <div className="fixed inset-0 z-0 overflow-hidden">
          <motion.div className="absolute inset-0" style={{ opacity: mirrorOpacity, scale: bgScale }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudUrl(ZONE_MIRROR)}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'contrast(1.08) saturate(0.85) brightness(0.92) sepia(0.06)' }}
              draggable={false}
            />
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: confrontationOpacity, scale: bgScale }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudUrl(ZONE_CONFRONTATION)}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'contrast(1.08) saturate(0.85) brightness(0.88) sepia(0.06)' }}
              draggable={false}
            />
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: dissolutionOpacity, scale: bgScale }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudUrl(ZONE_DISSOLUTION)}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'contrast(1.08) saturate(0.85) brightness(0.85) sepia(0.06)' }}
              draggable={false}
            />
          </motion.div>
          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 3,
              background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)',
            }}
          />
          {/* Film grain */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
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
        {/* ── ZONE 0: THE MIRROR — Hero ── */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%)',
            }}
          />
          <div className="relative z-10 max-w-3xl mx-auto">
            <BackButton href="/" label="Back to Home" className="mb-10 justify-center" />
            <motion.p
              className="section-label mb-6"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
            >
              The Mirror Method
            </motion.p>
            <motion.h1
              className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] tracking-[0.08em] mb-6 hero-heading uppercase"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              Pattern Atlas
            </motion.h1>
            <motion.p
              className="font-display text-xl md:text-2xl lg:text-3xl text-text-secondary leading-relaxed mb-4"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              The emotional patterns that run your life.
            </motion.p>
            <motion.p
              className="text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              and the sādhanas designed to dissolve them.
            </motion.p>
            <motion.div
              className="mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              <div className="flex flex-col items-center gap-2 text-text-muted/40">
                <span className="font-mono text-[0.6rem] tracking-[0.3em] uppercase">Scroll to Enter</span>
                <motion.div
                  className="w-px h-8 bg-gradient-to-b from-gold/30 to-transparent"
                  animate={reduced ? {} : { scaleY: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── SEARCH & FILTER BAR ── */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.div
            className="mb-8"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patterns, signs, or keywords..."
                  className="w-full pl-11 pr-10 py-2.5 bg-surface/60 backdrop-blur-md border border-gold/10 rounded-sm text-foreground font-ui text-sm tracking-wide placeholder:text-text-muted/50 focus:outline-none focus:border-gold/30 transition-colors duration-300"
                  aria-label="Search patterns"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-gold transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-[0.65rem] font-ui tracking-[0.15em] uppercase rounded-sm transition-all duration-300',
                  showFilters || hasActiveFilters
                    ? 'bg-gold/10 text-gold border border-gold/30'
                    : 'bg-surface/60 backdrop-blur-md text-text-muted border border-gold/5 hover:border-gold/20 hover:text-gold-dim'
                )}
                aria-expanded={showFilters}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2.5 bg-surface/60 backdrop-blur-md border border-gold/5 rounded-sm text-[0.65rem] font-ui tracking-[0.15em] uppercase text-text-muted focus:outline-none focus:border-gold/20 transition-colors appearance-none cursor-pointer"
                aria-label="Sort patterns"
              >
                <option value="default">Narrative Order</option>
                <option value="most-linked">Most Linked</option>
                <option value="name">Alphabetical</option>
              </select>
              {hasActiveFilters ? (
                <div className="flex items-center gap-4 ml-auto">
                  <span className="font-mono text-[0.7rem] tracking-[0.15em] text-text-muted">
                    {filtered.length} OF {allPatterns.length}
                  </span>
                  <motion.button
                    initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={clearFilters}
                    className="text-[0.65rem] font-ui tracking-[0.15em] uppercase text-copper hover:text-gold transition-colors"
                  >
                    Clear All
                  </motion.button>
                </div>
              ) : (
                <span className="font-mono text-[0.7rem] tracking-[0.15em] text-text-muted/50 ml-auto">
                  {allPatterns.length} PATTERNS
                </span>
              )}
            </div>
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={reduced ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveArchetype(null)}
                      className={cn(
                        'px-4 py-2 text-[0.6rem] font-ui tracking-[0.15em] uppercase rounded-sm transition-all duration-300',
                        activeArchetype === null
                          ? 'neon-chip-glow bg-gold/15 text-gold border border-gold/40'
                          : 'bg-surface/60 text-text-muted border border-gold/5 hover:border-gold/20 hover:text-gold-dim'
                      )}
                    >
                      All Categories
                    </button>
                    {allArchetypes.map((cat) => {
                      const count = allPatterns.filter((p) => {
                        const siddhis = p.relatedSiddhis
                          .map((slug) => allSiddhis.find((s) => s.slug === slug))
                          .filter(Boolean);
                        return siddhis.some((s) => s.category === cat);
                      }).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveArchetype(activeArchetype === cat ? null : cat)}
                          className={cn(
                            'px-4 py-2 text-[0.6rem] font-ui tracking-[0.15em] uppercase rounded-sm transition-all duration-300',
                            activeArchetype === cat
                              ? 'neon-chip-glow bg-gold/15 text-gold border border-gold/40'
                              : 'bg-surface/60 text-text-muted border border-gold/5 hover:border-gold/20 hover:text-gold-dim'
                          )}
                        >
                          {cat} <span className="ml-1 opacity-50">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ═══ NARRATIVE MODE — Zone Scroll ═══ */}
        {isNarrativeMode && (
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20">
            <ZoneDivider
              label="Recognition"
              subtitle="The patterns begin to reveal themselves. You see the shape of what has been running beneath the surface."
              index={1}
            />
            <PatternZone patterns={ZONE_RECOGNITION} />

            <ZoneDivider
              label="Confrontation"
              subtitle="The mirror cracks. The threads tangle. What was hidden demands to be seen."
              index={2}
            />
            <PatternZone patterns={ZONE_CONFRONTATION_PATTERNS} />

            <ZoneDivider
              label="Dissolution"
              subtitle="The geometry breaks apart. The light behind the mirror begins to emerge."
              index={3}
            />
            <PatternZone patterns={ZONE_DISSOLUTION_PATTERNS} />
          </div>
        )}

        {/* ═══ FILTERED MODE — Flat Grid ═══ */}
        {!isNarrativeMode && (
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20">
            <FilteredGrid patterns={filtered} clearFilters={clearFilters} />
          </div>
        )}

        {/* ── ZONE 4: UNDERSTANDING — Statistics ── */}
        <section className="relative py-24 md:py-32">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(5,5,5,0.85) 20%, rgba(5,5,5,0.95) 50%, rgba(5,5,5,1) 100%)',
            }}
          />
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
            <motion.div
              className="text-center mb-16"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              whileInView={fadeInUp.visible}
              viewport={{ once: true, margin: '-60px' }}
            >
              <span className="block font-mono text-[0.65rem] tracking-[0.3em] text-text-muted/50 mb-4">
                {String(4).padStart(2, '0')}
              </span>
              <h2 className="section-label mb-4" style={{ letterSpacing: '0.6em' }}>
                Understanding
              </h2>
              <p className="font-display text-lg md:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed">
                The mirror clears. What was pattern becomes awareness.
              </p>
              <div className="divider-gold max-w-[200px] mx-auto mt-8" />
            </motion.div>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              whileInView={fadeInUp.visible}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.15 }}
            >
              <div className="text-center">
                <p className="font-display text-4xl md:text-5xl lg:text-6xl text-gold gold-foil-text">
                  <AnimatedCounter target={allPatterns.length} />
                </p>
                <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mt-3">
                  Patterns Mapped
                </p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl md:text-5xl lg:text-6xl text-gold gold-foil-text">
                  <AnimatedCounter target={siddhiSlugSet.size} />
                </p>
                <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mt-3">
                  Siddhis Linked
                </p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl md:text-5xl lg:text-6xl text-gold gold-foil-text">
                  <AnimatedCounter target={allArchetypes.length} />
                </p>
                <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mt-3">
                  Categories
                </p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl md:text-5xl lg:text-6xl text-gold gold-foil-text">
                  <AnimatedCounter target={48} />
                </p>
                <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mt-3">
                  Warning Signs
                </p>
              </div>
            </motion.div>
            <motion.p
              className="text-center mt-20 font-mono text-[0.7rem] tracking-[0.25em] text-text-muted/40 uppercase"
              initial={reduced ? { opacity: 1 } : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1.2 }}
            >
              Enter the mirror &rarr; Recognize &rarr; Confront &rarr; Dissolve
            </motion.p>
          </div>
        </section>
      </div>
    </div>
  );
}
