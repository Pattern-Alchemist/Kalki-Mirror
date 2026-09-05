/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Vol. 2 #19: wizard copy via next-intl
   ---------------------------------------------------------------------------
   The wizard's 5 steps + sliders ship in Hindi (the seeker's mother tongue
   lowers friction at the emotional moment). Structure:

     · MESSAGES live in src/i18n/messages/{en,hi}.json under "wizard".
     · This module turns the namespace translator into a typed copy object
       consumed by ConsultationWizard (pure, unit-testable).
     · DATA VALUES stay locale-stable: experience levels and modalities
       store their English canonical values ('beginner', 'Mantra & Japa')
       in the lead + WhatsApp payload — only DISPLAY labels translate.
       Pattern names/descriptions are corpus data (separate concern).
     · The enriched WhatsApp message (buildEnrichedMessage) stays English
       by design: it is the archivist's working copy.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Minimal callable shape of useTranslations('wizard') — keeps this module testable. */
export type WizardT = (key: string, values?: Record<string, string | number>) => string;

export interface SliderQuestionCopy {
  key: 'emotionalStability' | 'patternAwareness' | 'discomfortWillingness' | 'previousGuidance';
  question: string;
  lowLabel: string;
  highLabel: string;
}

export interface ExperienceLevelCopy {
  value: 'beginner' | 'intermediate' | 'advanced' | 'returning';
  label: string;
  description: string;
}

export interface WizardCopy {
  steps: string[];
  step1: {
    selected: string;
    countSelected: (n: number) => string;
  };
  step2: {
    intro: string;
    sliders: SliderQuestionCopy[];
  };
  step3: {
    intro: string;
    levels: ExperienceLevelCopy[];
  };
  step4: {
    // intro is rendered via t.rich (gold highlight) in the component
    modalityLabels: Record<string, string>;
  };
  step5: {
    intro: string;
    summaryLabel: string;
    summary: {
      resonantPatterns: string;
      scoresHeader: string;
      emotionalStability: string;
      patternAwareness: string;
      discomfortWillingness: string;
      previousGuidance: string;
      experienceLevel: string;
      preferredModalities: string;
    };
    nameLabel: string;
    namePlaceholder: string;
    whatsappLabel: string;
    notesLabel: string;
    notesOptional: string;
    notesPlaceholder: string;
  };
  success: {
    heading: string;
    ack: string;
    body: string;
    step1Label: string;
    continueWhatsapp: string;
    step2Label: string;
    chooseSession: string;
    payCta: (amount: string) => string;
    upiCopied: string;
    upiTapToCopy: string;
    confirmUnpaid: string;
    confirmPaid: string;
    preferTalk: string;
    freeCall: string;
    payAfter: string;
    step3Label: string;
    bookingIntro: string;
    reserveSlot: string;
    justPressSend: string;
    returnArchive: string;
  };
  nav: {
    back: string;
    continue: string;
    sending: string;
    sendRequest: string;
  };
  errors: {
    nameWhatsappRequired: string;
    submissionFailed: string;
  };
}

/** Canonical modality values — locale-stable lead data, labels translate. */
export const MODALITY_VALUES = [
  'Mantra & Japa',
  'Breathwork (Prāṇāyāma)',
  'Yantra & Visualization',
  'Movement & Embodiment',
  'Shadow Journaling',
  'Dreamwork',
] as const;

export const EXPERIENCE_VALUES = ['beginner', 'intermediate', 'advanced', 'returning'] as const;

const SLIDER_KEYS = ['emotionalStability', 'patternAwareness', 'discomfortWillingness', 'previousGuidance'] as const;

export function buildWizardCopy(t: WizardT): WizardCopy {
  return {
    steps: [0, 1, 2, 3, 4].map((i) => t(`steps.${i}`)),
    step1: {
      selected: t('step1.selected'),
      countSelected: (n: number) => t('step1.countSelected', { n }),
    },
    step2: {
      intro: t('step2.intro'),
      sliders: SLIDER_KEYS.map((key) => ({
        key,
        question: t(`sliders.${key}.question`),
        lowLabel: t(`sliders.${key}.low`),
        highLabel: t(`sliders.${key}.high`),
      })),
    },
    step3: {
      intro: t('step3.intro'),
      levels: EXPERIENCE_VALUES.map((value) => ({
        value,
        label: t(`levels.${value}.label`),
        description: t(`levels.${value}.description`),
      })),
    },
    step4: {
      modalityLabels: Object.fromEntries(
        MODALITY_VALUES.map((m) => [m, t(`modalities.${modalityKey(m)}`)])
      ),
    },
    step5: {
      intro: t('step5.intro'),
      summaryLabel: t('step5.summaryLabel'),
      summary: {
        resonantPatterns: t('step5.summary.resonantPatterns'),
        scoresHeader: t('step5.summary.scoresHeader'),
        emotionalStability: t('step5.summary.emotionalStability'),
        patternAwareness: t('step5.summary.patternAwareness'),
        discomfortWillingness: t('step5.summary.discomfortWillingness'),
        previousGuidance: t('step5.summary.previousGuidance'),
        experienceLevel: t('step5.summary.experienceLevel'),
        preferredModalities: t('step5.summary.preferredModalities'),
      },
      nameLabel: t('step5.nameLabel'),
      namePlaceholder: t('step5.namePlaceholder'),
      whatsappLabel: t('step5.whatsappLabel'),
      notesLabel: t('step5.notesLabel'),
      notesOptional: t('step5.notesOptional'),
      notesPlaceholder: t('step5.notesPlaceholder'),
    },
    success: {
      heading: t('success.heading'),
      ack: t('success.ack'),
      body: t('success.body'),
      step1Label: t('success.step1Label'),
      continueWhatsapp: t('success.continueWhatsapp'),
      step2Label: t('success.step2Label'),
      chooseSession: t('success.chooseSession'),
      payCta: (amount: string) => t('success.payCta', { amount }),
      upiCopied: t('success.upiCopied'),
      upiTapToCopy: t('success.upiTapToCopy'),
      confirmUnpaid: t('success.confirmUnpaid'),
      confirmPaid: t('success.confirmPaid'),
      preferTalk: t('success.preferTalk'),
      freeCall: t('success.freeCall'),
      payAfter: t('success.payAfter'),
      step3Label: t('success.step3Label'),
      bookingIntro: t('success.bookingIntro'),
      reserveSlot: t('success.reserveSlot'),
      justPressSend: t('success.justPressSend'),
      returnArchive: t('success.returnArchive'),
    },
    nav: {
      back: t('nav.back'),
      continue: t('nav.continue'),
      sending: t('nav.sending'),
      sendRequest: t('nav.sendRequest'),
    },
    errors: {
      nameWhatsappRequired: t('errors.nameWhatsappRequired'),
      submissionFailed: t('errors.submissionFailed'),
    },
  };
}

/** Message-key slug for a canonical modality value (en.json path). */
export function modalityKey(value: string): string {
  switch (value) {
    case 'Mantra & Japa': return 'mantra';
    case 'Breathwork (Prāṇāyāma)': return 'breath';
    case 'Yantra & Visualization': return 'yantra';
    case 'Movement & Embodiment': return 'movement';
    case 'Shadow Journaling': return 'journaling';
    case 'Dreamwork': return 'dream';
    default: return 'mantra';
  }
}
