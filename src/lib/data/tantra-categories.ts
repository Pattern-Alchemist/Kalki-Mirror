// =============================================================
// TANTRA — 13 CATEGORIES OF PRACTICE
// The complete taxonomy of tantrik practice as preserved across
// Śaiva Āgama, Śākta Tantra, and Aghori lineages.
//
// Each category maps to a classical Sanskrit term and encompasses
// a family of related practices documented in the tradition.
// =============================================================

export type TantraCategoryId =
  | 'mantra'
  | 'yantra'
  | 'nyasa'
  | 'puja'
  | 'dharna'
  | 'pranayama'
  | 'dhyana'
  | 'dhuni'
  | 'smashana'
  | 'bhasma'
  | 'japa'
  | 'kundalini'
  | 'seva';

export interface TantraCategory {
  id: TantraCategoryId;
  name: string;
  sanskrit: string;
  description: string;
  icon: string;          // SVG path or emoji
  color: string;         // Tailwind-compatible color token or hex
  siddhiAlias: string[]; // Categories used in existing siddhi data that map here
  practiceCount: number; // How many siddhis fall under this (computed)
  minTierDefault: string; // Default tier for new entries in this category
}

export const TANTRA_CATEGORIES: TantraCategory[] = [
  {
    id: 'mantra',
    name: 'Mantra',
    sanskrit: 'Mantra-vidyā',
    description: 'Sacred sound formulas — from single bīja syllables to full stotras. The science of vibration as a vehicle for consciousness transformation, encompassing japa (repetition), puraścaraṇa (completion), and the progressive internalization of sound from vācika (vocal) through mānasika (mental) to parā (transcendent).',
    icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
    color: '#E8C855',
    siddhiAlias: ['Mantra', 'mantra'],
    practiceCount: 0,
    minTierDefault: 'prithvi',
  },
  {
    id: 'yantra',
    name: 'Yantra',
    sanskrit: 'Yantra-vidyā',
    description: 'Sacred geometry as meditation instrument and ritual tool. The Śrī Yantra, chakra yantras, protective yantras, and the practice of Dṛṣṭi — the concentrated gaze that transforms external geometry into internal maps of consciousness.',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    color: '#7ec8e3',
    siddhiAlias: ['Yantra', 'yantra'],
    practiceCount: 0,
    minTierDefault: 'jal',
  },
  {
    id: 'nyasa',
    name: 'Nyāsa',
    sanskrit: 'Nyāsa-vidyā',
    description: 'The ritual installation of divine presence into the body. Ṣaḍaṅga Nyāsa (six-limbed installation), Kara Nyāsa (hand), Aṅga Nyāsa (body), and the Khadgamālā Nyāsa that transforms the practitioner\'s body into a living Śrī Cakra.',
    icon: 'M7 21L3 17l4-4 4 4zm10-14l-4 4 4 4 4-4-4-4zM3 3h4v4H3V3zm10 0h4v4h-4V3zm0 10h4v4h-4v-4zm-4 8a4 4 0 11-8 0 4 4 0 018 0z',
    color: '#a99de0',
    siddhiAlias: ['Nyāsa', 'nyasa', 'Nyasa'],
    practiceCount: 0,
    minTierDefault: 'jal',
  },
  {
    id: 'puja',
    name: 'Pūjā',
    sanskrit: 'Pūjā-vidyā',
    description: 'Ritual worship — the systematic offering of body, speech, and mind to the divine. Encompasses Kapāl Pūjā (skull ritual), daily āratī, the sixteen-fold offering (Ṣoḍaśopacāra), and the devotional framework that grounds all technical practice in bhakti.',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    color: '#e8734f',
    siddhiAlias: ['Ritual', 'Pūjā', 'Puja', 'ritual', 'puja'],
    practiceCount: 0,
    minTierDefault: 'prithvi',
  },
  {
    id: 'dharna',
    name: 'Dhāraṇā',
    sanskrit: 'Dhāraṇā-vidyā',
    description: 'Concentration practices — the sixth limb of yoga applied through the tantrik lens. Trāṭaka (steady gazing), Dṛṣṭi (transforming gaze), bindu fixation, and the progressive narrowing of attention from the manifold to the single point.',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    color: '#4ade80',
    siddhiAlias: ['Dhāraṇā', 'Dharna', 'dharna', 'Meditation', 'meditation', 'Meditation & Dhāraṇā'],
    practiceCount: 0,
    minTierDefault: 'prithvi',
  },
  {
    id: 'pranayama',
    name: 'Prāṇāyāma',
    sanskrit: 'Prāṇāyāma-vidyā',
    description: 'Breath discipline — the bridge between body and mind. The Aghori breath practices, Nāda Yoga (sound-from-breath), kumbhaka (retention), and the vital energy (prāṇa) techniques that prepare the nervous system for deeper practice.',
    icon: 'M4 15s1-1 4-1 5 2 5 2 4-1 4-1V3s-1 1-4 1-5-2-5-2-4 1-4 1z',
    color: '#67e8f9',
    siddhiAlias: ['Prāṇāyāma', 'Pranayama', 'pranayama'],
    practiceCount: 0,
    minTierDefault: 'prithvi',
  },
  {
    id: 'dhyana',
    name: 'Dhyāna',
    sanskrit: 'Dhyāna-vidyā',
    description: 'Meditation proper — the state of unbroken flow where the practitioner and the practice merge. Neti-neti (apophatic contemplation), śmaśāna bhāva (cremation-ground meditation), Sākṣī Bhāva (witness consciousness), and the non-dual practices of the Aghori tradition.',
    icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
    color: '#c4b5fd',
    siddhiAlias: ['Dhyāna', 'Dhyana', 'dhyana'],
    practiceCount: 0,
    minTierDefault: 'jal',
  },
  {
    id: 'dhuni',
    name: 'Dhūni',
    sanskrit: 'Dhūni-vidyā',
    description: 'Sacred fire practice — the Dhūni as altar, mirror, and teacher. Homa (fire offering), the Dhūni as a meditation focus for Nāda Yoga, bhasma (sacred ash) alchemy, and the fire rituals that form the heart of Aghori daily practice.',
    icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
    color: '#f97316',
    siddhiAlias: ['Dhūni', 'Dhuni', 'dhuni', 'Homa', 'homa'],
    practiceCount: 0,
    minTierDefault: 'agni',
  },
  {
    id: 'smashana',
    name: 'Śmaśāna',
    sanskrit: 'Śmaśāna-vidyā',
    description: 'Cremation-ground contemplation — the most direct and psychologically intense practice in the Aghori tradition. Marana-smṛti (death awareness), Kapāl Pūjā (skull worship), first-entry protocols, Bhūta Samvāda (dialogue with the unseen), and the Great Reversal that transforms the place of death into the gateway to liberation.',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    color: '#dc2626',
    siddhiAlias: ['Aghora', 'Smashana', 'Śmaśāna', 'Smashana', 'smashana'],
    practiceCount: 0,
    minTierDefault: 'agni',
  },
  {
    id: 'bhasma',
    name: 'Bhasma',
    sanskrit: 'Bhasma-vidyā',
    description: 'Sacred ash practices — Vibhūti as both substance and symbol. The alchemy of ash, its application to the body, its use in yantra practice, and its significance as the ultimate equalizer that reminds the practitioner that all forms return to the same substance.',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z',
    color: '#a8a29e',
    siddhiAlias: ['Bhasma', 'bhasma'],
    practiceCount: 0,
    minTierDefault: 'agni',
  },
  {
    id: 'japa',
    name: 'Japa',
    sanskrit: 'Japa-vidyā',
    description: 'Mantra repetition as disciplined practice — the method that transforms sound from an event into a state. Vācika (vocal), Upāṃśu (whispered), Mānasika (mental) japa, Puraścaraṇa (the completion discipline), and the progressive journey from 108 repetitions to lakṣa (100,000).',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    color: '#fbbf24',
    siddhiAlias: ['Japa', 'japa'],
    practiceCount: 0,
    minTierDefault: 'prithvi',
  },
  {
    id: 'kundalini',
    name: 'Kuṇḍalinī',
    sanskrit: 'Kuṇḍalinī-vidyā',
    description: 'The serpent power — the dormant energy at the base of the spine and its awakening through the seven chakras. Chakra Dhyāna, nāḍī śodhana (channel purification), and the advanced practices documented in the Śaiva Āgama and Nāth Sampradāya traditions.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: '#a855f7',
    siddhiAlias: ['Kuṇḍalinī', 'Kundalini', 'kundalini', 'Chakra', 'chakra', 'Esoteric'],
    practiceCount: 0,
    minTierDefault: 'agni',
  },
  {
    id: 'seva',
    name: 'Sevā',
    sanskrit: 'Sevā-vidyā',
    description: 'Selfless service as sādhanā — the practice that grounds all other practices in reality. Anuṣṭhāna (daily discipline), Viveka (discernment), the Guru-Paramparā in the modern world, and the integration of awakened awareness into ordinary life.',
    icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    color: '#34d399',
    siddhiAlias: ['Sevā', 'Seva', 'seva', 'Initiation'],
    practiceCount: 0,
    minTierDefault: 'prithvi',
  },
];

/** Map any legacy category string to a TantraCategoryId */
export function resolveCategory(legacy: string): TantraCategoryId | null {
  const lower = legacy.toLowerCase();
  for (const cat of TANTRA_CATEGORIES) {
    if (cat.siddhiAlias.some(a => a.toLowerCase() === lower)) return cat.id;
  }
  return null;
}

/** Get a category by ID */
export function getCategoryById(id: TantraCategoryId): TantraCategory | undefined {
  return TANTRA_CATEGORIES.find(c => c.id === id);
}

/** Get display-friendly categories for the archive filter (subset) */
export const ARCHIVE_FILTER_CATEGORIES = [
  'All',
  'Mantra', 'Yantra', 'Prāṇāyāma', 'Pūjā', 'Tantra', 'Dhyāna', 'Dhāraṇā',
  'Dhūni', 'Śmaśāna', 'Aghora',
] as const;
