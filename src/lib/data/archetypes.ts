// =============================================================
// KALKI — THE TEN MAHĀVIDYĀ ARCHETYPES
// Each Mahāvidyā as a karmic-loop archetype.
// YANTRA classifies detected patterns under these archetypes.
// =============================================================

export type CautionLevel = 'OPEN' | 'MODERATE' | 'HIGH' | 'SEALED';

export interface Archetype {
  id: string;
  name: string;
  sanskrit: string;
  number: number;           // 1-10 ordering
  pattern: string;          // the karmic loop it governs
  description: string;
  element: string;          // tantric element association
  bija: string;             // seed syllable (public)
  cautionLevel: CautionLevel;
  accessTier: 'prithvi' | 'jal' | 'agni' | 'akash';
  image: string;
  relatedSiddhiSlugs: string[];
  relatedPatternSlugs: string[];
  color: string;            // thematic color for the archetype wheel
}

export const TEN_MAHAVIDYAS: Archetype[] = [
  {
    id: 'kali',
    name: 'Kālī',
    sanskrit: 'काली',
    number: 1,
    pattern: 'The loop of ego-attachment that must be severed',
    description: 'Kālī is the first Mahāvidyā — time itself, the force that devours all form. Her archetype governs the karmic loop where identity clings to what is dissolving. The practitioner caught in Kālī\'s loop confuses attachment with love, possession with devotion. The severance Kālī demands is not destruction but the recognition that what you grip is already gone. Her darkness is not evil — it is the field from which all forms arise and to which they return.',
    element: 'Akasha (Ether)',
    bija: 'krīṁ',
    cautionLevel: 'HIGH',
    accessTier: 'agni',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/mahavidyas/kali',
    relatedSiddhiSlugs: ['dakshina-kali-sadhana'],
    relatedPatternSlugs: ['the-saboteur', 'the-controller'],
    color: '#8A252C',
  },
  {
    id: 'tara',
    name: 'Tārā',
    sanskrit: 'तारा',
    number: 2,
    pattern: 'The loop of drowning / needing to be ferried across',
    description: 'Tārā is the second Mahāvidyā — she who ferries across the ocean of existence. Her archetype governs the loop of perpetual rescue: the practitioner who always needs saving, who seeks gurus, therapists, and saviors because the inner ferryman has been forgotten. Tārā\'s loop manifests as learned helplessness dressed as surrender, as the refusal to recognize that the capacity to cross over already exists within. Her ugra (fierce) form in Buddhist tantra — where she holds the knife of discriminating wisdom — reveals that compassion without discernment is another form of drowning.',
    element: 'Jal (Water)',
    bija: 'oṃ tāre tuttāre ture svāhā',
    cautionLevel: 'HIGH',
    accessTier: 'agni',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/mahavidyas/tara',
    relatedSiddhiSlugs: ['tara-ugra-sadhana'],
    relatedPatternSlugs: ['the-rescuer', 'the-pleaser'],
    color: '#2A6B7C',
  },
  {
    id: 'chinnamasta',
    name: 'Chinnamastā',
    sanskrit: 'चिन्नमस्ता',
    number: 3,
    pattern: 'The loop of self-sacrifice / feeding others from your own life-force',
    description: 'Chinnamastā is the third Mahāvidyā — the self-decapitated goddess who feeds her own severed head. Her archetype governs the loop where the practitioner gives until there is nothing left, where self-sacrifice becomes identity and martyrdom becomes currency. The Chinnamastā loop is not simple generosity — it is the structural confusion between nourishing and being consumed. The practitioner caught here believes that depletion is devotion, that the only way to be worthy is to be emptied. Her iconography — standing on Kāma and Rati, feeding two attendants from her own arterial spray — is the most direct visual statement in all of tantra: the energy you give away must be regenerated, or the source dies.',
    element: 'Agni (Fire)',
    bija: 'hrīṁ',
    cautionLevel: 'HIGH',
    accessTier: 'agni',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/mahavidyas/chinnamasta',
    relatedSiddhiSlugs: ['chinnamasta-sadhana'],
    relatedPatternSlugs: ['the-martyr', 'the-ghost'],
    color: '#A63D40',
  },
  {
    id: 'bhuvaneshvari',
    name: 'Bhuvaneśvarī',
    sanskrit: 'भुवनेश्वरी',
    number: 4,
    pattern: 'The loop of control / cosmic-sovereignty wound',
    description: 'Bhuvaneśvarī is the fourth Mahāvidyā — the sovereign of the cosmos, she who contains all worlds within her body. Her archetype governs the loop where the practitioner seeks to control reality through mental architecture, overthinking, over-planning, and over-structuring as a defense against the terror of not knowing. The Bhuvaneśvarī loop is the architect\'s trap: beautiful maps of territories never walked, elaborate systems that substitute for direct experience. Her worship reveals the paradox at the heart of sovereignty — true containment is not control but the capacity to hold all possibilities without grasping any single one.',
    element: 'Prithvi (Earth)',
    bija: 'hrīṁ śrīṁ',
    cautionLevel: 'MODERATE',
    accessTier: 'jal',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/mahavidyas/bhuvaneshvari',
    relatedSiddhiSlugs: ['bhuvaneshvari-sadhana'],
    relatedPatternSlugs: ['the-controller', 'the-architect'],
    color: '#5B8C5A',
  },
  {
    id: 'shodashi',
    name: 'Ṣoḍaśī / Tripurasundarī',
    sanskrit: 'षोडशी / त्रिपुरसुन्दरी',
    number: 5,
    pattern: 'The loop of beauty-as-avoidance',
    description: 'Ṣoḍaśī is the fifth Mahāvidyā — the sixteen-year-old goddess of supreme beauty, also known as Tripurasundarī, Lalitā, and Śrī. Her archetype governs the loop where beauty, harmony, and aesthetic perfection become defensive structures against the messiness of real feeling. The practitioner caught in Ṣoḍaśī\'s loop curates a life of surfaces — beautiful environments, beautiful relationships, beautiful spiritual experiences — while the raw, unpolished truth of suffering remains unexamined. The Śrī Yantra, her geometric form, encodes the entire cosmos in nine interlocking triangles: the teaching is that beauty is not the opposite of depth but its most refined expression — when it arises from wholeness rather than avoidance.',
    element: 'Agni (Fire)',
    bija: 'śrīṁ hrīṁ',
    cautionLevel: 'MODERATE',
    accessTier: 'jal',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/mahavidyas/shodashi',
    relatedSiddhiSlugs: ['shodashi-tripurasundari-sadhana', 'sri-yantra-dhyana', 'bala-tripurasundari-sadhana'],
    relatedPatternSlugs: ['the-perfectionist', 'the-positivist', 'the-chameleon'],
    color: '#C5A059',
  },
  {
    id: 'bhairavi',
    name: 'Bhairavī',
    sanskrit: 'भैरवी',
    number: 6,
    pattern: 'The loop of refusing the teacher',
    description: 'Bhairavī is the sixth Mahāvidyā — the fierce consort of Bhairava, the goddess of transformative rage. Her archetype governs the loop where the practitioner refuses guidance, authority, and transmission, operating from a wound of betrayal or a belief that no teacher is worthy. The Bhairavī loop is not healthy skepticism — it is the structural rejection of lineage, community, and the humility that authentic learning requires. The practitioner caught here collects knowledge but never submits to the transformation that knowledge demands. Bhairavī\'s fury is not directed at the student — it is the intensity of the teaching itself, the fire that burns away the illusion of self-sufficiency.',
    element: 'Agni (Fire)',
    bija: 'hsauḥ',
    cautionLevel: 'HIGH',
    accessTier: 'agni',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/mahavidyas/bhairavi',
    relatedSiddhiSlugs: ['bhairavi-proper-sadhana', 'tripura-bhairavi-sadhana'],
    relatedPatternSlugs: ['the-saboteur', 'the-architect'],
    color: '#D4522A',
  },
  {
    id: 'dhumavati',
    name: 'Dhūmāvatī',
    sanskrit: 'धूमावती',
    number: 7,
    pattern: 'The loop of inauspiciousness / widowhood-of-the-soul',
    description: 'Dhūmāvatī is the seventh Mahāvidyā — the widow-goddess, she who dwells in what has been abandoned, inauspicious, and void. Her archetype governs the loop of existential despair: the practitioner who identifies with loss, who has made a home in the ashes of what was, who cannot see that the void they inhabit is not emptiness but the space before new creation. The Dhūmāvatī loop is the identification with barrenness — spiritual dryness, creative block, the sense that the inner life has died. Her teaching is the most counter-intuitive in the Mahāvidyā system: the widowhood of the soul is not a defect but a stage. The practitioner must learn to dwell in the smoke without being consumed by it.',
    element: 'Vayu (Air)',
    bija: 'dhūṁ dhūṁ dhūmāvatyai svāhā',
    cautionLevel: 'MODERATE',
    accessTier: 'jal',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/mahavidyas/dhumavati',
    relatedSiddhiSlugs: ['dhumavati-sadhana'],
    relatedPatternSlugs: ['the-avoidant', 'the-hermit', 'the-ghost'],
    color: '#6B5B4E',
  },
  {
    id: 'bagalamukhi',
    name: 'Bagalāmukhī',
    sanskrit: 'बगलामुखी',
    number: 8,
    pattern: 'The loop of being silenced / needing to freeze a hostile force',
    description: 'Bagalāmukhī is the eighth Mahāvidyā — the goddess who paralyses, who silences the hostile tongue. Her archetype governs the loop where the practitioner has been silenced — by family, culture, trauma — and now carries a frozen rage that manifests as either compulsive silence or the desire to silence others. The Bagalāmukhī loop is not passivity; it is the tension between a voice that has been suppressed and the force required to release it. Her power is stambhana — the ability to arrest motion, speech, and intent. In the inner world, this is the capacity to still the hostile inner critic, to freeze the narrative of unworthiness before it can take form. The practitioner must learn the difference between silencing the enemy and finding their own voice.',
    element: 'Prithvi (Earth)',
    bija: 'hlīṁ',
    cautionLevel: 'HIGH',
    accessTier: 'agni',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/mahavidyas/bagalamukhi',
    relatedSiddhiSlugs: ['bagalamukhi-sadhana', 'stambhana-karma'],
    relatedPatternSlugs: ['the-ghost', 'the-pleaser', 'the-chameleon'],
    color: '#8B7355',
  },
  {
    id: 'matangi',
    name: 'Mātaṅgī',
    sanskrit: 'मातङ्गी',
    number: 9,
    pattern: 'The loop of transgressive voice / the outcaste within',
    description: 'Mātaṅgī is the ninth Mahāvidyā — the outcaste goddess, she who dwells at the margins, in the speech of the forbidden and the polluted. Her archetype governs the loop where the practitioner\'s authentic voice has been exiled — deemed too strange, too raw, too dangerous for polite society — and has gone underground, emerging only in shadow form as addiction, compulsion, or explosive outburst. The Mātaṅgī loop is the split between the acceptable self and the transgressive self, between what is spoken and what is suppressed. Her association with polluted speech and leftover food is not degradation but the declaration that the sacred is found at the margins, that the voice you have been told to silence may be the one that carries the most truth.',
    element: 'Vayu (Air)',
    bija: 'aiṁ hrīṁ śrīṁ aiṁ',
    cautionLevel: 'MODERATE',
    accessTier: 'jal',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/mahavidyas/matangi',
    relatedSiddhiSlugs: ['matangi-sadhana'],
    relatedPatternSlugs: ['the-hermit', 'the-saboteur', 'the-avoidant'],
    color: '#4A7C59',
  },
  {
    id: 'kamala',
    name: 'Kamalā',
    sanskrit: 'कमला',
    number: 10,
    pattern: 'The loop of prosperity-without-integration',
    description: 'Kamalā is the tenth Mahāvidyā — the lotus goddess, iconographically akin to Lakṣmī, seated on a lotus, bathed by elephants. Her archetype governs the loop where material prosperity, spiritual attainment, or both are accumulated without integration — where the practitioner collects practices, certifications, wealth, or experiences without allowing any of them to transform the underlying structure. The Kamalā loop is the spiritual materialist\'s trap: more retreats, more initiations, more techniques, more purity — yet the same patterns repeat beneath the accumulating surface. Her teaching is that the lotus grows from mud: true prosperity is not the absence of the base but its transmutation. The practitioner must learn to digest what they have consumed rather than merely collecting it.',
    element: 'Jal (Water)',
    bija: 'śrīṁ hrīṁ klīṁ aiṁ sauḥ',
    cautionLevel: 'MODERATE',
    accessTier: 'jal',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/mahavidyas/kamala',
    relatedSiddhiSlugs: ['kamala-sadhana'],
    relatedPatternSlugs: ['the-architect', 'the-positivist', 'the-perfectionist'],
    color: '#C5A059',
  },
];

