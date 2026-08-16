'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import Link from 'next/link';
import { allSequences } from '@/lib/data/sequences';
import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { TIER_BADGE_STYLES, TIER_LABELS } from '@/lib/utils/tier-gate';
import { cn } from '@/lib/utils';
import { Clock, ArrowRight } from 'lucide-react';

/* ── Derived Data ── */
const findSiddhi = (slug: string) => allSiddhis.find((s) => s.slug === slug);
const findPattern = (slug: string) => allPatterns.find((p) => p.slug === slug);

/* ══════════════════════════════════════════════════════════════
   SEQUENCE CARD
   ══════════════════════════════════════════════════════════════ */
function SequenceCard({
  sequence,
  index,
}: {
  sequence: (typeof allSequences)[number];
  index: number;
}) {
  const tierLabel = TIER_LABELS[sequence.minTier];

  const stepNames = sequence.steps.map((s) => {
    const siddhi = findSiddhi(s.siddhiSlug);
    return siddhi?.name ?? s.label;
  });

  return (
    <motion.div variants={staggerItem} className="group">
      <Link
        href={`/sequences/${sequence.slug}`}
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
                TIER_BADGE_STYLES[sequence.minTier]
              )}
            >
              {tierLabel}
            </span>
          </div>

          {/* Sequence name + sanskrit */}
          <h3 className="font-display text-2xl md:text-3xl text-foreground leading-[1.05] tracking-[0.04em] mb-1 font-light group-hover:text-gold transition-colors duration-500">
            {sequence.name}
          </h3>
          {sequence.sanskrit && (
            <p className="font-mono text-xs text-copper tracking-[0.12em] mb-3">
              {sequence.sanskrit}
            </p>
          )}
          <p className="font-mono text-[0.8125rem] text-gold-dim tracking-[0.1em] mb-4">
            {sequence.subtitle}
          </p>

          {/* Description — clipped */}
          <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-2">
            {sequence.description}
          </p>

          {/* Step progression — horizontal mini-timeline */}
          <div className="flex items-center gap-2 mb-5">
            {stepNames.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className="w-6 h-6 rounded-full border flex items-center justify-center text-[0.6rem] font-mono"
                    style={{
                      borderColor: 'var(--copper)',
                      color: 'var(--copper)',
                    }}
                  >
                    {i + 1}
                  </div>
                </div>
                {i < stepNames.length - 1 && (
                  <div
                    className="w-6 md:w-10 h-px"
                    style={{ backgroundColor: 'var(--copper)', opacity: 0.3 }}
                  />
                )}
              </div>
            ))}
            <span className="font-mono text-[0.65rem] text-text-muted tracking-[0.1em] ml-1">
              {sequence.steps.length} steps
            </span>
          </div>

          {/* Target patterns as small chips */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {sequence.targetPatterns.map((pSlug) => {
              const pattern = findPattern(pSlug);
              if (!pattern) return null;
              return (
                <span
                  key={pSlug}
                  className="text-[0.6rem] font-mono tracking-[0.08em] uppercase px-2 py-0.5 border rounded-sm bg-surface/40 text-text-muted border-gold/10"
                >
                  {pattern.name}
                </span>
              );
            })}
          </div>

          {/* Footer: duration + arrow */}
          <div className="flex items-center justify-between pt-3 border-t border-gold/5">
            <div className="flex items-center gap-2 text-text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono text-[0.75rem] tracking-[0.08em]">
                {sequence.totalDuration}
              </span>
            </div>
            <span className="font-mono text-[0.75rem] text-text-muted group-hover:text-gold transition-colors duration-500 flex items-center gap-1.5">
              Enter sequence
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SEQUENCES — Main Page
   ══════════════════════════════════════════════════════════════ */
export default function SequencesPage() {
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
            <BackButton href="/patterns" label="Back to Patterns" className="mb-10 justify-center" />
            <motion.p
              className="section-label mb-6"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
            >
              Sādhana Protocols
            </motion.p>
            <motion.h1
              className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] tracking-[0.08em] mb-6 hero-heading uppercase"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              Practice{' '}
            <span style={{ display: 'block' }}>Sequences</span>
            </motion.h1>
            <motion.p
              className="font-display text-xl md:text-2xl lg:text-3xl text-text-secondary leading-relaxed mb-4 text-shadow-deep"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Multi-stage sādhana protocols.
            </motion.p>
            <motion.p
              className="text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              animate={fadeInUp.visible}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Each sequence chains specific siddhis into a coherent arc —
              designed to dissolve targeted emotional patterns.
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

        {/* ── SEQUENCE GRID ── */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-32">
          <motion.div
            className="mb-12"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <p className="section-label mb-4" style={{ letterSpacing: '0.6em' }}>
              All Sequences
            </p>
            <p className="text-text-muted text-sm max-w-lg">
              Six curated protocols — each chaining 3–4 siddhis into a
              progressive arc. Sequences are gated by tier: deeper work requires
              a deeper commitment.
            </p>
            <div className="divider-gold max-w-[200px] mt-8" />

            {/* ── EDITORIAL: Sequence Methodology ── */}
            <div className="mt-10 max-w-2xl space-y-4 text-text-secondary text-sm leading-relaxed editorial-spacing">
              <p>
                In the Tantric sādhana traditions, isolated techniques yield isolated results. A mantra chanted without preparatory purification is like planting a seed in barren soil — the intention may be pure, but the ground cannot sustain it. The KALKI practice sequences are designed to solve this problem by chaining specific siddhis into progressive arcs, where each stage prepares the nervous system, energetic body, and cognitive frame for the next.
              </p>
              <p>
                Each sequence follows a three-phase structure drawn from classical Kaula paddhatis: <em>āvaraṇa-bhedana</em> (dissolving the outer shell — the pattern you are trapped in), <em>sādhana-āropaṇa</em> (installing the new practice — the siddhi that replaces the pattern), and <em>samādhi-samāpti</em> (integration — allowing the new pattern to stabilize through rest and reflective awareness). This is not a linear sequence of techniques but a topology of transformation, where each siddhi modifies the internal landscape to make the next one more effective.
              </p>
              <p>
                The sequences are organized by the emotional pattern they target — not by tradition, lineage, or difficulty level. This is deliberate. The KALKI system identifies your dominant karmic loop through the Mirror Method, then prescribes the sequence that directly addresses that loop. The tier gating exists not as a paywall but as a safeguard: advanced sequences work with powerful psychological material that requires foundational stability to process safely.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6"
            initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
            whileInView={staggerContainer.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            {allSequences.map((seq, i) => (
              <SequenceCard key={seq.slug} sequence={seq} index={i} />
            ))}
          </motion.div>
        </section>
      </div>

      {/* ═══ CINEMATIC STRIP ═══ */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ascetic-himalayan-overlook"
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
          <p className="section-label mb-6">Continue the Investigation</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">
            The sequence is mapped.{' '}
            <span style={{ display: 'block' }}>The sādhana awaits.</span>
          </h2>
          <p
            className="text-foreground/70 text-lg mb-12 editorial-spacing text-shadow-deep"
          >
            Book a session with Kaustubh for a precise prescription — or
            explore the Archive and Pattern Atlas to continue your own
            investigation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/consultations" className="gold-cta">
              Consult the Archivist
            </Link>
            <Link href="/patterns" className="ghost-cta">
              Pattern Atlas
            </Link>
          </div>
        </ParallaxText>
      </section>

    </div>
  );
}
