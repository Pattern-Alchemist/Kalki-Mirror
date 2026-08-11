'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { GatedContent } from '@/components/monetization/GatedContent';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import { TIER_LABELS, TIER_ELEMENTS, TIER_COLORS } from '@/lib/utils/tier-gate';
import { TANTRA_CATEGORIES, getCategoryById } from '@/lib/data/tantra-categories';
import { sadhanaLibrary, getSadhanasByCategory, SADHANA_COUNT } from '@/lib/data/sadhana-library';
import { aghoriCourse } from '@/lib/data/aghoiri-tantra-course';
import type { Sadhana } from '@/lib/data/types';
import type { Tier } from '@/lib/data/types';

/* ─────────────────────────────────────────────────────────────
   THE SĀDHANĀ LIBRARY
   Structured practice protocols organized across the 13
   categories of tantrik practice.
   ───────────────────────────────────────────────────────────── */

const tierBadgeStyle: Record<string, string> = {
  prithvi: 'bg-[#8a7230]/15 text-[#d4a853] border-[#8a7230]/30',
  jal: 'bg-[#4a8fa8]/15 text-[#7ec8e3] border-[#4a8fa8]/30',
  agni: 'bg-[#c44b2b]/15 text-[#e8734f] border-[#c44b2b]/30',
  akash: 'bg-[#7c6bb5]/15 text-[#a99de0] border-[#7c6bb5]/30',
};

const evidenceColor: Record<string, string> = {
  TRADITIONAL: 'text-emerald-400/70 border-emerald-400/20',
  ORAL: 'text-amber-400/70 border-amber-400/20',
  FIELD: 'text-sky-400/70 border-sky-400/20',
  RECONSTRUCTED: 'text-foreground/40 border-foreground/20',
};

/* ─── Category Icon Component ─── */
function CategoryIcon({ path, color }: { path: string; color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d={path} />
    </svg>
  );
}

