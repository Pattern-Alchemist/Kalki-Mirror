'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { TIER_LABELS } from '@/lib/utils/tier-gate';
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

interface TierResult {
  recommendedTier: string;
  tierElement: string;
  reason: string;
  unlockedFeatures: string[];
}

type QuizState = 'intro' | 'quiz' | 'analyzing' | 'result' | 'error';

/* ── Tier Display Names ── */
const TIER_NAMES: Record<string, string> = {
  prithvi: 'Prithvi',
  jal: 'Jal',
  agni: 'Agni',
  akash: 'Akash',
};

/* ── Questions ── */
const QUESTIONS: QuizQuestion[] = [
  {
    question: 'What draws you to Vedic wisdom?',
    options: [
      { label: 'Intellectual curiosity about ancient systems', value: 'intellectual-curiosity' },
      { label: 'I want to solve recurring life patterns', value: 'solve-patterns' },
      { label: 'I have a dedicated daily practice', value: 'daily-practice' },
      { label: 'I want complete mastery and transmission', value: 'complete-mastery' },
    ],
  },
  {
    question: 'How would you describe your experience level?',
    options: [
      { label: "Complete beginner — I'm exploring", value: 'beginner' },
      { label: "I've tried meditation or breathwork", value: 'tried-meditation' },
      { label: 'I practice regularly — mantra, pranayama, ritual', value: 'regular-practice' },
      { label: 'Advanced practitioner with years of discipline', value: 'advanced' },
    ],
  },
  {
    question: 'What depth of access matters most?',
    options: [
      { label: 'Just the basics — let me explore first', value: 'basics' },
      { label: 'Structured practices and pattern analysis', value: 'structured-practices' },
      { label: 'Advanced siddhis and detailed transit interpretations', value: 'advanced-siddhis' },
      { label: 'Everything — sealed practices, research codices, priority sessions', value: 'everything' },
    ],
  },
];

/* ── Client-side fallback (mirrors server fallback) ── */
const ANSWER_TIER_WEIGHTS: Record<string, Record<string, number>> = {
  'intellectual-curiosity': { prithvi: 3, jal: 1, agni: 0, akash: 0 },
  'solve-patterns':         { prithvi: 1, jal: 3, agni: 1, akash: 0 },
  'daily-practice':         { prithvi: 0, jal: 2, agni: 3, akash: 1 },
  'complete-mastery':       { prithvi: 0, jal: 0, agni: 2, akash: 3 },
  'beginner':           { prithvi: 3, jal: 1, agni: 0, akash: 0 },
  'tried-meditation':   { prithvi: 1, jal: 3, agni: 1, akash: 0 },
  'regular-practice':   { prithvi: 0, jal: 2, agni: 3, akash: 1 },
  'advanced':           { prithvi: 0, jal: 0, agni: 2, akash: 3 },
  'basics':               { prithvi: 3, jal: 1, agni: 0, akash: 0 },
  'structured-practices': { prithvi: 0, jal: 3, agni: 2, akash: 0 },
  'advanced-siddhis':     { prithvi: 0, jal: 1, agni: 3, akash: 2 },
  'everything':           { prithvi: 0, jal: 0, agni: 1, akash: 3 },
};

const TIER_INFO: Record<string, TierResult> = {
  prithvi: {
    recommendedTier: 'prithvi',
    tierElement: 'Earth',
    reason: 'Your curiosity and foundational interest in Vedic wisdom aligns with Prithvi — the solid earth from which all deeper practice grows. This tier provides the essential maps and introductory practices to orient your trajectory.',
    unlockedFeatures: ['Introductory practices', 'Foundational archetypes', 'Entry-level patterns', 'Basic breathwork sequences'],
  },
  jal: {
    recommendedTier: 'jal',
    tierElement: 'Water',
    reason: 'Your commitment to establishing a regular practice places you in the Jal stream — the flowing water that deepens with consistent effort. This tier provides structured sādhana protocols, detailed archetype analyses, and the mantra libraries your practice needs.',
    unlockedFeatures: ['Structured sādhana protocols', 'Full archetype analyses', 'Mantra library', 'Breathwork sequences', 'Pattern analysis tools'],
  },
  agni: {
    recommendedTier: 'agni',
    tierElement: 'Fire',
    reason: 'Your depth of experience and appetite for advanced technique places you in the Agni stream — the transformative fire that burns through superficial understanding. This tier provides advanced siddhis, detailed transit interpretations, and yantra construction guides.',
    unlockedFeatures: ['Advanced siddhis', 'Detailed transit interpretations', 'Pattern deep-dives', 'Yantra construction guides', 'Community consultations'],
  },
  akash: {
    recommendedTier: 'akash',
    tierElement: 'Space',
    reason: 'Your pursuit of complete mastery places you in Akash — the boundless sky that contains all practices without restriction. This tier provides unrestricted access to sealed practices, research codices, and priority consultations.',
    unlockedFeatures: ['All content including sealed practices', 'Research codices', 'Advanced Mahavidya workings', 'Priority consultations', 'Early access to new content'],
  },
};

