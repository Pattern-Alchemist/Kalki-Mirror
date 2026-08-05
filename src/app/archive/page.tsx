'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { SiddhiCard } from '@/components/archive/SiddhiCard';
import { allSiddhis } from '@/lib/data/siddhis';
import { staggerContainer, staggerItem } from '@/lib/motion/tokens';

const CATEGORIES = ['All', 'Mantra', 'Yantra', 'Pr\u0101\u1e47\u0101y\u0101ma', 'Ritual', 'Tantra', 'Meditation', 'Dh\u0101ra\u1e47\u0101'];

export default function ArchivePage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const reduced = useReducedMotion();

  const filtered = useMemo(() => {
    return allSiddhis.filter((s) => {
      const matchCat = filter === 'All' || s.category === filter;
      const q = search.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.sanskrit.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [filter, search]);

  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image="/assets/tantra/hero-temple.jpeg"
        title="The Living Archive"
        subtitle="41 siddhis with evidence sources, authenticity scores, and lineage."
        sectionLabel="Scholarly Heritage"
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 md:py-28">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-16">
          <input
            type="text"
            placeholder="Search by name or Sanskrit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-surface border border-gold/10 rounded-sm px-5 py-3.5 text-foreground placeholder-text-muted focus:outline-none focus:border-gold/30 font-body text-sm transition-colors duration-500"
            aria-label="Search siddhis"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2.5 text-[0.65rem] font-ui tracking-[0.15em] uppercase rounded-sm transition-all duration-400 ${
                  filter === cat
                    ? 'bg-gold text-deep-black'
                    : 'bg-surface text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="text-caption mb-12">
          Showing {filtered.length} of {allSiddhis.length} siddhis
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
      </div>
    </div>
  );
}
