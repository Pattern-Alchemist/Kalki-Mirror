'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { GatedContent } from '@/components/monetization/GatedContent';
import { fadeInUp, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import { TIER_LABELS, TIER_ELEMENTS, TIER_COLORS } from '@/lib/utils/tier-gate';
import { TANTRA_CATEGORIES, getCategoryById } from '@/lib/data/tantra-categories';
import { sadhanaLibrary, SADHANA_COUNT } from '@/lib/data/sadhana-library';
import { SIDDHI_COUNT } from '@/lib/data/siddhis';
import { aghoriCourse } from '@/lib/data/aghoiri-tantra-course';
import type { Sadhana, Tier } from '@/lib/data/types';
import type { TantraCategory } from '@/lib/data/tantra-categories';

/* ─────────────────────────────────────────────────────────────
   THE SĀDHANĀ LIBRARY — Cinematic Rebuild
   31 practice protocols across 13 categories of tantrik practice.
   Tier-grouped navigation. Evidence-graded. Course-linked.
   ───────────────────────────────────────────────────────────── */

/* ─── Shared Styles ─── */
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

const levelColor: Record<string, string> = {
  Foundation: 'text-emerald-400 border-emerald-400/30',
  Intermediate: 'text-amber-400 border-amber-400/30',
  Advanced: 'text-red-400 border-red-400/30',
  Restricted: 'text-red-600 border-red-600/30',
};

/* ─── Tier-Grouped Category Nav Data ─── */
const tierGroups: { tier: Tier; label: string; categories: TantraCategory[] }[] = [
  { tier: 'prithvi', label: 'PRITHVI — EARTH', categories: TANTRA_CATEGORIES.filter(c => c.minTierDefault === 'prithvi') },
  { tier: 'jal', label: 'JAL — WATER', categories: TANTRA_CATEGORIES.filter(c => c.minTierDefault === 'jal') },
  { tier: 'agni', label: 'AGNI — FIRE', categories: TANTRA_CATEGORIES.filter(c => c.minTierDefault === 'agni') },
  { tier: 'akash', label: 'AKASH — SKY', categories: TANTRA_CATEGORIES.filter(c => c.minTierDefault === 'akash') },
];

/* Flatten all categories in tier-grouped order for nav */
const allCategoriesOrdered = tierGroups.flatMap(g => g.categories);

/* ─── Category Icon ─── */
function CategoryIcon({ path, color, size = 24 }: { path: string; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d={path} />
    </svg>
  );
}

/* ─── Tier Badge ─── */
function TierBadge({ tier, compact = false }: { tier: string; compact?: boolean }) {
  const t = tier as Tier;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded border font-mono tracking-wider', tierBadgeStyle[t] || tierBadgeStyle.prithvi, compact ? 'px-2 py-0.5 text-[0.6rem]' : 'px-2.5 py-1 text-[0.65rem]')}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TIER_COLORS[t] }} />
      {TIER_LABELS[t]}{!compact && <span className="opacity-50">· {TIER_ELEMENTS[t]}</span>}
    </span>
  );
}

/* ─── Level Badge ─── */
function LevelBadge({ level }: { level: string }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full border text-[0.6rem] font-mono tracking-widest uppercase', levelColor[level] || levelColor.Foundation)}>
      {level}
    </span>
  );
}

