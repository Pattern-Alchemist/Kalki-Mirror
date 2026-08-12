'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { STAGE_ACCENT_COLORS } from '@/lib/tier-colors';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import { BreathTimer } from '@/components/practice/BreathTimer';
import { allBreathPatterns } from '@/lib/data/breath-patterns';
import { BackButton } from '@/components/nav/BackButton';
import { ResonanceToggle } from '@/components/ui/ResonanceToggle';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import { Timer, CircleDot, Wind, Flame, Moon } from 'lucide-react';

const AIBreathworkGenerator = dynamic(() => import('@/components/ai/AIBreathworkGenerator').then(m => ({ default: m.AIBreathworkGenerator })), { ssr: false, loading: () => <div className="h-32" /> });

const FREE_PATTERNS = ['nadi-shuddhi-basic', 'bhramari', 'ujjayi-pranayama'];

/* ─────────────────────────────────────────────────────────────
   SECTION DATA — Three practice gates
   ───────────────────────────────────────────────────────────── */

const practiceSections = [
  {
    id: 'pranayama',
    num: 1,
    title: 'Pr\u0101\u1E47\u0101y\u0101ma',
    subtitle: 'Breathwork Timer',
    sanskrit: 'Pr\u0101\u1E47\u0101y\u0101ma \u2014 The Mastery of Pr\u0101\u1E47a',
    icon: Wind,
    color: STAGE_ACCENT_COLORS.gold,
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-meditation-platform',
    text: 'The breath is the bridge between body and consciousness. Pr\u0101\u1E47\u0101y\u0101ma is not merely breathing exercises \u2014 it is the systematic regulation of vital energy through precise rhythmic patterns. Each pattern targets a specific nervous system state: N\u0101\u1E0D\u012B \u015Auddhi balances the left and right energy channels, Bhramar\u012B activates the vagus nerve for deep parasympathetic release, and Ujj\u0101y\u012B creates internal heat and focused attention. The timer below guides you through each phase with visual and haptic cues, turning an ancient practice into a precise, repeatable protocol.',
  },
  {
    id: 'japa',
    num: 2,
    title: 'Japa M\u0101l\u0101',
    subtitle: 'Mantra Counter',
    sanskrit: 'Japa \u2014 The Repetition That Dissolves',
    icon: CircleDot,
    color: STAGE_ACCENT_COLORS.teal,
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-cremation-ground-alt',
    text: 'Count your mantra repetitions with precision. The m\u0101l\u0101 persists in your browser across sessions, tracking your daily rounds and total count. Each bead represents one full recitation \u2014 a single thread in the tapestry of your practice. Select from traditional mantras or enter your own. The counter supports multiple m\u0101l\u0101s of 108 beads, with haptic and visual feedback at each bead boundary. In the tantric tradition, 108 is not arbitrary \u2014 it represents the 108 energy lines (n\u0101\u1E0D\u012Bs) that converge to form the heart chakra.',
  },
  {
    id: 'timer',
    num: 3,
    title: 'Silent Sitting',
    subtitle: 'Meditation Timer',
    sanskrit: 'Mauna \u2014 The Practice of Sacred Silence',
    icon: Timer,
    color: STAGE_ACCENT_COLORS.violet,
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/dark-temple-interior',
    text: 'A minimal timer for unstructured meditation practice. Set your duration, begin sitting, and let the timer handle the rest. A gentle bell signals the end of the session \u2014 no jarring alarms, no interruptions to your stillness. The interface disappears during practice, leaving only the breathing indicator and remaining time. Designed to support, never distract. In the Aghor\u012B tradition, mauna (silence) is considered the highest form of s\u0101dhana \u2014 not because speech is sinful, but because silence reveals what words conceal.',
  },
];

