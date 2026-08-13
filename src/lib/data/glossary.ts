// =============================================================
// KALKI — THE LEXICON
// 50+ Sanskrit / Tantric terms used across the KALKI system.
// Sorted by category, then alphabetically within each category.
// =============================================================

export interface GlossaryEntry {
  term: string;
  sanskrit?: string;
  pronunciation?: string;
  definition: string;
  category: 'foundational' | 'pranayama' | 'tantra' | 'ritual' | 'philosophical' | 'archetype';
  relatedTerms?: string[];
  relatedSiddhiSlugs?: string[];
  minTier?: 'jal' | 'agni' | 'akash';
}

export const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'foundational', label: 'Foundational' },
  { value: 'pranayama', label: 'Prāṇāyāma' },
  { value: 'tantra', label: 'Tantra' },
  { value: 'ritual', label: 'Ritual' },
  { value: 'philosophical', label: 'Philosophical' },
  { value: 'archetype', label: 'Archetype' },
] as const;

export const glossaryEntries: GlossaryEntry[] = [
  // ─── FOUNDATIONAL ────────────────────────────────────────────────
  {
    term: 'Oṃ',
    sanskrit: 'ॐ',
    pronunciation: 'AUM',
    definition:
      'The primordial sound — the acoustic signature of the cosmos. Composed of three phonemes (a-u-ṃ) representing the waking, dreaming, and deep-sleep states, with the fourth (turiya) as the silence beyond. In the KALKI system, Oṃ is not a religious symbol but a frequency calibration tool that tunes the nervous system to the fundamental vibration of consciousness.',
    category: 'foundational',
    relatedTerms: ['Mantra', 'Bīja'],
  },
  {
    term: 'Prāṇa',
    sanskrit: 'प्राण',
    pronunciation: 'PRAH-nah',
    definition:
      'The vital life-force that animates all biological systems. Not breath itself, but the intelligent energy that rides upon breath. The KALKI system treats prāṇa as the primary currency of consciousness — the medium through which intention is translated into physiological change and, ultimately, into pattern transformation.',
    category: 'foundational',
    relatedTerms: ['Prāṇāyāma', 'Nāḍī', 'Ojas'],
  },
  {
    term: 'Nāḍī',
    sanskrit: 'नाड़ी',
    pronunciation: 'NAH-dee',
    definition:
      'The energetic channels through which prāṇa circulates in the subtle body. The Tantric model describes 72,000 nāḍīs, of which three are primary: Iḍā (lunar, cooling), Piṅgalā (solar, heating), and Suṣumṇā (central, transcendent). The health of the nāḍī system determines the clarity and bandwidth of consciousness.',
    category: 'foundational',
    relatedTerms: ['Iḍā', 'Piṅgalā', 'Suṣumṇā', 'Prāṇa', 'Kuṇḍalinī'],
  },
  {
    term: 'Iḍā',
    sanskrit: 'इड़ा',
    pronunciation: 'EE-dah',
    definition:
      'The lunar nāḍī, flowing from the left nostril down to the base of the spine. Governs the parasympathetic nervous system, intuitive receptivity, cooling, and the feminine principle. When Iḍā dominates, the mental state is receptive, inward-turning, and contemplative.',
    category: 'foundational',
    relatedTerms: ['Nāḍī', 'Piṅgalā', 'Suṣumṇā'],
  },
  {
    term: 'Piṅgalā',
    sanskrit: 'पिङ्गला',
    pronunciation: 'ping-GAHL-ah',
    definition:
      'The solar nāḍī, flowing from the right nostril to the base of the spine. Governs the sympathetic nervous system, logical analysis, heating, and the masculine principle. When Piṅgalā dominates, the mental state is active, outward-turning, and analytical.',
    category: 'foundational',
    relatedTerms: ['Nāḍī', 'Iḍā', 'Suṣumṇā'],
  },
  {
    term: 'Suṣumṇā',
    sanskrit: 'सुषुम्ना',
    pronunciation: 'soo-SHOOM-nah',
    definition:
      'The central nāḍī, running from the base of the spine (mūlādhāra) to the crown (sahasrāra). Dormant in the ordinary state, it activates when Iḍā and Piṅgalā are brought into equilibrium. The KALKI system treats suṣumṇā activation as the physiological correlate of viveka — the bandwidth expansion that makes pattern recognition possible.',
    category: 'foundational',
    relatedTerms: ['Nāḍī', 'Iḍā', 'Piṅgalā', 'Kuṇḍalinī', 'Cakra'],
  },
  {
    term: 'Cakra',
    sanskrit: 'चक्र',
    pronunciation: 'CHAH-krah',
    definition:
      'Energetic nodes along the suṣumṇā nāḍī where psychological and physiological functions converge. The classical model identifies seven primary cakras, each governing a specific band of experience — from survival (mūlādhāra) to transcendent awareness (sahasrāra). In the KALKI framework, cakras are not mystical objects but information-processing hubs in the subtle-body operating system.',
    category: 'foundational',
    relatedTerms: ['Suṣumṇā', 'Kuṇḍalinī', 'Nāḍī'],
  },
  {
    term: 'Kuṇḍalinī',
    sanskrit: 'कुण्डलिनी',
    pronunciation: 'koon-dah-LEE-nee',
    definition:
      'The dormant bio-energy coiled at the base of the spine, conceptualized as a serpent. When awakened through sustained practice, it ascends through the suṣumṇā, activating each cakra and ultimately merging with consciousness at the crown. The KALKI system does not treat kuṇḍalinī as a supernatural phenomenon but as the activation of latent neuro-physiological bandwidth.',
    category: 'foundational',
    relatedTerms: ['Suṣumṇā', 'Cakra', 'Prāṇa'],
    minTier: 'jal',
  },
  {
    term: 'Mantra',
    sanskrit: 'मन्त्र',
    pronunciation: 'MAN-trah',
    definition:
      'A structured vibrational pattern used to focus, direct, and transform consciousness. The word derives from man (mind) + trana (protection/liberation). Mantras are not prayers in the Western sense — they are acoustic technologies that reorganize the pattern architecture of the mind by exposing it to specific frequencies of sound and intention.',
    category: 'foundational',
    relatedTerms: ['Bīja', 'Oṃ', 'Japa'],
  },
  {
    term: 'Bīja',
    sanskrit: 'बीज',
    pronunciation: 'BEE-jah',
    definition:
      'Seed syllable — the most compressed form of a mantra, containing the vibrational essence of an entire deity or principle. Examples: oṃ, hrīṁ, śrīṁ, krīṁ. Bīja mantras are the source code of the sonic universe — single phonemes that encode complex energetic architectures. In the KALKI system, bījas are treated as frequency-based pattern interrupters.',
    category: 'foundational',
    relatedTerms: ['Mantra', 'Oṃ', 'Bīja Mantra'],
  },
  {
    term: 'Mudrā',
    sanskrit: 'मुद्रा',
    pronunciation: 'MOO-drah',
    definition:
      'Seal or gesture — a physical or energetic configuration that redirects prāṇa and locks specific states of consciousness. Hand mudrās channel energy through the fingertips; body mudrās (such as mahāmudrā or khecarī mudrā) seal prāṇa within specific circuits. In the KALKI system, mudrās are treated as hardware-level controls for the subtle-body operating system.',
    category: 'foundational',
    relatedTerms: ['Bandha', 'Prāṇa', 'Nyāsa'],
  },
  {
    term: 'Bandha',
    sanskrit: 'बन्ध',
    pronunciation: 'BAHN-dah',
    definition:
      'Lock or binding — the deliberate muscular contraction that redirects prāṇa within the body. The three primary bandhas are jālandhara (throat lock), uḍḍīyāna (abdominal lock), and mūla (perineal lock). When applied together as mahābandha, they create a sealed pressure system that forces prāṇa into the suṣumṇā.',
    category: 'foundational',
    relatedTerms: ['Mudrā', 'Prāṇāyāma', 'Kumbhaka'],
  },
  {
    term: 'Drisṭi',
    sanskrit: 'दृष्टि',
    pronunciation: 'DRISH-tee',
    definition:
      'Gaze or focused seeing — the direction and quality of visual attention during practice. Each āsana, mudrā, and prāṇāyāma technique has a prescribed drisṭi that channels the nervous system into specific states. In the KALKI framework, drisṭi is the visual dimension of pattern recognition — where you look determines what you see.',
    category: 'foundational',
    relatedTerms: ['Trāṭaka', 'Dhyāna'],
  },
  {
    term: 'Bindu',
    sanskrit: 'बिन्दु',
    pronunciation: 'BEEN-doo',
    definition:
      'Point or dot — the metaphysical point of origin from which all manifestation expands. In the subtle body, bindu refers to the nectar of immortality at the crown of the head, and to the point of consciousness from which all thought arises. The bindu is the geometric and philosophical zero-point of the KALKI system.',
    category: 'foundational',
    relatedTerms: ['Oṃ', 'Cakra', 'Kāmakalā'],
  },
  {
    term: 'Ojas',
    sanskrit: 'ओजस्',
    pronunciation: 'OH-jahs',
    definition:
      'The subtle essence of vitality — the refined product of properly digested prāṇa, tejas, and nutrition. Ojas is the immune system of consciousness: it confers resilience, radiance, and the capacity to sustain intense practice without depletion. The KALKI system treats ojas as the measure of a practitioner\'s energetic bank account.',
    category: 'foundational',
    relatedTerms: ['Tejas', 'Prāṇa', 'Kuṇḍalinī'],
  },
  {
    term: 'Tejas',
    sanskrit: 'तेजस्',
    pronunciation: 'TEH-jahs',
    definition:
      'The fire of intelligence and radiance — the subtle energy of discernment and transformation. Tejas is the refined product of properly directed prāṇa, and it fuels the faculty of viveka. When tejas is depleted, clarity collapses into confusion. When it is abundant, the practitioner sees through patterns with surgical precision.',
    category: 'foundational',
    relatedTerms: ['Ojas', 'Prāṇa', 'Sattva'],
  },
  {
    term: 'Sattva',
    sanskrit: 'सत्त्व',
    pronunciation: 'SAHT-vah',
    definition:
      'The quality of balance, clarity, and illumination — one of the three guṇas (fundamental constituents of nature). Sattva is the principle of harmonic coherence: when dominant, the mind is clear, the body is healthy, and perception is undistorted. The KALKI system aims to cultivate sattva as the baseline operating frequency of consciousness.',
    category: 'foundational',
    relatedTerms: ['Rajas', 'Tamas', 'Tejas'],
  },
  {
    term: 'Rajas',
    sanskrit: 'रजस्',
    pronunciation: 'RAH-jahs',
    definition:
      'The quality of activity, restlessness, and desire — the guṇa that drives motion and ambition. Rajas is not negative; it is the engine of action. But when unchecked, it produces the compulsive doing that the KALKI system identifies as a primary pattern architecture — the inability to stop, to be still, to allow transformation through non-action.',
    category: 'foundational',
    relatedTerms: ['Sattva', 'Tamas', 'Karma'],
  },
  {
    term: 'Tamas',
    sanskrit: 'तमस्',
    pronunciation: 'TAH-mahs',
    definition:
      'The quality of inertia, darkness, and ignorance — the guṇa that resists change and perpetuates the status quo. Tamas is the gravitational pull of the known, the comfort of the familiar pattern. In the KALKI system, tamas is the primary obstacle to pattern recognition: it is the force that keeps the practitioner asleep within their own loops.',
    category: 'foundational',
    relatedTerms: ['Sattva', 'Rajas', 'Saṃskāra'],
  },

  // ─── PRĀṆĀYĀMA ──────────────────────────────────────────────────
  {
    term: 'Prāṇāyāma',
    sanskrit: 'प्राणायाम',
    pronunciation: 'PRAH-nah-YAH-mah',
    definition:
      'The science of prāṇa extension — the systematic expansion, direction, and refinement of vital energy through breath manipulation. Prāṇāyāma is not breathing exercise; it is a precision technology for altering the operating frequency of the nervous system. The four stages are pūraka (inhalation), kumbhaka (retention), recaka (exhalation), and śūnya (suspension).',
    category: 'pranayama',
    relatedTerms: ['Prāṇa', 'Kumbhaka', 'Nāḍī Śuddhi'],
  },
  {
    term: 'Kumbhaka',
    sanskrit: 'कुम्भक',
    pronunciation: 'koom-BHAH-kah',
    definition:
      'Breath retention — the central technique of prāṇāyāma and the most powerful tool for redirecting prāṇa. Kumbhaka is the still point between inhalation and exhalation where the nervous system is most receptive to reprogramming. The KALKI system treats kumbhaka as the primary technology for pattern interruption at the physiological level.',
    category: 'pranayama',
    relatedTerms: ['Prāṇāyāma', 'Bandha', 'Antara Kumbhaka', 'Bahya Kumbhaka'],
  },
  {
    term: 'Antara Kumbhaka',
    sanskrit: 'अन्तर कुम्भक',
    pronunciation: 'ahn-TAH-rah koom-BHAH-kah',
    definition:
      'Internal breath retention — holding the breath after inhalation, with the lungs full. This is the primary kumbhaka for building prāṇic pressure and activating the suṣumṇā. Antara kumbhaka increases tejas and charges the system with the energy needed for intensive pattern confrontation.',
    category: 'pranayama',
    relatedTerms: ['Kumbhaka', 'Bahya Kumbhaka', 'Prāṇāyāma'],
  },
  {
    term: 'Bahya Kumbhaka',
    sanskrit: 'बाह्य कुम्भक',
    pronunciation: 'BAH-hyah koom-BHAH-kah',
    definition:
      'External breath retention — holding the breath after exhalation, with the lungs empty. This is the most advanced form of kumbhaka, requiring significant prāṇic capacity. Bahya kumbhaka produces a deep parasympathetic state that allows access to unconscious pattern material.',
    category: 'pranayama',
    relatedTerms: ['Kumbhaka', 'Antara Kumbhaka', 'Prāṇāyāma'],
    minTier: 'jal',
  },
  {
    term: 'Sahita Kumbhaka',
    sanskrit: 'सहित कुम्भक',
    pronunciation: 'sah-HEE-tah koom-BHAH-kah',
    definition:
      'Connected breath retention — kumbhaka that is deliberately held and released through conscious effort. This is the preparatory stage before kevala kumbhaka. The practitioner uses will to extend the pause, gradually building the capacity for spontaneous retention.',
    category: 'pranayama',
    relatedTerms: ['Kumbhaka', 'Kevala Kumbhaka'],
  },
  {
    term: 'Kevala Kumbhaka',
    sanskrit: 'केवल कुम्भक',
    pronunciation: 'keh-VAH-lah koom-BHAH-kah',
    definition:
      'Spontaneous breath retention — the state where the breath suspends naturally without conscious effort. This is the advanced sign that the prāṇic system has been recalibrated and the nervous system has entered a new operating mode. Kevala kumbhaka is not achieved through forcing; it emerges as the natural consequence of sustained practice.',
    category: 'pranayama',
    relatedTerms: ['Kumbhaka', 'Sahita Kumbhaka', 'Samādhi'],
    minTier: 'agni',
  },
  {
    term: 'Trāṭaka',
    sanskrit: 'त्राटक',
    pronunciation: 'TRAH-tah-kah',
    definition:
      'Steady gazing — the practice of fixing the eyes on a single point (traditionally a candle flame) without blinking until tears flow. Trāṭaka develops concentration (dhāraṇā), purifies the visual channel, and directly trains the faculty of drisṭi. It is one of the six śaṭkarmas and a foundational practice in the KALKI system.',
    category: 'pranayama',
    relatedTerms: ['Drisṭi', 'Dhāraṇā', 'Dhyāna'],
  },
  {
    term: 'Śītalī',
    sanskrit: 'शीतली',
    pronunciation: 'shee-TAH-lee',
    definition:
      'Cooling breath — inhalation through a rolled tongue, cooling the blood and calming the nervous system. Śītalī directly reduces pitta (excess heat) and is used to counterbalance the heating prāṇāyāmas. In the KALKI system, it is prescribed after intense pattern-confrontation sessions to prevent energetic overload.',
    category: 'pranayama',
    relatedTerms: ['Prāṇāyāma', 'Bhastrika'],
  },
  {
    term: 'Bhastrika',
    sanskrit: 'भस्त्रिका',
    pronunciation: 'bahs-TREE-kah',
    definition:
      'Bellows breath — rapid, forceful inhalations and exhalations through the nose, pumping prāṇa through the system like a blacksmith\'s bellows. Bhastrika generates intense heat (tapas), awakens kuṇḍalinī, and burns through tamas. It is the most aggressive prāṇāyāma and must be practiced with precise count and bandha application.',
    category: 'pranayama',
    relatedTerms: ['Prāṇāyāma', 'Kapālabhāti', 'Kumbhaka'],
    minTier: 'jal',
  },
  {
    term: 'Bhramarī',
    sanskrit: 'भ्रामरी',
    pronunciation: 'bhrah-MAH-ree',
    definition:
      'Bee breath — exhalation with a sustained, low-pitched humming sound created by the vocal cords. Bhramarī stimulates the vagus nerve, activates the parasympathetic system, and produces a measurable reduction in cortisol and blood pressure. The KALKI system uses bhramarī as a primary tool for nervous-system recalibration after pattern-confrontation work.',
    category: 'pranayama',
    relatedTerms: ['Prāṇāyāma', 'Nāḍī Śuddhi'],
  },
  {
    term: 'Ujjāyī',
    sanskrit: 'उज्जायी',
    pronunciation: 'oo-JAH-yee',
    definition:
      'Victorious breath — a gentle constriction of the glottis that produces a soft, oceanic hissing sound during both inhalation and exhalation. Ujjāyī creates a slight back-pressure that warms the air, slows the breath, and activates the baroreceptor reflex. It is the default breath during all KALKI practice sessions.',
    category: 'pranayama',
    relatedTerms: ['Prāṇāyāma', 'Nāḍī Śuddhi'],
  },
  {
    term: 'Kapālabhāti',
    sanskrit: 'कपालभाति',
    pronunciation: 'kah-PAHL-bah-tee',
    definition:
      'Skull-shining breath — rapid, forceful exhalations through the nose with passive inhalations. Kapālabhāti clears the sinuses, stimulates the frontal lobe, and purges the system of stale prāṇa. Unlike bhastrika, inhalation is passive. It is classified as one of the six śaṭkarmas and is used in the KALKI system as an energetic reset.',
    category: 'pranayama',
    relatedTerms: ['Prāṇāyāma', 'Bhastrika'],
  },
  {
    term: 'Sūrya Bhedana',
    sanskrit: 'सूर्य भेदन',
    pronunciation: 'SOOR-yah bhay-DAH-nah',
    definition:
      'Solar-piercing breath — inhalation through the right nostril, exhalation through the left. Activates the piṅgalā nāḍī and increases sympathetic tone, body heat, and alertness. Used when tamas or lethargy dominates. Contra-indicated when agni is already excessive.',
    category: 'pranayama',
    relatedTerms: ['Prāṇāyāma', 'Candra Bhedana', 'Piṅgalā'],
  },
  {
    term: 'Candra Bhedana',
    sanskrit: 'चन्द्र भेदन',
    pronunciation: 'CHAHN-drah bhay-DAH-nah',
    definition:
      'Lunar-piercing breath — inhalation through the left nostril, exhalation through the right. Activates the iḍā nāḍī and increases parasympathetic tone, coolness, and receptivity. Used when rajas or anxiety dominates. The complementary practice to sūrya bhedana.',
    category: 'pranayama',
    relatedTerms: ['Prāṇāyāma', 'Sūrya Bhedana', 'Iḍā'],
  },
  {
    term: 'Nāḍī Śuddhi',
    sanskrit: 'नाड़ी शुद्धि',
    pronunciation: 'NAH-dee SHOO-dee',
    definition:
      'Nāḍī purification — alternate nostril breathing (anuloma viloma), the foundational prāṇāyāma that balances the iḍā and piṅgalā channels. By equalizing solar and lunar flows, nāḍī śuddhi prepares the system for suṣumṇā activation. It is the first prāṇāyāma taught in the KALKI system and remains a daily practice at every tier.',
    category: 'pranayama',
    relatedTerms: ['Prāṇāyāma', 'Nāḍī', 'Iḍā', 'Piṅgalā'],
  },

  // ─── TANTRA ──────────────────────────────────────────────────────
  {
    term: 'Tantra',
    sanskrit: 'तन्त्र',
    pronunciation: 'TAHN-trah',
    definition:
      'The technology of expansion — from tan (to expand) + tra (to liberate). Tantra is not a religion but a methodological framework: a set of precise techniques for expanding the bandwidth of consciousness beyond its ordinary limits. The KALKI system is a tantrik system in the purest sense — it uses the raw material of human experience as the fuel for consciousness transformation.',
    category: 'tantra',
    relatedTerms: ['Mantra', 'Yantra', 'Maṇḍala', 'Kuṇḍalinī'],
  },
  {
    term: 'Kaula',
    sanskrit: 'कौल',
    pronunciation: 'KOW-lah',
    definition:
      'The Kaula path — the innermost current of tantric practice, characterized by the use of all experiences (including those conventionally rejected) as fuel for transformation. The Kaula practitioner does not renounce the world but transmutes it. The KALKI system operates within the Kaula methodological framework.',
    category: 'tantra',
    relatedTerms: ['Tantra', 'Śākta', 'Sādhana'],
    minTier: 'jal',
  },
  {
    term: 'Śākta',
    sanskrit: 'शाक्त',
    pronunciation: 'SHAHK-tah',
    definition:
      'The tradition that holds Śakti — the divine feminine power — as the supreme reality. Śākta tantra recognizes consciousness as fundamentally dynamic, creative, and transformative. The KALKI system\'s use of the Mahāvidyā archetypes places it within the Śākta framework.',
    category: 'tantra',
    relatedTerms: ['Śakti', 'Śiva', 'Tantra', 'Mahāvidyā'],
  },
  {
    term: 'Śaiva',
    sanskrit: 'शैव',
    pronunciation: 'SHAHY-vah',
    definition:
      'The tradition centered on Śiva — pure consciousness, the unchanging witness. Śaiva tantra recognizes consciousness as fundamentally static, luminous, and free. The KALKI system integrates both Śākta and Śaiva perspectives: Śakti as the transformative power, Śiva as the witnessing awareness that observes the transformation.',
    category: 'tantra',
    relatedTerms: ['Śiva', 'Śākta', 'Tantra'],
  },
  {
    term: 'Śakti',
    sanskrit: 'शक्ति',
    pronunciation: 'SHAHK-tee',
    definition:
      'Power — the dynamic, creative force of consciousness that manifests as all experience. Śakti is not separate from consciousness but is its active dimension. In the KALKI system, Śakti is the energy of pattern transformation: the force that dissolves old grooves and creates new ones.',
    category: 'tantra',
    relatedTerms: ['Śiva', 'Kuṇḍalinī', 'Tantra', 'Śākta'],
  },
  {
    term: 'Śiva',
    sanskrit: 'शिव',
    pronunciation: 'SHEE-vah',
    definition:
      'Pure consciousness — the unchanging witness that observes all experience without being altered by it. Śiva is not a deity in the anthropomorphic sense but the foundational awareness that makes all experience possible. In the KALKI system, Śiva is the witness — the part of you that watches the pattern without becoming the pattern.',
    category: 'tantra',
    relatedTerms: ['Śakti', 'Atman', 'Brahman'],
  },
  {
    term: 'Yantra',
    sanskrit: 'यन्त्र',
    pronunciation: 'YAHN-trah',
    definition:
      'Instrument — a geometric diagram that encodes a specific energetic architecture. Unlike a mantra, which works through sound, a yantra works through spatial and visual frequency. The most famous is the Śrī Yantra, which encodes the entire process of manifestation from unity to multiplicity and back. In the KALKI system, yantras are treated as visual operating systems.',
    category: 'tantra',
    relatedTerms: ['Maṇḍala', 'Śrī Yantra', 'Mantra'],
  },
  {
    term: 'Maṇḍala',
    sanskrit: 'मण्डल',
    pronunciation: 'mahn-DAH-lah',
    definition:
      'Circle — a sacred geometric arrangement used as a map of consciousness, a ritual enclosure, or a meditative focus. The maṇḍala represents the totality of the cosmos and the psyche simultaneously. In the KALKI system, maṇḍalas are used as structural maps for organizing and navigating the terrain of consciousness.',
    category: 'tantra',
    relatedTerms: ['Yantra', 'Śrī Cakra', 'Puja'],
  },
  {
    term: 'Śrī Cakra',
    sanskrit: 'श्री चक्र',
    pronunciation: 'SHREE CHAH-krah',
    definition:
      'The Śrī Cakra (also Śrī Yantra) — the supreme yantra of the Śākta tradition. Nine interlocking triangles (four upward, five downward) encoded in a lotus-and-gate framework, representing the entire process of creation, preservation, and dissolution. Each of its nine circuits (āvaraṇa) corresponds to a specific band of experience.',
    category: 'tantra',
    relatedTerms: ['Śrī Yantra', 'Yantra', 'Maṇḍala'],
  },
  {
    term: 'Śrī Yantra',
    sanskrit: 'श्री यन्त्र',
    pronunciation: 'SHREE YAHN-trah',
    definition:
      'The instrument of auspiciousness — synonymous with Śrī Cakra. The most studied and most powerful yantra in the Tantric canon. Its geometry encodes the relationship between consciousness and its objects, between Śiva and Śakti, between the witness and the witnessed.',
    category: 'tantra',
    relatedTerms: ['Śrī Cakra', 'Yantra', 'Mantra'],
  },
  {
    term: 'Mahāvidyā',
    sanskrit: 'महाविद्या',
    pronunciation: 'mah-HAH-vid-YAH',
    definition:
      'Great knowledge — the ten wisdom goddesses of the Śākta Tantric tradition. Each Mahāvidyā represents a specific mode of consciousness and governs a specific karmic-loop archetype. In the KALKI system, the ten Mahāvidyās are the primary classification framework for the emotional patterns that govern human behavior.',
    category: 'tantra',
    relatedTerms: ['Śākta', 'Kāmakalā', 'Bīja'],
    relatedSiddhiSlugs: ['dakshina-kali-sadhana', 'tara-ugra-sadhana', 'chinnamasta-sadhana'],
  },
  {
    term: 'Kāmakalā',
    sanskrit: 'कामकला',
    pronunciation: 'KAH-mah-KAH-lah',
    definition:
      'The desire-essence — the most esoteric doctrine in Śrī Vidyā, describing the union of Śiva and Śakti at the level of pure creative desire. Kāmakalā is the triangle within the bindu, the seed within the seed, the desire that is itself the engine of all manifestation.',
    category: 'tantra',
    relatedTerms: ['Śrī Cakra', 'Bindu', 'Mahāvidyā'],
    minTier: 'akash',
  },
  {
    term: 'Vidyā',
    sanskrit: 'विद्या',
    pronunciation: 'vid-YAH',
    definition:
      'Knowledge — specifically, liberating knowledge. Vidyā is the antidote to avidyā (ignorance), the fundamental misapprehension that the pattern is the self. Each Mahāvidyā is a "great knowledge" because she reveals a specific dimension of reality that the ordinary mind cannot access.',
    category: 'tantra',
    relatedTerms: ['Mahāvidyā', 'Jñāna Yoga'],
  },

  // ─── RITUAL ──────────────────────────────────────────────────────
  {
    term: 'Dīkṣā',
    sanskrit: 'दीक्षा',
    pronunciation: 'DEEK-shah',
    definition:
      'Initiation — the ritual transmission of a specific energetic frequency from teacher to student. Dīkṣā is not a ceremony but a calibration: the teacher\'s system acts as a template that rewires the student\'s subtle-body architecture to receive and transmit specific frequencies. Without dīkṣā, certain practices remain inert — the code exists but cannot execute.',
    category: 'ritual',
    relatedTerms: ['Guru', 'Sādhana', 'Mantra'],
    minTier: 'jal',
  },
  {
    term: 'Sādhana',
    sanskrit: 'साधना',
    pronunciation: 'SAH-dhah-nah',
    definition:
      'Systematic practice — the disciplined, sustained application of specific techniques toward a specific transformative goal. Sādhana is not hobby practice or casual meditation; it is a structured protocol with defined inputs, processes, and observable outputs. The KALKI system is, in its entirety, a sādhana framework.',
    category: 'ritual',
    relatedTerms: ['Sādhaka', 'Guru', 'Dīkṣā'],
  },
  {
    term: 'Sādhaka',
    sanskrit: 'साधक',
    pronunciation: 'SAH-dhah-kah',
    definition:
      'The practitioner — one who has committed to a sustained sādhana. The word derives from the same root as sādhana (sādh, to accomplish). A sādhaka is not a student in the passive sense but an active agent of transformation. In the KALKI system, every user is a potential sādhaka.',
    category: 'ritual',
    relatedTerms: ['Sādhana', 'Guru', 'Dīkṣā'],
  },
  {
    term: 'Guru',
    sanskrit: 'गुरु',
    pronunciation: 'GOO-roo',
    definition:
      'Teacher — from gu (darkness) + ru (light): the one who dispels darkness. In the Tantric framework, the guru is not a person but a function: the transmission channel through which the energetic frequency of the lineage is delivered. The KALKI system acknowledges the guru principle as essential for advanced practices while providing a structured self-guided path for foundational work.',
    category: 'ritual',
    relatedTerms: ['Dīkṣā', 'Sādhana', 'Sādhaka'],
  },
  {
    term: 'Nyāsa',
    sanskrit: 'न्यास',
    pronunciation: 'NYAH-sah',
    definition:
      'Placement — the ritual installation of mantras and bījas at specific points on the body, transforming the physical form into a living yantra. Each finger, limb, and energy center receives a specific sonic installation. Nyāsa is the interface technology between the sonic body (mantra) and the spatial body (yantra).',
    category: 'ritual',
    relatedTerms: ['Mantra', 'Bīja', 'Mudrā', 'Puja'],
    minTier: 'agni',
  },
  {
    term: 'Puja',
    sanskrit: 'पूजा',
    pronunciation: 'POO-jah',
    definition:
      'Worship — a structured ritual offering that establishes a reciprocal relationship between the practitioner and a specific principle or deity. Puja is not petitionary prayer; it is a calibration ritual that aligns the practitioner\'s system with the frequency of the invoked principle. Each element (flowers, incense, light, food) represents a specific sensory channel.',
    category: 'ritual',
    relatedTerms: ['Homa', 'Ārati', 'Prasād', 'Darśana'],
  },
  {
    term: 'Homa',
    sanskrit: 'होम',
    pronunciation: 'HO-mah',
    definition:
      'Fire offering — the Vedic/Tantric ritual of making offerings into a consecrated fire. Homa is the most ancient and most powerful form of ritual technology: fire is the only element that transforms matter into energy instantaneously. The offerings (ghee, herbs, mantras) are not symbolic but operational — each is a specific energetic payload delivered through the fire into the subtle realm.',
    category: 'ritual',
    relatedTerms: ['Puja', 'Mantra', 'Bīja'],
    minTier: 'agni',
  },
  {
    term: 'Ārati',
    sanskrit: 'आरती',
    pronunciation: 'ah-RAH-tee',
    definition:
      'The waving of light — the ritual circling of a lit lamp before a deity, guru, or sacred object. Ārati is the culminating act of puja, in which the element of fire (light) is used to establish the final energetic connection. The ghee lamp represents the individual soul (jīva), and its flame is the light of consciousness (cit).',
    category: 'ritual',
    relatedTerms: ['Puja', 'Homa', 'Prasād'],
  },
  {
    term: 'Prasād',
    sanskrit: 'प्रसाद',
    pronunciation: 'prah-SAHD',
    definition:
      'Grace — the sacred substance that has been offered and returned by the deity. In the Tantric framework, prasād is not a symbol but a carrier medium: the food or substance that has been exposed to the ritual field absorbs the specific frequency of the ceremony and transmits it to the one who consumes it.',
    category: 'ritual',
    relatedTerms: ['Puja', 'Homa', 'Ārati'],
  },
  {
    term: 'Darśana',
    sanskrit: 'दर्शन',
    pronunciation: 'dar-SHAH-nah',
    definition:
      'Seeing — the auspicious sight of a deity, guru, or sacred object. In the Tantric framework, darśana is a transmission: the visual contact with a consecrated form transmits a specific frequency. The word also means "philosophy" or "viewpoint" — the particular lens through which a tradition interprets reality.',
    category: 'ritual',
    relatedTerms: ['Puja', 'Guru', 'Satsaṅga'],
  },
  {
    term: 'Satsaṅga',
    sanskrit: 'सत्संग',
    pronunciation: 'saht-SAHN-gah',
    definition:
      'Association with truth — the practice of gathering with practitioners and teachers who embody the frequency you wish to cultivate. Satsaṅga is not socializing; it is an energetic calibration. The field generated by committed practitioners amplifies the individual capacity for transformation. The KALKI system treats the community dimension as essential, not optional.',
    category: 'ritual',
    relatedTerms: ['Guru', 'Sādhana', 'Darśana'],
  },
  {
    term: 'Uccāṭana',
    sanskrit: 'उच्चाटन',
    pronunciation: 'oo-CHAH-tah-nah',
    definition:
      'Uprooting — one of the six ṣaṭ-karmas (ritual actions), the practice of energetically uprooting and dispersing a hostile force or obstructing pattern. In the KALKI system, uccāṭana is the inner technology of radical pattern disruption — the capacity to tear out a karmic groove at its root.',
    category: 'ritual',
    relatedTerms: ['Stambhana', 'Vaśīkaraṇa', 'Māraṇa', 'Śānti'],
    minTier: 'akash',
  },
  {
    term: 'Stambhana',
    sanskrit: 'स्तम्भन',
    pronunciation: 'stahm-BHAH-nah',
    definition:
      'Stunning / paralysis — the ṣaṭ-karma practice of arresting the motion, speech, or intent of a hostile force. Stambhana is the inner technology of stilling the hostile inner critic, of freezing a destructive pattern before it can execute. In the KALKI system, it is the technology behind Bagalāmukhī\'s archetype.',
    category: 'ritual',
    relatedTerms: ['Uccāṭana', 'Vaśīkaraṇa', 'Māraṇa', 'Śānti'],
    minTier: 'akash',
  },
  {
    term: 'Vaśīkaraṇa',
    sanskrit: 'वशीकरण',
    pronunciation: 'vah-shee-kah-RAH-nah',
    definition:
      'Subjugation / attraction — the ṣaṭ-karma practice of bringing a force, person, or pattern under one\'s control. In the inner application, vaśīkaraṇa is the technology of self-mastery — the capacity to bring the scattered forces of the mind under the direction of the will. In the KALKI system, it maps to the Bhuvaneśvarī archetype.',
    category: 'ritual',
    relatedTerms: ['Stambhana', 'Uccāṭana', 'Māraṇa', 'Śānti'],
    minTier: 'akash',
  },
  {
    term: 'Māraṇa',
    sanskrit: 'मारण',
    pronunciation: 'mah-RAH-nah',
    definition:
      'Erasure — the most extreme of the six ṣaṭ-karmas, the practice of complete cessation. In the inner application, māraṇa is the technology of total pattern annihilation — the capacity to erase a karmic groove so completely that it cannot regenerate. In the KALKI system, this maps to the Kālī archetype. This practice is SEALED and documented for heritage scholarship only.',
    category: 'ritual',
    relatedTerms: ['Uccāṭana', 'Stambhana', 'Vaśīkaraṇa', 'Śānti'],
    minTier: 'akash',
  },
  {
    term: 'Śānti',
    sanskrit: 'शान्ति',
    pronunciation: 'SHAHN-tee',
    definition:
      'Pacification — the ṣaṭ-karma practice of bringing peace, resolution, and equilibrium. Śānti is the balancing force that follows any act of disruption. In the KALKI system, every pattern-confrontation session concludes with a śānti practice — the deliberate re-establishment of equilibrium after the destabilizing work of recognition.',
    category: 'ritual',
    relatedTerms: ['Uccāṭana', 'Stambhana', 'Vaśīkaraṇa', 'Māraṇa'],
  },
  {
    term: 'Bīja Mantra',
    sanskrit: 'बीजमन्त्र',
    pronunciation: 'BEE-jah MAN-trah',
    definition:
      'Seed mantra — the most compressed vibrational encoding of a deity or principle. Unlike longer mantras, which unfold a complex theology through their syntax, bīja mantras are single syllables that bypass the intellect and directly reprogram the subtle body. The KALKI system assigns specific bījas to specific patterns as precision intervention tools.',
    category: 'ritual',
    relatedTerms: ['Bīja', 'Mantra', 'Mahāmantra', 'Nyāsa'],
  },
  {
    term: 'Mahāmantra',
    sanskrit: 'महामन्त्र',
    pronunciation: 'mah-HAH-man-trah',
    definition:
      'Great mantra — a complete, self-sufficient mantra that contains an entire spiritual technology within its structure. The most famous is the Hare Kṛṣṇa mahāmantra. In the KALKI system, each Mahāvidyā has a mahāmantra that encodes the complete practice protocol for working with her archetype.',
    category: 'ritual',
    relatedTerms: ['Mantra', 'Bīja Mantra', 'Mahāvidyā'],
    minTier: 'agni',
  },

  // ─── PHILOSOPHICAL ───────────────────────────────────────────────
  {
    term: 'Brahman',
    sanskrit: 'ब्रह्मन्',
    pronunciation: 'BRAH-mahn',
    definition:
      'The absolute — the unchanging, infinite reality that underlies all appearance. Brahman is not a being but being itself; not a thing but the condition of possibility for all things. In the KALKI system, Brahman is the operating system: the foundational reality that runs beneath all patterns, all experience, all worlds.',
    category: 'philosophical',
    relatedTerms: ['Atman', 'Śiva', 'Mokṣa'],
  },
  {
    term: 'Atman',
    sanskrit: 'आत्मन्',
    pronunciation: 'AHT-mahn',
    definition:
      'The self — the pure witnessing consciousness that is identical with Brahman. The atman is not the ego, the personality, or the body; it is the awareness that observes the ego, personality, and body. The KALKI system\'s core teaching is that the atman is not a pattern but the pattern-observer, and that liberation is the permanent shift from identification with pattern to identification with the observer.',
    category: 'philosophical',
    relatedTerms: ['Brahman', 'Śiva', 'Mokṣa'],
  },
  {
    term: 'Karma',
    sanskrit: 'कर्म',
    pronunciation: 'KAHR-mah',
    definition:
      'Action and its consequences — the fundamental law of information processing in consciousness. Every action creates a pattern imprint (saṃskāra) that generates a probabilistic bias toward repetition. Karma is not moral accounting but computational: you are running the compiled output of every action you have ever generated.',
    category: 'philosophical',
    relatedTerms: ['Saṃskāra', 'Vāsanā', 'Samsāra', 'Mokṣa'],
  },
  {
    term: 'Dharma',
    sanskrit: 'धर्म',
    pronunciation: 'DAHR-mah',
    definition:
      'The natural order — the inherent law or duty that sustains the cosmos, the individual, and the relationship between them. Dharma is not morality in the conventional sense but structural alignment: the state where the individual pattern architecture is in resonance with the cosmic architecture. In the KALKI system, dharma is the condition of pattern coherence.',
    category: 'philosophical',
    relatedTerms: ['Karma', 'Mokṣa', 'Samsāra'],
  },
  {
    term: 'Mokṣa',
    sanskrit: 'मोक्ष',
    pronunciation: 'MOHK-shah',
    definition:
      'Liberation — the permanent cessation of the cycle of birth, death, and rebirth (samsāra). In the KALKI framework, mokṣa is not an afterlife destination but a mode of perception: the condition in which the witness is no longer confused with the witnessed, the observer is no longer identified with the pattern. Mokṣa is not escape from the system but mastery of its operation.',
    category: 'philosophical',
    relatedTerms: ['Samsāra', 'Brahman', 'Atman', 'Karma'],
  },
  {
    term: 'Samsāra',
    sanskrit: 'संसार',
    pronunciation: 'sahm-SAH-rah',
    definition:
      'The cycle of wandering — the continuous loop of birth, death, and rebirth driven by unexhausted karma. In the KALKI framework, samsāra is not a cosmic journey but a psychological condition: the state where consciousness is trapped in repetitive pattern loops, unable to see that it is running the same code in different disguises.',
    category: 'philosophical',
    relatedTerms: ['Karma', 'Mokṣa', 'Saṃskāra', 'Vāsanā'],
  },
  {
    term: 'Saṃskāra',
    sanskrit: 'संस्कार',
    pronunciation: 'sahm-SKAH-rah',
    definition:
      'Mental imprint — the groove in consciousness created by every action, thought, and experience. Saṃskāras are the compiled subroutines that run automatically below the threshold of conscious awareness. The KALKI system treats saṃskāras as the primary operating code of the conditioned self — the source code that generates the illusion of a fixed identity.',
    category: 'philosophical',
    relatedTerms: ['Karma', 'Vāsanā', 'Samsāra'],
  },
  {
    term: 'Vāsanā',
    sanskrit: 'वासना',
    pronunciation: 'VAH-sah-nah',
    definition:
      'Subliminal tendency — the subtle, unconscious inclination that drives behavior without the mind\'s awareness. Vāsanās are deeper than saṃskāras: they are the background tendencies that generate the specific saṃskāras. In the KALKI system, vāsanās are the root-cause code that must be accessed and rewritten for lasting pattern transformation.',
    category: 'philosophical',
    relatedTerms: ['Saṃskāra', 'Karma', 'Samsāra'],
    minTier: 'jal',
  },
  {
    term: 'Kali Yuga',
    sanskrit: 'कलियुग',
    pronunciation: 'KAH-lee YOO-gah',
    definition:
      'The dark age — the fourth and final age in the Vedic cosmic cycle, characterized by the progressive decline of righteousness, clarity, and human capacity. The KALKI system is designed specifically for the Kali Yuga: a precision instrument for pattern recognition deployed at the precise moment in the cycle when the old instruments can no longer function.',
    category: 'philosophical',
    relatedTerms: ['Dharma', 'Samsāra', 'Mokṣa'],
  },
  {
    term: 'Tattva',
    sanskrit: 'तत्त्व',
    pronunciation: 'TAHT-vah',
    definition:
      'Principle / category of existence — the fundamental building blocks of reality in the Sāṃkhya-Tantric framework. The 36 tattvas describe the process by which pure consciousness (Śiva-tattva) progressively limits itself to become the apparently solid world of experience. Each tattva is a layer of compression applied to the original signal.',
    category: 'philosophical',
    relatedTerms: ['Mahābhūta', 'Pañca-bhūta', 'Brahman'],
  },
  {
    term: 'Mahābhūta',
    sanskrit: 'महाभूत',
    pronunciation: 'mah-HAH-BHOO-tah',
    definition:
      'Great element — the five fundamental constituents of material reality: ākāśa (ether), vāyu (air), agni (fire), jala (water), and pṛthvī (earth). Each mahābhūta is a progressively denser expression of the same underlying energy, and each corresponds to a specific band of experience in the KALKI system.',
    category: 'philosophical',
    relatedTerms: ['Pañca-bhūta', 'Tattva'],
  },
  {
    term: 'Pañca-bhūta',
    sanskrit: 'पञ्चभूत',
    pronunciation: 'PAHN-chah-BHOO-tah',
    definition:
      'The five elements — synonymous with mahābhūta. The tantric model uses the five elements as both a cosmological map and a psychological typology. Each element corresponds to a cakra, a sensory modality, and a quality of experience. The KALKI system\'s tier structure (Prithvi, Jal, Agni, Akash) is built on the four manifest elements.',
    category: 'philosophical',
    relatedTerms: ['Mahābhūta', 'Tattva', 'Cakra'],
  },
  {
    term: 'Haṭha Yoga',
    sanskrit: 'हठयोग',
    pronunciation: 'HAHT-hah YOH-gah',
    definition:
      'Forceful yoga — the physical-energetic discipline that uses āsana, prāṇāyāma, mudrā, and bandha to purify and strengthen the body as a vehicle for consciousness. Haṭha Yoga is not exercise; it is the systematic engineering of the physical body to support the demands of advanced consciousness work. The KALKI system integrates Haṭha Yoga as its somatic foundation.',
    category: 'philosophical',
    relatedTerms: ['Rāja Yoga', 'Prāṇāyāma', 'Mudrā', 'Bandha'],
  },
  {
    term: 'Rāja Yoga',
    sanskrit: 'राजयोग',
    pronunciation: 'RAH-jah YOH-gah',
    definition:
      'Royal yoga — the meditative path outlined in Patañjali\'s Yoga Sūtras, emphasizing the eight limbs (aṣṭāṅga yoga) as a progressive system for stilling the fluctuations of the mind. Rāja Yoga is the framework within which the KALKI system organizes its concentration and meditation practices.',
    category: 'philosophical',
    relatedTerms: ['Haṭha Yoga', 'Dhyāna', 'Samādhi', 'Dhāraṇā'],
  },
  {
    term: 'Jñāna Yoga',
    sanskrit: 'ज्ञानयोग',
    pronunciation: 'GNYAH-nah YOH-gah',
    definition:
      'The yoga of knowledge — the path of liberation through direct, discriminative understanding of the nature of reality. Jñāna Yoga uses contemplation, self-inquiry (ātma-vicāra), and the rigorous application of viveka to distinguish the real (ātman) from the unreal (anātman). The KALKI system\'s analytical dimension draws heavily from the Jñāna tradition.',
    category: 'philosophical',
    relatedTerms: ['Vidyā', 'Viveka', 'Brahman', 'Atman'],
  },
  {
    term: 'Bhakti Yoga',
    sanskrit: 'भक्तियोग',
    pronunciation: 'BAHK-tee YOH-gah',
    definition:
      'The yoga of devotion — the path of liberation through the complete emotional surrender to the divine. Bhakti Yoga uses love, prayer, chanting, and ritual worship as vehicles for ego-transcendence. In the KALKI system, bhakti is the emotional dimension of practice — the capacity to meet the pattern with an open heart rather than a clenched fist.',
    category: 'philosophical',
    relatedTerms: ['Puja', 'Mantra', 'Sādhana'],
  },
  {
    term: 'Karma Yoga',
    sanskrit: 'कर्मयोग',
    pronunciation: 'KAHR-mah YOH-gah',
    definition:
      'The yoga of action — the path of liberation through selfless action performed without attachment to results. Karma Yoga transforms every action into a practice by removing the ego-investment that creates new saṃskāras. In the KALKI system, karma yoga is the principle that the practice of daily life — work, relationship, responsibility — is itself the primary field of transformation.',
    category: 'philosophical',
    relatedTerms: ['Karma', 'Dharma', 'Sādhana'],
  },
  {
    term: 'Dhāraṇā',
    sanskrit: 'धारणा',
    pronunciation: 'dah-RAH-nah',
    definition:
      'Concentration — the sixth limb of Patañjali\'s aṣṭāṅga yoga. Dhāraṇā is the sustained, single-pointed focusing of the mind on a single object, mantra, or sensation. It is not effortful attention but the natural result of a mind that has been sufficiently stilled by prāṇāyāma and ethical preparation. In the KALKI system, dhāraṇā is the precision instrument of pattern recognition.',
    category: 'philosophical',
    relatedTerms: ['Dhyāna', 'Samādhi', 'Trāṭaka'],
  },
  {
    term: 'Dhyāna',
    sanskrit: 'ध्यान',
    pronunciation: 'dhee-AH-nah',
    definition:
      'Meditation — the seventh limb of Patañjali\'s aṣṭāṅga yoga. Dhyāna is the unbroken flow of awareness toward a single point. When dhāraṇā (concentration) becomes effortless and sustained, it transitions into dhyāna. In the KALKI system, dhyāna is the state in which the pattern is observed without interference — the prerequisite for pattern dissolution.',
    category: 'philosophical',
    relatedTerms: ['Dhāraṇā', 'Samādhi', 'Trāṭaka'],
  },
  {
    term: 'Samādhi',
    sanskrit: 'समाधि',
    pronunciation: 'sah-MAH-dhee',
    definition:
      'Absorption — the eighth limb of Patañjali\'s aṣṭāṅga yoga and the culminating state of meditative absorption. In samādhi, the boundary between observer and observed dissolves. The KALKI system does not treat samādhi as a mystical experience but as the natural outcome of sufficient pattern clarity: when all patterns are visible and transparent, only the witness remains.',
    category: 'philosophical',
    relatedTerms: ['Dhyāna', 'Dhāraṇā', 'Brahman'],
    minTier: 'agni',
  },

  // ─── ARCHETYPE ───────────────────────────────────────────────────
  {
    term: 'Yoni',
    sanskrit: 'योनि',
    pronunciation: 'YOH-nee',
    definition:
      'Source, origin, womb — the primordial creative matrix from which all forms emerge and to which they return. In Tantric iconography, the yoni is the geometric representation of the divine feminine creative principle. In the KALKI system, the yoni represents the source code from which all pattern architectures are generated.',
    category: 'archetype',
    relatedTerms: ['Śakti', 'Bindu', 'Mahāvidyā'],
  },
];