/* ─── Tantra Category Card ─── */
function CategoryCard({ cat, sadhanaCount, isSelected, onClick }: { cat: typeof TANTRA_CATEGORIES[0]; sadhanaCount: number; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group text-left w-full border rounded-lg p-4 md:p-5 transition-all duration-400',
        isSelected
          ? 'bg-foreground/5 border-gold/30'
          : 'bg-transparent border-foreground/10 hover:border-foreground/20 hover:bg-foreground/[0.02]',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <CategoryIcon path={cat.icon} color={isSelected ? cat.color : `${cat.color}66`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn('font-display text-base md:text-lg tracking-wide', isSelected ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground')}>
              {cat.name}
            </h3>
            <span className="font-mono text-[0.6rem] text-foreground/30 tracking-wider">{cat.sanskrit}</span>
          </div>
          <p className="text-foreground/40 text-xs leading-relaxed line-clamp-2 hidden md:block">{cat.description.slice(0, 120)}...</p>
          <div className="flex items-center gap-3 mt-2">
            {sadhanaCount > 0 && (
              <span className="font-mono text-[0.6rem] text-foreground/25">{sadhanaCount} protocol{sadhanaCount > 1 ? 's' : ''}</span>
            )}
            <span className="font-mono text-[0.55rem] px-1.5 py-0.5 rounded border" style={{
              borderColor: `${TIER_COLORS[cat.minTierDefault as Tier]}33`,
              color: TIER_COLORS[cat.minTierDefault as Tier],
            }}>
              {TIER_LABELS[cat.minTierDefault as Tier]}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─── Sadhana Detail Card ─── */
function SadhanaCard({ sadhana, index }: { sadhana: Sadhana; index: number }) {
  const [open, setOpen] = useState(false);
  const cat = getCategoryById(sadhana.categoryId as any);
  const reduced = useReducedMotion();

  return (
    <GatedContent minTier={sadhana.minTier} label={sadhana.name} teaser={`This practice requires the ${TIER_ELEMENTS[sadhana.minTier]} tier.`}>
      <motion.div
        variants={staggerItem}
        className="border border-foreground/10 rounded-lg overflow-hidden"
      >
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-start justify-between p-5 text-left hover:bg-foreground/[0.02] transition-colors"
          aria-expanded={open}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-gold/30 font-mono text-[0.6rem]">{String(index + 1).padStart(2, '0')}</span>
              {cat && <span className="font-mono text-[0.55rem]" style={{ color: cat.color }}>{cat.name}</span>}
              <span className={cn('px-2 py-0.5 rounded border text-[0.55rem] font-mono tracking-wider', tierBadgeStyle[sadhana.minTier])}>
                {TIER_LABELS[sadhana.minTier]}
              </span>
            </div>
            <h3 className={cn('font-display text-base md:text-lg tracking-wide mb-1', open ? 'text-gold' : 'text-foreground')}>
              {sadhana.name}
            </h3>
            {sadhana.sanskrit && (
              <p className="text-foreground/30 text-xs italic">{sadhana.sanskrit}</p>
            )}
            <p className="text-foreground/50 text-sm mt-2 line-clamp-2">{sadhana.summary}</p>
          </div>
          <motion.span
            className="text-foreground/30 text-xl shrink-0 ml-4 mt-1"
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >+</motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-6 space-y-5">

                <div className="flex flex-wrap gap-3">
                  {sadhana.evidence && (
                    <span className={cn('px-2 py-0.5 rounded border text-[0.6rem] font-mono tracking-widest uppercase', evidenceColor[sadhana.evidence])}>
                      {sadhana.evidence}
                    </span>
                  )}
                  <span className="text-foreground/30 font-mono text-[0.65rem]">{sadhana.duration}</span>
                  <span className="text-foreground/30 font-mono text-[0.65rem]">{sadhana.dailyCommitment}</span>
                </div>

                {/* Mantra */}
                {sadhana.primaryMantra && (
                  <div className="bg-deep-black/60 border border-gold/10 rounded-lg p-4">
                    <p className="text-gold font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2">Primary Mantra</p>
                    <p className="text-foreground font-medium text-lg" dir="ltr">{sadhana.primaryMantra}</p>
                  </div>
                )}

                {/* Prerequisites */}
                {sadhana.prerequisites.length > 0 && (
                  <div>
                    <p className="text-gold font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2">Prerequisites</p>
                    <ul className="space-y-1">
                      {sadhana.prerequisites.map((p, i) => (
                        <li key={i} className="text-foreground/50 text-sm flex items-start gap-2">
                          <span className="text-foreground/20 mt-1">&#x2022;</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Steps */}
                <div>
                  <p className="text-gold font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2">Practice Protocol</p>
                  <ol className="space-y-2">
                    {sadhana.steps.map((step, i) => (
                      <li key={i} className="text-foreground/70 text-sm leading-relaxed flex items-start gap-3">
                        <span className="text-gold/30 font-mono text-xs mt-0.5 shrink-0 w-5">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Materials */}
                {sadhana.materials && sadhana.materials.length > 0 && (
                  <div>
                    <p className="text-gold font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2">Materials</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {sadhana.materials.map((m, i) => (
                        <p key={i} className="text-foreground/40 text-xs flex items-start gap-2">
                          <span className="text-gold/30 mt-0.5">&#x2022;</span>{m}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {sadhana.benefits && sadhana.benefits.length > 0 && (
                  <div className="bg-gold/5 border border-gold/10 rounded-lg p-4">
                    <p className="text-gold font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2">Benefits</p>
                    <ul className="space-y-1.5">
                      {sadhana.benefits.map((b, i) => (
                        <li key={i} className="text-foreground/60 text-sm">{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {sadhana.warnings && sadhana.warnings.length > 0 && (
                  <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-4 space-y-1.5">
                    <p className="text-red-400 font-mono text-[0.6rem] tracking-[0.2em] uppercase flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      Warnings
                    </p>
                    {sadhana.warnings.map((w, i) => (
                      <p key={i} className="text-red-300/70 text-sm">{w}</p>
                    ))}
                  </div>
                )}

                {/* Course link */}
                {sadhana.relatedCoursePhase && (
                  <Link
                    href="/aghoiri-tantra"
                    className="inline-flex items-center gap-2 text-gold-dim hover:text-gold text-xs font-mono tracking-wider uppercase transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
                    Full context in {sadhana.relatedCoursePhase} of the Aghorī Tantra course
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </GatedContent>
  );
}

/* ─── MAIN PAGE ─── */
export default function SadhanaLibraryPage() {
  const reduced = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredSadhana = useMemo(() => {
    if (!selectedCategory) return sadhanaLibrary;
    return getSadhanasByCategory(selectedCategory);
  }, [selectedCategory]);

  // Count sadhanas per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sadhanaLibrary.forEach(s => {
      counts[s.categoryId] = (counts[s.categoryId] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <main className="bg-deep-black min-h-screen">
      {/* Hero */}
      <header className="relative min-h-[60vh] md:min-h-[70vh] flex items-end overflow-hidden">
        <CinematicImage
          src='/assets/aghori/course/forgotten-chamber.jpeg'
          alt='The Sadhana Library — Structured Practice Protocols'
          kenBurns="slow"
          scrim="bottom"
          vignette
          dust
          priority
        />
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 lg:px-10 pb-16 md:pb-24 pt-32">
          <motion.p
            className="section-label mb-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
          >
            KNOWLEDGE ARCHITECTURE
          </motion.p>
          <motion.h1
            className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-3 hero-heading"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            The Sadhana Library
          </motion.h1>
          <motion.p
            className="text-foreground/50 text-lg italic mb-5"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.15, duration: 0.8 }}
          >
            Thirteen Categories of Practice — Structured Protocols from Living Lineages
          </motion.p>
          <motion.p
            className="text-foreground/70 text-base max-w-2xl leading-relaxed"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Every practice in the tantrik tradition belongs to one of thirteen categories — from Mantra and Yantra to Dhūni and Sevā.
            This library organizes structured practice protocols across all thirteen, with evidence grading, step-by-step
            instructions, and direct links to the Aghorī Tantra course phases where each practice is taught in full depth.
          </motion.p>
        </div>
      </header>

      <div className="atmospheric-bg h-48 -mt-20 relative z-10" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <BackButton href="/" label="Back to Home" />

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-16">
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Practice Protocols</p>
            <p className="text-foreground text-sm font-medium">{SADHANA_COUNT}</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Categories</p>
            <p className="text-foreground text-sm font-medium">{TANTRA_CATEGORIES.length}</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Course Phases</p>
            <p className="text-foreground text-sm font-medium">{aghoriCourse.length}</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Evidence Grading</p>
            <p className="text-foreground text-sm font-medium">4 Levels</p>
          </div>
        </div>

        {/* Section: 13 Tantra Categories */}
        <motion.div
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true, margin: '-40px' }}
        >
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-display text-2xl md:text-3xl text-foreground font-light tracking-[0.04em] engraved-heading">
              Thirteen Categories
            </h2>
            <div className="flex-1 h-px bg-foreground/10" />
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-gold-dim hover:text-gold text-xs font-mono tracking-wider uppercase transition-colors"
              >
                Show All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-16">
            {TANTRA_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                sadhanaCount={categoryCounts[cat.id] || 0}
                isSelected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              />
            ))}
          </div>
        </motion.div>

        <div className="divider-gold mb-16" />

        {/* Section: Practice Protocols */}
        <motion.div
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true, margin: '-40px' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-display text-2xl md:text-3xl text-foreground font-light tracking-[0.04em] engraved-heading">
              {selectedCategory ? getCategoryById(selectedCategory as any)?.name || 'All' : 'All'} Protocols
            </h2>
            <div className="flex-1 h-px bg-foreground/10" />
            <span className="text-caption text-xs">{filteredSadhana.length} protocol{filteredSadhana.length !== 1 ? 's' : ''}</span>
          </div>

          {selectedCategory && getCategoryById(selectedCategory as any) && (
            <p className="text-foreground/50 text-sm leading-relaxed mb-8 max-w-2xl">
              {getCategoryById(selectedCategory as any)?.description}
            </p>
          )}

          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
            whileInView={reduced ? { opacity: 1 } : staggerContainer.visible}
            viewport={{ once: true, margin: '-40px' }}
          >
            {filteredSadhana.map((sadhana, i) => (
              <SadhanaCard key={sadhana.slug} sadhana={sadhana} index={i} />
            ))}
          </motion.div>

          {filteredSadhana.length === 0 && (
            <div className="text-center py-20">
              <p className="text-foreground/30 text-sm">No protocols yet in this category. Check the Aghori Tantra course for practices that will be added here.</p>
              <Link href="/aghoiri-tantra" className="ghost-cta inline-block mt-6 text-sm">Go to Course</Link>
            </div>
          )}
        </motion.div>

        {/* Links to related knowledge sections */}
        <div className="divider-gold my-16" />
        <motion.div
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <p className="text-caption text-xs mb-6">EXPLORE THE KNOWLEDGE ARCHITECTURE</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            <Link href="/archive" className="glass-chip p-5 group block hover:border-gold/20 transition-colors">
              <p className="font-display text-lg text-foreground group-hover:text-gold transition-colors mb-1">Akashic Archive</p>
              <p className="text-foreground/40 text-xs">The complete siddhi database — {SADHANA_COUNT}+ folios with evidence grading</p>
            </Link>
            <Link href="/aghoiri-tantra" className="glass-chip p-5 group block hover:border-gold/20 transition-colors">
              <p className="font-display text-lg text-foreground group-hover:text-gold transition-colors mb-1">Aghori Tantra Course</p>
              <p className="text-foreground/40 text-xs">Eight phases. Fifty-four lessons. A lifetime of practice.</p>
            </Link>
            <Link href="/archetypes" className="glass-chip p-5 group block hover:border-gold/20 transition-colors">
              <p className="font-display text-lg text-foreground group-hover:text-gold transition-colors mb-1">Mahavidya Archetypes</p>
              <p className="text-foreground/40 text-xs">Ten karmic loops. Ten wisdom goddesses. The architecture of consciousness.</p>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative pb-20 md:pb-28 mt-8">
        <div className="atmospheric-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-gold/40 rounded-full" style={{ animation: 'binduPulse 2s ease-in-out infinite' }} />
          </div>
          <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper">
            THE SĀDHANĀ LIBRARY — KNOWLEDGE ARCHITECTURE
          </p>
        </div>
      </footer>
    </main>
  );
}
