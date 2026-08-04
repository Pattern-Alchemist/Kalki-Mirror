'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { SiddhiCard } from '@/components/archive/SiddhiCard';
import { allSiddhis } from '@/lib/data/siddhis';
import { staggerContainer, staggerItem } from '@/lib/motion/tokens';

const CATEGORIES = ['All', 'Mantra', 'Yantra', 'Breath', 'Ritual', 'Karma', 'Meditation'];

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
        image="/assets/archive/cave-yantras.jpg"
        title="The Living Archive"
        subtitle="41 siddhis with evidence sources, authenticity scores, and lineage."
        sectionLabel="Scholarly Heritage"
      />

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <input
            type="text"
            placeholder="Search by name or Sanskrit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-surface border border-gold-subtle rounded px-4 py-3 text-foreground placeholder-text-muted focus:outline-none focus:border-gold font-body"
            aria-label="Search siddhis"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-xs font-ui tracking-wider uppercase rounded transition-all ${
                  filter === cat
                    ? 'bg-gold text-deep-black'
                    : 'bg-surface text-text-muted hover:text-gold hover:border-gold border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="text-text-muted text-sm mb-8">
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
                exit={{ opacity: 0, scale: 0.95 }}
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