// Additional archetypes for non-Mahāvidyā categories
export const SUPPLEMENTARY_ARCHETYPES: Archetype[] = [
  {
    id: 'shaiva-ascetic',
    name: 'Pāśupata Ascetic',
    sanskrit: 'पाशुपत',
    number: 11,
    pattern: 'The loop of extreme asceticism as identity',
    description: 'The Pāśupata archetype governs the loop where self-denial becomes the self. The practitioner identifies so completely with discipline, renunciation, or rigor that the discipline itself becomes the ego-structure it was meant to dissolve. Originating in the Pāśupata Sūtras of Lakulīśa (c. 2nd c. CE), this is the oldest surviving Śaiva ascetic path — and its paradox is built into the methodology: the practitioner must act as if mad, as if possessed, deliberately attracting contempt to dissolve the social self. When this becomes performance rather than transformation, the loop is complete.',
    element: 'Agni (Fire)',
    bija: 'oṃ namaḥ śivāya',
    cautionLevel: 'HIGH',
    accessTier: 'akash',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/archetypes/shaiva-mountain-pass',
    relatedSiddhiSlugs: ['lakulisha-pashupata-sadhana'],
    relatedPatternSlugs: ['the-martyr', 'the-perfectionist'],
    color: '#594A42',
  },
  {
    id: 'nath-alchemical',
    name: 'Nāth Alchemist',
    sanskrit: 'नाथ',
    number: 12,
    pattern: 'The loop of collecting techniques without embodiment',
    description: 'The Nāth archetype governs the loop of tantric consumerism — the practitioner who collects kuṇḍalinī techniques, cakra visualizations, and nāḍī mappings without ever sitting still long enough for the body to integrate any of it. Originating with Matsyendranāth (c. 9th-10th c. CE) and the Kaulajñānanirṇaya, the Nāth tradition is the foundation of Haṭha Yoga. But its core teaching is direct embodiment, not textual accumulation. The practitioner caught in the Nāth loop knows more about the cakras than they have ever directly experienced.',
    element: 'Vayu (Air)',
    bija: 'so\'haṃ',
    cautionLevel: 'HIGH',
    accessTier: 'akash',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/archetypes/natha-forest-shrine',
    relatedSiddhiSlugs: ['matsyendranath-nath-sadhana'],
    relatedPatternSlugs: ['the-architect', 'the-avoidant'],
    color: '#5C5850',
  },
  {
    id: 'buddhist-vajra',
    name: 'Vajrayoginī / Vajravārāhī',
    sanskrit: 'वज्रयोगिनी',
    number: 13,
    pattern: 'The loop of sacred madness / bypass through bliss',
    description: 'The Vajrayoginī archetype governs the loop where the practitioner uses the intensity of tantric experience — bliss, vision, energetic phenomenon — as a bypass for the slower, less glamorous work of psychological integration. Originating in the Cakrasaṃvara cycle of Buddhist mother-tantras, Vajrayoginī is the adamantine ḍākinī who dances in the charnel ground of the mind. The practitioner caught in her loop chases peak experiences while avoiding the valleys. The teaching is that the charnel ground is not a destination but the ground on which all experience stands.',
    element: 'Akasha (Ether)',
    bija: 'hrīṁ (public seed; operational mantra dīkṣā-restricted)',
    cautionLevel: 'HIGH',
    accessTier: 'akash',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/archetypes/buddhist-meditation-platform',
    relatedSiddhiSlugs: ['vajrayogini-sadhana'],
    relatedPatternSlugs: ['the-positivist', 'the-saboteur'],
    color: '#1A2436',
  },
  {
    id: 'atharvana-protective',
    name: 'Pratyaṅgirā',
    sanskrit: 'प्रत्यङ्गिरा',
    number: 14,
    pattern: 'The loop of hypervigilance / armor as identity',
    description: 'The Pratyaṅgirā archetype governs the loop where protective awareness calcifies into permanent hypervigilance — the practitioner who cannot stop scanning for threat, who has made defense into identity. Pratyaṅgirā is the Atharvaṇa protective goddess invoked to neutralise hostile force. But her loop is the confusion between protection and imprisonment: the armor that once saved you now prevents you from feeling anything at all. The teaching is that true protection is not the absence of vulnerability but the capacity to remain open within it.',
    element: 'Agni (Fire)',
    bija: 'oṃ hrīṁ pratyaṅgirāyai namaḥ (public form)',
    cautionLevel: 'HIGH',
    accessTier: 'akash',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/archetypes/temple-silhouette',
    relatedSiddhiSlugs: ['pratyangira-devi-sadhana'],
    relatedPatternSlugs: ['the-ghost', 'the-controller', 'the-avoidant'],
    color: '#8A252C',
  },
  {
    id: 'shatkarma-destruction',
    name: 'Ṣaṭ-karma (Destructive)',
    sanskrit: 'षट्कर्म',
    number: 15,
    pattern: 'The loop of adversarial thinking / the enemy-making mind',
    description: 'The Ṣaṭ-karma archetype governs the loop of adversarial cognition — the practitioner who sees the world through the lens of enemy and ally, who needs opposition to define themselves, who has made conflict into a spiritual technology. The six ṣaṭ-karmas (śānti, vaśīkaraṇa, stambhana, vidveṣaṇa, uccāṭana, māraṇa) form a complete taxonomy of force applied to the external world. When internalized, they become the six ways the mind wages war on its own experience. This archetype is SEALED — documented as heritage, never operationalized.',
    element: 'Prithvi (Earth)',
    bija: '(multiple; all dīkṣā-restricted)',
    cautionLevel: 'SEALED',
    accessTier: 'akash',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/archetypes/shatkarma-labyrinth',
    relatedSiddhiSlugs: ['shanti-karma', 'vashikarana-karma', 'stambhana-karma', 'vidveshana-karma', 'uccatana-karma', 'marana-karma'],
    relatedPatternSlugs: ['the-saboteur', 'the-controller'],
    color: '#3D3D3D',
  },
  {
    id: 'preta-field',
    name: 'Preta-Siddhi Field',
    sanskrit: 'प्रेतसिद्धि',
    number: 16,
    pattern: 'The loop of unfinished grief / the unburied dead within',
    description: 'The Preta archetype governs the loop of unresolved relationship with the dead — literal or symbolic. The practitioner who cannot release the past, who carries the unburied grief of ancestors, broken lineages, or unspoken family secrets. The preta-saṁvāda rite (spirit dialogue) is documented in Aghora/Kaula field manuals as a complete operational protocol for invoking, questioning, and releasing a preta. This archetype is SEALED — documented as heritage scholarship, never operationalized. The teaching is that what remains unacknowledged does not disappear; it becomes a hidden driver of behavior.',
    element: 'Vayu (Air)',
    bija: '(dīkṣā-restricted; field rite only)',
    cautionLevel: 'SEALED',
    accessTier: 'akash',
    image: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/archetypes/vault-ritual-chamber',
    relatedSiddhiSlugs: ['preta-siddhi'],
    relatedPatternSlugs: ['the-ghost', 'the-martyr', 'the-hermit'],
    color: '#2A2A2A',
  },
];

