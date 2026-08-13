import type { Tier } from './types';

export interface PracticeSequence {
  slug: string;
  name: string;
  sanskrit?: string;
  subtitle: string;
  description: string;
  minTier: Tier;
  steps: { siddhiSlug: string; label: string; duration: string; note?: string }[];
  totalDuration: string;
  targetPatterns: string[];
}

export const allSequences: PracticeSequence[] = [
  {
    slug: 'anxiety-dissolution',
    name: 'Anxiety Dissolution',
    subtitle: 'Prāṇāyāma → Dhāraṇā → Dhyāna',
    description:
      'A three-stage sequence designed to systematically dissolve the somatic, cognitive, and existential layers of anxiety. Begin with Nāḍī Śuddhi to stabilize the autonomic nervous system and equalize the iḍā-piṅgalā currents. Progress to Trāṭaka to anchor scattered attention onto a single point. Complete with So\'haṃ Dhyāna to rest in the recognition that the anxious self is not the true self.',
    minTier: 'prithvi',
    steps: [
      {
        siddhiSlug: 'nadi-shuddhi',
        label: 'Nāḍī Śuddhi',
        duration: '15 min',
        note: 'Begin with 5 rounds of simple alternate-nostril breathing, then extend to a 1:2 ratio. Observe the breath without forcing symmetry.',
      },
      {
        siddhiSlug: 'trataka',
        label: 'Trāṭaka',
        duration: '10 min',
        note: 'Gaze at a candle flame or a fixed point. When the eyes water, close them and hold the after-image at the ājñā center.',
      },
      {
        siddhiSlug: 'soham-dhyana',
        label: 'So\'haṃ Dhyāna',
        duration: '20 min',
        note: 'Let the breath become the mantra: so on inhalation, haṃ on exhalation. Rest in the silence between breaths — the anxiety dissolves there.',
      },
    ],
    totalDuration: '45 min',
    targetPatterns: ['the-controller', 'the-ghost', 'the-avoidant'],
  },
  {
    slug: 'shadow-integration',
    name: 'Shadow Integration',
    sanskrit: 'Chāyā Samāveśa',
    subtitle: 'Yoga Nidrā → Cakra Dhāraṇā → Śrī Yantra',
    description:
      'A deep-dive sequence for confronting and integrating the disowned aspects of the psyche. Yoga Nidrā relaxes the ego\'s defenses, creating a safe container for shadow material to surface. Cakra Dhāraṇā maps the terrain of the subconscious. Śrī Yantra contemplation completes the integration by holding the full complexity of self and cosmos in a single geometric vision.',
    minTier: 'jal',
    steps: [
      {
        siddhiSlug: 'yoga-nidra',
        label: 'Yoga Nidrā',
        duration: '25 min',
        note: 'Follow a systematic rotation of consciousness through the body. When the body sleeps, observe what the mind reveals — this is the shadow speaking.',
      },
      {
        siddhiSlug: 'chakra-dharana',
        label: 'Cakra Dhāraṇā',
        duration: '20 min',
        note: 'Ascend from mūlādhāra to ājñā, pausing at each center. Note which cakras feel blocked or dense — these are the shadow\'s anchor points.',
      },
      {
        siddhiSlug: 'sri-yantra-dhyana',
        label: 'Śrī Yantra Contemplation',
        duration: '20 min',
        note: 'Gaze at the yantra and allow the nine triangles to hold both the light and dark aspects of self. The bindu is the point where shadow and light are one.',
      },
    ],
    totalDuration: '65 min',
    targetPatterns: ['the-martyr', 'the-avoidant', 'the-witness'],
  },
  {
    slug: 'pattern-recognition',
    name: 'Pattern Recognition',
    subtitle: 'Pranava → Trāṭaka → Ajapa',
    description:
      'A sequence for developing the precise, non-reactive awareness needed to see your own behavioral loops in real time. Pranava Japa establishes a stable vibrational baseline. Trāṭaka sharpens the visual-discriminative faculty. Ajapa-Japa then weaves that awareness into the breath itself, so that pattern-recognition becomes automatic — running in the background like the breath-mantra.',
    minTier: 'prithvi',
    steps: [
      {
        siddhiSlug: 'pranava-japa',
        label: 'Pranava Japa',
        duration: '15 min',
        note: 'Chant Oṃ aloud for 5 rounds, then whisper, then internalize. The transition from audible to silent trains the shift from external to internal perception.',
      },
      {
        siddhiSlug: 'trataka',
        label: 'Trāṭaka',
        duration: '10 min',
        note: 'This time, use the after-image period to observe thoughts arising. Each thought is a pattern — notice them without following.',
      },
      {
        siddhiSlug: 'ajapa-japa',
        label: 'Ajapa-Japa',
        duration: '20 min',
        note: 'Recognize that the breath is already repeating so\'haṃ 21,600 times daily. Let the recognition do the work — effort is the pattern trying to control recognition.',
      },
    ],
    totalDuration: '45 min',
    targetPatterns: ['the-architect', 'the-seeker', 'the-positivist'],
  },
  {
    slug: 'emotional-reconstitution',
    name: 'Emotional Reconstitution',
    sanskrit: 'Bhāva Pūraṇa',
    subtitle: 'Bīja Mantra → Kumbhaka → Mahā Mṛtyuṅjaya',
    description:
      'A fiery sequence for practitioners ready to confront the most deeply embedded emotional imprints. Bīja Mantra vibrates the stuck emotional residue at each cakra. Kumbhaka builds the internal pressure needed to dislodge fixed patterns. The Mahā Mṛtyuṅjaya Mantra then provides the final release — a Ṛgvedic verse that has been recited at life\'s thresholds for over three millennia.',
    minTier: 'agni',
    steps: [
      {
        siddhiSlug: 'bija-mantra',
        label: 'Bīja Mantra',
        duration: '15 min',
        note: 'Chant each bīja (laṃ, vaṃ, raṃ, yaṃ, haṃ, oṃ) at its corresponding cakra. Feel the vibration — not conceptually, but somatically.',
      },
      {
        siddhiSlug: 'kumbhaka',
        label: 'Kumbhaka',
        duration: '15 min',
        note: 'After a stable breath rhythm, begin gentle antar kumbhaka (internal retention). The held breath creates a pressure that loosens the emotional imprint.',
      },
      {
        siddhiSlug: 'mahamrityunjaya',
        label: 'Mahā Mṛtyuṅjaya Mantra',
        duration: '15 min',
        note: 'Chant the Tryambaka verse 11 or 21 times. The metaphor is precise: release from the vine as the cucumber releases itself — no force, only ripeness.',
      },
    ],
    totalDuration: '45 min',
    targetPatterns: ['the-saboteur', 'the-tyrant', 'the-judge'],
  },
  {
    slug: 'identity-dissolution',
    name: 'Identity Dissolution',
    subtitle: 'Śrī Yantra → Cakra Dhāraṇā → Trāṭaka',
    description:
      'An advanced sequence for deconstructing the fixed sense of self that underlies the most persistent patterns. Śrī Yantra contemplation dissolves the boundary between observer and observed. Cakra Dhāraṇā then maps the identity-constructs anchored at each center. Trāṭaka completes the dissolution by fixing the gaze on emptiness itself — the after-image of a vanishing self.',
    minTier: 'agni',
    steps: [
      {
        siddhiSlug: 'sri-yantra-dhyana',
        label: 'Śrī Yantra Contemplation',
        duration: '20 min',
        note: 'Begin at the bindu and expand awareness outward through the nine triangles. The yantra is a map of emanation — follow it in reverse, back to the source.',
      },
      {
        siddhiSlug: 'chakra-dharana',
        label: 'Cakra Dhāraṇā',
        duration: '15 min',
        note: 'This time, descend from ājñā to mūlādhāra. At each center, ask: "Who is the one observing this?" — the answer dissolves as you ask it.',
      },
      {
        siddhiSlug: 'trataka',
        label: 'Trāṭaka',
        duration: '15 min',
        note: 'Gaze until the object and the gazer become indistinguishable. In the after-image, there is no self looking — only looking itself.',
      },
    ],
    totalDuration: '50 min',
    targetPatterns: ['the-chameleon', 'the-hermit', 'the-pleaser'],
  },
  {
    slug: 'void-reclamation',
    name: 'Void Reclamation',
    subtitle: 'Cakra → Nidrā → Nāḍī → So\'haṃ',
    description:
      'The most comprehensive sequence in the collection — a four-stage journey through the deepest territories of the psyche. Cakra Dhāraṇā maps the terrain. Yoga Nidrā dissolves the ego\'s grip. Nāḍī Śuddhi re-equilibrates the currents. So\'haṃ Dhyana completes the journey by resting in the void itself — not as absence, but as the ground from which all patterns arise and to which they return.',
    minTier: 'akash',
    steps: [
      {
        siddhiSlug: 'chakra-dharana',
        label: 'Cakra Dhāraṇā',
        duration: '15 min',
        note: 'Rapid survey of all six centers — 2 min each. Note the quality of attention at each, not the content. This is cartography, not analysis.',
      },
      {
        siddhiSlug: 'yoga-nidra',
        label: 'Yoga Nidrā',
        duration: '25 min',
        note: 'Enter the hypnagogic threshold deliberately. The void you fear is the same void the tradition points to as the source of liberation. Do not flinch.',
      },
      {
        siddhiSlug: 'nadi-shuddhi',
        label: 'Nāḍī Śuddhi',
        duration: '10 min',
        note: 'After the depth of Nidrā, return to the simplest practice. The channels are already open — this is re-equilibration, not effort.',
      },
      {
        siddhiSlug: 'soham-dhyana',
        label: 'So\'haṃ Dhyāna',
        duration: '20 min',
        note: 'Sit in the recognition. The void was always here. The patterns were always passing through it. You are the void — not the patterns.',
      },
    ],
    totalDuration: '70 min',
    targetPatterns: ['the-void', 'the-addict', 'the-witness'],
  },
];

export function getSequenceBySlug(slug: string): PracticeSequence | undefined {
  return allSequences.find((s) => s.slug === slug);
}
