'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { STAGE_ACCENT_COLORS } from '@/lib/tier-colors';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import { MirrorMethodSteps } from '@/components/patterns/MirrorMethodSteps';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { BackButton } from '@/components/nav/BackButton';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────
   THE MIRROR METHOD — The Architecture of Pattern Dissolution
   Five stages. From recognition to liberation.
   ───────────────────────────────────────────────────────────── */

const stages = [
  {
    num: 1,
    title: 'Pattern Recognition',
    titleSanskrit: 'Pratyakṣa Jñāna',
    text: 'The first step is naming the loop. Every recurring frustration, every self-sabotaging decision, every relationship that ends the same way — these are not random. They are patterns with names, origins, and specific sādhanas designed to address them. KALKI maps 12 core psychological patterns to specific tantric practices drawn from the Aghorī, Kashmiri Shaiva, and Buddhist Vajrayāna traditions. Until a pattern is named, it operates invisibly — shaping your choices from the shadows of unconscious habit. Recognition is the first act of freedom.',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/manuscript-sacred-geometry.jpeg',
    icon: '◉',
    color: STAGE_ACCENT_COLORS.gold,
  },
  {
    num: 2,
    title: 'Emotional Origin',
    titleSanskrit: 'Kāraṇa Bhāva',
    text: 'Every pattern started somewhere. Not as a flaw, but as a survival strategy. The Rescuer pattern formed because love felt conditional on being useful. The Perfectionist formed because safety meant never making a mistake. The Victim pattern formed because power was taken, not given. Understanding the origin dissolves shame and replaces it with clarity — you see not a broken self, but a brilliant adaptation that has outlived its purpose. The Mirror Method traces each pattern back to its emotional root, often located in early formative experiences where the nervous system first learned to contract.',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-temple-midnight.jpeg',
    icon: '◎',
    color: STAGE_ACCENT_COLORS.teal,
  },
  {
    num: 3,
    title: 'Karmic Reinforcement',
    titleSanskrit: 'Saṃskāra Vṛtti',
    text: 'Patterns persist because they are reinforced by karma — not in the mystical sense, but in the neurological. Each repetition strengthens the neural pathway. Each time you choose the familiar pain over the unknown growth, you deepen the groove. The yogic concept of saṃskāra (mental imprint) maps precisely to modern neuroscience\'s understanding of neuroplasticity: repeated neural firing creates stable pathways that become the default mode of perception and reaction. The sādhanas are designed to create new grooves — new neural pathways that weaken the old pattern while strengthening a new, conscious response.',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/pattern-intelligence-rescuer.jpeg',
    icon: '◎',
    color: STAGE_ACCENT_COLORS.copper,
  },
  {
    num: 4,
    title: 'Behavioral Expression',
    titleSanskrit: 'Vyavahāra Prakāśa',
    text: 'Patterns do not stay in the mind. They express through behavior: the way you speak, the relationships you choose, the work you avoid, the anger you swallow, the boundaries you cannot set. Observing these expressions without judgment is itself a practice — and it is the gateway to change. The Mirror Method teaches you to witness your own behavioral expressions as a detached observer would, creating the critical gap between stimulus and response that Viktor Frankl described. In that gap lies your freedom. In that gap, the sādhana begins.',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/mountain-pass-trident.jpeg',
    icon: '◉',
    color: STAGE_ACCENT_COLORS.violet,
  },
  {
    num: 5,
    title: 'Conscious Intervention',
    titleSanskrit: 'Sādhanā Praveśa',
    text: 'This is where the ancient meets the personal. With awareness of the pattern, its origin, its reinforcement, and its expression, you can now choose a different response. The specific sādhana prescribed for your pattern becomes the tool of intervention — not as an escape, but as a disciplined practice of rewiring. Mantra dissolves the emotional charge. Prāṇāyāma regulates the nervous system. Yantra meditation rewires spatial cognition. Each practice targets a specific layer of the pattern, creating a comprehensive intervention that addresses not just the symptom but the root. This is not self-improvement. This is self-dissolution — the systematic untying of knots you did not know you carried.',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/copper-trident-courtyard-2.jpeg',
    icon: '◉',
    color: STAGE_ACCENT_COLORS.gold,
  },
];

