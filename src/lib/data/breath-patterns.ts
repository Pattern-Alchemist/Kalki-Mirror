import type { BreathPattern } from './types';

export const breathPatterns: BreathPattern[] = [
  {
    slug: 'nadi-shuddhi-basic',
    name: 'Nāḍī Śuddhi — Basic',
    phases: [
      { name: 'Inhale (left)', duration: 4 },
      { name: 'Exhale (right)', duration: 4 },
      { name: 'Inhale (right)', duration: 4 },
      { name: 'Exhale (left)', duration: 4 },
    ],
    cycles: 9,
    minTier: 'prithvi',
    description:
      'The foundational alternate-nostril breath. Balances iḍā and piṅgalā, steadies the mind, and prepares for deeper prāṇāyāma. Use the right thumb to close the right nostril and the right ring finger for the left.',
  },
  {
    slug: 'nadi-shuddhi-with-retention',
    name: 'Nāḍī Śuddhi — With Retention',
    phases: [
      { name: 'Inhale (left)', duration: 4 },
      { name: 'Retain', duration: 4 },
      { name: 'Exhale (right)', duration: 8 },
      { name: 'Inhale (right)', duration: 4 },
      { name: 'Retain', duration: 4 },
      { name: 'Exhale (left)', duration: 8 },
    ],
    cycles: 7,
    minTier: 'jal',
    description:
      'Adds kumbhaka (retention) to the basic pattern. The 1:1:2 ratio calms the nervous system and trains CO₂ tolerance. Never force retention — build gradually over weeks.',
  },
  {
    slug: 'bhramari',
    name: 'Bhramarī — Bee Breath',
    phases: [
      { name: 'Inhale', duration: 4 },
      { name: 'Humming exhale', duration: 8 },
    ],
    cycles: 11,
    minTier: 'prithvi',
    description:
      'A soothing practice where the exhale is produced as a bee-like hum. The vibration stimulates the vagus nerve and promotes parasympathetic activation. Ideal before meditation or sleep.',
  },
  {
    slug: 'ujjayi-pranayama',
    name: 'Ujjāyī — Ocean Breath',
    phases: [
      { name: 'Inhale (constricted)', duration: 4 },
      { name: 'Exhale (constricted)', duration: 6 },
    ],
    cycles: 15,
    minTier: 'prithvi',
    description:
      'A gentle constriction of the glottis creates an oceanic sound on both inhale and exhale. Warms the body, focuses attention, and is the breath of choice during asana practice in many lineages.',
  },
  {
    slug: 'sitali',
    name: 'Śītalī — Cooling Breath',
    phases: [
      { name: 'Inhale (rolled tongue)', duration: 4 },
      { name: 'Retain', duration: 2 },
      { name: 'Exhale (nostrils)', duration: 6 },
    ],
    cycles: 9,
    minTier: 'jal',
    description:
      'Inhale through a rolled tongue, retain briefly, then exhale through the nostrils. Cools the body and calms Pitta. Contraindicated in cold weather or for those with respiratory congestion.',
  },
  {
    slug: 'kapalabhati-basic',
    name: 'Kapālabhāti — Skull Shining',
    phases: [
      { name: 'Passive inhale', duration: 0.5 },
      { name: 'Active exhale', duration: 0.5 },
    ],
    cycles: 30,
    minTier: 'jal',
    description:
      'Rapid, forceful exhales with passive inhales. Cleanses the frontal sinuses, stimulates the manipūra cakra, and builds internal heat. Avoid during pregnancy, hypertension, or acute anxiety.',
  },
  {
    slug: 'surya-bhedana',
    name: 'Sūrya Bhedana — Solar Piercing',
    phases: [
      { name: 'Inhale (right)', duration: 4 },
      { name: 'Retain', duration: 4 },
      { name: 'Exhale (left)', duration: 8 },
    ],
    cycles: 9,
    minTier: 'agni',
    description:
      'Inhale exclusively through the right (solar) nostril, exhale through the left (lunar). Activates sympathetic tone, builds heat, and increases alertness. Practice in the morning only.',
  },
  {
    slug: 'chandra-bhedana',
    name: 'Candra Bhedana — Lunar Piercing',
    phases: [
      { name: 'Inhale (left)', duration: 4 },
      { name: 'Retain', duration: 4 },
      { name: 'Exhale (right)', duration: 8 },
    ],
    cycles: 9,
    minTier: 'agni',
    description:
      'The mirror of Sūrya Bhedana — inhale through the left (lunar), exhale through the right (solar). Cools, calms, and promotes parasympathetic dominance. Practice in the evening.',
  },
];

export const allBreathPatterns = breathPatterns;