export const ALL_ARCHETYPES: Archetype[] = [
  ...TEN_MAHAVIDYAS,
  ...SUPPLEMENTARY_ARCHETYPES,
];

export function getArchetypeById(id: string): Archetype | undefined {
  return ALL_ARCHETYPES.find(a => a.id === id);
}

// Pattern → Archetype mapping for YANTRA
export const PATTERN_ARCHETYPE_MAP: Record<string, string> = {
  'the-rescuer': 'tara',
  'the-perfectionist': 'shodashi',
  'the-ghost': 'bagalamukhi',
  'the-controller': 'bhuvaneshvari',
  'the-hermit': 'dhumavati',
  'the-chameleon': 'matangi',
  'the-saboteur': 'kali',
  'the-avoidant': 'dhumavati',
  'the-martyr': 'chinnamasta',
  'the-pleaser': 'tara',
  'the-positivist': 'kamala',
  'the-architect': 'bhuvaneshvari',
};

// Access tier labels for the archive
export const ACCESS_LABELS: Record<string, string> = {
  prithvi: 'The Antechamber',
  jal: 'The Initiate',
  agni: 'The Practitioner',
  akash: 'The Vault',
};

export const CAUTION_LABELS: Record<CautionLevel, string> = {
  OPEN: 'Open',
  MODERATE: 'Moderate',
  HIGH: 'High',
  SEALED: 'Sealed',
};
