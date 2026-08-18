'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import Link from 'next/link';
import type { BreathPattern } from '@/lib/data/types';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { TIER_BADGE_STYLES, TIER_LABELS } from '@/lib/utils/tier-gate';
import { cn } from '@/lib/utils';
import { Wind, ArrowRight, Repeat } from 'lucide-react';

export interface BreathworkPageProps {
  breathPatterns: BreathPattern[];
}

/* ══════════════════════════════════════════════════════════════
   BREATH PATTERN CARD
   ══════════════════════════════════════════════════════════════ */
function BreathCard({
  pattern,
  index,
}: {
  pattern: BreathPattern;
  index: number;
}) {
  const tierLabel = TIER_LABELS[pattern.minTier];
  const phaseCount = pattern.phases.length;
  const totalPhaseDuration = pattern.phases.reduce((a, p) => a + p.duration, 0);

  return (
    <motion.div variants={staggerItem} className="group">
      <Link
        href={`/breathwork/${pattern.slug}`}
        className="block glass-chip p-6 md:p-8 hover:border-gold/25 transition-all duration-500 relative overflow-hidden"
      >
        {/* Blueprint grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, var(--copper) 0px, var(--copper) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, var(--copper) 0px, var(--copper) 1px, transparent 1px, transparent 40px)",
          }}
        />

        <div className="relative z-10">
          {/* Header row: index + tier badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[0.7rem] tracking-[0.2em] text-text-muted/50">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className={cn(
                'text-[0.65rem] font-mono tracking-[0.15em] uppercase px-2.5 py-1 border rounded-sm',
                TIER_BADGE_STYLES[pattern.minTier]
              )}
            >
              {tierLabel}
            </span>
          </div>

          {/* Pattern name */}
          <h3 className="font-display text-2xl md:text-3xl text-foreground leading-[1.05] tracking-[0.04em] mb-1 font-light group-hover:text-gold transition-colors duration-500">
            {pattern.name}
          </h3>

          {/* Description — clipped */}
          <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-3">
            {pattern.description}
          </p>

          {/* Phase mini-timeline */}
          <div className="flex items-center gap-1 mb-5 flex-wrap">
            {pattern.phases.map((phase, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="font-mono text-[0.6rem] text-text-muted tracking-[0.06em] px-2 py-0.5 border border-gold/10 rounded-sm bg-surface/40">
                  {phase.name} {phase.duration}s
                </span>
                {i < pattern.phases.length - 1 && (
                  <span className="text-gold/20 text-[0.5rem]">→</span>
                )}
              </div>
            ))}
          </div>

          {/* Footer: meta + arrow */}
          <div className="flex items-center justify-between pt-3 border-t border-gold/5">
            <div className="flex items-center gap-4 text-text-muted">
              <span className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5" />
                <span className="font-mono text-[0.75rem] tracking-[0.08em]">
                  {phaseCount}{phaseCount === 1 ? ' phase' : ' phases'}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5" />
                <span className="font-mono text-[0.75rem] tracking-[0.08em]">
                  {pattern.cycles} cycles
                </span>
              </span>
            </div>
            <span className="font-mono text-[0.75rem] text-text-muted group-hover:text-gold transition-colors duration-500 flex items-center gap-1.5">
              Practice
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BREATHWORK — Main Page
   ══════════════════════════════════════════════════════════════ */
export default function BreathworkPage({ breathPatterns: allBreathPatterns }: BreathworkPageProps) {
  const reduced = useNativeReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <div ref={containerRef} className="relative bg-deep-black min-h-screen">
      {/* ═══ FIXED BACKGROUND LAYER ═══ */}
      {!reduced && (
        <div className="fixed inset-0 z-0 overflow-hidden">
          <motion.div className="absolute inset-0" style={{ scale: bgScale }}>
            <CinematicImage
              src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/aghori-tantra/practices-bg"
              alt=""
              scrim="full"
              filmGrain={false}
            />
          </motion.div>
          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 3,
              background:
                'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)',
            }}
          />
        </div>
      )}

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="relative z-10">
        {/* ── HERO ── */}
        <motion.section
          className="min-h-[90vh] md:min-h-[100vh] flex flex-col items-center justify-center text-center px-6 relative"
          style={!reduced ? { opacity: heroOpacity } : undefined}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%)',
            }}
          />
          <div className="relative z-10 max-w-3xl mx-auto">
            <BackButton href="/practice" label="Back to Practice" className="mb-10 justify-center" />
            <motion.p
              className="section-label mb-6"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
            >
              Prāṇāyāma Laboratory
            </motion.p>
            <motion.h1
              className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] tracking-[0.08em] mb-6 hero-heading uppercase"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              Prāṇāyāma{' '}
            <span style={{ display: 'block' }}>Laboratory</span>
            </motion.h1>
            <motion.p
              className="font-display text-xl md:text-2xl lg:text-3xl text-text-secondary leading-relaxed mb-4 text-shadow-deep"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Twelve breath patterns. Animated visualizer.
            </motion.p>
            <motion.p
              className="text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              From foundational alternate-nostril breathing to advanced kevala kumbhaka —
              each pattern is animated phase-by-phase so you can follow along with precision.
            </motion.p>
            <motion.div
              className="mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              <div className="flex flex-col items-center gap-2 text-text-muted/40">
                <span className="font-mono text-[0.6rem] tracking-[0.3em] uppercase">Scroll to Enter</span>
                <motion.div
                  className="w-px h-8 bg-gradient-to-b from-gold/30 to-transparent"
                  animate={
                    reduced
                      ? {}
                      : {
                          scaleY: [1, 1.3, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }
                  }
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ── BREATH PATTERN GRID ── */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-32">
          <motion.div
            className="mb-12"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <p className="section-label mb-4" style={{ letterSpacing: '0.6em' }}>
              All Patterns
            </p>
            <p className="text-text-muted text-sm max-w-lg">
              Twelve prāṇāyāma techniques spanning four tiers — from foundational
              calming breaths to advanced retention practices. Each pattern includes
              an animated visualizer for guided practice.
            </p>
            <div className="divider-gold max-w-[200px] mt-8" />

            {/* ── EDITORIAL: Prāṇāyāma Tradition ── */}
            <div className="mt-10 max-w-2xl space-y-4 text-text-secondary text-sm leading-relaxed editorial-spacing">
              <p>
                Prāṇāyāma — from <em>prāṇa</em> (vital breath, life-force) and <em>āyāma</em> (extension, expansion) — is the fourth limb of Patañjali's aṣṭāṅga yoga and one of the six purification techniques (<em>ṣaṭkarma</em>) in the Haṭha Yoga Pradīpikā. In the Tantric traditions, however, breathwork occupies a far more central role than mere preparation for meditation. The breath is understood as the gross visible wave of prāṇa — the subtle energy that animates consciousness itself. Working with the breath is not a relaxation technique but a direct intervention in the energetics of awareness.
              </p>
              <p>
                The twelve patterns in this laboratory span four categories drawn from classical and field-attested sources. The foundational patterns — alternate-nostril breathing (<em>nāḍī śodhana</em>), abdominal breathing, and the victory breath (<em>ujjāyī</em>) — purify the nāḍī channels and establish the prāṇic baseline required for all subsequent work. The intermediate patterns introduce kumbhaka (breath retention), which is where prāṇāyāma becomes genuinely transformative: retention creates a controlled pressure differential in the energetic body that can dissolve blockages, activate dormant nāḍīs, and shift the dominant nostril cycle. Advanced patterns like kevala kumbhaka (spontaneous cessation of breath) represent the threshold where voluntary prāṇāyāma dissolves into the natural state of samādhi.
              </p>
              <p>
                The animated visualizer is not cosmetic. In traditional transmission, the guru demonstrates the rhythm and ratio of each technique — the precise timing of inhalation, retention, and exhalation — because these ratios determine whether the practice is calming, stimulating, or balancing. The visualizer replaces this in-person demonstration, showing you the exact phase transitions and timing. Follow it precisely. The prāṇāyāma tradition is precise: a ratio of 1:4:2 (inhalation:retention:exhalation) produces a fundamentally different effect than 1:2:2. Do not improvise the ratios until you have practiced a pattern consistently for at least forty days.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6"
            initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
            whileInView={staggerContainer.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            {allBreathPatterns.map((pattern, i) => (
              <BreathCard key={pattern.slug} pattern={pattern} index={i} />
            ))}
          </motion.div>
        </section>
      </div>

      {/* ═══ CINEMATIC STRIP ═══ */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ascetic-water-practice"
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
        <div
          className="absolute inset-0 pointer-events-none z-[1] cta-overlay-dark"
        />
        <ParallaxText
          speed={-0.04}
          className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center"
        >
          <p className="section-label mb-6">Continue the Practice</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">
            The breath is mapped.{' '}
            <span style={{ display: 'block' }}>The sādhana awaits.</span>
          </h2>
          <p
            className="text-foreground/70 text-lg mb-12 editorial-spacing text-shadow-deep"
          >
            Book a session with Kaustubh for a precise breathwork prescription — or
            explore the Archive and Practice sections to continue your own investigation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/consultations" className="gold-cta">
              Consult the Archivist
            </Link>
            <Link href="/practice" className="ghost-cta">
              Practice Hub
            </Link>
          </div>
        </ParallaxText>
      </section>

    </div>
  );
}