/* ─── Section Navigation (Desktop sidebar + Mobile bottom dock) ─── */
function SectionNav({ activeSection }: { activeSection: number }) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 flex-col gap-1 pl-4"
        aria-label="Practice section navigation"
      >
        {practiceSections.map((s, i) => {
          const isActive = i === activeSection;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
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
                />\n                {i < practiceSections.length - 1 && (
                  <div className={cn(
                    'w-px h-6 mt-1 transition-colors duration-500',
                    i < activeSection ? 'bg-gold/30' : 'bg-foreground/10',
                  )} />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={cn(
                  'font-mono text-[0.6rem] tracking-widest uppercase transition-colors duration-300',
                  isActive ? 'text-gold' : 'text-foreground/30 group-hover:text-foreground/50',
                )}>
                  Gate {s.num}
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
        aria-label="Practice section navigation"
      >
        <div className="flex overflow-x-auto gap-0 px-2 py-2 scrollbar-none">
          {practiceSections.map((s, i) => {
            const isActive = i === activeSection;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-1.5 rounded-md shrink-0 transition-all duration-300',
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

/* ─── Breathwork Pattern Detail (extracted to avoid SWC parse issues) ─── */
function BreathworkPanel({ active, reduced }: { active: string; reduced: boolean }) {
  const freePatterns = allBreathPatterns.filter((p) => FREE_PATTERNS.includes(p.slug));
  const lockedPatterns = allBreathPatterns.filter((p) => !FREE_PATTERNS.includes(p.slug));

  return (
    <>
      {/* Pattern tabs */}
      <div className="flex flex-wrap gap-2 mb-12">
        {freePatterns.map((p) => (
          <BreathTab key={p.slug} pattern={p} isActive={active === p.slug} locked={false} />
        ))}
        {lockedPatterns.map((p) => (
          <BreathTab key={p.slug} pattern={p} isActive={false} locked />
        ))}
      </div>

      <BreathTimer patternSlug={active} />

      {/* AI Breathwork Generator */}
      <div className="mt-12">
        <AIBreathworkGenerator />
      </div>
    </>
  );
}

function BreathTab({ pattern, isActive, locked }: { pattern: typeof allBreathPatterns[0]; isActive: boolean; locked: boolean }) {
  return (
    <button
      disabled={locked}
      className={cn(
        'px-5 py-2.5 text-[0.65rem] font-ui tracking-[0.15em] uppercase rounded-sm transition-all duration-400',
        isActive
          ? 'bg-gold text-deep-black'
          : locked
            ? 'bg-surface text-text-muted/40 cursor-not-allowed border border-gold/5'
            : 'bg-surface text-text-muted hover:text-gold-dim border border-gold/5 hover:border-gold/20',
      )}
      title={locked ? `${pattern.name} \u2014 unlock with ${pattern.minTier} tier` : undefined}
    >
      {pattern.name}
    </button>
  );
}

/* ─── MAIN PAGE ─── */
export default function PracticePage() {
  const [active, setActive] = useState(FREE_PATTERNS[0]);
  const reduced = useReducedMotion() ?? false;
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const refs = sectionRefs.current.filter(Boolean);
    if (refs.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = refs.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveSection(idx);
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
      {/* \u2550\u2550\u2550 HERO \u2550\u2550\u2550 */}
      <header className="relative min-h-[85vh] md:min-h-[95vh] flex items-end overflow-hidden">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/forgotten-forest-shrine.jpeg'
          alt='S\u0101dhana Tools \u2014 Guided Practice Gateway'
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
            THE PRACTICE GATE
          </motion.p>
          <motion.h1
            className="font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            S\u0101dhana<br />Tools
          </motion.h1>
          <motion.p
            className="text-foreground/70 text-lg md:text-xl max-w-2xl leading-relaxed"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Guided breathwork, japa counting, and meditation timers. Three practice gates drawn from living tantric lineages \u2014 structured for the modern practitioner.
          </motion.p>
        </div>
      </header>

      {/* \u2550\u2550\u2550 STATS BAR \u2550\u2550\u2550 */}
      <div className="atmospheric-bg h-24 -mt-10 relative z-10" />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 -mt-4 mb-12">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">{allBreathPatterns.length}</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Breath Patterns</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">108</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Beads Per M\u0101l\u0101</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">21</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Min Default</p>
          </div>
        </div>
      </div>

      {/* \u2550\u2550\u2550 BACK + RESONANCE \u2550\u2550\u2550 */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-8 flex items-center justify-between">
        <BackButton href="/" label="Back to Home" />
        <ResonanceToggle />
      </div>

      {/* \u2550\u2550\u2550 CINEMATIC STRIP I \u2550\u2550\u2550 */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-cremation-ground-alt'
          alt='Ceremonial altar with sacred instruments'
          kenBurns="normal"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* \u2550\u2550\u2550 EDITORIAL DIVIDER \u2550\u2550\u2550 */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 md:py-36">
        <div className="divider-gold mb-16" />
        <ParallaxText speed={-0.05} className="max-w-3xl mx-auto text-center">
          <p className="text-sub-display text-foreground mb-6 engraved-heading">
            Where pattern<br />meets discipline.
          </p>
          <p className="text-editorial max-w-xl mx-auto">
            The tools on this page are not wellness apps. They are structured practice instruments drawn from the Aghor\u012B, Kashmiri Shaiva, and Vajray\u0101na traditions \u2014 each one a specific gate to a specific state.
          </p>
        </ParallaxText>
        <div className="divider-gold mt-16" />
      </div>

      {/* \u2550\u2550\u2550 SECTION NAVIGATION \u2550\u2550\u2550 */}
      <SectionNav activeSection={activeSection} />

      {/* \u2550\u2550\u2550 GATE 1 \u2014 PR\u0100\u1E46\u0100Y\u0100MA \u2550\u2550\u2550 */}
      <div ref={(el) => { sectionRefs.current[0] = el; }}>
        <section id="pranayama" className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-20 md:mb-32 scroll-mt-24">
          <motion.div
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
              {/* Image column */}
              <ScrollParallax speed={-0.06} disabled className="relative min-h-[50vh] md:min-h-[60vh] overflow-hidden">
                <CinematicImage
                  src={practiceSections[0].image}
                  alt="Pr\u0101\u1E47\u0101y\u0101ma practice"
                  kenBurns="slow"
                  scrim="full"
                  vignette
                  volumetric
                  dust
                  className="absolute inset-0"
                />
                <div className="absolute top-6 right-6 md:top-10 md:right-10 z-10">
                  <span
                    className="font-mono text-[7rem] md:text-[10rem] font-bold leading-none select-none"
                    style={{ color: `${practiceSections[0].color}08` }}
                  >
                    01
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
                  <Wind
                    className="w-10 h-10 md:w-12 md:h-12"
                    style={{
                      color: practiceSections[0].color,
                      filter: `drop-shadow(0 0 20px ${practiceSections[0].color}40)`,
                    }}
                  />
                </div>
              </ScrollParallax>

              {/* Text column */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-display text-xl md:text-2xl font-light"
                    style={{
                      borderColor: `${practiceSections[0].color}60`,
                      color: practiceSections[0].color,
                      boxShadow: `0 0 20px ${practiceSections[0].color}15, inset 0 0 12px ${practiceSections[0].color}08`,
                    }}
                  >
                    1
                  </span>
                  <p className="text-caption text-xs" style={{ color: `${practiceSections[0].color}AA` }}>Gate 1 of 3</p>
                </div>

                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white tracking-wide leading-tight mb-2 engraved-heading">
                  {practiceSections[0].title}
                </h2>
                <p className="text-foreground/30 text-sm italic mb-6 font-display tracking-wide">
                  {practiceSections[0].sanskrit}
                </p>

                <p className="text-foreground/75 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
                  {practiceSections[0].text}
                </p>

                <Link href="/practice#pranayama" className="ghost-cta text-xs self-start">Explore Breathwork</Link>
              </div>
            </div>
          </motion.div>

          {/* Full-width timer section below the hero block */}
          <motion.div
            className="mt-16"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true, margin: '-40px' }}
          >
            <BreathworkPanel active={active} reduced={reduced} />
          </motion.div>
        </section>
      </div>

      {/* \u2550\u2550\u2550 CINEMATIC STRIP II \u2550\u2550\u2550 */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/dark-temple-interior'
          alt='Temple interior with lamp light'
          kenBurns="normal"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* \u2550\u2550\u2550 GATE 2 \u2014 JAPA M\u0100L\u0100 \u2550\u2550\u2550 */}
      <div ref={(el) => { sectionRefs.current[1] = el; }}>
        <section id="japa" className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-20 md:mb-32 scroll-mt-24">
          <motion.div
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
              {/* Text column (reversed order on desktop) */}
              <div className="flex flex-col justify-center md:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-display text-xl md:text-2xl font-light"
                    style={{
                      borderColor: `${practiceSections[1].color}60`,
                      color: practiceSections[1].color,
                      boxShadow: `0 0 20px ${practiceSections[1].color}15, inset 0 0 12px ${practiceSections[1].color}08`,
                    }}
                  >
                    2
                  </span>
                  <p className="text-caption text-xs" style={{ color: `${practiceSections[1].color}AA` }}>Gate 2 of 3</p>
                </div>

                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white tracking-wide leading-tight mb-2 engraved-heading">
                  {practiceSections[1].title}
                </h2>
                <p className="text-foreground/30 text-sm italic mb-6 font-display tracking-wide">
                  {practiceSections[1].sanskrit}
                </p>

                <p className="text-foreground/75 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
                  {practiceSections[1].text}
                </p>

                <Link href="/practice/japa" className="gold-cta inline-block self-start">Open Japa Counter</Link>
              </div>

              {/* Image column (reversed on desktop) */}
              <ScrollParallax speed={-0.06} disabled className="relative min-h-[50vh] md:min-h-[60vh] overflow-hidden md:order-2">
                <CinematicImage
                  src={practiceSections[1].image}
                  alt="Japa m\u0101l\u0101 practice"
                  kenBurns="slow"
                  scrim="full"
                  vignette
                  volumetric
                  dust
                  className="absolute inset-0"
                />
                <div className="absolute top-6 right-6 md:top-10 md:right-10 z-10">
                  <span
                    className="font-mono text-[7rem] md:text-[10rem] font-bold leading-none select-none"
                    style={{ color: `${practiceSections[1].color}08` }}
                  >
                    02
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
                  <CircleDot
                    className="w-10 h-10 md:w-12 md:h-12"
                    style={{
                      color: practiceSections[1].color,
                      filter: `drop-shadow(0 0 20px ${practiceSections[1].color}40)`,
                    }}
                  />
                </div>
              </ScrollParallax>
            </div>
          </motion.div>

          {/* Japa preview card */}
          <motion.div
            className="mt-16 max-w-lg mx-auto"
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <div className="glass-panel p-8 md:p-10 text-center">
              <CircleDot className="w-10 h-10 text-gold/40 mx-auto mb-4" />
              <p className="font-display text-6xl md:text-7xl text-gold font-light mb-2">108</p>
              <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-foreground/40">Beads Per M\u0101l\u0101</p>
              <div className="mt-6 flex justify-center gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gold/20" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <p className="text-foreground/30 text-xs mt-6 max-w-sm mx-auto">
                The m\u0101l\u0101 persists across sessions. Your count is stored locally in your browser \u2014 private, precise, uninterrupted.
              </p>
            </div>
          </motion.div>
        </section>
      </div>

      {/* \u2550\u2550\u2550 GATE 3 \u2014 SILENT SITTING \u2550\u2550\u2550 */}
      <div ref={(el) => { sectionRefs.current[2] = el; }}>
        <section id="timer" className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-20 md:mb-32 scroll-mt-24 safe-bottom">
          <div className="divider-gold max-w-3xl mx-auto mb-20 md:mb-32" />
          <motion.div
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
              {/* Image column */}
              <ScrollParallax speed={-0.06} disabled className="relative min-h-[50vh] md:min-h-[60vh] overflow-hidden">
                <CinematicImage
                  src={practiceSections[2].image}
                  alt="Silent meditation practice"
                  kenBurns="slow"
                  scrim="full"
                  vignette
                  volumetric
                  dust
                  className="absolute inset-0"
                />
                <div className="absolute top-6 right-6 md:top-10 md:right-10 z-10">
                  <span
                    className="font-mono text-[7rem] md:text-[10rem] font-bold leading-none select-none"
                    style={{ color: `${practiceSections[2].color}08` }}
                  >
                    03
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
                  <Moon
                    className="w-10 h-10 md:w-12 md:h-12"
                    style={{
                      color: practiceSections[2].color,
                      filter: `drop-shadow(0 0 20px ${practiceSections[2].color}40)`,
                    }}
                  />
                </div>
              </ScrollParallax>

              {/* Text column (reversed on desktop) */}
              <div className="flex flex-col justify-center md:order-1">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-display text-xl md:text-2xl font-light"
                    style={{
                      borderColor: `${practiceSections[2].color}60`,
                      color: practiceSections[2].color,
                      boxShadow: `0 0 20px ${practiceSections[2].color}15, inset 0 0 12px ${practiceSections[2].color}08`,
                    }}
                  >
                    3
                  </span>
                  <p className="text-caption text-xs" style={{ color: `${practiceSections[2].color}AA` }}>Gate 3 of 3</p>
                </div>

                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white tracking-wide leading-tight mb-2 engraved-heading">
                  {practiceSections[2].title}
                </h2>
                <p className="text-foreground/30 text-sm italic mb-6 font-display tracking-wide">
                  {practiceSections[2].sanskrit}
                </p>

                <p className="text-foreground/75 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
                  {practiceSections[2].text}
                </p>

                <Link href="/practice/timer" className="gold-cta inline-block self-start">Open Timer</Link>
              </div>
            </div>
          </motion.div>

          {/* Timer preview card */}
          <motion.div
            className="mt-16 max-w-lg mx-auto"
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <div className="glass-panel p-8 md:p-10 text-center">
              <Timer className="w-10 h-10 text-gold/40 mx-auto mb-4" />
              <p className="font-display text-6xl md:text-7xl text-gold font-light mb-2">21</p>
              <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-foreground/40">Minutes Default</p>
              <div className="mt-6 w-16 h-16 mx-auto rounded-full border border-gold/20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-gold/50 rounded-full" style={{ animation: 'breatheSlow 6s ease-in-out infinite' }} />
              </div>
              <p className="text-foreground/30 text-xs mt-6 max-w-sm mx-auto">
                The interface disappears during practice. Only the breathing indicator and remaining time remain \u2014 designed to support, never distract.
              </p>
            </div>
          </motion.div>
        </section>
      </div>

      {/* \u2550\u2550\u2550 CINEMATIC STRIP III \u2550\u2550\u2550 */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/meditation-platform-overlooking.jpeg'
          alt='Meditation platform overlooking the Himalayas'
          kenBurns="normal"
          filmGrain={false}
        />\n        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* \u2550\u2550\u2550 CLOSING CTA \u2550\u2550\u2550 */}
      <section className="relative py-24 md:py-36 lg:pb-40">
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
          <p className="section-label mb-6">Enter the Practice</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">
            The tools are ready.<br />The practice is yours.
          </h2>
          <p className="text-foreground/70 text-lg mb-12 editorial-spacing" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
            Begin with the breath. Let the mantra follow. When the mind settles, sit in silence. This is the ancient sequence \u2014 pr\u0101\u1E47\u0101y\u0101ma, japa, then mauna. Each gate prepares you for the next.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <WhatsAppCTA variant="inline" label="Consult Kaustubh" />
            <Link href="/library" className="ghost-cta">S\u0101dhan\u0101 Library</Link>
          </div>
        </ParallaxText>
      </section>

      {/* \u2550\u2550\u2550 FOOTER \u2550\u2550\u2550 */}
      <div className="relative pb-28 md:pb-20 mt-16">
        <div className="atmospheric-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-gold/40 rounded-full" style={{ animation: 'binduPulse 2s ease-in-out infinite' }} />
          </div>
          <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper">
            S\u0100DHANA TOOLS \u2014 PRACTICE GATEWAY
          </p>
          <p className="text-foreground/30 text-xs mt-3 max-w-md mx-auto">
            Drawn from Aghor\u012B, Kashmiri Shaiva, and Buddhist Vajray\u0101na traditions.
          </p>
        </div>
      </div>
    </div>
  );
}