/* ─── Stage Navigation (Desktop sidebar + Mobile bottom dock) ─── */
function StageNav({ activeStage }: { activeStage: number }) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 flex-col gap-1 pl-4"
        aria-label="Stage navigation"
      >
        {stages.map((s, i) => {
          const isActive = i === activeStage;
          return (
            <a
              key={s.num}
              href={`#stage-${s.num}`}
              className={cn(
                'group flex items-center gap-3 py-2 pr-4 rounded-r transition-all duration-300',
                isActive ? 'bg-foreground/5' : 'hover:bg-foreground/[0.02]',
              )}
              aria-current={isActive ? 'true' : undefined}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full border-2 transition-all duration-500',
                    isActive
                      ? 'border-gold bg-gold scale-125'
                      : 'border-foreground/20 bg-transparent group-hover:border-foreground/40',
                  )}
                  style={isActive ? { boxShadow: `0 0 8px ${s.color}66` } : undefined}
                />
                {i < stages.length - 1 && (
                  <div className={cn(
                    'w-px h-6 mt-1 transition-colors duration-500',
                    i < activeStage ? 'bg-gold/30' : 'bg-foreground/10',
                  )} />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={cn(
                  'font-mono text-[0.6rem] tracking-widest uppercase transition-colors duration-300',
                  isActive ? 'text-gold' : 'text-foreground/30 group-hover:text-foreground/50',
                )}>
                  Stage {s.num}
                </span>
                <span className={cn(
                  'text-[0.55rem] truncate max-w-[110px] transition-colors duration-300',
                  isActive ? 'text-foreground/60' : 'text-foreground/20 group-hover:text-foreground/30',
                )}>
                  {s.title}
                </span>
              </div>
            </a>
          );
        })}
      </nav>

      {/* Mobile horizontal scroll dock */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-deep-black/90 backdrop-blur-md border-t border-foreground/5"
        aria-label="Stage navigation"
      >
        <div className="flex overflow-x-auto gap-0 px-2 py-2 scrollbar-none">
          {stages.map((s, i) => {
            const isActive = i === activeStage;
            return (
              <a
                key={s.num}
                href={`#stage-${s.num}`}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-md shrink-0 transition-all duration-300',
                  isActive ? 'bg-foreground/5' : 'hover:bg-foreground/[0.02]',
                )}
              >
                <span className={cn(
                  'font-mono text-[0.6rem] tracking-widest uppercase',
                  isActive ? 'text-gold' : 'text-foreground/30',
                )}>
                  {s.num}
                </span>
                <div className={cn(
                  'w-1 h-1 rounded-full transition-all duration-500',
                  isActive ? 'bg-gold' : 'bg-foreground/15',
                )} />
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/* ─── Expandable Stage Detail ─── */
function StageDetail({ stageNum, expanded }: { stageNum: number; expanded: boolean }) {
  const detail = stageDetails[stageNum];
  if (!detail || !expanded) return null;
  return (
    <div className="mt-6 glass-panel p-6 md:p-8 space-y-4">
      <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase mb-3">{detail.heading}</p>
      <p className="text-foreground/70 text-sm leading-relaxed">{detail.text}</p>
      {detail.links && (
        <div className="flex gap-2 mt-3">{detail.links}</div>
      )}
    </div>
  );
}

const stageDetails: Record<number, { heading: string; text: React.ReactNode; links?: React.ReactNode } | null> = {
  1: {
    heading: 'Linked Practices',
    text: <p>The Pattern Intelligence system on KALKI maps 12 archetypal patterns — Rescuer, Perfectionist, Victim, Rebel, Caretaker, Avoider, Controller, Martyr, People-Pleaser, Imposter, Chameleon, and Seeker. Each pattern links to specific siddhis from the Akashic Archive and corresponding sādhanas from the Sādhanā Library. The <Link href="/patterns" className="text-gold hover:text-gold-bright transition-colors underline underline-offset-4 decoration-gold/30">Pattern Atlas</Link> is the entry point.</p>,
    links: <><Link href="/patterns" className="ghost-cta text-xs">Pattern Atlas</Link><Link href="/archetypes" className="ghost-cta text-xs">Archetypes</Link></>,
  },
  2: {
    heading: 'How Origin Mapping Works',
    text: <p>Through guided self-inquiry and AI-assisted pattern analysis, the Mirror Method traces each behavioral loop to its formative origin. This is not therapy — it is tantric diagnostics. The practitioner learns to identify the exact moment of pattern formation, often tracing back to a single emotional decision made in childhood. The <Link href="/archetypes" className="text-gold hover:text-gold-bright transition-colors underline underline-offset-4 decoration-gold/30">Archetype Quiz</Link> provides an initial assessment.</p>,
  },
  3: {
    heading: 'Breaking the Saṃskāra Loop',
    text: <p>Saṃskāras are deep mental impressions formed by repeated actions and experiences. In tantric psychology, these impressions store emotional charge and create automatic behavioral responses. The practice of prāṇāyāma directly addresses the nervous system where these patterns are stored, while mantra practice dissolves the emotional charge held within the saṃskāra. The <Link href="/practice" className="text-gold hover:text-gold-bright transition-colors underline underline-offset-4 decoration-gold/30">Prāṇāyāma Timer</Link> offers guided breathwork for this stage.</p>,
  },
  4: {
    heading: 'The Witness Practice',
    text: <p>Observing behavioral expressions without judgment is the core of Sakshi Bhāva — the practice of witnessing. This is not suppression or analysis. It is pure observation: watching yourself react, choose, avoid, and contract — with the compassionate detachment of a seasoned practitioner. The <Link href="/practice/japa" className="text-gold hover:text-gold-bright transition-colors underline underline-offset-4 decoration-gold/30">Japa Mālā</Link> practice cultivates this witness awareness through repetitive mantra recitation.</p>,
  },
  5: {
    heading: 'Prescribed Intervention',
    text: <p>Conscious intervention is not self-improvement — it is self-dissolution. The specific sādhana prescribed targets your pattern at multiple levels simultaneously: mantra dissolves emotional charge, prāṇāyāma regulates the nervous system, yantra meditation rewires spatial cognition, and specific rituals from the Aghorī tradition address the deepest karmic imprints. The <Link href="/library" className="text-gold hover:text-gold-bright transition-colors underline underline-offset-4 decoration-gold/30">Sādhanā Library</Link> contains 31 evidence-graded protocols for precise intervention.</p>,
    links: <><Link href="/library" className="ghost-cta text-xs">Sādhanā Library</Link><Link href="/aghoiri-tantra" className="ghost-cta text-xs">Aghorī Tantra Course</Link></>,
  },
};

/* ─── Single Stage Block ─── */
function StageBlock({ stage, index }: { stage: typeof stages[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const isEven = index % 2 === 0;

  return (
    <motion.section
      id={`stage-${stage.num}`}
      className="mb-20 md:mb-32 scroll-mt-24"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className={cn(
        'grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch',
      )}>
        {/* Image column */}
        <ScrollParallax speed={-0.06} disabled className={cn('relative min-h-[50vh] md:min-h-[60vh] overflow-hidden', !isEven && 'md:order-2')}>
          <CinematicImage
            src={stage.image}
            alt={stage.title}
            kenBurns="slow"
            scrim="full"
            vignette
            volumetric
            dust
            className="absolute inset-0"
          />
          {/* Stage number watermark */}
          <div className="absolute top-6 right-6 md:top-10 md:right-10 z-10">
            <span
              className="font-mono text-[7rem] md:text-[10rem] font-bold leading-none select-none"
              style={{ color: `${stage.color}08` }}
            >
              {String(stage.num).padStart(2, '0')}
            </span>
          </div>
          {/* Icon overlay */}
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
            <span
              className="text-4xl md:text-5xl font-light"
              style={{
                color: stage.color,
                textShadow: `0 0 30px ${stage.color}40, 0 2px 12px rgba(0,0,0,0.8)`,
              }}
            >
              {stage.icon}
            </span>
          </div>
        </ScrollParallax>

        {/* Text column */}
        <div className={cn('flex flex-col justify-center', !isEven && 'md:order-1')}>
          {/* Stage number + Sanskrit */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-display text-xl md:text-2xl font-light"
              style={{
                borderColor: `${stage.color}60`,
                color: stage.color,
                boxShadow: `0 0 20px ${stage.color}15, inset 0 0 12px ${stage.color}08`,
              }}
            >
              {stage.num}
            </span>
            <div>
              <p className="text-caption text-xs" style={{ color: `${stage.color}AA` }}>Stage {stage.num} of 5</p>
            </div>
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white tracking-wide leading-tight mb-2 engraved-heading">
            {stage.title}
          </h2>
          <p className="text-foreground/30 text-sm italic mb-6 font-display tracking-wide">
            {stage.titleSanskrit}
          </p>

          <p className="text-foreground/75 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
            {stage.text}
          </p>

          {/* Expand/collapse for practice details */}
          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              'flex items-center gap-3 text-sm font-ui tracking-[0.12em] uppercase transition-all duration-400 group',
              'hover:gap-4',
            )}
            style={{ color: stage.color }}
          >
            <span>{expanded ? 'Collapse Details' : 'Explore This Stage'}</span>
            <motion.span
              animate={{ rotate: expanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-lg"
            >+</motion.span>
          </button>

          <StageDetail stageNum={stage.num} expanded={expanded} />
        </div>
      </div>
    </motion.section>
  );
}

/* ─── MAIN PAGE ─── */
export default function MethodPage() {
  const reduced = useReducedMotion();
  const [activeStage, setActiveStage] = useState(0);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track active stage via IntersectionObserver
  useEffect(() => {
    const refs = stageRefs.current.filter(Boolean);
    if (refs.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = refs.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveStage(idx);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );

    refs.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-deep-black min-h-screen">
      {/* ═══ HERO ═══ */}
      <header className="relative min-h-[90vh] md:min-h-[100vh] flex items-end overflow-hidden">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/forgotten-forest-shrine.jpeg'
          alt='The Mirror Method — Architecture of Pattern Dissolution'
          kenBurns="slow"
          scrim="bottom"
          vignette
          volumetric
          dust
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/30 to-deep-black/40" />
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 md:pb-28 pt-32">
          <motion.p
            className="section-label mb-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
          >
            THE ARCHITECTURE
          </motion.p>
          <motion.h1
            className="font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            The Mirror<br />Method
          </motion.h1>
          <motion.p
            className="text-foreground/70 text-lg md:text-xl max-w-2xl leading-relaxed"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            A five-stage framework for recognizing and dissolving your psychological patterns through ancient sādhana. Not self-improvement. Self-dissolution.
          </motion.p>
        </div>
      </header>

      {/* ═══ STATS BAR ═══ */}
      <div className="atmospheric-bg h-24 -mt-10 relative z-10" />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 -mt-4 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">5</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Stages</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">12</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Patterns Mapped</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">31</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Sādhana Protocols</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">3</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Tantric Traditions</p>
          </div>
        </div>
      </div>

      {/* ═══ BACK + HORIZONTAL STEP OVERVIEW ═══ */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-16">
        <BackButton href="/" label="Back to Home" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-8">
        <p className="section-label mb-6">The Five Stages</p>
        <MirrorMethodSteps className="mb-4" />
      </div>

      {/* ═══ CINEMATIC STRIP I ═══ */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ritual-items-altar.jpeg'
          alt='Ceremonial altar with sacred instruments'
          kenBurns="normal"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* ═══ EDITORIAL DIVIDER ═══ */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 md:py-36">
        <div className="divider-gold mb-16" />
        <ParallaxText speed={-0.05} className="max-w-3xl mx-auto text-center">
          <p className="text-sub-display text-foreground mb-6 engraved-heading">
            Your patterns<br />have names.<br />Your sādhanas<br />are waiting.
          </p>
          <p className="text-editorial max-w-xl mx-auto">
            The Mirror Method is not a theory. It is a diagnostic framework drawn from three living tantric traditions, mapped to modern pattern recognition, and delivered through precise, graded sādhanas.
          </p>
        </ParallaxText>
        <div className="divider-gold mt-16" />
      </div>

      {/* ═══ STAGE NAVIGATION ═══ */}
      <StageNav activeStage={activeStage} />

      {/* ═══ THE FIVE STAGES ═══ */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {stages.map((stage, i) => (
          <div key={stage.num} ref={(el) => { stageRefs.current[i] = el; }}>
            {i > 0 && <div className="divider-gold max-w-3xl mx-auto mb-20 md:mb-32" />}
            <StageBlock stage={stage} index={i} />
          </div>
        ))}
      </div>

      {/* ═══ CINEMATIC STRIP II ═══ */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/meditation-platform-overlooking.jpeg'
          alt='Meditation platform overlooking the Himalayas'
          kenBurns="normal"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* ═══ CLOSING — Enter the Practice ═══ */}
      <section className="relative py-24 md:py-36 safe-bottom">
        <ScrollParallax speed={-0.06} disabled>
          <CinematicImage
            src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-codex-scroll.jpeg'
            alt='Ancient codex with golden illumination'
            className="absolute inset-0"
            scrim="full"
            vignette
          />
        </ScrollParallax>
        <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: 'rgba(0,0,0,0.75)' }} />
        <ParallaxText speed={-0.04} className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <p className="section-label mb-6">Begin the Dissolution</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">
            The Method is the Mirror.<br />The Practice is the Polishing.
          </h2>
          <p className="text-foreground/70 text-lg mb-12 editorial-spacing" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
            Book a consultation with Kaustubh to discover your dominant pattern and receive a prescribed sādhana — or explore the Archive and Library to begin your own investigation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <WhatsAppCTA variant="inline" label="Consult Kaustubh" />
            <Link href="/patterns" className="ghost-cta">Explore Patterns</Link>
          </div>
        </ParallaxText>
      </section>

      {/* ═══ FOOTER ═══ */}
      <div className="relative pb-28 md:pb-20 mt-16">
        <div className="atmospheric-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-gold/40 rounded-full" style={{ animation: 'binduPulse 2s ease-in-out infinite' }} />
          </div>
          <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper">
            THE MIRROR METHOD — PATTERN DISSOLUTION FRAMEWORK
          </p>
          <p className="text-foreground/30 text-xs mt-3 max-w-md mx-auto">
            Drawn from Aghorī, Kashmiri Shaiva, and Buddhist Vajrayāna traditions.
          </p>
        </div>
      </div>
    </div>
  );
}
