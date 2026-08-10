'use client';

import { useState, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { PatternCard } from '@/components/patterns/PatternCard';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';
import { BackButton } from '@/components/nav/BackButton';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { Search, X, SlidersHorizontal } from 'lucide-react';

// Derive unique archetypes from related siddhis
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

// Derive unique siddhi slugs linked to patterns
const siddhiSlugSet = new Set(allPatterns.flatMap((p) => p.relatedSiddhis));

export default function PatternsPage() {
  const reduced = useReducedMotion();
  const [search, setSearch] = useState('');
  const [activeArchetype, setActiveArchetype] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'most-linked' | 'name'>('default');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...allPatterns];

    // Text search across name, subtitle, signs, description
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

    // Archetype filter — only show patterns linked to siddhis in this category
    if (activeArchetype) {
      result = result.filter((p) => {
        const siddhis = p.relatedSiddhis
          .map((slug) => allSiddhis.find((s) => s.slug === slug))
          .filter(Boolean);
        return siddhis.some((s) => s.category === activeArchetype);
      });
    }

    // Sort
    if (sortBy === 'most-linked') {
      result.sort((a, b) => b.relatedSiddhis.length - a.relatedSiddhis.length);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [search, activeArchetype, sortBy]);

  const hasActiveFilters = search.trim() !== '' || activeArchetype !== null;

  const clearFilters = () => {
    setSearch('');
    setActiveArchetype(null);
    setSortBy('default');
  };

  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-mountain-trident'
        title="Pattern Atlas"
        subtitle="The emotional patterns that run your life — and the sādhanas designed to dissolve them."
        sectionLabel="The Mirror Method"
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 md:py-28">
        <BackButton href="/" label="Back to Home" className="mb-10" />

        {/* ── Search & Filter Bar ── */}
        <motion.div
          className="mb-12"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
        >
          {/* Search input */}
          <div className="relative max-w-xl mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patterns, signs, or keywords..."
              className="w-full pl-11 pr-10 py-3 bg-surface border border-gold/10 rounded-sm text-foreground font-ui text-sm tracking-wide placeholder:text-text-muted/60 focus:outline-none focus:border-gold/30 transition-colors duration-300"
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

          {/* Filter controls row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter toggle (mobile-friendly) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 text-[0.65rem] font-ui tracking-[0.15em] uppercase rounded-sm transition-all duration-300 ${
                showFilters || hasActiveFilters
                  ? 'bg-gold/10 text-gold border border-gold/30'
                  : 'bg-surface text-text-muted border border-gold/5 hover:border-gold/20 hover:text-gold-dim'
              }`}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              )}
            </button>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 bg-surface border border-gold/5 rounded-sm text-[0.65rem] font-ui tracking-[0.15em] uppercase text-text-muted focus:outline-none focus:border-gold/20 transition-colors appearance-none cursor-pointer"
              aria-label="Sort patterns"
            >
              <option value="default">Default Order</option>
              <option value="most-linked">Most Linked</option>
              <option value="name">Alphabetical</option>
            </select>

            {/* Result count */}
            <span className="font-mono text-[0.7rem] tracking-[0.15em] text-text-muted ml-auto">
              {filtered.length} OF {allPatterns.length} PATTERNS
            </span>

            {/* Clear filters */}
            {hasActiveFilters && (
              <motion.button
                initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearFilters}
                className="text-[0.65rem] font-ui tracking-[0.15em] uppercase text-copper hover:text-gold transition-colors"
              >
                Clear All
              </motion.button>
            )}
          </div>

          {/* Expandable filter chips */}
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
                    className={`px-4 py-2 text-[0.6rem] font-ui tracking-[0.15em] uppercase rounded-sm transition-all duration-300 ${
                      activeArchetype === null
                        ? 'neon-chip-glow bg-gold/15 text-gold border border-gold/40'
                        : 'bg-surface text-text-muted border border-gold/5 hover:border-gold/20 hover:text-gold-dim'
                    }`}
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
                        className={`px-4 py-2 text-[0.6rem] font-ui tracking-[0.15em] uppercase rounded-sm transition-all duration-300 ${
                          activeArchetype === cat
                            ? 'neon-chip-glow bg-gold/15 text-gold border border-gold/40'
                            : 'bg-surface text-text-muted border border-gold/5 hover:border-gold/20 hover:text-gold-dim'
                        }`}
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

        {/* ── Pattern Grid ── */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={`${search}-${activeArchetype}-${sortBy}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
              animate={staggerContainer.visible}
            >
              {filtered.map((p) => (
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
              <button
                onClick={clearFilters}
                className="ghost-cta text-sm"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom Stats ── */}
        <motion.div
          className="mt-20 pt-10 border-t border-gold/5"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="font-display text-3xl md:text-4xl text-gold">{allPatterns.length}</p>
              <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mt-1">Patterns Mapped</p>
            </div>
            <div>
              <p className="font-display text-3xl md:text-4xl text-gold">{siddhiSlugSet.size}</p>
              <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mt-1">Siddhis Linked</p>
            </div>
            <div>
              <p className="font-display text-3xl md:text-4xl text-gold">{allArchetypes.length}</p>
              <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mt-1">Categories</p>
            </div>
            <div>
              <p className="font-display text-3xl md:text-4xl text-gold">48</p>
              <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mt-1">Warning Signs</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
