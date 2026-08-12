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
  {
    slug: 'kapalabhati-advanced',
    name: 'Kapālabhāti — Advanced',
    phases: [
      { name: 'Passive inhale', duration: 0.3 },
      { name: 'Active exhale', duration: 0.3 },
    ],
    cycles: 50,
    minTier: 'agni',
    description:
      'Advanced skull-shining with longer rounds — 50 rapid pump cycles at double the tempo of the basic variation. Builds sustained internal heat, clears the frontal sinuses deeply, and activates manipūra cakra. Only for practitioners who have steadied the basic 30-cycle round for at least four weeks. Rest between rounds is essential.',
  },
  {
    slug: 'bhastrika',
    name: 'Bhastrikā — Bellows Breath',
    phases: [
      { name: 'Active inhale', duration: 1 },
      { name: 'Active exhale', duration: 1 },
    ],
    cycles: 10,
    minTier: 'agni',
    description:
      'The bellows breath — both inhale and exhale are forceful and active, mimicking the pumping action of a blacksmith\'s bellows. Rapidly oxygenates the blood, stokes the digestive fire, and awakens sahasrāra. Contra-indicated in hypertension, peptic ulcer, or during acute anxiety. Practice on an empty stomach.',
  },
  {
    slug: 'nadi-shuddhi-advanced',
    name: 'Nāḍī Śuddhi — Advanced',
    phases: [
      { name: 'Inhale (left)', duration: 6 },
      { name: 'Retain', duration: 6 },
      { name: 'Exhale (right)', duration: 12 },
      { name: 'Inhale (right)', duration: 6 },
      { name: 'Retain', duration: 6 },
      { name: 'Exhale (left)', duration: 12 },
    ],
    cycles: 5,
    minTier: 'agni',
    description:
      'Advanced alternate-nostril breath with extended ratios — 1:1:2 using 6-6-12 second phases. The longer durations demand significant CO₂ tolerance and mental steadiness. Builds on the foundation of the basic and retention-based patterns. This is the gateway ratio from which sūrya and candra bhedana variations emerge.',
  },
  {
    slug: 'kevala-kumbhaka',
    name: 'Kevala Kumbhaka — Spontaneous Retention',
    phases: [
      { name: 'Inhale', duration: 4 },
      { name: 'Sustained retention', duration: 30 },
      { name: 'Exhale', duration: 8 },
    ],
    cycles: 3,
    minTier: 'akash',
    description:
      'The pinnacle of prāṇāyāma — kevala kumbhaka is the state where breath suspension arises spontaneously, without deliberate effort. This guided version uses a 30-second retention as a training wheel toward the unmediated state. The nervous system enters deep parasympathetic dominance. Only suitable for advanced practitioners who have stabilized in antara kumbhaka for extended periods.',
  },
];

export const allBreathPatterns = breathPatterns;