function localFallback(answers: string[]): TierResult {
  const scores: Record<string, number> = { prithvi: 0, jal: 0, agni: 0, akash: 0 };
  for (const a of answers) {
    const weights = ANSWER_TIER_WEIGHTS[a];
    if (!weights) continue;
    for (const [tier, w] of Object.entries(weights)) {
      scores[tier] = (scores[tier] || 0) + w;
    }
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const tier = sorted[0]?.[0] || 'prithvi';
  return TIER_INFO[tier];
}

/* ── Spinner ── */
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
}

/* ── Component ── */
export function PricingQuiz() {
  const reduced = useReducedMotion();
  const [state, setState] = useState<QuizState>('intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<TierResult | null>(null);
  const [error, setError] = useState('');

  const selectAnswer = useCallback((value: string) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
  }, [answers, step]);

  const canProceed = answers[step] !== undefined;

  const submit = useCallback(async () => {
    // Compact answers to remove any undefined holes from back-navigation
    const cleanAnswers = answers.filter(Boolean);
    if (cleanAnswers.length < QUESTIONS.length) {
      setError('All questions must be answered before the geometry can assess your resonance.');
      setState('error');
      return;
    }
    setState('analyzing');
    setError('');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const res = await fetch('/api/ai/recommend-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: cleanAnswers }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Recommendation failed');
      // Validate that the result has meaningful content
      if (!data.recommendedTier || !data.reason) {
        throw new Error('The geometry returned an incomplete reading. Please try again.');
      }
      setResult(data);
      setState('result');
    } catch (err) {
      // On any failure (timeout, network, server error), compute locally
      console.warn('[PricingQuiz] API failed, using client-side fallback:', err);
      setResult(localFallback(cleanAnswers));
      setState('result');
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
            <p className="section-label">Find Your Path</p>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground engraved-heading">
              Which Gate Opens for You?
            </h2>
            <div className="divider-gold max-w-xs mx-auto" />
            <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
              Three questions. The geometry assesses your resonance and recommends
              the membership tier that aligns with your depth of practice.
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
                  Reveal Tier
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
            <p className="text-caption">Consulting the pattern-matrix...</p>
            <p className="text-text-muted text-xs">Aligning your resonance to the gates.</p>
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
              <p className="section-label">Recommended Gate</p>
              <h2 className="font-display text-3xl sm:text-4xl text-gold engraved-heading">
                {TIER_NAMES[result.recommendedTier] || result.recommendedTier}
              </h2>
              <p className="font-mono text-sm text-gold-dim tracking-wider">
                {result.tierElement} Element — {result.recommendedTier}
              </p>
            </div>

            <div className="divider-gold" />

            {/* Reason */}
            <p className="text-text-secondary text-sm leading-relaxed">
              {result.reason}
            </p>

            {/* Unlocked Features */}
            <div className="space-y-3">
              <p className="text-caption">Unlocked With This Tier</p>
              <motion.div
                className="flex flex-wrap gap-2"
                variants={reduced ? {} : staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {result.unlockedFeatures.map((feature, i) => (
                  <motion.span
                    key={i}
                    variants={reduced ? {} : staggerItem}
                    className="glass-chip px-3 py-1.5 text-xs text-text-secondary"
                  >
                    {feature}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            <div className="divider-subtle" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href="/pricing"
                className="gold-cta w-full sm:w-auto text-center text-xs"
              >
                View Plans
              </a>
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


      </AnimatePresence>
    </div>
  );
}