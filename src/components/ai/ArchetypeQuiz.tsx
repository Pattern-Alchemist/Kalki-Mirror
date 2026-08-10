'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';

/* ── Types ── */
interface QuizOption {
  label: string;
  value: string;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

interface ArchetypeResult {
  archetypeId: string;
  archetypeName: string;
  sanskrit: string;
  description: string;
  bija: string;
  pattern: string;
  confidence: number;
  secondaryArchetype: string | null;
}

type QuizState = 'intro' | 'quiz' | 'analyzing' | 'result' | 'error' | 'unconfigured';

/* ── Questions ── */
const QUESTIONS: QuizQuestion[] = [
  {
    question: 'When you face a crisis, your first instinct is to:',
    options: [
      { label: 'Cut through it directly', value: 'cut-through' },
      { label: 'Nourish and protect others', value: 'nourish-protect' },
      { label: 'Withdraw and observe', value: 'withdraw-observe' },
      { label: 'Transform the situation creatively', value: 'transform-creative' },
    ],
  },
  {
    question: 'In relationships, you tend to:',
    options: [
      { label: 'Attract people who need saving', value: 'attract-saving' },
      { label: 'Seek deep emotional merging', value: 'emotional-merging' },
      { label: 'Maintain independence fiercely', value: 'independence' },
      { label: 'Become the caretaker', value: 'caretaker' },
    ],
  },
  {
    question: 'Your greatest fear is:',
    options: [
      { label: 'Being powerless', value: 'powerless' },
      { label: 'Being abandoned', value: 'abandoned' },
      { label: 'Being controlled', value: 'controlled' },
      { label: 'Being unknown', value: 'unknown' },
    ],
  },
  {
    question: 'When you practice stillness, your mind tends to:',
    options: [
      { label: 'Race with analytical thoughts', value: 'analytical' },
      { label: 'Drift into emotional memories', value: 'emotional-memories' },
      { label: 'Become completely still easily', value: 'still-easily' },
      { label: 'Generate creative visions', value: 'creative-visions' },
    ],
  },
  {
    question: 'The pattern you most want to break is:',
    options: [
      { label: 'Self-sabotage when close to success', value: 'self-sabotage' },
      { label: 'Attracting unavailable people', value: 'unavailable-people' },
      { label: 'Controlling situations to feel safe', value: 'controlling' },
      { label: 'Abandoning yourself for others', value: 'self-abandonment' },
    ],
  },
];

/* ── Spinner ── */
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
}

