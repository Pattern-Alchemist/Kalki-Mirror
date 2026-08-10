'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { TEN_MAHAVIDYAS, ALL_ARCHETYPES, type Archetype } from '@/lib/data/archetypes';
import { allSiddhis, getSiddhiBySlug } from '@/lib/data/siddhis';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { CautionBadge } from '@/components/archive/CautionBadge';
import { GatedContent } from '@/components/monetization/GatedContent';
import { TIER_LABELS } from '@/lib/utils/tier-gate';
import Link from 'next/link';
import { BackButton } from '@/components/nav/BackButton';
import { ArchetypeQuiz } from '@/components/ai/ArchetypeQuiz';
import { ScrollParallax } from '@/components/ui/ScrollParallax';
import type { CautionLevel } from '@/lib/data/archetypes';
import type { Tier } from '@/lib/data/types';

export default function ArchetypesPage() {
  const [selected, setSelected] = useState<Archetype | null>(null);
  const reduced = useReducedMotion();

  // Auto-expand archetype card when navigated via hash (e.g., /archetypes#kali)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const match = ALL_ARCHETYPES.find(a => a.id === hash);
      if (match) {
        setSelected(match);
        // Scroll to the card after a brief delay for render
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, []);

  const maha = selected && selected.number <= 10 ? selected : null;
  const supplementary = selected && selected.number > 10 ? selected : null;

  return (
    <div className="bg-deep-black min-h-screen">
      {/* Header */}
      <header className="border-b border-gold/5">
        <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-32 pb-16">
          <BackButton href="/" label="Back to Home" className="mb-8" />
          <motion.p
            className="section-label mb-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
          >
            Pattern Intelligence
          </motion.p>
          <motion.h1
            className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.95] tracking-[0.06em] mb-5 engraved-heading font-light"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.1 }}
          >
            The Ten Mahāvidyās
          </motion.h1>
          <motion.p
            className="text-text-secondary text-lg md:text-xl max-w-2xl editorial-spacing"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.2 }}
          >
            Ten karmic-loop archetypes. Each Mahāvidyā governs a recurring behavioral pattern {'—'} the structure of suffering that YANTRA detects and classifies.
          </motion.p>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 md:py-24">
        <BackButton href="/" label="Back to Home" className="mb-10" />

        {/* AI Archetype Quiz */}
        <div className="mb-16">
          <ArchetypeQuiz />
        </div>

        <ScrollParallax speed={-0.12} className="my-20 md:my-28">
          <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
            <CinematicImage
              src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/archetypes/shodashi-sri-yantra"
              alt="Sri Yantra"
              fill
              scrim="full"
              vignette
              filmGrain={false}
            />
          </div>
        </ScrollParallax>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          animate={staggerContainer.visible}
        >
          {TEN_MAHAVIDYAS.map((a, i) => (
            <motion.div
              key={a.id}
              id={a.id}
              variants={staggerItem}
              className="relative"
            >
              <button
                onClick={() => setSelected(selected?.id === a.id ? null : a)}
                className={`w-full text-left glass-chip overflow-hidden group transition-all duration-500 ${selected?.id === a.id ? 'ring-1 ring-gold/30' : ''}`}
                style={selected?.id === a.id ? { borderColor: a.color + '44' } : undefined}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative md:w-48 h-40 md:h-auto shrink-0 overflow-hidden">
                    <CinematicImage
                      src={a.image}
                      alt={a.name}
                      filmGrain={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-deep-black/80 hidden md:block z-[5]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 to-transparent md:hidden z-[5]" />
                    {/* Number */}
                    <div className="absolute top-4 left-4">
                      <span className="font-mono text-[0.75rem] tracking-[0.2em] text-gold/60">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-6 md:p-8 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-display text-2xl md:text-3xl text-foreground group-hover:text-gold transition-colors duration-500 font-light">
                          {a.name}
                        </h3>
                        <p className="font-mono text-[0.8125rem] text-gold-dim tracking-[0.12em] mt-1">{a.sanskrit}</p>
                      </div>
                      <CautionBadge level={a.cautionLevel} />
                    </div>
                    <p className="text-sm text-copper font-mono tracking-[0.08em] mb-3 italic">
                      {a.pattern}
                    </p>
                    <div className="flex items-center gap-3 text-[0.75rem] font-mono text-text-muted tracking-[0.1em]">
                      <span>{a.element}</span>
                      <span>{'·'}</span>
                      <span>{TIER_LABELS[a.accessTier]} TIER</span>
                      <span>{'·'}</span>
                      <span>{a.relatedSiddhiSlugs.length} FOLIOS</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {selected?.id === a.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="glass-panel p-8 md:p-10 mt-2">
                      <p className="text-editorial mb-8">{a.description}</p>

                      <p className="section-label mb-4">Seed Syllable</p>
                      <p className="font-display text-xl text-gold mb-8 p-6 glass-chip font-light">
                        {a.bija}
                      </p>

                      {/* Connected folios in the archive */}
                      <p className="section-label mb-4">
                        Archive Folios ({a.relatedSiddhiSlugs.length})
                      </p>
                      <div className="space-y-3 mb-8">
                        {a.relatedSiddhiSlugs.map((sSlug) => {
                          const s = getSiddhiBySlug(sSlug);
                          if (!s) return null;
                          return (
                            <Link
                              key={sSlug}
                              href={`/archive/${sSlug}`}
                              className="flex items-center justify-between glass-chip p-4 group/folio hover:border-gold/20"
                            >
                              <div>
                                <p className="text-sm text-foreground group-hover/folio:text-gold transition-colors duration-500">
                                  {s.name}
                                </p>
                                <p className="font-mono text-[0.75rem] text-text-muted mt-0.5 tracking-[0.1em]">
                                  {s.tradition.toUpperCase()}
                                </p>
                              </div>
                              <span className="font-mono text-[0.75rem] text-copper tracking-[0.1em]">{s.level}</span>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Connected patterns */}
                      {a.relatedPatternSlugs.length > 0 && (
                        <>
                          <p className="section-label mb-4">
                            Mirror Method Patterns ({a.relatedPatternSlugs.length})
                          </p>
                          <div className="space-y-3">
                            {a.relatedPatternSlugs.map((pSlug) => (
                              <Link
                                key={pSlug}
                                href={`/patterns/${pSlug}`}
                                className="flex items-center justify-between glass-chip p-4 group/pat hover:border-gold/20"
                              >
                                <div>
                                  <p className="font-display text-lg text-foreground group-hover/pat:text-gold transition-colors duration-500 font-light">
                                    {pSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                  </p>
                                </div>
                                <span className="font-mono text-[0.75rem] text-copper tracking-[0.1em]">PATTERN</span>
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Parallax Interlude — Supplementary transition ── */}
        <ScrollParallax speed={-0.08} className="mb-20">
          <div className="relative h-[30vh] md:h-[40vh] overflow-hidden">
            <CinematicImage
              src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/temple-midnight"
              alt="Temple at midnight — beyond the ten"
              fill
              scrim="full"
              vignette
              filmGrain={false}
            />
          </div>
        </ScrollParallax>

        {/* Supplementary Archetypes */}
        <div className="divider-gold mb-16" />
        <p className="section-label mb-4">Supplementary Archetypes</p>
        <h2 className="font-display text-2xl md:text-3xl text-foreground font-light tracking-[0.06em] engraved-heading mb-12">
          Beyond the Ten
        </h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          whileInView={staggerContainer.visible}
          viewport={{ once: true }}
        >
          {ALL_ARCHETYPES.filter(a => a.number > 10).map((a) => (
            <motion.div key={a.id} variants={staggerItem} id={a.id}>
              <div className="glass-chip p-6 h-full">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-xl text-foreground font-light">{a.name}</h3>
                  <CautionBadge level={a.cautionLevel} />
                </div>
                <p className="font-mono text-[0.75rem] text-gold-dim tracking-[0.1em] mb-3">{a.sanskrit}</p>
                <p className="text-sm text-copper font-mono tracking-[0.06em] mb-4 italic line-clamp-2">{a.pattern}</p>
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 editorial-spacing">{a.description}</p>
                <div className="mt-4 pt-4 border-t border-gold/5 flex items-center gap-2">
                  <span className="font-mono text-[0.75rem] text-text-muted tracking-[0.1em]">{a.element}</span>
                  <span className="font-mono text-[0.75rem] text-text-muted">{'·'}</span>
                  <span className="font-mono text-[0.75rem] text-text-muted tracking-[0.1em]">{a.relatedSiddhiSlugs.length} FOLIOS</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}