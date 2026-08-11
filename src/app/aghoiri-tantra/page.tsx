'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import { aghoriCourse, COURSE_META } from '@/lib/data/aghoiri-tantra-course';
import type { CourseModule, CourseLesson } from '@/lib/data/aghoiri-tantra-course';

/* ─────────────────────────────────────────────────────────────
   AGHORĪ TANTRA — Self-Learning Course
   As if a real sadhaka is trained by a guru in an ashram.
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

function LessonContent({ lesson, isOpen }: { lesson: CourseLesson; isOpen: boolean }) {
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
          {/* Evidence badge */}
          {lesson.evidence && (
            <span className={cn('inline-block px-2 py-0.5 rounded border text-[0.6rem] font-mono tracking-widest uppercase mb-4', evidenceColor[lesson.evidence] || evidenceColor.RECONSTRUCTED)}>
              {lesson.evidence}
            </span>
          )}
          {/* Lesson body */}
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

          {/* Practice section */}
          {lesson.practice && (
            <div className="bg-gold/5 border border-gold/10 rounded-lg p-5">
              <h4 className="text-gold font-mono text-xs tracking-[0.2em] uppercase mb-2">Practice Instruction</h4>
              <p className="text-foreground/80 text-sm leading-relaxed">{lesson.practice}</p>
            </div>
          )}

          {/* Mantras */}
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

          {/* Materials */}
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

          {/* Warnings */}
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ModuleCard({ module, index }: { module: CourseModule; index: number }) {
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const isOpen = (id: string) => openLesson === id;
  const toggle = (id: string) => setOpenLesson(isOpen(id) ? null : id);

  return (
    <motion.section
      className="mb-16 md:mb-24"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Module Image */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden mb-10">
        <CinematicImage
          src={module.image}
          alt={module.title}
          kenBurns="slow"
          scrim="full"
          vignette
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-3">
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

      {/* Module Description */}
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <p className="text-foreground/70 text-editorial leading-relaxed mb-10">{module.description}</p>

        {/* Lessons */}
        <div className="space-y-3">
          {module.lessons.map((lesson, li) => (
            <div key={lesson.id} className="border border-foreground/10 rounded-lg overflow-hidden">
              <button
                onClick={() => toggle(lesson.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-gold/30 font-mono text-xs w-6">{String(li + 1).padStart(2, '0')}</span>
                  <h3 className={cn('font-display text-lg tracking-wide', isOpen(lesson.id) ? 'text-gold' : 'text-foreground')}>{lesson.title}</h3>
                </div>
                <motion.span
                  className="text-foreground/30 text-xl"
                  animate={{ rotate: isOpen(lesson.id) ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >+</motion.span>
              </button>
              <div className="px-5">
                <LessonContent lesson={lesson} isOpen={isOpen(lesson.id)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default function AghoriTantraPage() {
  const reduced = useReducedMotion();

  return (
    <main className="bg-deep-black min-h-screen">
      {/* Hero */}
      <header className="relative min-h-[80vh] md:min-h-[90vh] flex items-end overflow-hidden">
        <CinematicImage
          src='/assets/aghori/course/hero-cremation-initiation.jpeg'
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
            className="text-foreground/70 text-base md:text-lg max-w-2xl leading-relaxed"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
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
      <div className="max-w-3xl mx-auto px-6 lg:px-10 mb-12">
        <BackButton href="/" label="Back to Home" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Duration</p>
            <p className="text-foreground text-sm font-medium">{COURSE_META.totalDuration}</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Tradition</p>
            <p className="text-foreground text-sm font-medium">{COURSE_META.tradition}</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Phases</p>
            <p className="text-foreground text-sm font-medium">{aghoriCourse.length} Phases</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-4">
            <p className="text-caption text-xs mb-1">Total Lessons</p>
            <p className="text-foreground text-sm font-medium">{aghoriCourse.reduce((a, m) => a + m.lessons.length, 0)} Lessons</p>
          </div>
        </div>
        {/* Lineage */}
        <div className="mt-6 bg-foreground/5 border border-foreground/10 rounded-lg p-5">
          <p className="text-caption text-xs mb-2">Lineage</p>
          <p className="text-foreground/60 text-xs leading-relaxed font-mono">{COURSE_META.lineageGuru}</p>
        </div>
        {/* Evidence grading legend */}
        <div className="mt-4 flex flex-wrap gap-3">
          {COURSE_META.evidenceGrading && Object.entries(COURSE_META.evidenceGrading).map(([k, v]) => (
            <span key={k} className={cn('px-2 py-1 rounded border text-[0.6rem] font-mono tracking-wider uppercase', evidenceColor[k])}>
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Modules */}
      {aghoriCourse.map((module, i) => (
        <div key={module.id}>
          {i > 0 && <div className="divider-gold max-w-3xl mx-auto" />}
          <ModuleCard module={module} index={i} />
        </div>
      ))}

      {/* Footer */}
      <footer className="relative pb-20 md:pb-28 mt-16">
        <div className="atmospheric-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-gold/40 rounded-full" style={{ animation: 'binduPulse 2s ease-in-out infinite' }} />
          </div>
          <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper">
            AGHORĪ TANTRA — THE ASHRAM PATH
          </p>
          <p className="text-foreground/30 text-xs mt-3 max-w-md mx-auto">
            {COURSE_META.source}
          </p>
        </div>
      </footer>
    </main>
  );
}
