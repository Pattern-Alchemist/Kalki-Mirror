'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { fadeInUp, fadeIn } from '@/lib/motion/tokens';
import { submitConsultation } from '@/app/consultations/actions';

interface PatternSummary {
  slug: string;
  name: string;
  signs: string[];
}

/* ─── Types ─── */

interface WizardFormData {
  // Step 1
  selectedPatterns: string[]; // slug array, max 3
  // Step 2
  emotionalStability: number;
  patternAwareness: number;
  discomfortWillingness: number;
  previousGuidance: number;
  // Step 3
  experienceLevel: string;
  // Step 4
  preferredModalities: string[]; // max 2
  // Step 5
  name: string;
  whatsapp: string;
  additionalNotes: string;
}

interface SliderQuestion {
  key: keyof Pick<WizardFormData, 'emotionalStability' | 'patternAwareness' | 'discomfortWillingness' | 'previousGuidance'>;
  question: string;
  lowLabel: string;
  highLabel: string;
}

const SLIDER_QUESTIONS: SliderQuestion[] = [
  {
    key: 'emotionalStability',
    question: 'How would you rate your current emotional stability?',
    lowLabel: '1 — Very unstable',
    highLabel: '10 — Very stable',
  },
  {
    key: 'patternAwareness',
    question: 'How long have you been aware of these patterns?',
    lowLabel: 'Just noticing',
    highLabel: 'Years',
  },
  {
    key: 'discomfortWillingness',
    question: 'How willing are you to engage with discomfort?',
    lowLabel: '1 — Avoidant',
    highLabel: '10 — Fully willing',
  },
  {
    key: 'previousGuidance',
    question: 'Have you worked with a guide or therapist before?',
    lowLabel: 'Never',
    highLabel: 'Extensively',
  },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'No regular practice' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some meditation or breathwork' },
  { value: 'advanced', label: 'Advanced', description: 'Daily sādhana practice' },
  { value: 'returning', label: 'Returning', description: 'Practiced before, starting again' },
] as const;

const MODALITY_OPTIONS = [
  'Mantra & Japa',
  'Breathwork (Prāṇāyāma)',
  'Yantra & Visualization',
  'Movement & Embodiment',
  'Shadow Journaling',
  'Dreamwork',
] as const;

const STEP_LABELS = [
  'Pattern Self-Assessment',
  'Emotional Landscape',
  'Experience Level',
  'Preferred Modality',
  'Contact & Scheduling',
] as const;

const INITIAL_FORM: WizardFormData = {
  selectedPatterns: [],
  emotionalStability: 5,
  patternAwareness: 5,
  discomfortWillingness: 5,
  previousGuidance: 5,
  experienceLevel: '',
  preferredModalities: [],
  name: '',
  whatsapp: '',
  additionalNotes: '',
};

/* ─── Progress Indicator ─── */

function ProgressIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-500 ${
            i < current
              ? 'bg-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]'
              : i === current
                ? 'border-2 border-gold bg-transparent'
                : 'bg-zinc-700/60'
          }`}
          aria-hidden="true"
        />
      ))}
      <span className="ml-3 text-[0.6875rem] tracking-[0.2em] uppercase text-text-muted">
        {current + 1} / {total}
      </span>
    </div>
  );
}

/* ─── Gold Range Slider ─── */

function GoldSlider({
  value,
  onChange,
  lowLabel,
  highLabel,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
  ariaLabel: string;
}) {
  const pct = ((value - 1) / 9) * 100;
  return (
    <div className="space-y-3">
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        className="w-full h-1.5 appearance-none cursor-pointer rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(212,175,55,0.5)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:hover:shadow-[0_0_18px_rgba(212,175,55,0.7)] [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_0_12px_rgba(212,175,55,0.5)] [&::-moz-range-thumb]:cursor-pointer"
        style={{
          background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${pct}%, #3f3f46 ${pct}%, #3f3f46 100%)`,
        }}
      />
      <div className="flex justify-between">
        <span className="text-[0.6875rem] text-text-muted">{lowLabel}</span>
        <span className="text-sm font-mono text-gold">{value}</span>
        <span className="text-[0.6875rem] text-text-muted">{highLabel}</span>
      </div>
    </div>
  );
}

/* ─── Step Components ─── */

