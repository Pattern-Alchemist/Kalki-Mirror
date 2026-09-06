'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { Search, X, ChevronRight, Lock, Volume2, ArrowLeft } from 'lucide-react';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax } from '@/components/ui/ScrollParallax';
import dynamic from 'next/dynamic';
import { TIER_BADGE_STYLES } from '@/lib/utils/tier-gate';
import { termAnchor } from '@/lib/utils/term-anchor';
import { track } from '@/lib/analytics/track';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { GlossaryEntry } from '@/lib/data/glossary';

interface GlossaryPageProps {
  entries: GlossaryEntry[];
  categories: readonly { value: string; label: string }[];
}

const GatedContent = dynamic(() => import('@/components/monetization/GatedContent').then(m => ({ default: m.GatedContent })), { ssr: false, loading: () => <div className="min-h-[100px]" /> });

/* ── Category badge colors ── */
const CATEGORY_STYLES: Record<string, string> = {
  foundational: 'bg-gold/10 text-gold border-gold/20',
  pranayama: 'bg-[#c44b2b]/10 text-[#e8734f] border-[#c44b2b]/20',
  tantra: 'bg-[#c44b2b]/10 text-[#e8734f] border-[#c44b2b]/20',
  ritual: 'bg-[#8a7230]/10 text-[#d4a853] border-[#8a7230]/20',
  philosophical: 'bg-foreground/5 text-text-secondary border-foreground/10',
  archetype: 'bg-[#c44b2b]/10 text-[#e8734f] border-[#c44b2b]/20',
};

/* ── Pronunciation helper ── */
function PronunciationButton({ pronunciation }: { pronunciation?: string }) {
  const [speaking, setSpeaking] = useState(false);
  if (!pronunciation) return null;

  const speak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(pronunciation);
    utterance.rate = 0.7;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
  };

  return (
    <button
      onClick={speak}
      className={cn(
        'inline-flex items-center gap-1 text-[0.65rem] font-mono tracking-wider text-text-muted hover:text-gold transition-colors',
        speaking && 'text-gold'
      )}
      aria-label={`Hear pronunciation: ${pronunciation}`}
    >
      <Volume2 className="w-3 h-3" />
      {pronunciation}
    </button>
  );
}

