'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { PageHero } from '@/components/layout/PageHero';
import { SiddhiCard } from '@/components/archive/SiddhiCard';
import { CautionBadge, getCautionLevel } from '@/components/archive/CautionBadge';
import { allSiddhis, SIDDHI_COUNT } from '@/lib/data/siddhis';
import { TEN_MAHAVIDYAS, ACCESS_LABELS, type CautionLevel as ArchCaution } from '@/lib/data/archetypes';
import { staggerContainer, staggerItem } from '@/lib/motion/tokens';
import type { SiddhiLevel, Tier } from '@/lib/data/types';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/nav/BackButton';

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

export default function ArchivePage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [cautionFilter, setCautionFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
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

  // Count by caution level
  const counts = useMemo(() => {
    const c: Record<string, number> = { OPEN: 0, MODERATE: 0, HIGH: 0, SEALED: 0 };
    allSiddhis.forEach(s => { c[getCautionLevel(s.level)]++; });
    return c;
  }, []);

  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image="/assets/tantra/hero-underground-library.jpeg"
        title="The Akashic Archive"
        subtitle={`${SIDDHI_COUNT} siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access.`}
        sectionLabel="The Reading Room"
      />

      {/* Access tier summary — the ledger header */}
      <div className="border-b border-gold/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
          <div className="flex flex-wrap gap-6 md:gap-12">
            {(['OPEN', 'MODERATE', 'HIGH', 'SEALED'] as const).map((level) => (
              <div key={level} className="flex items-center gap-3">
                <CautionBadge level={level} />
                <span className="font-mono text-[0.6rem] tracking-[0.15em] text-text-muted">
                  {counts[level]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 md:py-24">
        <BackButton href="/" label="Back to Home" className="mb-10" />
        {/* Search + Filters — ledger terminal aesthetic */}
        <div className="flex flex-col gap-5 mb-12">
          {/* Search bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Query the Akasha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-surface/50 border border-gold/10 rounded-sm px-5 py-3.5 text-foreground placeholder-text-muted focus:outline-none focus:border-gold/30 font-body text-sm transition-colors duration-500"
              aria-label="Search siddhis"
            />
          </div>

          {/* Filter rows */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    'px-3.5 py-2 text-[0.6rem] font-ui tracking-[0.12em] uppercase rounded-sm transition-all duration-400 neon-chip-glow',
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
            {/* Caution filters */}
            <div className="flex flex-wrap gap-2">
              {CAUTION_FILTERS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCautionFilter(c.value)}
                  className={cn(
                    'px-3.5 py-2 text-[0.6rem] font-mono tracking-[0.12em] uppercase rounded-sm transition-all duration-400 neon-chip-glow',
                    cautionFilter === c.value
                      ? 'bg-gold text-deep-black'
                      : 'text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <span className="hidden md:block text-text-muted/30">{'\u00B7'}</span>

            {/* Tier filters */}
            <div className="flex flex-wrap gap-2">
              {TIER_FILTERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTierFilter(t.value)}
                  className={cn(
                    'px-3.5 py-2 text-[0.6rem] font-mono tracking-[0.12em] uppercase rounded-sm transition-all duration-400 neon-chip-glow',
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
          Showing {filtered.length} of {SIDDHI_COUNT}
        </p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          animate={staggerContainer.visible}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((s) => (
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

        {/* Archetype navigation — the pattern wheel teaser */}
        <div className="mt-32">
          <div className="divider-gold mb-16" />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="section-label mb-4">The Pattern Taxonomy</p>
              <h2 className="font-display text-3xl md:text-4xl text-foreground font-light tracking-[0.06em] engraved-heading">
                Ten Mahāvidyās{' \u2014'} Ten Karmic Loops
              </h2>
            </div>
            <Link
              href="/archetypes"
              className="ghost-cta inline-block w-fit"
            >
              Enter the Wheel
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TEN_MAHAVIDYAS.map((a, i) => (
              <Link
                key={a.id}
                href={`/archetypes#${a.id}`}
                className="glass-chip p-5 group text-center"
              >
                <p className="font-mono text-[0.55rem] text-gold-dim mb-2 tracking-[0.2em]">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="font-display text-lg text-foreground group-hover:text-gold transition-colors duration-500 font-light">
                  {a.name}
                </p>
                <p className="font-mono text-[0.5rem] text-text-muted mt-1.5 tracking-[0.1em] line-clamp-2">
                  {a.pattern}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
