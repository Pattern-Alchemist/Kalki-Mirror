'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax } from '@/components/ui/ScrollParallax';
import dynamic from 'next/dynamic';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import CaptureBand from '@/components/capture/CaptureBand';
import Link from 'next/link';
import { fadeInUp, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import { TIER_LABELS, TIER_ELEMENTS, TIER_COLORS, TIER_BADGE_STYLES } from '@/lib/utils/tier-gate';
import { COURSE_LESSON_COUNT, type CourseModule, type CourseLesson } from '@/lib/data/aghori-tantra-course';
import type { Tier } from '@/lib/data/types';

type CourseMeta = typeof import('@/lib/data/aghori-tantra-course').COURSE_META;

interface AghoriTantraPageProps {
  aghoriCourse: CourseModule[];
  courseMeta: CourseMeta;
}

const GatedContent = dynamic(() => import('@/components/monetization/GatedContent').then(m => ({ default: m.GatedContent })), { ssr: false, loading: () => <div className="min-h-[100px]" /> });

/* ─────────────────────────────────────────────────────────────
   AGHORĪ TANTRA — THE ASHRAM PATH
   Eight phases. Fifty-four lessons. A lifetime of practice.
   ───────────────────────────────────────────────────────────── */

const difficultyColor: Record<string, string> = {
  'Foundational': 'text-emerald-400 border-emerald-400/30',
  'Intermediate': 'text-amber-400 border-amber-400/30',
  'Advanced': 'text-red-400 border-red-400/30',
  'Forbidden': 'text-red-600 border-red-600/30',
};



const phaseAccent: Record<string, string> = {
  'Phase I': 'from-zinc-500 to-zinc-700',
  'Phase II': 'from-amber-600 to-amber-800',
  'Phase III': 'from-amber-700 to-red-700',
  'Phase IV': 'from-red-700 to-red-900',
  'Phase V': 'from-gold to-amber-700',
  'Phase VI': 'from-red-800 to-red-950',
  'Phase VII': 'from-red-950 to-black',
  'Phase VIII': 'from-emerald-800 to-emerald-950',
};

const evidenceColor: Record<string, string> = {
  TRADITIONAL: 'text-emerald-400/70 border-emerald-400/20',
  ORAL: 'text-amber-400/70 border-amber-400/20',
  FIELD: 'text-sky-400/70 border-sky-400/20',
  RECONSTRUCTED: 'text-foreground/40 border-foreground/20',
};

/* ─── Phase Navigation Data ─── */
function buildPhaseNavData(course: CourseModule[]) {
  return course.map((m, i) => ({
    id: m.id,
    phase: m.phase,
    phaseSanskrit: m.phaseSanskrit,
    shortTitle: m.phase.replace('Phase ', ''),
    lessonCount: m.lessons.length,
    difficulty: m.difficulty,
    minTier: m.minTier as Tier,
    element: TIER_ELEMENTS[m.minTier as Tier],
  }));
}

/* ─── Tier Badge Component ─── */
function TierBadge({ tier, showElement = true, compact = false }: { tier: string; showElement?: boolean; compact?: boolean }) {
  const t = tier as Tier;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded border font-mono tracking-wider whitespace-nowrap max-w-full', TIER_BADGE_STYLES[t as Tier] || TIER_BADGE_STYLES.prithvi, compact ? 'px-2 py-0.5 text-[0.6rem]' : 'px-2.5 py-1 text-[0.65rem]')}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: TIER_COLORS[t] }} />
      {TIER_LABELS[t]}{showElement && <span className="opacity-50">· {TIER_ELEMENTS[t]}</span>}
    </span>
  );
}