function StepPatternAssessment({
  selected,
  onToggle,
  patterns,
}: {
  selected: string[];
  onToggle: (slug: string) => void;
  patterns: PatternSummary[];
}) {
  const canSelect = selected.length < 3;

  return (
    <div className="space-y-6">
      <p className="text-text-secondary text-sm leading-relaxed max-w-lg">
        Select up to <span className="text-gold font-medium">3 patterns</span> that most resonate with what
        you are navigating. Each card shows the primary sign.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
        {patterns.map((p) => {
          const isSelected = selected.includes(p.slug);
          const isDisabled = !isSelected && !canSelect;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => !isDisabled && onToggle(p.slug)}
              disabled={isDisabled}
              className={`
                glass-chip text-left p-4 transition-all duration-300 border
                ${
                  isSelected
                    ? 'border-gold bg-gold/10 shadow-[0_0_16px_rgba(212,175,55,0.12)]'
                    : isDisabled
                      ? 'border-zinc-800/40 opacity-40 cursor-not-allowed'
                      : 'border-zinc-700/50 hover:border-gold/30 hover:bg-zinc-800/40'
                }
              `}
              aria-pressed={isSelected}
            >
              <p className="font-display text-sm text-foreground mb-1.5">{p.name}</p>
              <p className="text-text-muted text-xs leading-relaxed line-clamp-2">
                {p.signs[0]}
              </p>
              {isSelected && (
                <span className="inline-block mt-2 text-[0.625rem] tracking-[0.15em] uppercase text-gold">
                  ✓ Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-text-muted text-xs text-center">
          {selected.length} / 3 selected
        </p>
      )}
    </div>
  );
}

function StepEmotionalLandscape({ form, onChange }: { form: WizardFormData; onChange: <K extends keyof WizardFormData>(key: K, val: WizardFormData[K]) => void }) {
  return (
    <div className="space-y-8">
      <p className="text-text-secondary text-sm leading-relaxed max-w-lg">
        Move the sliders to reflect where you are right now. There are no wrong answers — only honest ones.
      </p>
      {SLIDER_QUESTIONS.map((q) => (
        <div key={q.key} className="space-y-2">
          <p className="text-foreground text-sm font-medium">{q.question}</p>
          <GoldSlider
            value={form[q.key] as number}
            onChange={(v) => onChange(q.key, v as WizardFormData[typeof q.key])}
            lowLabel={q.lowLabel}
            highLabel={q.highLabel}
            ariaLabel={q.question}
          />
        </div>
      ))}
    </div>
  );
}

function StepExperienceLevel({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <p className="text-text-secondary text-sm leading-relaxed max-w-lg">
        Where are you on the path? This helps Kaustubh calibrate the depth of your first session.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXPERIENCE_LEVELS.map((level) => {
          const isActive = selected === level.value;
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => onSelect(level.value)}
              className={`
                glass-chip text-left p-5 transition-all duration-300 border
                ${
                  isActive
                    ? 'border-gold bg-gold/10 shadow-[0_0_16px_rgba(212,175,55,0.12)]'
                    : 'border-zinc-700/50 hover:border-gold/30 hover:bg-zinc-800/40'
                }
              `}
              aria-pressed={isActive}
            >
              <p className="font-display text-foreground mb-1">{level.label}</p>
              <p className="text-text-muted text-xs">{level.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepModality({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (modality: string) => void;
}) {
  const canSelect = selected.length < 2;

  return (
    <div className="space-y-6">
      <p className="text-text-secondary text-sm leading-relaxed max-w-lg">
        Choose up to <span className="text-gold font-medium">2 modalities</span> that call to you most strongly.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODALITY_OPTIONS.map((mod) => {
          const isSelected = selected.includes(mod);
          const isDisabled = !isSelected && !canSelect;
          return (
            <button
              key={mod}
              type="button"
              onClick={() => !isDisabled && onToggle(mod)}
              disabled={isDisabled}
              className={`
                glass-chip text-left p-5 transition-all duration-300 border
                ${
                  isSelected
                    ? 'border-gold bg-gold/10 shadow-[0_0_16px_rgba(212,175,55,0.12)]'
                    : isDisabled
                      ? 'border-zinc-800/40 opacity-40 cursor-not-allowed'
                      : 'border-zinc-700/50 hover:border-gold/30 hover:bg-zinc-800/40'
                }
              `}
              aria-pressed={isSelected}
            >
              <p className="font-display text-sm text-foreground">{mod}</p>
              {isSelected && (
                <span className="inline-block mt-1.5 text-[0.625rem] tracking-[0.15em] uppercase text-gold">
                  ✓ Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepContactScheduling({
  form,
  onChange,
  patterns,
}: {
  form: WizardFormData;
  onChange: <K extends keyof WizardFormData>(key: K, val: WizardFormData[K]) => void;
  patterns: PatternSummary[];
}) {
  const summary = useMemo(() => {
    const lines: string[] = [];

    // Patterns
    if (form.selectedPatterns.length > 0) {
      const names = form.selectedPatterns
        .map((slug) => patterns.find((p) => p.slug === slug)?.name)
        .filter(Boolean);
      lines.push(`▸ Resonant Patterns: ${names.join(', ')}`);
    }

    // Scores
    lines.push('▸ Self-Assessment Scores:');
    lines.push(`   Emotional Stability: ${form.emotionalStability}/10`);
    lines.push(`   Pattern Awareness: ${form.patternAwareness}/10`);
    lines.push(`   Discomfort Willingness: ${form.discomfortWillingness}/10`);
    lines.push(`   Previous Guidance: ${form.previousGuidance}/10`);

    // Experience
    if (form.experienceLevel) {
      const level = EXPERIENCE_LEVELS.find((l) => l.value === form.experienceLevel);
      lines.push(`▸ Experience Level: ${level?.label ?? form.experienceLevel}`);
    }

    // Modalities
    if (form.preferredModalities.length > 0) {
      lines.push(`▸ Preferred Modalities: ${form.preferredModalities.join(', ')}`);
    }

    return lines.join('\n');
  }, [form, patterns]);

  return (
    <div className="space-y-6">
      <p className="text-text-secondary text-sm leading-relaxed max-w-lg">
        Review your intake summary below. Add any additional context, then send your request.
      </p>

      {/* Summary panel with blueprint grid overlay */}
      <div className="relative glass-panel p-6 overflow-hidden">
        {/* Blueprint grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          aria-hidden="true"
        />
        <p className="section-label mb-4 relative z-10">Intake Summary</p>
        <pre className="font-mono text-xs sm:text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed relative z-10 max-h-64 overflow-y-auto scrollbar-thin">
          {summary}
        </pre>
      </div>

      {/* Contact fields */}
      <div className="space-y-5">
        <div>
          <label htmlFor="wiz-name" className="block text-[0.6875rem] tracking-[0.2em] uppercase text-text-muted mb-2">
            Name
          </label>
          <input
            id="wiz-name"
            type="text"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full bg-transparent border border-gold/10 rounded-sm px-4 py-3 text-foreground text-sm placeholder:text-text-muted/50 focus:border-gold/40 focus:outline-none transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="wiz-whatsapp" className="block text-[0.6875rem] tracking-[0.2em] uppercase text-text-muted mb-2">
            WhatsApp Number
          </label>
          <input
            id="wiz-whatsapp"
            type="tel"
            value={form.whatsapp}
            onChange={(e) => onChange('whatsapp', e.target.value)}
            className="w-full bg-transparent border border-gold/10 rounded-sm px-4 py-3 text-foreground text-sm placeholder:text-text-muted/50 focus:border-gold/40 focus:outline-none transition-colors"
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label htmlFor="wiz-notes" className="block text-[0.6875rem] tracking-[0.2em] uppercase text-text-muted mb-2">
            Additional Notes <span className="normal-case tracking-normal text-text-muted/50">(optional)</span>
          </label>
          <textarea
            id="wiz-notes"
            rows={3}
            value={form.additionalNotes}
            onChange={(e) => onChange('additionalNotes', e.target.value)}
            className="w-full bg-transparent border border-gold/10 rounded-sm px-4 py-3 text-foreground text-sm placeholder:text-text-muted/50 focus:border-gold/40 focus:outline-none transition-colors resize-none"
            placeholder="Anything else Kaustubh should know before your session…"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Wizard Component ─── */

export default function ConsultationWizard({ patterns }: { patterns: PatternSummary[] }) {
  const reduced = useNativeReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<WizardFormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [direction, setDirection] = useState<1 | -1>(1);

  const totalSteps = STEP_LABELS.length;

  const updateField = useCallback(<K extends keyof WizardFormData>(key: K, val: WizardFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const togglePattern = useCallback(
    (slug: string) => {
      setForm((prev) => {
        const exists = prev.selectedPatterns.includes(slug);
        if (exists) {
          return { ...prev, selectedPatterns: prev.selectedPatterns.filter((s) => s !== slug) };
        }
        if (prev.selectedPatterns.length >= 3) return prev;
        return { ...prev, selectedPatterns: [...prev.selectedPatterns, slug] };
      });
    },
    [],
  );

  const toggleModality = useCallback(
    (mod: string) => {
      setForm((prev) => {
        const exists = prev.preferredModalities.includes(mod);
        if (exists) {
          return { ...prev, preferredModalities: prev.preferredModalities.filter((m) => m !== mod) };
        }
        if (prev.preferredModalities.length >= 2) return prev;
        return { ...prev, preferredModalities: [...prev.preferredModalities, mod] };
      });
    },
    [],
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const buildEnrichedMessage = useCallback((): string => {
    const lines: string[] = [];

    // Patterns
    if (form.selectedPatterns.length > 0) {
      const names = form.selectedPatterns
        .map((slug) => patterns.find((p) => p.slug === slug)?.name)
        .filter(Boolean);
      lines.push(`Resonant Patterns: ${names.join(', ')}`);
    }

    // Scores
    lines.push(`Emotional Stability: ${form.emotionalStability}/10`);
    lines.push(`Pattern Awareness: ${form.patternAwareness}/10`);
    lines.push(`Discomfort Willingness: ${form.discomfortWillingness}/10`);
    lines.push(`Previous Guidance: ${form.previousGuidance}/10`);

    // Experience
    if (form.experienceLevel) {
      const level = EXPERIENCE_LEVELS.find((l) => l.value === form.experienceLevel);
      lines.push(`Experience Level: ${level?.label ?? form.experienceLevel}`);
    }

    // Modalities
    if (form.preferredModalities.length > 0) {
      lines.push(`Preferred Modalities: ${form.preferredModalities.join(', ')}`);
    }

    // Additional notes
    if (form.additionalNotes.trim()) {
      lines.push(`Additional Notes: ${form.additionalNotes.trim()}`);
    }

    return lines.join('\n');
  }, [form, patterns]);

  const handleSubmit = useCallback(async () => {
    setFormError('');

    if (!form.name.trim() || !form.whatsapp.trim()) {
      setFormError('Name and WhatsApp number are required.');
      return;
    }

    const enrichedMessage = buildEnrichedMessage();

    setSubmitting(true);
    const result = await submitConsultation({
      name: form.name,
      whatsapp: form.whatsapp,
      message: enrichedMessage,
      enrichedMessage,
    });
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setFormError(result.error || 'Submission failed.');
    }
  }, [form, buildEnrichedMessage]);

  // Step animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: reduced ? 0 : dir * 60,
      opacity: reduced ? 1 : 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      x: reduced ? 0 : dir * -60,
      opacity: reduced ? 1 : 0,
      transition: { duration: reduced ? 0 : 0.3, ease: 'easeIn' },
    }),
  };

  /* ─── Submitted State ─── */
  if (submitted) {
    return (
      <motion.div
        initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
        whileInView={fadeInUp.visible}
        viewport={{ once: true, margin: '-60px' }}
        className="max-w-xl mx-auto"
      >
        <div className="glass-panel p-10 text-center">
          <p className="section-label mb-4">Request Received</p>
          <p className="font-display text-2xl text-white mb-4">The Archive acknowledges you.</p>
          <p className="text-text-secondary text-sm editorial-spacing">
            Kaustubh will respond via WhatsApp within 24 hours.
          </p>
        </div>
      </motion.div>
    );
  }

  /* ─── Wizard ─── */
  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true, margin: '-60px' }}
      className="max-w-xl mx-auto"
    >
      <div className="glass-panel p-8 md:p-10">
        {/* Progress */}
        <ProgressIndicator current={currentStep} total={totalSteps} />

        {/* Step Label */}
        <p className="section-label mb-6">Step {currentStep + 1} — {STEP_LABELS[currentStep]}</p>

        {/* Step Content */}
        <div className="min-h-[320px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {currentStep === 0 && (
                <StepPatternAssessment selected={form.selectedPatterns} onToggle={togglePattern} patterns={patterns} />
              )}
              {currentStep === 1 && (
                <StepEmotionalLandscape form={form} onChange={updateField} />
              )}
              {currentStep === 2 && (
                <StepExperienceLevel selected={form.experienceLevel} onSelect={(v) => updateField('experienceLevel', v)} />
              )}
              {currentStep === 3 && (
                <StepModality selected={form.preferredModalities} onToggle={toggleModality} />
              )}
              {currentStep === 4 && (
                <StepContactScheduling form={form} onChange={updateField} patterns={patterns} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error */}
        {formError && (
          <p className="text-red-400 text-xs mt-4 text-center animate-pulse">{formError}</p>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 mt-8">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="ghost-cta flex-shrink-0"
            >
              ← Back
            </button>
          )}

          <div className="flex-1" />

          {currentStep < totalSteps - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="gold-cta flex-shrink-0"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!form.name.trim() || !form.whatsapp.trim() || submitting}
              className="gold-cta flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending…' : 'Send Request'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
