// =============================================================
// SĀDHANĀ LIBRARY — Structured Practice Index
// Each entry is a self-contained practice protocol extracted from
// the Aghorī Tantra course and the siddhi archive.
// Evidence grading: TRADITIONAL | ORAL | FIELD | RECONSTRUCTED
// =============================================================

import type { Sadhana } from './types';

export const sadhanaLibrary: Sadhana[] = [
  // ═══════════════════════════════════════════════════════════════
  // MANTRA VIDYĀ
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'bhairava-japa-daily',
    name: 'Daily Bhairava Japa',
    sanskrit: 'Bhairava-Japa-Anuṣṭhāna',
    categoryId: 'japa',
    tradition: 'Aghora / Bhairava',
    level: 'Foundation',
    minTier: 'prithvi',
    summary: 'The foundational daily mantra practice of the Aghori tradition — 108 repetitions of the Bhairava mantra each morning and evening, progressing from vocal (vācika) to whispered (upāṃśu) to mental (mānasika) over a 40-day intensive period.',
    duration: '40 days intensive, then lifelong daily',
    dailyCommitment: '20–30 minutes (2 rounds of 108)',
    prerequisites: ['Rudrākṣa mālā (108 beads)', 'Quiet space', 'Completion of Phase I orientation'],
    steps: [
      'Sit facing east or north, spine straight, at the same time each day',
      'Begin with 3x Aghora invocation: oṃ aghora aghora aghorabhyo namaḥ',
      'Perform japa of oṃ hrīṃ bhairavāya namaḥ — 108 repetitions on the mālā',
      'Week 1–2: Vācika (vocal) japa',
      'Week 3–4: Upāṃśu (whispered) japa',
      'Week 5+: Mānasika (mental) japa',
      'If the mind wanders more than 10 times in a single round, return to the previous level',
      'Close with 3x Aghora invocation',
    ],
    primaryMantra: 'oṃ hrīṁ bhairavāya namaḥ',
    materials: ['Rudrākṣa mālā, 108 beads', 'Quiet space for practice'],
    warnings: ['If you hear voices during mental japa, return to vocal japa — this is not the inner sound but auditory hallucination'],
    benefits: ['Stabilizes attention', 'Develops single-pointed concentration', 'Begins the process of mantra internalization', 'Creates a daily rhythm that supports all other practices'],
    evidence: 'TRADITIONAL',
    relatedCoursePhase: 'Phase III',
  },
  {
    slug: 'purashcharana-discipline',
    name: 'Puraścaraṇa: The Mantra Completion Discipline',
    sanskrit: 'Puraścaraṇa-Sādhanā',
    categoryId: 'japa',
    tradition: 'Aghora / Classical Tantra',
    level: 'Intermediate',
    minTier: 'jal',
    summary: 'The formal discipline of completing 100,000 repetitions of the primary mantra over 40–90 days, with simplified fire offering and water libation. Not for accumulating power, but for burning through the resistance patterns that prevent the mantra from operating at its deepest level.',
    duration: '40–90 days',
    dailyCommitment: '45–90 minutes (minimum 108x daily, scaling to 1008x on intensive days)',
    prerequisites: ['Stable Vācika and Upāṃśu japa', 'Rudrākṣa mālā', 'Journal for tracking', 'Candle or ghee lamp'],
    steps: [
      'Commit to a fixed number per day (minimum 108x) for a fixed period (40 or 90 days)',
      'Track every round on the mālā and log in journal',
      'If you miss a day, add two days to the commitment',
      'On the final day, perform a simplified homa: 108 repetitions with each accompanied by a ghee offering to a candle flame',
      'Perform simplified tarpaṇa: 108 water libations while reciting the mantra',
      'Journal the experience at the beginning, middle, and end of the period',
    ],
    primaryMantra: 'oṃ hrīṁ bhairavāya namaḥ',
    materials: ['Rudrākṣa mālā (108 beads)', 'Journal for tracking', 'Candle or ghee lamp for simplified homa', 'Glass of water for simplified tarpaṇa'],
    warnings: ['Do not begin until Vācika and Upāṃśu japa are stable', 'The commitment IS the practice — if you cannot commit to the full period, do not begin', 'Can be emotionally intense — maintain daily grounding', 'Do not attempt multiple Puraścaraṇas simultaneously'],
    benefits: ['Burns through ego-resistance patterns', 'Transforms the mantra from a repeated sound into a living presence', 'Creates extraordinary intensity of focus', 'The practitioner is not the same person who began it'],
    evidence: 'TRADITIONAL',
    relatedCoursePhase: 'Phase III',
  },

  // ═══════════════════════════════════════════════════════════════
  // YANTRA VIDYĀ
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'sri-yantra-trataka',
    name: 'Śrī Yantra Trāṭaka',
    sanskrit: 'Śrī-Cakra-Trāṭaka',
    categoryId: 'yantra',
    tradition: 'Śrī Vidyā / Aghora',
    level: 'Intermediate',
    minTier: 'jal',
    summary: 'Progressive gazing meditation on the Śrī Yantra — moving from the outermost bhūpura inward through the nine enclosures to the central bindu, then closing the eyes and visualizing the complete yantra from memory.',
    duration: 'Lifelong daily practice',
    dailyCommitment: '20 minutes',
    prerequisites: ['A clear Śrī Yantra image (printed or engraved)', 'Completion of Phase II Trāṭaka practice', 'Stable sitting posture for 20+ minutes'],
    steps: [
      'Place the Śrī Yantra at eye level in a well-lit area',
      'Begin Trāṭaka on the outermost square (bhūpura) for 5 minutes',
      'Move the gaze inward through each enclosure, 1–2 minutes per enclosure',
      'Rest the gaze on the central bindu for 5 minutes',
      'Close the eyes and visualize the entire yantra from memory',
      'Practice 20 minutes daily',
    ],
    primaryMantra: 'oṃ aiṁ hrīṁ śrīṃ aiṁ klīṁ sauḥ',
    materials: ['Śrī Yantra image or engraving', 'Clean cloth for the yantra'],
    benefits: ['Develops concentrated, unwavering attention', 'Internalizes the geometry of consciousness', 'Prepares the mind for Dṛṣṭi practice', 'Creates a bridge between external form and internal awareness'],
    evidence: 'TRADITIONAL',
    relatedCoursePhase: 'Phase IV',
  },
  {
    slug: 'yantra-drawing-consecration',
    name: 'Drawing and Consecrating a Yantra',
    sanskrit: 'Yantra-Lekhana-Prāṇa-Pratiṣṭhā',
    categoryId: 'yantra',
    tradition: 'Śrī Vidyā / Aghora',
    level: 'Intermediate',
    minTier: 'jal',
    summary: 'The complete process of drawing a Śrī Yantra by hand (considered 7x more powerful than a purchased one), followed by Prāṇa Pratiṣṭhā — the consecration ritual that transforms geometric form into a living instrument.',
    duration: 'One full day for drawing, monthly re-consecration',
    dailyCommitment: 'Full day for initial creation',
    prerequisites: ['Śrī Yantra template for first attempt', 'Understanding of the nine enclosures from Phase IV lessons', 'Ṣaḍaṅga Nyāsa proficiency'],
    steps: [
      'Choose an auspicious day (Friday for Tripurasundarī). Bathe, wear clean clothes.',
      'Prepare materials: unlined paper or copper plate, fine-tipped pen, red ink (sindoor + water), ruler and compass',
      'Draw from center outward: bindu → central triangle → 8 remaining triangles → lotus petals → circles → bhūpura',
      'Recite the root mantra (aiṁ hrīṁ śrīṃ) with each element drawn',
      'Perform Ṣaḍaṅga Nyāsa over the completed drawing',
      'Chant the Śrī Yantra root mantra 108 times while gazing at the bindu',
      'Visualize the deity presence entering the bindu and radiating outward',
      'Install on a small altar, facing east. Cover with clean cloth when not in use.',
      'Re-consecrate monthly or after any period of disuse',
    ],
    primaryMantra: 'oṃ aiṁ hrīṁ śrīṃ aiṁ klīṁ sauḥ',
    materials: ['Unlined paper or copper plate', 'Fine-tipped pen or stylus', 'Red ink (sindoor + water)', 'Ruler and compass', 'Śrī Yantra template', 'Clean cloth for altar'],
    warnings: ['Do not draw yantras casually — the act of drawing IS the practice', 'A poorly proportioned Śrī Yantra is considered inactive', 'Do not discard a consecrated yantra in the trash — immerse in flowing water'],
    benefits: ['Encodes the yantra geometry into the nervous system', 'Produces a personally consecrated meditation instrument', 'Deepens understanding of the nine enclosures'],
    evidence: 'FIELD',
    relatedCoursePhase: 'Phase IV',
  },

  // ═══════════════════════════════════════════════════════════════
  // NYĀSA VIDYĀ
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'kadgamala-nyasa',
    name: 'Khadgamālā Ṣaḍaṅga Nyāsa',
    sanskrit: 'Khadgamālā-Ṣaḍaṅga-Nyāsa',
    categoryId: 'nyasa',
    tradition: 'Śrī Vidyā / Govinda Das Aghori lineage',
    level: 'Intermediate',
    minTier: 'jal',
    summary: 'The ritual installation of the Śrī Yantra deities into the practitioner own body through Kara Nyāsa (hand installation) and Aṅga Nyāsa (body installation), followed by recitation of the Khadgamālā Stotram — the highest form of Śrī Yantra worship.',
    duration: 'Lifelong weekly-to-daily practice',
    dailyCommitment: '30–45 minutes',
    prerequisites: ['Proficiency in Śrī Yantra Trāṭaka', 'Knowledge of the bīja mantras: aiṁ, klīṁ, sauḥ', 'Śrī Yantra image for reference'],
    steps: [
      'Begin with Kara Nyāsa: touch each finger pair with the corresponding bīja as you recite it (aiṃ thumbs, klīṁ index, sauḥ middle, sauḥ ring, klīṁ little, aiṁ palm)',
      'Perform Aṅga Nyāsa: touch heart (aiṃ), crown (klīṁ), topknot (sauḥ), right shoulder (sauḥ), eyes (klīṁ), fingertips (aiṁ)',
      'Conclude installation with: bhūr bhuva suva oṃ',
      'Begin recitation of the Khadgamālā Stotram, one verse at a time',
      'Visualize each deity at its location in the Śrī Yantra as you recite',
      'Begin once weekly, increase to daily as comfort allows',
    ],
    materials: ['Śrī Yantra image or engraving', 'Clean cloth', 'Rudrākṣa mālā', 'Optional: sandalwood paste, red sindoor, ghee lamp, flowers'],
    warnings: ['Nyāsa activates subtle body energy stations — do not perform casually', 'Bīja mantras must be pronounced as accurately as possible', 'Do not attempt without prior Trāṭaka experience'],
    benefits: ['Transforms the body into a living Śrī Cakra', 'Activates the Mātṛkā (sonic forms of the divine) throughout the body', 'Bridges external geometry with internal subtle body', 'Deepens all subsequent mantra and yantra practice'],
    evidence: 'TRADITIONAL',
    relatedCoursePhase: 'Phase IV',
  },

  // ═══════════════════════════════════════════════════════════════
  // ŚMAŚĀNA VIDYĀ
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'marana-smriti',
    name: 'Maraṇa-Smṛti: Death-Awareness Practice',
    sanskrit: 'Maraṇa-Smṛti-Sādhanā',
    categoryId: 'smashana',
    tradition: 'Aghora / Buddhist shared heritage',
    level: 'Advanced',
    minTier: 'agni',
    summary: 'The most direct and uncompromising contemplation practice: visualizing your own body on a cremation pyre, watching the fire consume it stage by stage. Not morbid — the most compassionate practice possible, addressing the root cause of all suffering.',
    duration: 'Lifelong daily practice',
    dailyCommitment: '10–20 minutes',
    prerequisites: ['Stability in witness consciousness (Sākṣī Bhāva)', 'Completion of Phases I–II', 'No history of suicidal ideation or clinical depression'],
    steps: [
      'Sit in a quiet place, preferably at night',
      'Week 1: Visualize your body on a pyre for 10 minutes. See the fire begin at the feet.',
      'Week 2+: Extend to 20 minutes. Watch it spread through legs, torso, arms, face.',
      'Observe the skin blackening, flesh contracting, bones whitening, skull cracking.',
      'Watch everything you identify with reduced to ash and bone fragments.',
      'Notice the psychological effects: fear → grief → resistance → relief.',
      'The relief comes from recognizing that what you fear losing is already temporary.',
    ],
    warnings: ['Can trigger intense fear and grief — do not suppress', 'If you have a history of suicidal ideation or depression, consult a professional first', 'Should create relief, not despair — if persistent despair, discontinue', 'Do not combine with alcohol or drugs'],
    benefits: ['Dissolves the deepest clinging — the attachment to a future that was never guaranteed', 'Produces a lightness mistaken for detachment', 'Reveals that the practice does not create impermanence — it reveals it', 'The most compassionate practice in the tradition'],
    evidence: 'TRADITIONAL',
    relatedCoursePhase: 'Phase VI',
  },
  {
    slug: 'kapal-puja-daily',
    name: 'Kapāl Pūjā: The Skull Ritual',
    sanskrit: 'Kapāl-Pūjā-Anuṣṭhāna',
    categoryId: 'puja',
    tradition: 'Aghora',
    level: 'Advanced',
    minTier: 'agni',
    summary: 'The central ritual practice of the Aghori tradition — daily worship of the skull as the most direct teacher of impermanence and the most powerful instrument for concentrating the mind. The cranial vault is the seat of consciousness; the skull is its physical representation.',
    duration: 'Lifelong daily practice (ideally at twilight)',
    dailyCommitment: '20–30 minutes',
    prerequisites: ['A skull or symbolic representation', 'Completion of Phase V deity contemplation', 'Stability in witness consciousness'],
    steps: [
      'Place the skull on a clean black cloth on a small altar',
      'Bathe with water (Gaṅgā Jal if available), then with sandalwood paste and ash mixture',
      'Apply red sindoor to the third-eye area',
      'Place red or white flowers before the skull',
      'Light a ghee lamp',
      'Perform 108x japa of the Kapāleśvara mantra while gazing at the skull',
      'Offer water and a small food portion (bhoga)',
      'Sit in silence for 10 minutes after the pūjā',
      'Close with the Aghora invocation',
    ],
    primaryMantra: 'oṃ kapāleśvarāya namaḥ',
    materials: ['Skull (real or symbolic)', 'Black cloth for altar', 'Gaṅgā Jal or clean water', 'Red sindoor', 'Sandalwood paste (optional)', 'Red or white flowers', 'Ghee lamp', 'Rudrākṣa mālā'],
    warnings: ['A real human skull should only be obtained through ethical and legal means', 'Check local laws regarding possession of human remains', 'Psychological impact should not be underestimated — maintain grounding', 'If persistent nightmares or anxiety, take a break'],
    benefits: ['The most powerful instrument for concentrating the mind', 'Radical acceptance of mortality', 'The skull cannot be sentimentalized — it cuts through all rationalization', 'Daily confrontation with what you will become'],
    evidence: 'ORAL',
    relatedCoursePhase: 'Phase VI',
  },

  // ═══════════════════════════════════════════════════════════════
  // DHĀRAṆĀ VIDYĀ
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'trataka-candle',
    name: 'Trāṭaka: Steady Gazing',
    sanskrit: 'Trāṭaka-Sādhanā',
    categoryId: 'dharna',
    tradition: 'Aghora / Haṭha Yoga shared',
    level: 'Foundation',
    minTier: 'prithvi',
    summary: 'The foundational concentration practice: unwavering gazing at a candle flame until the eyes water, then visualizing the afterimage with closed eyes. Develops the capacity for Dṛṣṭi — the concentrated, transformative gaze used throughout the Aghori path.',
    duration: '40 days intensive, then as needed',
    dailyCommitment: '15–20 minutes',
    prerequisites: ['Candle and matches', 'Dark or dim room', 'Clean sitting posture'],
    steps: [
      'Place a lit candle at eye level, arm length away',
      'Gaze at the flame without blinking for as long as comfortable',
      'When the eyes water, close them',
      'Visualize the afterimage of the flame at the third eye (between the eyebrows)',
      'When the afterimage fades, open the eyes and repeat',
      'Practice 15–20 minutes daily',
      'Over 40 days, the ability to maintain the gaze without watering will extend significantly',
    ],
    materials: ['Candle and matches', 'Dark room or dim lighting'],
    warnings: ['Do not strain the eyes — if pain occurs, discontinue', 'If you see colors or shapes during closed-eye phase, observe without grasping', 'People with epilepsy or eye conditions should consult a doctor first'],
    benefits: ['Develops unwavering concentration', 'Prepares the mind for all subsequent visualization practices', 'Strengthens the eye muscles and the ability to focus', 'Begins to train the witness consciousness (Sākṣī Bhāva)'],
    evidence: 'TRADITIONAL',
    relatedCoursePhase: 'Phase II',
  },

  // ═══════════════════════════════════════════════════════════════
  // NĀDA YOGA
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'nada-yoga-inner-sound',
    name: 'Nāda Yoga: The Ten Stages of Inner Sound',
    sanskrit: 'Daśa-Nāda-Anusandhāna',
    categoryId: 'dhyana',
    tradition: 'Aghora / Nāth',
    level: 'Intermediate',
    minTier: 'jal',
    summary: 'Listening for the inner sound (Nāda) by excluding external sounds — progressing through ten stages from chini (crickets) to the anāhata dhvani (the unstruck sound of consciousness itself). The bridge between mantra practice and the internal silence that is the ultimate goal.',
    duration: 'Lifelong daily practice',
    dailyCommitment: '15–30 minutes',
    prerequisites: ['Completion of Mānasika Japa (mental repetition)', 'Ability to sit still for 30+ minutes', 'Quiet dark space'],
    steps: [
      'After evening japa, sit in a quiet dark space',
      'Close the ears with the thumbs (Śānmuṅkī Mudrā)',
      'Listen. Do not imagine a sound — wait for it.',
      'When a high-pitched ringing or humming appears, this is the first layer (Parā Nāda)',
      'Focus on it gently. As concentration deepens, the sound will change.',
      'Progress through the ten sounds: chini → chini-chini → ghantā → śaṅkha → tāṃḍavī → bherī → mṛdaṅga → veṇā → bāṃśī → anāhata dhvani',
      'The sound and listener eventually become indistinguishable — this is the goal.',
    ],
    warnings: ['If you hear voices or words, this is NOT nāda — discontinue and ground yourself', 'Do not pursue the sounds aggressively', 'Nāda practice can make you sensitive to noise — protect your hearing'],
    benefits: ['Traces consciousness back to its source through sound', 'The most subtle medium the mind can perceive', 'Produces a constant internal anchor even during daily activity', 'Bridges mantra practice and the silence of pure awareness'],
    evidence: 'TRADITIONAL',
    relatedCoursePhase: 'Phase III',
  },

  // ═══════════════════════════════════════════════════════════════
  // BHASMA VIDYĀ
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'bhasma-alchemy',
    name: 'Bhasma: The Alchemy of Sacred Ash',
    sanskrit: 'Bhasma-Vidyā — Vibhūti-Sādhanā',
    categoryId: 'bhasma',
    tradition: 'Aghora',
    level: 'Advanced',
    minTier: 'agni',
    summary: 'The practice of sacred ash (Vibhūti/Bhasma) as both substance and symbol — applying it to the body, using it in yantra practice, and contemplating its significance as the ultimate equalizer: all forms return to the same substance.',
    duration: 'Lifelong — applied daily',
    dailyCommitment: '5–10 minutes (application + contemplation)',
    prerequisites: ['Access to sacred ash from a dhūni or temple', 'Understanding of impermanence from Phase VI practices'],
    steps: [
      'Collect ash from a sacred fire (dhūni) or obtain Vibhūti from a temple',
      'Each morning, apply three horizontal lines of bhasma to the forehead (tripuṇḍra)',
      'Apply to arms, chest, and throat while contemplating: this is what all forms become',
      'Before yantra practice, use bhasma to draw yantras on the ground or on a surface',
      'During the application, contemplate the equality of all forms in ash',
    ],
    materials: ['Sacred ash (from dhūni or temple)', 'Clean water for mixing (optional)'],
    warnings: ['Bhasma from a dhūni may contain incompletely burned material — use only fine, white ash', 'Do not use ash from non-sacred fires'],
    benefits: ['Constant physical reminder of impermanence', 'Creates a tactile connection to the transformative power of fire', 'The great equalizer — kings and ascetics become the same substance'],
    evidence: 'FIELD',
    relatedCoursePhase: 'Phase VI',
  },

  // ═══════════════════════════════════════════════════════════════
  // PRAṆĀYĀMA VIDYĀ
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'nadi-shodhana-basic',
    name: 'Nāḍī Śodhana: Channel Purification',
    sanskrit: 'Nāḍī-Śodhana-Prāṇāyāma',
    categoryId: 'pranayama',
    tradition: 'Aghora / Haṭha Yoga shared',
    level: 'Foundation',
    minTier: 'prithvi',
    summary: 'Alternate nostril breathing — the foundational prāṇāyāma that purifies the iḍā and piṅgalā nāḍīs, balances the solar and lunar energies, and prepares the subtle body for deeper practice.',
    duration: '40 days intensive, then lifelong daily',
    dailyCommitment: '10–15 minutes',
    prerequisites: ['Clean sitting posture', 'Empty stomach (practice before breakfast or 3+ hours after eating)'],
    steps: [
      'Sit with spine straight. Use Viśrama Mudrā or Jñāna Mudrā with the right hand.',
      'Close the right nostril with the thumb. Inhale slowly through the left nostril (4 counts).',
      'Close both nostrils. Retain (4 counts).',
      'Release the right nostril. Exhale slowly through the right nostril (8 counts).',
      'Inhale through the right nostril (4 counts).',
      'Close both nostrils. Retain (4 counts).',
      'Release the left nostril. Exhale through the left nostril (8 counts).',
      'This is one round. Begin with 9 rounds, increase to 27 over 40 days.',
    ],
    warnings: ['Never force the breath — if you feel dizzy or anxious, stop immediately', 'Do not practice with a full stomach', 'Kumbhaka (retention) should only be added after 2 weeks of practice without it', 'People with high blood pressure, heart conditions, or pregnancy should skip retention'],
    benefits: ['Balances the left and right brain hemispheres', 'Calms the nervous system', 'Develops breath awareness that supports all other practices', 'Begins the purification of the nāḍī system'],
    evidence: 'TRADITIONAL',
    relatedCoursePhase: 'Phase II',
  },

  // ═══════════════════════════════════════════════════════════════
  // SEVĀ VIDYĀ
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'seva-selfless-service',
    name: 'Sevā: Selfless Service as Sādhanā',
    sanskrit: 'Sevā-Sādhanā',
    categoryId: 'seva',
    tradition: 'Aghora / Aghoreshwar Bhagwan Ramji',
    level: 'Foundation',
    minTier: 'prithvi',
    summary: 'Selfless service — not as a moral obligation but as a precise practice for dissolving the ego. The Aghoreshwar tradition emphasizes service to the poor, the sick, and the dying as the supreme form of sādhanā, equal in power to any mantra or ritual.',
    duration: 'Lifelong',
    dailyCommitment: '30–60 minutes or as circumstances allow',
    prerequisites: ['None — this is the most accessible practice in the tradition'],
    steps: [
      'Identify a form of service that does not serve your self-image',
      'Perform it regularly — daily if possible, weekly at minimum',
      'During the service, observe the ego reactions: pride, resentment, self-congratulation',
      'Continue despite the reactions. The reactions ARE the practice.',
      'After service, sit for 5 minutes and observe the state of the mind',
    ],
    benefits: ['Dissolves the ego more effectively than many meditation practices', 'Grounds all other spiritual practice in reality', 'Connects the practitioner to the community', 'The Aghoreshwar tradition: service IS the highest sādhanā'],
    evidence: 'ORAL',
    relatedCoursePhase: 'Phase VIII',
  },
];

/** Get a sadhana by slug */
export function getSadhanaBySlug(slug: string): Sadhana | undefined {
  return sadhanaLibrary.find(s => s.slug === slug);
}

/** Get sadhanas filtered by category */
export function getSadhanasByCategory(categoryId: string): Sadhana[] {
  return sadhanaLibrary.filter(s => s.categoryId === categoryId);
}

/** Get sadhanas filtered by tier */
export function getSadhanasByTier(tier: string): Sadhana[] {
  const tierOrder = ['prithvi', 'jal', 'agni', 'akash'];
  const idx = tierOrder.indexOf(tier);
  if (idx === -1) return sadhanaLibrary;
  return sadhanaLibrary.filter(s => tierOrder.indexOf(s.minTier) <= idx);
}

export const SADHANA_COUNT = sadhanaLibrary.length;