/* ─── Lesson Content ─── */
function LessonContent({ lesson, isOpen, phaseId }: { lesson: CourseLesson; isOpen: boolean; phaseId: string }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="pt-6 pb-2 space-y-6">
          {lesson.evidence && (
            <span className={cn('inline-block px-2 py-0.5 rounded border text-[0.6rem] font-mono tracking-widest uppercase mb-4', evidenceColor[lesson.evidence] || evidenceColor.RECONSTRUCTED)}>
              {lesson.evidence}
            </span>
          )}
          {lesson.content.split('\n\n').map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**')) {
              return <p key={i} className="text-gold font-display text-lg tracking-wide">{para.replace(/\*\*/g, '')}</p>;
            }
            if (para.startsWith('**')) {
              const parts = para.split('**');
              return (
                <p key={i} className="text-foreground/80 text-editorial leading-relaxed">
                  {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-foreground font-medium">{p}</strong> : p)}
                </p>
              );
            }
            return <p key={i} className="text-foreground/80 text-editorial leading-relaxed">{para}</p>;
          })}

          {lesson.practice && (
            <div className="bg-gold/5 border border-gold/10 rounded-lg p-5">
              <h4 className="text-gold font-mono text-xs tracking-[0.2em] uppercase mb-2">Practice Instruction</h4>
              <p className="text-foreground/80 text-sm leading-relaxed">{lesson.practice}</p>
            </div>
          )}

          {lesson.mantras && lesson.mantras.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-gold font-mono text-xs tracking-[0.2em] uppercase">Mantras</h4>
              {lesson.mantras.map((m, i) => (
                <div key={i} className="bg-deep-black/60 border border-gold/10 rounded-lg p-4 space-y-2">
                  <p className="text-foreground font-medium text-lg" dir="ltr">{m.sanskrit}</p>
                  <p className="text-foreground/60 text-sm italic">{m.transliteration}</p>
                  <p className="text-foreground/50 text-sm">{m.meaning}</p>
                  {m.count && <p className="text-gold/60 text-xs font-mono">Count: {m.count}</p>}
                </div>
              ))}
            </div>
          )}

          {lesson.materials && lesson.materials.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-gold font-mono text-xs tracking-[0.2em] uppercase">Required Materials</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {lesson.materials.map((m, i) => (
                  <li key={i} className="text-foreground/60 text-sm flex items-start gap-2">
                    <span className="text-gold/40 mt-1">&#x2022;</span>{m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lesson.warnings && lesson.warnings.length > 0 && (
            <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-5 space-y-2">
              <h4 className="text-red-400 font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Warnings
              </h4>
              {lesson.warnings.map((w, i) => (
                <p key={i} className="text-red-300/70 text-sm leading-relaxed">{w}</p>
              ))}
            </div>
          )}
          <div className="pt-2">
            <Link
              href={`/aghori-tantra/${phaseId}/${lesson.id}`}
              className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.15em] uppercase text-copper hover:text-gold transition-colors"
            >
              Open as standalone lesson page →
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Module Card (single phase) ─── */
function ModuleCard({ module, index, totalPhases }: { module: CourseModule; index: number; totalPhases: number }) {
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useNativeReducedMotion();
  const isOpen = (id: string) => openLesson === id;
  const toggle = (id: string) => setOpenLesson(isOpen(id) ? null : id);
  const phaseNum = index + 1;

  return (
    <motion.section
      ref={ref}
      id={`phase-${phaseNum}`}
      className="mb-16 md:mb-24 scroll-mt-24"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Phase image + header */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden mb-10">
        <CinematicImage
          src={module.image}
          alt={module.title}
          kenBurns="slow"
          scrim="full"
          vignette
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/40 to-transparent" />
        {/* Phase number watermark */}
        <div className="absolute top-6 right-6 md:top-10 md:right-10">
          <span className="font-mono text-[6rem] md:text-[8rem] font-bold leading-none text-white/[0.03] select-none">
            {String(phaseNum).padStart(2, '0')}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <TierBadge tier={module.minTier} />
            <span className={cn('px-3 py-1 rounded-full border text-xs font-mono tracking-widest uppercase', difficultyColor[module.difficulty])}>
              {module.difficulty}
            </span>
            <span className="text-caption text-xs">{module.duration}</span>
          </div>
          <p className="text-gold/70 font-mono text-xs tracking-[0.15em] mb-2">{module.phase}{module.phaseSanskrit && ` — ${module.phaseSanskrit}`}</p>
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl text-white tracking-wide leading-tight">
            {module.title}
          </h2>
          {module.titleSanskrit && (
            <p className="text-foreground/40 text-sm mt-2 italic">{module.titleSanskrit}</p>
          )}
        </div>
      </div>

      {/* Module description + lessons */}
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <p className="text-foreground/70 text-editorial leading-relaxed mb-4">{module.description}</p>

        {/* Lesson count + reading time estimate */}
        <div className="flex items-center gap-4 mb-8 text-xs font-mono text-foreground/30">
          <span>{module.lessons.length} Lessons</span>
          <span className="w-1 h-1 rounded-full bg-foreground/20" />
          <span>Phase {phaseNum} of {totalPhases}</span>
        </div>

        {/* Gated lesson list */}
        <GatedContent
          minTier={module.minTier as Tier}
          label={`${module.phase} — ${TIER_LABELS[module.minTier as Tier]} Access`}
          teaser={`${module.phase} requires the ${TIER_ELEMENTS[module.minTier as Tier]} tier (${TIER_LABELS[module.minTier as Tier]}) or above. Upgrade to access all ${module.lessons.length} lessons.`}
        >
          <div className="space-y-3">
            {module.lessons.map((lesson, li) => (
              <motion.div
                key={lesson.id}
                variants={staggerItem}
                className="border border-foreground/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggle(lesson.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-foreground/5 transition-colors"
                  aria-expanded={isOpen(lesson.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-gold/30 font-mono text-xs w-6 shrink-0">{String(li + 1).padStart(2, '0')}</span>
                    <h3 className={cn('font-display text-base md:text-lg tracking-wide truncate', isOpen(lesson.id) ? 'text-gold' : 'text-foreground')}>{lesson.title}</h3>
                  </div>
                  <motion.span
                    className="text-foreground/30 text-xl shrink-0 ml-4"
                    animate={{ rotate: isOpen(lesson.id) ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >+</motion.span>
                </button>
                <div className="px-5">
                  <LessonContent lesson={lesson} isOpen={isOpen(lesson.id)} phaseId={module.id} />
                </div>
              </motion.div>
            ))}
          </div>
        </GatedContent>
      </div>
    </motion.section>
  );
}

/* ─── Phase Navigation Data type ─── */
type PhaseNavItem = ReturnType<typeof buildPhaseNavData>[number];

/* ─── Phase Navigation Sidebar (Desktop) / Horizontal Scroll (Mobile) ─── */
function PhaseNav({ activePhase, phaseNavData }: { activePhase: number; phaseNavData: PhaseNavItem[] }) {
  const reduced = useNativeReducedMotion();

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 flex-col gap-1 pl-4"
        aria-label="Phase navigation"
      >
        {phaseNavData.map((p, i) => {
          const isActive = i === activePhase;
          return (
            <a
              key={p.id}
              href={`#phase-${i + 1}`}
              className={cn(
                'group flex items-center gap-3 py-2 pr-4 rounded-r transition-all duration-300',
                isActive
                  ? 'bg-foreground/5'
                  : 'hover:bg-foreground/[0.02]',
              )}
              aria-current={isActive ? 'true' : undefined}
            >
              {/* Dot + connector line */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full border-2 transition-all duration-500',
                    isActive
                      ? 'border-gold bg-gold scale-125'
                      : 'border-foreground/20 bg-transparent group-hover:border-foreground/40',
                  )}
                  style={isActive ? { boxShadow: '0 0 8px rgba(212,175,55,0.4)' } : undefined}
                />
                {i < phaseNavData.length - 1 && (
                  <div className={cn(
                    'w-px h-6 mt-1 transition-colors duration-500',
                    i < activePhase ? 'bg-gold/30' : 'bg-foreground/10',
                  )} />
                )}
              </div>
              {/* Label */}
              <div className="flex flex-col min-w-0">
                <span className={cn(
                  'font-mono text-[0.6rem] tracking-widest uppercase transition-colors duration-300',
                  isActive ? 'text-gold' : 'text-foreground/30 group-hover:text-foreground/50',
                )}>
                  {p.shortTitle}
                </span>
                <span className={cn(
                  'text-[0.55rem] truncate max-w-[100px] transition-colors duration-300',
                  isActive ? 'text-foreground/60' : 'text-foreground/20 group-hover:text-foreground/30',
                )}>
                  {p.lessonCount} lessons
                </span>
              </div>
            </a>
          );
        })}
      </nav>

      {/* Mobile horizontal scroll */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-deep-black/90 backdrop-blur-md border-t border-foreground/5"
        aria-label="Phase navigation"
      >
        <div className="flex overflow-x-auto gap-0 px-2 py-2 scrollbar-none">
          {phaseNavData.map((p, i) => {
            const isActive = i === activePhase;
            return (
              <a
                key={p.id}
                href={`#phase-${i + 1}`}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-md shrink-0 transition-all duration-300',
                  isActive ? 'bg-foreground/5' : 'hover:bg-foreground/[0.02]',
                )}
              >
                <span className={cn(
                  'font-mono text-[0.6rem] tracking-widest uppercase',
                  isActive ? 'text-gold' : 'text-foreground/30',
                )}>
                  {p.shortTitle}
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

/* ─── Ashram Progression Map ─── */
function AshramProgressionMap({ phaseNavData }: { phaseNavData: PhaseNavItem[] }) {
  const reduced = useNativeReducedMotion();
  const tierGroups = [
    { tier: 'prithvi' as Tier, label: 'PRITHVI — EARTH', phases: phaseNavData.filter(p => p.minTier === 'prithvi') },
    { tier: 'jal' as Tier, label: 'JAL — WATER', phases: phaseNavData.filter(p => p.minTier === 'jal') },
    { tier: 'agni' as Tier, label: 'AGNI — FIRE', phases: phaseNavData.filter(p => p.minTier === 'agni') },
    { tier: 'akash' as Tier, label: 'AKASH — SKY', phases: phaseNavData.filter(p => p.minTier === 'akash') },
  ];

  return (
    <motion.div
      className="max-w-3xl mx-auto px-6 lg:px-10 mb-16"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true, margin: '-40px' }}
    >
      <h3 className="text-caption text-xs tracking-[0.2em] uppercase text-foreground/40 mb-6">The Ashram Path — Eight Stations</h3>
      <div className="space-y-4">
        {tierGroups.map((group) => (
          <div key={group.tier} className="relative">
            {/* Tier label */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIER_COLORS[group.tier] }} />
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase" style={{ color: TIER_COLORS[group.tier] }}>
                {group.label}
              </span>
            </div>
            {/* Phase stations */}
            <div className="flex items-stretch gap-0 ml-1">
              {group.phases.map((p, i) => (
                <div key={p.id} className="flex items-center">
                  <a
                    href={`#phase-${phaseNavData.indexOf(p) + 1}`}
                    className="group/station flex flex-col items-center gap-1 px-2 py-1"
                  >
                    <div
                      className="w-3 h-3 rounded-full border-2 transition-all duration-300 group-hover/station:scale-125"
                      style={{
                        borderColor: TIER_COLORS[group.tier],
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = TIER_COLORS[group.tier]; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    />
                    <span className="text-[0.55rem] font-mono text-foreground/30 group-hover/station:text-foreground/60 transition-colors">
                      {p.shortTitle}
                    </span>
                  </a>
                  {i < group.phases.length - 1 && (
                    <div className="w-8 md:w-12 h-px mt-[-12px]" style={{ backgroundColor: `${TIER_COLORS[group.tier]}33` }} />
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
export default function AghoriTantraPageClient({ aghoriCourse, courseMeta: COURSE_META }: AghoriTantraPageProps) {
  const phaseNavData = buildPhaseNavData(aghoriCourse);
  const reduced = useNativeReducedMotion();
  const [activePhase, setActivePhase] = useState(0);
  const moduleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track which phase is in view via IntersectionObserver
  useEffect(() => {
    const refs = moduleRefs.current.filter(Boolean);
    if (refs.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = refs.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActivePhase(idx);
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
      {/* Hero */}
      <header className="relative min-h-[90vh] md:min-h-[100vh] flex items-end overflow-hidden">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/aghori-tantra/shmashana-hero'
          alt='Aghori Tantra — The Pathless Path of Bhairava'
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
            SELF-LEARNING COURSE
          </motion.p>
          <motion.h1
            className={cn(
              'font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-3 hero-heading',
            )}
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            {COURSE_META.title}
          </motion.h1>
          <motion.p
            className="text-foreground/50 text-lg italic mb-5"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.15, duration: 0.8 }}
          >
            {COURSE_META.subtitle}
          </motion.p>
          <motion.p
            className="text-foreground/70 text-base md:text-lg max-w-2xl leading-relaxed text-shadow-deep"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {COURSE_META.description}
          </motion.p>
        </div>
      </header>

      {/* Atmospheric gradient */}
      <div className="atmospheric-bg h-48 -mt-20 relative z-10" />

      {/* Course info bar */}
      <div className="max-w-3xl mx-auto px-6 lg:px-10 mb-8">
        <BackButton href="/" label="Back to Home" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Duration</p>
            <p className="text-foreground text-sm font-medium">{COURSE_META.totalDuration.split('|')[0]}</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Tradition</p>
            <p className="text-foreground text-sm font-medium">{COURSE_META.tradition}</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Phases</p>
            <p className="text-foreground text-sm font-medium">{aghoriCourse.length} Phases · {COURSE_LESSON_COUNT} Lessons</p>
          </div>
          {/* Access tiers: full-width on mobile so the four badges wrap
              inside the card instead of running outside its border. */}
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4 col-span-2 md:col-span-1">
            <p className="text-caption text-xs mb-1">Access Tiers</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <TierBadge tier="prithvi" compact showElement={false} />
              <TierBadge tier="jal" compact showElement={false} />
              <TierBadge tier="agni" compact showElement={false} />
              <TierBadge tier="akash" compact showElement={false} />
            </div>
          </div>
        </div>

        {/* Lineage */}
        <div className="mt-4 bg-foreground/5 border border-foreground/10 rounded-lg p-5">
          <p className="text-caption text-xs mb-2">Lineage</p>
          <p className="text-foreground/60 text-xs leading-relaxed font-mono">{COURSE_META.lineageGuru}</p>
        </div>

        {/* Evidence grading legend */}
        <div className="mt-3 flex flex-wrap gap-2">
          {COURSE_META.evidenceGrading && Object.entries(COURSE_META.evidenceGrading).map(([k, v]) => (
            <span key={k} className={cn('px-2 py-0.5 rounded border text-[0.55rem] font-mono tracking-wider uppercase', evidenceColor[k])}>
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Ashram Progression Map */}
      <div className="divider-gold max-w-3xl mx-auto" />
      <AshramProgressionMap phaseNavData={phaseNavData} />

      {/* Phase Navigation */}
      <PhaseNav activePhase={activePhase} phaseNavData={phaseNavData} />

      {/* ── Cinematic strip: Cremation Ground ── */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/aghori-tantra/section-divider"
          alt="Aghori cremation ground at twilight with smoke rising from funeral pyres"
          kenBurns="slow"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* Modules — with IntersectionObserver refs */}
      {aghoriCourse.map((module, i) => (
        <div key={module.id} ref={(el) => { moduleRefs.current[i] = el; }}>
          {i > 0 && <div className="divider-gold max-w-3xl mx-auto" />}
          <ModuleCard module={module} index={i} totalPhases={aghoriCourse.length} />
        </div>
      ))}

      {/* ── Cinematic strip: Bhairava Pathway ── */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/aghori-tantra/lineage-bg"
          alt="Dark pathway leading to a Bhairava shrine through dense forest"
          kenBurns="slow"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* ── Closing CTA ── */}
      <motion.div
        className="max-w-lg mx-auto mt-20 text-center"
        initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
        whileInView={fadeInUp.visible}
        viewport={{ once: true, margin: '-60px' }}
      >
        <p className="section-label mb-3">READY TO BEGIN</p>
        <p className="font-display text-2xl md:text-3xl tracking-wide mb-3">The path is open.</p>
        <p className="text-text-muted mb-8 max-w-md mx-auto editorial-spacing">
          Eight phases. {COURSE_LESSON_COUNT} lessons. A lifetime of practice.
          Speak with Kaustubh before entering the ashram.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <WhatsAppCTA variant="inline" label="Consult Kaustubh" message="I am interested in beginning the Aghori Tantra course." className="" />
          <Link href="/pricing" className="ghost-cta">View Membership</Link>
        </div>
      </motion.div>

      <CaptureBand topic="aghori-tantra" className="mt-12" />


    </div>
  );
}
