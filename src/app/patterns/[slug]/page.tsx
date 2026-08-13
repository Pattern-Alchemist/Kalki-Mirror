'use client';

import { use, useState, useCallback } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';
import { getArchetypeById, PATTERN_ARCHETYPE_MAP } from '@/lib/data/archetypes';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { PatternExplainer } from '@/components/ai/PatternExplainer';
import { YantraLoader } from '@/components/patterns/YantraLoader';
import { CautionBadge } from '@/components/archive/CautionBadge';
import { GatedContent } from '@/components/monetization/GatedContent';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import { fadeInUp } from '@/lib/motion/tokens';
import { TIER_BADGE_STYLES } from '@/lib/utils/tier-gate';
import type { Tier } from '@/lib/data/types';

export default function PatternFolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const pattern = allPatterns.find((p) => p.slug === slug);
  if (!pattern) notFound();
  const reduced = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const relatedSiddhis = allSiddhis.filter((s) => pattern.relatedSiddhis.includes(s.slug)).slice(0, 3);
  const archetypeId = PATTERN_ARCHETYPE_MAP[slug];
  const archetype = archetypeId ? getArchetypeById(archetypeId) : null;
  const patternTier = pattern.minTier as Tier | undefined;

  const handleLoadComplete = useCallback(() => setLoading(false), []);

  return (
    <div className="bg-deep-black min-h-screen">
      {/* YANTRA Analysis Loading Sequence */}
      <AnimatePresence>
        {loading && (
          <YantraLoader patternName={pattern.name} onComplete={handleLoadComplete} />
        )}
      </AnimatePresence>

      {/* Header — dark mode dossier aesthetic */}
      <header className="border-b border-gold/5">
        <div className="w-full max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-16">
          <BackButton href="/patterns" label="Back to Patterns" className="mb-8" />
          {/* Terminal-style metadata */}
          <motion.p
            className="font-mono text-[0.8125rem] tracking-[0.2em] uppercase text-copper mb-6"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={loading ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            [ YANTRA PATTERN / MIRROR METHOD ]
          </motion.p>
          <motion.h1
            className="font-display text-4xl md:text-5xl text-foreground leading-[0.95] tracking-[0.06em] mb-3 font-light"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={loading ? { opacity: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {pattern.name}
          </motion.h1>
          <motion.p
            className="font-mono text-gold-dim text-sm tracking-[0.12em] mb-8"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={loading ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {pattern.subtitle}
          </motion.p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 space-y-16 pb-32">
        {/* Archetype Classification */}
        {archetype && (
          <motion.section
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <p className="section-label mb-6">Mahāvidyā Classification</p>
            <Link href={`/archetypes#${archetype.id}`} className="glass-chip p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 group hover:border-gold/30 transition-all duration-500 block">
              <div className="shrink-0 w-20 h-20 rounded-sm overflow-hidden border border-gold/10 relative">
                <CinematicImage
                  src={archetype.image}
                  alt={archetype.name}
                  fill={false}
                  width={80}
                  height={80}
                  filmGrain={false}
                  vignette
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-display text-2xl text-foreground group-hover:text-gold transition-colors duration-500 font-light">{archetype.name}</p>
                  <CautionBadge level={archetype.cautionLevel} />
                </div>
                <p className="font-mono text-[0.8125rem] text-gold-dim tracking-[0.12em] mb-2">{archetype.sanskrit}</p>
                <p className="text-sm text-copper font-mono tracking-[0.06em] italic">{archetype.pattern}</p>
              </div>
              <span className="font-mono text-[0.75rem] text-text-muted tracking-[0.1em] shrink-0 hidden md:block">VIEW ARCHETYPE →</span>
            </Link>
          </motion.section>
        )}

        {/* Overview — blueprint section */}
        <motion.section
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <p className="section-label mb-4">Overview</p>
          <p className="text-text-secondary text-lg leading-relaxed editorial-spacing">{pattern.description}</p>
        </motion.section>

        {/* Recognizing This Pattern — Cinnabar warnings for critical signs */}
        <motion.section
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <p className="section-label mb-6">Recognizing This Pattern</p>
          <div className="space-y-3">
            {pattern.signs.map((sign, i) => (
              <div
                key={i}
                className="glass-chip p-4 flex items-start gap-4"
              >
                {/* Oxidized copper connector line */}
                <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                  <div className="w-px h-3" style={{ backgroundColor: 'var(--copper)' }} />
                  <span
                    className="font-mono text-[0.75rem] tracking-[0.15em] text-copper"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-px h-3" style={{ backgroundColor: 'var(--copper)' }} />
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">{sign}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Parallax Interlude ── */}
        <ScrollParallax speed={-0.1} className="-mx-6 lg:-mx-10">
          <div className="relative h-[30vh] md:h-[35vh] overflow-hidden">
            <CinematicImage
              src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/archetypes/sri-yantra-mist"
              alt="Śrī Yantra emerging from mist"
              fill
              scrim="full"
              vignette
              filmGrain={false}
            />
          </div>
        </ScrollParallax>

        {/* Origin */}
        <motion.section
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <p className="section-label mb-4">Origin</p>
          <p className="text-editorial">{pattern.origin}</p>
        </motion.section>

        {/* Suggested Practice — with YANTRA engine feel */}
        <motion.section
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <p className="section-label mb-4">Prescribed Sādhana</p>
          <div className="glass-panel p-8 relative overflow-hidden">
            {/* Blueprint grid lines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, var(--copper) 0px, var(--copper) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, var(--copper) 0px, var(--copper) 1px, transparent 1px, transparent 40px)`,
              }}
            />
            <p className="text-text-secondary leading-relaxed relative z-10 editorial-spacing">{pattern.practice}</p>
          </div>
        </motion.section>

        {/* Archetype Integration — Agni+ gated */}
        {pattern.archetypeIntegration && patternTier && (
          <motion.section
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <p className="section-label mb-4">Archetype Integration</p>
            <GatedContent minTier='agni' label='Archetype Mapping' teaser={`Deep archetype analysis for ${pattern.name} is available to Agni practitioners and above.`}>
              <div className="glass-panel p-8">
                <p className="text-text-secondary leading-relaxed editorial-spacing">{pattern.archetypeIntegration}</p>
              </div>
            </GatedContent>
          </motion.section>
        )}

        {/* Advanced Notes — Akash gated */}
        {pattern.advancedNotes && (
          <motion.section
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <p className="section-label mb-4">Advanced Integration Notes</p>
            <GatedContent minTier='akash' label='Akash-Level Intelligence' teaser={`Advanced integration protocols for ${pattern.name} are available to Akash practitioners only.`}>
              <div className="glass-panel p-8 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, var(--copper) 0px, var(--copper) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, var(--copper) 0px, var(--copper) 1px, transparent 1px, transparent 40px)`,
                  }}
                />
                <p className="text-text-secondary leading-relaxed editorial-spacing relative z-10">{pattern.advancedNotes}</p>
              </div>
            </GatedContent>
          </motion.section>
        )}

        {/* AI Pattern Explanation */}
        <motion.section
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <PatternExplainer patternSlug={slug} />
        </motion.section>

        {/* Connected Siddhis — blueprint schematic links */}
        {relatedSiddhis.length > 0 && (
          <motion.section
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <p className="section-label mb-6">Connected Siddhis</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedSiddhis.map((s, i) => (
                <div key={s.slug} className="relative">
                  {/* Copper connection line between cards */}
                  {i < relatedSiddhis.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px" style={{ backgroundColor: 'var(--copper)', opacity: 0.4 }} />
                  )}
                  <Link
                    href={`/archive/${s.slug}`}
                    className="glass-chip p-5 hover:border-gold/30 transition-colors duration-500 group block"
                  >
                    <p className="text-sm text-foreground group-hover:text-gold transition-colors duration-500 font-light">{s.name}</p>
                    <p className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper mt-1">{s.level}</p>
                  </Link>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        <motion.div className="text-center pt-8" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <WhatsAppCTA variant="inline" label="Consult the Archivist" />
        </motion.div>
      </div>

      {/* ═══ CINEMATIC STRIP ═══ */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/'
          alt='Meditation platform overlooking the Himalayas'
          kenBurns="normal"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* ═══ CLOSING CTA ═══ */}
      <section className="relative py-24 md:py-36">
        <ScrollParallax speed={-0.06} disabled>
          <CinematicImage
            src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior'
            alt='Ancient stone ashram interior — the repository of forbidden tantric knowledge'
            className="absolute inset-0"
            scrim="full"
            vignette
          />
        </ScrollParallax>
        <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: 'rgba(0,0,0,0.75)' }} />
        <ParallaxText speed={-0.04} className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <p className="section-label mb-6">Continue the Investigation</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">
            The pattern is mapped.{' '}
            <span style={{ display: 'block' }}>The sādhana awaits.</span>
          </h2>
          <p className="text-foreground/70 text-lg mb-12 editorial-spacing" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
            Book a session with Kaustubh for a precise prescription — or explore the Archive and Library to continue your own investigation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <WhatsAppCTA variant="inline" label="Consult the Archivist" />
            <Link href="/patterns" className="ghost-cta">Pattern Atlas</Link>
          </div>
        </ParallaxText>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative pb-28 md:pb-20 mt-16">
        <div className="atmospheric-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-gold/40 rounded-full" style={{ animation: 'binduPulse 2s ease-in-out infinite' }} />
          </div>
          <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper">
            AKASHIC ARCHIVE — PATTERN INTELLIGENCE
          </p>
        </div>
      </footer>
    </div>
  );
}