/* ── Component ── */
export function ArchetypeQuiz() {
  const reduced = useReducedMotion();
  const [state, setState] = useState<QuizState>('intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<ArchetypeResult | null>(null);
  const [error, setError] = useState('');

  const selectAnswer = useCallback((value: string) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
  }, [answers, step]);

  const canProceed = answers[step] !== undefined;

  const submit = useCallback(async () => {
    setState('analyzing');
    setError('');
    try {
      const res = await fetch('/api/ai/archetype-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (res.status === 503) { setState('unconfigured'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
      setState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The geometry faltered.');
      setState('error');
    }
  }, [answers]);

  const reset = useCallback(() => {
    setState('intro');
    setStep(0);
    setAnswers([]);
    setResult(null);
    setError('');
  }, []);

  return (
    <div className="glass-panel p-6 sm:p-8 max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {/* ── INTRO ── */}
        {state === 'intro' && (
          <motion.div
            key="intro"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            exit={reduced ? { opacity: 0 } : fadeInUp.exit}
            className="text-center space-y-6 py-8"
          >
            <p className="section-label">Pattern Recognition</p>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground engraved-heading">
              Discover Your Mahavidya
            </h2>
            <div className="divider-gold max-w-xs mx-auto" />
            <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
              Five questions. No right answers. The geometry reads your patterns and reveals
              which of the Ten Mahavidyas governs your inner architecture.
            </p>
            <button
              onClick={() => setState('quiz')}
              className="gold-cta"
            >
              Begin
            </button>
          </motion.div>
        )}

        {/* ── QUIZ ── */}
        {state === 'quiz' && (
          <motion.div
            key={`quiz-${step}`}
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            exit={reduced ? { opacity: 0 } : fadeInUp.exit}
            className="space-y-6 py-4"
          >
            {/* Progress */}
            <div className="flex items-center gap-3">
              <span className="text-caption">{step + 1}</span>
              <div className="flex-1 h-px bg-border-subtle" />
              <span className="text-caption">{QUESTIONS.length}</span>
            </div>

            {/* Question */}
            <h3 className="font-display text-xl sm:text-2xl text-foreground engraved-heading leading-snug">
              {QUESTIONS[step].question}
            </h3>

            {/* Options */}
            <motion.div
              className="space-y-3"
              variants={reduced ? {} : staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {QUESTIONS[step].options.map((opt) => (
                <motion.button
                  key={opt.value}
                  variants={reduced ? {} : staggerItem}
                  onClick={() => selectAnswer(opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-sm transition-all duration-300 cursor-pointer ${
                    answers[step] === opt.value
                      ? 'bg-gold/10 border border-gold/40 text-gold'
                      : 'bg-surface/50 border border-border-subtle text-text-secondary hover:border-gold/20 hover:text-foreground'
                  }`}
                >
                  <span className="font-body text-sm leading-relaxed">{opt.label}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              {step > 0 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="ghost-cta text-xs"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < QUESTIONS.length - 1 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed}
                  className="gold-cta text-xs"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={!canProceed}
                  className="gold-cta text-xs"
                >
                  Reveal Archetype
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── ANALYZING ── */}
        {state === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            exit={reduced ? { opacity: 0 } : fadeInUp.exit}
            className="text-center space-y-4 py-16"
          >
            <Spinner />
            <p className="text-caption">Reading the geometry...</p>
            <p className="text-text-muted text-xs">The pattern-matrix is aligning to your resonance.</p>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {state === 'result' && result && (
          <motion.div
            key="result"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            exit={reduced ? { opacity: 0 } : fadeInUp.exit}
            className="space-y-6 py-4"
          >
            <div className="text-center space-y-3">
              <p className="section-label">Your Archetype</p>
              <h2 className="font-display text-3xl sm:text-4xl text-gold engraved-heading">
                {result.archetypeName}
              </h2>
              <p className="font-mono text-sm text-gold-dim tracking-wider">
                {result.sanskrit}
              </p>
            </div>

            <div className="divider-gold" />

            {/* Bija */}
            <div className="glass-chip px-4 py-3 text-center">
              <p className="text-caption mb-1">Bīja Mantra</p>
              <p className="font-display text-2xl text-gold tracking-widest">{result.bija}</p>
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-3">
              <span className="text-caption">Resonance</span>
              <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>
              <span className="font-mono text-xs text-gold-dim">{result.confidence}%</span>
            </div>

            {/* Description */}
            <p className="text-text-secondary text-sm leading-relaxed">
              {result.description}
            </p>

            {/* Pattern */}
            <div className="space-y-2">
              <p className="text-caption">Core Pattern</p>
              <p className="text-foreground text-sm leading-relaxed font-body">
                {result.pattern}
              </p>
            </div>

            {/* Secondary Archetype */}
            {result.secondaryArchetype && (
              <div className="space-y-1">
                <p className="text-caption">Shadow Resonance</p>
                <p className="text-text-muted text-sm capitalize">{result.secondaryArchetype}</p>
              </div>
            )}

            <div className="divider-subtle" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href={`/archetypes#${result.archetypeId}`}
                className="gold-cta w-full sm:w-auto text-center text-xs"
              >
                View Full Archetype
              </Link>
              <button
                onClick={reset}
                className="ghost-cta w-full sm:w-auto text-xs"
              >
                Retake
              </button>
            </div>
          </motion.div>
        )}

        {/* ── ERROR ── */}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            exit={reduced ? { opacity: 0 } : fadeInUp.exit}
            className="text-center space-y-4 py-12"
          >
            <p className="text-crimson text-sm">{error}</p>
            <button onClick={reset} className="ghost-cta text-xs">
              Try Again
            </button>
          </motion.div>
        )}

        {/* ── UNCONFIGURED ── */}
        {state === 'unconfigured' && (
          <motion.div
            key="unconfigured"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            exit={reduced ? { opacity: 0 } : fadeInUp.exit}
            className="text-center space-y-4 py-12"
          >
            <p className="text-gold-dim text-sm">
              The pattern-matrix is offline. Retrying with geometry engine…
            </p>
            <button onClick={submit} className="ghost-cta text-xs">
              Retry
            </button>
            <button onClick={reset} className="ghost-cta text-xs ml-2">
              Return
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}