/* ── Related terms links ── */
function RelatedLinks({ terms }: { terms: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {terms.map((t) => (
        <span
          key={t}
          className="text-[0.6rem] font-mono tracking-wider text-text-muted/60 bg-foreground/5 border border-foreground/5 px-2 py-0.5 rounded-sm"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/* ── Expanded card detail ── */
function ExpandedCard({ entry, onClose }: { entry: GlossaryEntry; onClose: () => void }) {
  const reduced = useNativeReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel p-6 md:p-8 border-t border-gold/10"
    >
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-[0.65rem] font-mono tracking-[0.15em] uppercase text-text-muted hover:text-gold transition-colors mb-6"
        aria-label="Close expanded entry"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Lexicon
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
        <div className="flex-1">
          <h2 className="font-display text-2xl md:text-3xl text-foreground gold-foil-text mb-1">{entry.term}</h2>
          {entry.sanskrit && (
            <p className="font-display text-xl md:text-2xl text-gold/60 mb-2">{entry.sanskrit}</p>
          )}
          <PronunciationButton pronunciation={entry.pronunciation} />
        </div>
        <span className={cn('glass-chip text-[0.6rem] font-mono tracking-[0.15em] uppercase shrink-0', CATEGORY_STYLES[entry.category])}>
          {entry.category}
        </span>
      </div>

      {/* Vol. 3 #4 — every term has a programmatic page now; offer the jump */}
      <Link
        href={`/glossary/${termAnchor(entry.term)}`}
        className="inline-flex items-center gap-1.5 text-[0.65rem] font-mono tracking-[0.15em] uppercase text-text-muted hover:text-gold transition-colors mb-5"
        aria-label={`Open the standalone page for ${entry.term}`}
      >
        <ChevronRight className="w-3 h-3" />
        Open {entry.term} page
      </Link>

      {entry.minTier && (
        <span className={cn('inline-block mb-4 text-[0.6rem] font-mono tracking-[0.15em] uppercase px-2 py-1 rounded-sm border', TIER_BADGE_STYLES[entry.minTier])}>
          <Lock className="w-3 h-3 inline mr-1" />
          {entry.minTier} tier
        </span>
      )}

      <p className="text-text-secondary leading-relaxed text-[0.95rem] editorial-spacing">
        {entry.definition}
      </p>

      {entry.relatedTerms && entry.relatedTerms.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-text-muted/50 mb-2">Related Terms</p>
          <div className="flex flex-wrap gap-2">
            {entry.relatedTerms.map((t) => (
              <span
                key={t}
                className="glass-chip text-[0.65rem] font-mono tracking-wider text-gold-dim"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {entry.relatedSiddhiSlugs && entry.relatedSiddhiSlugs.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-text-muted/50 mb-2">Related Practices</p>
          <div className="flex flex-wrap gap-2">
            {entry.relatedSiddhiSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/archive/${slug}`}
                className="glass-chip text-[0.65rem] font-mono tracking-wider text-gold-dim hover:text-gold transition-colors"
              >
                {slug}
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GLOSSARY CARD
   ══════════════════════════════════════════════════════════════ */
function GlossaryCard({
  entry,
  onClick,
}: {
  entry: GlossaryEntry;
  onClick: () => void;
}) {
  const reduced = useNativeReducedMotion();

  return (
    <motion.button
      id={termAnchor(entry.term)}
      variants={staggerItem}
      onClick={onClick}
      className={cn(
        'glass-panel p-5 text-left w-full cursor-pointer group scroll-mt-28',
        'hover:border-gold/20 transition-colors duration-300',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/30'
      )}
      whileHover={reduced ? {} : { y: -2 }}
      transition={{ duration: 0.25 }}
    >
      {/* Gated overlay */}
      {entry.minTier ? (
        <GatedContent minTier={entry.minTier} label={entry.term} teaser={`${entry.term} is available to ${entry.minTier} practitioners and above.`}>
          <div className="relative">
            <CardInner entry={entry} />
          </div>
        </GatedContent>
      ) : (
        <CardInner entry={entry} />
      )}
    </motion.button>
  );
}

function CardInner({ entry }: { entry: GlossaryEntry }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display text-lg text-foreground gold-foil-text leading-tight">
          {entry.term}
        </h3>
        <ChevronRight className="w-4 h-4 text-text-muted/30 shrink-0 mt-0.5 group-hover:text-gold/50 transition-colors" />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {entry.sanskrit && (
          <span className="text-gold/50 text-sm">{entry.sanskrit}</span>
        )}
        {entry.pronunciation && (
          <span className="text-[0.6rem] font-mono text-text-muted/40">/{entry.pronunciation}/</span>
        )}
        <span className={cn('text-[0.55rem] font-mono tracking-[0.15em] uppercase px-1.5 py-0.5 rounded-sm border', CATEGORY_STYLES[entry.category])}>
          {entry.category}
        </span>
      </div>

      <p className="text-text-muted text-sm leading-relaxed line-clamp-2 mb-3">
        {entry.definition}
      </p>

      {entry.relatedTerms && entry.relatedTerms.length > 0 && (
        <RelatedLinks terms={entry.relatedTerms} />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   THE LEXICON — Main Page
   ══════════════════════════════════════════════════════════════ */
export default function GlossaryPage({ entries: glossaryEntries, categories: CATEGORIES }: GlossaryPageProps) {
  const reduced = useNativeReducedMotion();

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (search.trim().length >= 3) track('search_performed', { properties: { query: search.trim().slice(0, 100) } });
  }, [search]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedEntry, setExpandedEntry] = useState<GlossaryEntry | null>(null);

  useEffect(() => {
    if (expandedEntry) track('glossary_term_viewed', { slug: expandedEntry.term });
  }, [expandedEntry?.term]);

  const filtered = useMemo(() => {
    let result = [...glossaryEntries];
    if (activeCategory !== 'all') {
      result = result.filter((e) => e.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.term.toLowerCase().includes(q) ||
          (e.sanskrit?.includes(q) ?? false) ||
          (e.pronunciation?.toLowerCase().includes(q) ?? false) ||
          e.definition.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeCategory, glossaryEntries]);

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('all');
  };

  const hasActiveFilters = search.trim() !== '' || activeCategory !== 'all';

  return (
    <div className="bg-deep-black min-h-screen">
      {/* ── Cinematic Hero ── */}
      <header className="relative min-h-[90vh] md:min-h-[100vh] flex items-end overflow-hidden">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/codex/sanskrit-plate-hero'
          alt="Ancient Sanskrit manuscript with golden lettering"
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
            REFERENCE SYSTEM
          </motion.p>
          <motion.h1
            className={cn(
              'font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading'
            )}
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            The Lexicon
          </motion.h1>
          <motion.p
            className="text-foreground text-xl md:text-2xl max-w-3xl editorial-spacing text-shadow-deep"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {glossaryEntries.length} Sanskrit & Tantric terms decoded in the KALKI framework
          </motion.p>
        </div>
      </header>

      {/* ── Atmospheric gradient ── */}
      <div className="atmospheric-bg h-64 -mt-24 relative z-10" />

      {/* ── Stats Bar ── */}
      <div className="max-w-5xl mx-auto px-6 lg:px-10 -mt-4 mb-12">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">{glossaryEntries.length}</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Terms</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">6</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Categories</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">∞</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Interconnections</p>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <section className="pb-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <BackButton href="/codex" label="Back to Codex" />
        </div>

        <div className="max-w-5xl mx-auto px-6 lg:px-10 mt-8">
          {/* ── Editorial intro ── */}
          <motion.p
            className="text-text-secondary text-lg leading-relaxed max-w-3xl editorial-spacing mb-4"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            The KALKI Lexicon is not a dictionary. It is a cartographic instrument — each term is a coordinate
            in the map of tantrik psychology. Sanskrit is not used here for ornamentation; each word carries
            a precise technical meaning that has no adequate English equivalent. A siddhi is not simply a "power"
            — it is a measurable, repeatable shift in the relationship between consciousness and matter.
            Understanding the vocabulary is the first step toward recognizing the patterns it describes.
          </motion.p>
          <motion.p
            className="text-text-muted text-base leading-relaxed max-w-3xl editorial-spacing mb-10"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Terms are organized by category — Core Concepts, Practice Terms, Archetypes, and Textual References
            — and each entry includes its Sanskrit etymology, phonetic pronunciation, and connections to
            related siddhis and patterns across the KALKI system. Cross-references are embedded throughout:
            a term like "āvaraṇa" (enclosure) links directly to the siddhis designed to dissolve it, creating
            a navigable web between language and practice.
          </motion.p>

          {/* ── Search & Filter Bar ── */}
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
                  placeholder="Search terms, definitions, or Sanskrit..."
                  className="w-full pl-11 pr-10 py-2.5 bg-surface/60 backdrop-blur-md border border-gold/10 rounded-sm text-foreground font-ui text-sm tracking-wide placeholder:text-text-muted/50 focus:outline-none focus:border-gold/30 transition-colors duration-300"
                  aria-label="Search glossary"
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

              {hasActiveFilters ? (
                <div className="flex items-center gap-4 ml-auto">
                  <span className="font-mono text-[0.7rem] tracking-[0.15em] text-text-muted">
                    {filtered.length} OF {glossaryEntries.length}
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-[0.65rem] font-ui tracking-[0.15em] uppercase text-copper hover:text-gold transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              ) : (
                <span className="font-mono text-[0.7rem] tracking-[0.15em] text-text-muted/50 ml-auto">
                  {glossaryEntries.length} TERMS
                </span>
              )}
            </div>

            {/* ── Category Chips ── */}
            <div className="flex flex-wrap gap-2 mt-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={cn(
                    'glass-chip text-[0.65rem] font-mono tracking-[0.15em] uppercase transition-all duration-300',
                    activeCategory === cat.value
                      ? 'bg-gold/10 text-gold border-gold/30'
                      : 'text-text-muted hover:text-gold-dim hover:border-gold/20'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Expanded Entry ── */}
          <AnimatePresence mode="wait">
            {expandedEntry ? (
              <ExpandedCard
                key={expandedEntry.term}
                entry={expandedEntry}
                onClose={() => setExpandedEntry(null)}
              />
            ) : (
              <motion.div
                key="grid"
                initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
                animate={staggerContainer.visible}
              >
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {filtered.map((entry) => (
                      <GlossaryCard
                        key={entry.term}
                        entry={entry}
                        onClick={() => setExpandedEntry(entry)}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    key="empty"
                    className="text-center py-24"
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="font-mono text-sm text-text-muted tracking-[0.2em] uppercase mb-4">
                      No terms match your query
                    </p>
                    <button onClick={clearFilters} className="ghost-cta text-sm">
                      Reset Filters
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Divider ── */}
          <motion.div
            className="divider-gold mt-24"
            initial={reduced ? { opacity: 0.3, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 0.3, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'center' }}
          />

          {/* ── Cinematic Break ── */}
          <div className="my-16 md:my-24">
            <ScrollParallax speed={-0.15} className="cinematic-strip">
              <CinematicImage
                src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-runes-manuscript"
                alt="Ancient runes and tantrik manuscript inscriptions on weathered stone"
                kenBurns="slow"
                filmGrain={false}
              />
              <div className="cinematic-strip-overlay" />
            </ScrollParallax>
          </div>

          {/* ── Closing CTA ── */}
          <motion.div
            className="max-w-lg mx-auto mt-16 text-center"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            <p className="section-label mb-3">DEEPER STUDY</p>
            <p className="font-display text-2xl md:text-3xl tracking-wide mb-3">The vocabulary shapes the vision.</p>
            <p className="text-text-muted mb-8 max-w-md mx-auto editorial-spacing">
              Every term in the Lexicon is a node in the network of consciousness.
              Follow the links to explore the connections — or visit the Deities
              and Archetypes pages to see how these terms manifest as living
              psychological patterns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/archetypes" className="gold-cta">Explore the Pantheon</Link>
              <Link href="/codex" className="ghost-cta">Return to Codex</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Page Footer ── */}
      <div className="relative pb-20 md:pb-28">
        <div className="atmospheric-bg absolute inset-0 opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center"
            initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-3 h-3 bg-gold/40 rounded-full bindu-pulse" />
          </motion.div>
          <motion.p
            className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            END OF LEXICON — KALKI REFERENCE SYSTEM
          </motion.p>
        </div>
      </div>
    </div>
  );
}
