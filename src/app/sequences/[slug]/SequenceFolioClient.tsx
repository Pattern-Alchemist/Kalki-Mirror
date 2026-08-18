'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import dynamic from 'next/dynamic';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { TIER_BADGE_STYLES, TIER_LABELS } from '@/lib/utils/tier-gate';
import { cn } from '@/lib/utils';
import { Clock, ArrowRight } from 'lucide-react';
import type { PracticeSequence } from '@/lib/data/sequences';

const GatedContent = dynamic(() => import('@/components/monetization/GatedContent').then(m => ({ default: m.GatedContent })), { ssr: false, loading: () => <div className="min-h-[100px]" /> });

interface StepSiddhiInfo {
  slug: string;
  name: string;
  sanskrit?: string;
  category: string;
  level: string;
}

interface SequenceFolioClientProps {
  sequence: PracticeSequence;
  stepSiddhis: (StepSiddhiInfo | null)[];
  targetPatterns: { slug: string; name: string; subtitle: string }[];
}

/* ══════════════════════════════════════════════════════════════
   STEP TIMELINE ITEM
   ══════════════════════════════════════════════════════════════ */
function StepTimelineItem({
  step,
  siddhiInfo,
  index,
  isLast,
}: {
  step: { siddhiSlug: string; label: string; duration: string; note?: string };
  siddhiInfo: StepSiddhiInfo | null;
  index: number;
  isLast: boolean;
}) {
  const displayName = siddhiInfo?.name ?? step.label;

  return (
    <div className="flex gap-6 md:gap-8 relative">
      {/* Copper connector line + step number */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-px h-4" style={{ backgroundColor: 'var(--copper)' }} />
        <div
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10"
          style={{ borderColor: 'var(--copper)' }}
        >
          <span
            className="font-mono text-sm tracking-[0.1em]"
            style={{ color: 'var(--copper)' }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 min-h-[40px]"
            style={{ backgroundColor: 'var(--copper)', opacity: 0.4 }}
          />
        )}
        {isLast && <div className="w-px h-4" style={{ backgroundColor: 'var(--copper)' }} />}
      </div>

      {/* Step content */}
      <div className="flex-1 pb-10">
        <div className="glass-chip p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
            <div>
              <Link
                href={`/archive/${step.siddhiSlug}`}
                className="font-display text-lg md:text-xl text-foreground hover:text-gold transition-colors duration-500 font-light group inline-flex items-center gap-2"
              >
                {displayName}
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 text-gold-dim" />
              </Link>
              {siddhiInfo?.sanskrit && (
                <p className="font-mono text-[0.7rem] text-copper tracking-[0.1em] mt-0.5">
                  {siddhiInfo.sanskrit}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-text-muted shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono text-[0.75rem] tracking-[0.08em]">
                {step.duration}
              </span>
            </div>
          </div>

          {siddhiInfo && (
            <span className="inline-block font-mono text-[0.6rem] tracking-[0.15em] uppercase text-text-muted mb-3">
              {siddhiInfo.category} — {siddhiInfo.level}
            </span>
          )}

          {step.note && (
            <p className="text-text-secondary text-sm leading-relaxed mt-3 border-l-2 border-gold/10 pl-4">
              {step.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SEQUENCE DETAIL CLIENT
   ══════════════════════════════════════════════════════════════ */
export default function SequenceFolioClient({ sequence, stepSiddhis, targetPatterns }: SequenceFolioClientProps) {
  const reduced = useNativeReducedMotion();
  const tierLabel = TIER_LABELS[sequence.minTier];

  const firstStep = sequence.steps[0];
  const firstSiddhi = stepSiddhis[0] ?? null;
  const remainingSteps = sequence.steps.slice(1);
  const remainingSiddhis = stepSiddhis.slice(1);

  return (
    <div className="bg-deep-black min-h-screen">
      {/* ── HEADER ── */}
      <header className="border-b border-gold/5">
        <div className="w-full max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-16">
          <BackButton href="/sequences" label="Back to Sequences" className="mb-8" />

          <motion.p
            className="font-mono text-[0.8125rem] tracking-[0.2em] uppercase text-copper mb-6"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            [ SĀDHANA SEQUENCE / MIRROR METHOD ]
          </motion.p>

          <motion.h1
            className="font-display text-4xl md:text-5xl text-foreground leading-[0.95] tracking-[0.06em] mb-2 font-light"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {sequence.name}
          </motion.h1>

          {sequence.sanskrit && (
            <motion.p
              className="font-mono text-gold-dim text-sm tracking-[0.12em] mb-2"
              initial={reduced ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              {sequence.sanskrit}
            </motion.p>
          )}

          <motion.p
            className="font-mono text-gold-dim text-sm tracking-[0.12em] mb-6"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {sequence.subtitle}
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            <span
              className={cn(
                'text-[0.65rem] font-mono tracking-[0.15em] uppercase px-2.5 py-1 border rounded-sm',
                TIER_BADGE_STYLES[sequence.minTier]
              )}
            >
              {tierLabel}
            </span>
            <span className="flex items-center gap-1.5 text-text-muted text-[0.75rem] font-mono tracking-[0.08em]">
              <Clock className="w-3.5 h-3.5" />
              {sequence.totalDuration}
            </span>
            <span className="text-text-muted text-[0.75rem] font-mono tracking-[0.08em]">
              {sequence.steps.length} stages
            </span>
          </motion.div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 space-y-16 pb-32">
        {/* ── OVERVIEW ── */}
        <motion.section
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <p className="section-label mb-4">Overview</p>
          <p className="text-text-secondary text-lg leading-relaxed editorial-spacing">
            {sequence.description}
          </p>
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

        {/* ── STEP-BY-STEP PROGRESSION ── */}
        <motion.section
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <p className="section-label mb-2" style={{ letterSpacing: '0.6em' }}>
            The Sequence
          </p>
          <p className="text-text-muted text-sm mb-10">
            Each stage builds on the one before. Do not skip ahead — the arc is
            the sādhana.
          </p>

          {/* First step — always visible */}
          <StepTimelineItem step={firstStep} siddhiInfo={firstSiddhi} index={0} isLast={remainingSteps.length === 0} />

          {/* Remaining steps — gated */}
          {remainingSteps.length > 0 && (
            <GatedContent
              minTier={sequence.minTier}
              label={`${sequence.name} — Full Sequence`}
              teaser={`The complete ${sequence.name} protocol (${sequence.steps.length} stages) is available to ${tierLabel} practitioners and above.`}
            >
              <motion.div
                initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
                whileInView={staggerContainer.visible}
                viewport={{ once: true }}
              >
                {remainingSteps.map((step, i) => (
                  <motion.div key={step.siddhiSlug} variants={staggerItem}>
                    <StepTimelineItem
                      step={step}
                      siddhiInfo={remainingSiddhis[i] ?? null}
                      index={i + 1}
                      isLast={i === remainingSteps.length - 1}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </GatedContent>
          )}
        </motion.section>

        {/* ── TARGET PATTERNS ── */}
        <motion.section
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <p className="section-label mb-6">Targeted Patterns</p>
          <p className="text-text-muted text-sm mb-6">
            This sequence is designed to dissolve the following emotional patterns.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {targetPatterns.map((pattern) => (
              <Link
                key={pattern.slug}
                href={`/patterns/${pattern.slug}`}
                className="glass-chip p-4 hover:border-gold/25 transition-colors duration-500 group block"
              >
                <p className="text-sm text-foreground group-hover:text-gold transition-colors duration-500 font-light mb-1">
                  {pattern.name}
                </p>
                <p className="font-mono text-[0.7rem] text-gold-dim tracking-[0.1em]">
                  {pattern.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </motion.section>
      </div>

      {/* ═══ CINEMATIC STRIP ═══ */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-observatory-alt"
          alt="Meditation platform overlooking the Himalayas"
          kenBurns="normal"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* ═══ CLOSING CTA ═══ */}
      <section className="relative py-24 md:py-36">
        <ScrollParallax speed={-0.06} disabled>
          <CinematicImage
            src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior"
            alt="Ancient stone ashram interior — the repository of forbidden tantric knowledge"
            className="absolute inset-0"
            scrim="full"
            vignette
          />
        </ScrollParallax>
        <div className="absolute inset-0 pointer-events-none z-[1] cta-overlay-dark" />
        <ParallaxText
          speed={-0.04}
          className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center"
        >
          <p className="section-label mb-6">Continue the Investigation</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">
            The sequence is mapped.{' '}
            <span style={{ display: 'block' }}>The sādhana awaits.</span>
          </h2>
          <p className="text-foreground/70 text-lg mb-12 editorial-spacing text-shadow-deep">
            Book a session with Kaustubh for a precise prescription — or
            explore the Archive and Pattern Atlas to continue your own
            investigation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/consultations" className="gold-cta">
              Consult the Archivist
            </Link>
            <Link href="/sequences" className="ghost-cta">
              All Sequences
            </Link>
          </div>
        </ParallaxText>
      </section>
    </div>
  );
}