/* ─── Sadhana Detail Card ─── */
function SadhanaCard({ sadhana, index }: { sadhana: Sadhana; index: number }) {
  const [open, setOpen] = useState(false);
  const cat = getCategoryById(sadhana.categoryId as any);

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
              <TierBadge tier={sadhana.minTier} compact />
              <LevelBadge level={sadhana.level} />
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

                {sadhana.primaryMantra && (
                  <div className="bg-deep-black/60 border border-gold/10 rounded-lg p-4">
                    <p className="text-gold font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2">Primary Mantra</p>
                    <p className="text-foreground font-medium text-lg" dir="ltr">{sadhana.primaryMantra}</p>
                  </div>
                )}

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

/* ─── Category Section ─── */
function CategorySection({ cat, catIndex, sadhanas }: { cat: TantraCategory; catIndex: number; sadhanas: Sadhana[] }) {
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <motion.section
      ref={sectionRef}
      id={`cat-${cat.id}`}
      className="mb-12 md:mb-16 scroll-mt-24"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true, margin: '-40px' }}
    >
      {/* Category header with colored accent */}
      <div className="relative border border-foreground/10 rounded-lg overflow-hidden mb-6">
        {/* Color accent bar */}
        <div className="h-1" style={{ backgroundColor: cat.color }} />

        <div className="p-5 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Category number watermark */}
              <span className="font-mono text-[3rem] md:text-[4rem] font-bold leading-none text-white/[0.03] select-none -mt-2 hidden md:block">
                {String(catIndex + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <CategoryIcon path={cat.icon} color={cat.color} />
                  <h2 className="font-display text-xl md:text-2xl lg:text-3xl text-foreground tracking-wide">{cat.name}</h2>
                  <span className="font-mono text-[0.6rem] text-foreground/30 tracking-wider">{cat.sanskrit}</span>
                  <TierBadge tier={cat.minTierDefault} compact />
                </div>
                <p className={cn(
                  'text-foreground/50 text-sm leading-relaxed',
                  !expanded && 'line-clamp-2 md:line-clamp-3',
                )}>
                  {cat.description}
                </p>
                {cat.description.length > 180 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-gold-dim hover:text-gold text-[0.6rem] font-mono tracking-wider uppercase mt-2 transition-colors"
                  >
                    {expanded ? 'Less' : 'More'}
                  </button>
                )}

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                  <span className="font-mono text-[0.6rem] text-foreground/25">{cat.practiceCount} protocol{cat.practiceCount !== 1 ? 's' : ''}</span>
                  {cat.cautionNote && (
                    <span className="text-amber-400/50 text-[0.6rem] font-mono flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-amber-400/50" />
                      {cat.cautionNote}
                    </span>
                  )}
                </div>

                {/* Primary texts + Course phases (shown on md+) */}
                <div className="hidden md:flex flex-wrap gap-x-6 gap-y-1 mt-3">
                  {cat.primaryTexts && cat.primaryTexts.length > 0 && (
                    <span className="text-foreground/20 text-[0.55rem] font-mono">
                      <span className="text-foreground/30">Texts:</span> {cat.primaryTexts.join(', ')}
                    </span>
                  )}
                  {cat.relatedCoursePhases && cat.relatedCoursePhases.length > 0 && (
                    <span className="text-foreground/20 text-[0.55rem] font-mono">
                      <span className="text-foreground/30">Course:</span>{' '}
                      {cat.relatedCoursePhases.map((p, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          <Link href="/aghoiri-tantra" className="text-gold-dim hover:text-gold transition-colors">{p}</Link>
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sadhana cards for this category */}
      {sadhanas.length > 0 ? (
        <div className="space-y-3">
          {sadhanas.map((sadhana, i) => (
            <SadhanaCard key={sadhana.slug} sadhana={sadhana} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-foreground/5 rounded-lg">
          <p className="text-foreground/25 text-sm">Protocols for this category are in development.</p>
          <Link href="/aghoiri-tantra" className="ghost-cta inline-block mt-4 text-xs">Explore the Course</Link>
        </div>
      )}
    </motion.section>
  );
}

/* ─── Category Navigation Sidebar (Desktop) + Bottom Dock (Mobile) ─── */
function CategoryNav({ activeCatId }: { activeCatId: string | null }) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const globalIdx = useCallback((catId: string) => allCategoriesOrdered.findIndex(c => c.id === catId), []);

  return (
    <>
      {/* Desktop sidebar — tier-grouped */}
      <nav
        className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 flex-col gap-0 pl-4 max-h-[80vh] overflow-y-auto scrollbar-none"
        aria-label="Category navigation"
      >
        {tierGroups.map((group) => (
          <div
            key={group.tier}
            className="mb-2"
            onMouseEnter={() => setHoveredGroup(group.tier)}
            onMouseLeave={() => setHoveredGroup(null)}
          >
            {/* Tier group label */}
            <div className="flex items-center gap-2 mb-1 pl-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TIER_COLORS[group.tier] }} />
              <span
                className="font-mono text-[0.5rem] tracking-[0.2em] uppercase transition-colors duration-300"
                style={{ color: hoveredGroup === group.tier ? TIER_COLORS[group.tier] : 'rgba(255,255,255,0.15)' }}
              >
                {group.label}
              </span>
            </div>
            {/* Category items */}
            {group.categories.map((cat) => {
              const isActive = activeCatId === cat.id;
              const idx = globalIdx(cat.id);
              return (
                <a
                  key={cat.id}
                  href={`#cat-${cat.id}`}
                  className={cn(
                    'group flex items-center gap-2.5 py-1.5 pr-4 rounded-r transition-all duration-300',
                    isActive ? 'bg-foreground/5' : 'hover:bg-foreground/[0.02]',
                  )}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full border transition-all duration-500',
                        isActive
                          ? 'border-gold bg-gold scale-125'
                          : `border-transparent group-hover:border-foreground/30`,
                      )}
                      style={
                        isActive
                          ? { boxShadow: '0 0 8px rgba(212,175,55,0.4)' }
                          : !isActive
                            ? { borderColor: `${cat.color}40`, backgroundColor: 'transparent' }
                            : undefined
                      }
                    />
                    {idx < allCategoriesOrdered.length - 1 && group.categories.indexOf(cat) < group.categories.length - 1 && (
                      <div className="w-px h-4 mt-0.5" style={{ backgroundColor: `${cat.color}20` }} />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      'font-mono text-[0.55rem] tracking-widest uppercase transition-colors duration-300',
                      isActive ? 'text-gold' : 'text-foreground/25 group-hover:text-foreground/50',
                    )}>
                      {cat.name}
                    </span>
                    <span className="text-[0.5rem] font-mono truncate max-w-[90px]" style={{ color: `${cat.color}60` }}>
                      {cat.practiceCount}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Mobile bottom dock — horizontal scroll, tier-colored dots */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-deep-black/90 backdrop-blur-md border-t border-foreground/5"
        aria-label="Category navigation"
      >
        <div className="flex overflow-x-auto gap-0 px-2 py-2 scrollbar-none">
          {allCategoriesOrdered.map((cat) => {
            const isActive = activeCatId === cat.id;
            return (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-md shrink-0 transition-all duration-300',
                  isActive ? 'bg-foreground/5' : 'hover:bg-foreground/[0.02]',
                )}
              >
                <span className={cn(
                  'font-mono text-[0.55rem] tracking-widest uppercase',
                  isActive ? 'text-gold' : 'text-foreground/25',
                )}>
                  {cat.name}
                </span>
                <div className={cn(
                  'w-1 h-1 rounded-full transition-all duration-500',
                  isActive ? 'bg-gold' : 'bg-foreground/15',
                )} style={!isActive ? { backgroundColor: `${cat.color}40` } : undefined} />
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/* ─── Category Tier Map (like Ashram Progression Map) ─── */
function CategoryTierMap() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="max-w-3xl mx-auto px-6 lg:px-10 mb-12"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true, margin: '-40px' }}
    >
      <h3 className="text-caption text-xs tracking-[0.2em] uppercase text-foreground/40 mb-5">The Thirteen Gates — Category Access Tiers</h3>
      <div className="space-y-3">
        {tierGroups.map((group) => (
          <div key={group.tier}>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIER_COLORS[group.tier] }} />
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase" style={{ color: TIER_COLORS[group.tier] }}>
                {group.label} — {group.categories.length} categories
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-1 ml-1">
              {group.categories.map((cat, i) => (
                <div key={cat.id} className="flex items-center">
                  <a
                    href={`#cat-${cat.id}`}
                    className="group/station flex items-center gap-1.5 px-2 py-1 rounded transition-all duration-300"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 group-hover/station:scale-125"
                      style={{ borderColor: cat.color, backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = cat.color; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    />
                    <span className="text-[0.5rem] font-mono text-foreground/25 group-hover/station:text-foreground/50 transition-colors">
                      {cat.name}
                    </span>
                  </a>
                  {i < group.categories.length - 1 && (
                    <div className="w-4 md:w-8 h-px" style={{ backgroundColor: `${cat.color}20` }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── MAIN PAGE ─── */
export default function SadhanaLibraryPage() {
  const reduced = useReducedMotion();
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Group sadhanas by category (in tier-grouped order)
  const sadhanasByCategory = useMemo(() => {
    const map = new Map<string, Sadhana[]>();
    sadhanaLibrary.forEach(s => {
      const arr = map.get(s.categoryId) || [];
      arr.push(s);
      map.set(s.categoryId, arr);
    });
    return map;
  }, []);

  // Track active category via IntersectionObserver
  useEffect(() => {
    const refs = sectionRefs.current.filter(Boolean);
    if (refs.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('cat-', '');
            setActiveCatId(id);
          }
        });
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 },
    );

    refs.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-deep-black min-h-screen">
      {/* ═══ HERO ═══ */}
      <header className="relative min-h-[80vh] md:min-h-[90vh] flex items-end overflow-hidden">
        <CinematicImage
          src='/assets/aghori/course/forgotten-chamber.jpeg'
          alt='The Sādhanā Library — Thirty-One Practice Protocols from Living Lineages'
          kenBurns="slow"
          scrim="bottom"
          vignette
          volumetric
          dust
          priority
        />
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 lg:px-10 pb-20 md:pb-28 pt-32">
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
            Thirteen Categories · {SADHANA_COUNT} Protocols · Evidence-Graded
          </motion.p>
          <motion.p
            className="text-foreground/70 text-base md:text-lg max-w-2xl leading-relaxed"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Every practice in the tantrik tradition belongs to one of thirteen categories — from Mantra and Yantra to Dhūni and Sevā.
            This library organizes {SADHANA_COUNT} structured practice protocols with evidence grading, step-by-step
            instructions, and direct links to the Aghorī Tantra course phases where each practice is taught in full depth.
          </motion.p>
        </div>
      </header>

      <div className="atmospheric-bg h-48 -mt-20 relative z-10" />

      {/* ═══ INFO BAR ═══ */}
      <div className="max-w-3xl mx-auto px-6 lg:px-10 mb-8">
        <BackButton href="/" label="Back to Home" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Practice Protocols</p>
            <p className="text-foreground text-sm font-medium">{SADHANA_COUNT}</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Categories</p>
            <p className="text-foreground text-sm font-medium">{TANTRA_CATEGORIES.length}</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Linked to Course</p>
            <p className="text-foreground text-sm font-medium">{aghoriCourse.length} Phases</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Access Tiers</p>
            <div className="flex gap-1.5 mt-1">
              <TierBadge tier="prithvi" compact />
              <TierBadge tier="jal" compact />
              <TierBadge tier="agni" compact />
              <TierBadge tier="akash" compact />
            </div>
          </div>
        </div>

        {/* Evidence grading legend */}
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(evidenceColor) as Array<keyof typeof evidenceColor>).map((k) => (
            <span key={k} className={cn('px-2 py-0.5 rounded border text-[0.55rem] font-mono tracking-wider uppercase', evidenceColor[k])}>
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ CATEGORY TIER MAP ═══ */}
      <div className="divider-gold max-w-3xl mx-auto" />
      <CategoryTierMap />

      {/* ═══ CATEGORY NAV ═══ */}
      <CategoryNav activeCatId={activeCatId} />

      {/* ═══ CATEGORY SECTIONS ═══ */}
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        {allCategoriesOrdered.map((cat, i) => {
          const catSadhana = sadhanasByCategory.get(cat.id) || [];
          return (
            <div key={cat.id} ref={(el) => { sectionRefs.current[i] = el; }}>
              {i > 0 && <div className="divider-gold" />}
              <CategorySection cat={cat} catIndex={i} sadhanas={catSadhana} />
            </div>
          );
        })}
      </div>

      {/* ═══ KNOWLEDGE ARCHITECTURE LINKS ═══ */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
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
              <p className="text-foreground/40 text-xs">{SIDDHI_COUNT} siddhi folios with scholarly provenance fields and evidence grading</p>
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

      {/* ═══ FOOTER ═══ */}
      <footer className="relative pb-28 md:pb-20 mt-8">
        <div className="atmospheric-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-gold/40 rounded-full" style={{ animation: 'binduPulse 2s ease-in-out infinite' }} />
          </div>
          <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper">
            THE SĀDHANĀ LIBRARY — KNOWLEDGE ARCHITECTURE
          </p>
          <p className="text-foreground/20 text-[0.6rem] mt-3 max-w-md mx-auto">
            {SADHANA_COUNT} protocols across 13 categories. Evidence-graded. Course-linked.
            Distinguishing documented traditional practice from later folklore and unverifiable claims.
          </p>
        </div>
      </footer>
    </main>
  );
}
