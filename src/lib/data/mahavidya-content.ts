// =============================================================
// KALKI — MAHĀVIDYĀ EDITORIAL LAYER (Phase A, spec §5)
// -------------------------------------------------------------
// Authoritative content for the ten individual Mahāvidyā pages
// (/archetypes/[id]). Authored per deity — no template text.
// Editorial rules (spec §5 compliance):
//   · distinguish TRADITIONAL CLAIM / TEXTUAL EVIDENCE / KALKI
//     INTERPRETATION — never present contested claims as fact
//   · classical sources named where cited (Āgama register)
//   · diagnostic reading must align with the governing loop
//     already documented in archetypes.ts (the karmic loop text)
//   · practice discussion respects cautionLevel gates; no
//     instructions for HIGH/SEALED rites
// =============================================================

export interface MahavidyaSection {
  label: string;
  heading: string;
  paragraphs: string[];
}

export interface MahavidyaFaq {
  q: string;
  a: string;
}

export interface MahavidyaContent {
  title: string;
  description: string;
  intro: string[];
  sections: MahavidyaSection[];
  faqs: MahavidyaFaq[];
}

export const MAHAVIDYA_CONTENT: Record<string, MahavidyaContent> = {
  /* ───────────────────────────── KĀLĪ ───────────────────────────── */
  kali: {
    title: 'Kālī — The First Mahāvidyā, Devourer of Time | KALKI',
    description:
      'Kālī decoded: the garland of fifty phonemes, the tongue of rajas, the ego-severing teaching — textual sources, symbolism, and the KALKI diagnostic reading of the loop she governs.',
    intro: [
      'Kālī is the first of the ten Mahāvidyās — the Goddess of Time itself (kāla), rendered as the black, terrifying, uncontrollable ground of everything the ego tries to organize. She arrives in the Mahāvidyā sequence before all others because what she does — the severance of self-image — is the precondition for every other doorway on the path. A practitioner who has not met Kālī has not yet started.',
      'The popular picture (dancing on a corpse, tongue out) is the least interesting thing about her. This page reads the iconography the way the source tradition does — the Karpūrādi-stotra, the Mahābhāgavata Purāṇa, the Todala Tantra — and then turns the lens diagnostic: what the loop she governs looks like in an ordinary life, and how the tradition says it is interrupted.',
    ],
    sections: [
      {
        label: '01 · Identity & Textual Context',
        heading: 'From battlefield demon-slayer to the ground of time',
        paragraphs: [
          'Kālī\u2019s early appearances are martial: in the Devī-Māhātmya she erupts from Durgā\u2019s brow as Kālarātri to devour the armies of Caṇḍa and Muṇḍa — raw, beyond command, drenched in the aftermath. The later Śākta tantras complete the transformation: the Kālikā Purāṇa and the Mahābhāgavata Purāṇa present her as the supreme reality itself, and the Todala Tantra (a key Mahāvidyā source) maps her to the head of the sequence, the first doorway.',
          'Textual evidence (Āgama register): the Karpūrādi-stotra — one of the most-studied Kālī texts in scholarship — praises her with deliberate paradox, "she whose beauty is beyond the beautiful", dwelling in the cremation ground where all identity ends. The paradox is the teaching: what terrifies the ego is beautiful to what is not the ego. Traditional claim, stated as such: devotionally she is worshipped as Dakṣiṇākālī (the benevolent orientation) across Bengal and Assam, the mother who devours her children\u2019s enemies — including, finally, the child\u2019s own self-image.',
        ],
      },
      {
        label: '02 · Symbolism Decoded',
        heading: 'Fifty heads, severed arms, the tongue',
        paragraphs: [
          'The garland of fifty heads: classical commentary reads it as the fifty phonemes of the Sanskrit mātṛkā — the entire alphabet of manifestation worn as ornament. She is clothed in language itself; the goddess who precedes meaning wears it as a trophy. The skirt of severed arms: karma — the doership of all beings — gathered and worn. She does not refuse action; she wears its fruit as decoration, which is a very different posture.',
          'The tongue: the standard interpretation (lolling out in berserk triumph at the slaughter) is the surface one. The internal reading the tradition prefers: the tongue as rajas — appetite, craving, the taste-driven lunge of the mind — held out, caught, shown for what it is. And Śiva beneath her feet: pure consciousness, inert without śakti — the icon states a dependency, not a hierarchy. Interpretive register (Pratibimba): read together, the icon is a map of what happens when time (kāla) is seen directly — every structure the self built is revealed as garment, not body.',
        ],
      },
      {
        label: '03 · The Teaching',
        heading: 'Kāla: not death, but the end of the fictitious',
        paragraphs: [
          'Kālī\u2019s name derives from kāla — time, and secondarily death. The philosophical move the tradition makes is precise: time does not destroy anything real; it destroys only the fictitious — every permanence the mind projected onto matter, body, and identity. What survives the meeting with Kālī is what was always true. Everything else was storage waiting to be cleared. This is why the Mahāvidyā sequence begins here: she is the audit before the renovation.',
          'Modern readers will recognize the structure in grief, in aging, in any event that vaporizes a self-story. The tradition\u2019s claim — graded honestly as Anubhāva, practitioner testimony rather than laboratory fact — is that this meeting can be approached deliberately: that the ego\u2019s structures can be examined and dissolved in controlled doses through practice, instead of arriving only as catastrophe. Whether full dissolution is achievable is contested; that the practice changes the relationship to self-image is the least contested claim in the whole corpus.',
        ],
      },
      {
        label: '04 · KALKI Diagnostic',
        heading: 'The loop she governs: ego-attachment that must be severed',
        paragraphs: [
          'In the KALKI framework, Kālī governs the loop of ego-attachment — the pattern that preserves a self-image even as it destroys the life around it. Its signature: identities defended past their usefulness (the professional self held after the career is over, the victim self held after the danger has passed, the "difficult" self defended as authenticity). The person attached to an image will sacrifice outcomes, relationships, and health to keep it — which is the loop\u2019s tell: the pattern costs more than the thing it protects, and continues anyway.',
          'The diagnostic questions the tradition prescribes for self-observation: What am I protecting when I refuse this change? Whose approval was this image built to secure? What would remain, if the image were gone? In KALKI\u2019s platform, Kālī\u2019s force connects to specific sādhana folios in the Archive — graded, with caution levels stated — and to the pattern folios in the Pattern Atlas that carry her signature. The serious practice instructions stay behind the tier gates, as the tradition itself gates them.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Why is Kālī so frightening if she is worshipped as a mother?',
        a: 'Because the tradition is describing the same reality from two locations: from the ego\u2019s side, the severance of self-image is annihilation and must look terrifying; from the side of what survives, it is the mother devouring what was never her child — the false self. Devotional traditions (Dakṣiṇākālī worship) work precisely with this double image: the terror is real, and so is the shelter, and the practice is learning which part of you each applies to.',
      },
      {
        q: 'What does Kālī\u2019s garland of heads actually mean?',
        a: 'The classical reading: fifty heads for the fifty phonemes of the Sanskrit alphabet (the mātṛkā), meaning she wears the totality of language and manifestation as ornament — she precedes and outlasts every construct. Other readings exist (the severed heads as the fifty saṃskāra clusters, for example); the tradition itself records multiple layers, which is why KALKI grades iconographic interpretation as Pratibimba — interpretive — rather than asserting one canonical meaning.',
      },
      {
        q: 'Is Kālī worship dangerous?',
        a: 'The honest answer has three layers. Devotional Kālī upāsanā (Dakṣiṇākālī, household worship) is mainstream practice across Bengal and Assam — mainstream enough to have lullabies written about her. Intense vīra-mode practices (cremation-ground sādhana, certain mantra protocols) are gated by the tradition itself as HIGH-caution for real reasons: psychological destabilization is a documented risk when intensity exceeds readiness. KALKI documents the full range with caution levels and keeps the gated material behind tier gates — the gates are tradition-honest, not marketing.',
      },
      {
        q: 'How do I know if the Kālī loop is running me?',
        a: 'The signature is expensive self-protection: a self-image you defend at a cost wildly exceeding its value. Career decisions made to protect a title, relationships ended to avoid being seen without a mask, "authenticity" claimed for a pattern everyone around you pays for. The KALKI Pattern Atlas holds the full diagnostic — twenty minutes of reading against your own history answers this more reliably than any quiz, including ours.',
      },
    ],
  },

  /* ───────────────────────────── TĀRĀ ───────────────────────────── */
  tara: {
    title: 'Tārā — The Second Mahāvidyā, The Ferry Across | KALKI',
    description:
      'Tārā decoded: the savioress who ferries across, the scissors-and-lotus iconography, the Hindu-Buddhist crossover — sources, symbolism, and the KALKI reading of the drowning loop she governs.',
    intro: [
      'Tārā is the second Mahāvidyā — the ferrywoman. Her name derives from the root tṛ, "to cross": she is the one who carries the drowning across, the star that navigates by. Where Kālī ends something, Tārā begins the crossing — the sequence itself is teaching: severance first, then passage.',
      'She is also the most ecumenical figure on the list: the Hindu Tārā of the Tārātantra and the Mahāvidyā pantheon and the Buddhist Tārā of the Vajrayāna are historically entangled — a deity both traditions claim, worship, and argue about. That shared custody is itself evidence of how old and how central the figure is.',
    ],
    sections: [
      {
        label: '01 · Identity & Textual Context',
        heading: 'The goddess two religions share',
        paragraphs: [
          'In the Śākta corpus, Tārā appears in the Tārātantra, the Rudrayāmala, and the Todala Tantra\u2019s Mahāvidyā list — where the text makes a striking identification: Tārā corresponds to Matsya, the fish avatār of Viṣṇu, the being who ferries the Vedas across the flood. The ferry symbolism is thus textually load-bearing, not decorative. Her forms include Ekajaṭā (the one-lock), Ugra-tārā (the fierce), and Nīla-sarasvatī (the blue, speech-giving).',
          'In the Buddhist Vajrayāna, Tārā is the savioress par excellence — her twenty-one praises are recited daily across the Himalayan world. Which tradition came first is a genuinely contested scholarly question (Buddhist Tārā attested by the sixth–seventh century; Śākta Tārā\u2019s full Mahāvidyā status later); what is not contested is the crossover itself. KALKI grades the historical question as Parīkṣā — cross-source evidence exists for the entanglement, not for a definitive origin.',
        ],
      },
      {
        label: '02 · Symbolism Decoded',
        heading: 'The knife, the scissors, the lotus, the blue',
        paragraphs: [
          'Tārā\u2019s iconography is surgical where Kālī\u2019s is total. She carries the kartrī — the scissors — an instrument no other Mahāvidyā holds: the cut that separates the seeker from what drags them under, made with precision rather than wrath. The lotus in her other hand is the promise on the far side: what rises from the mud still rises. Her belly is drawn full — she is the gestating, ferrying matrix, not the void. Her blue-black body: the color of depth — of water too deep to stand in, and of the sky\u2019s limit at night: the two metaphors (ocean, star) her name itself contains.',
          'Interpretive register (Pratibimba): Kālī\u2019s icon severs; Tārā\u2019s icon conducts. Read as a sequence — and the Mahāvidyā list is ordered deliberately — the iconography is pedagogy: first the ego\u2019s structures come down, then the actual crossing is navigated with tools that cut precisely what needs cutting and no more.',
        ],
      },
      {
        label: '03 · The Teaching',
        heading: 'Tāraṇa: rescue as a technology, not a mood',
        paragraphs: [
          'The tradition\u2019s claim about Tārā is unsentimental: drowning is a condition with a known exit, and the exit has an operator. The ocean of saṃsāra — the recurring cycle the seeker cannot swim out of by effort alone — is crossable because it has been crossed before, by a method, and the method has a face. This is why Tārā practice in both traditions centers on mantra repetition: the syllable trā ("crossing") embedded in her bīja is the teaching compressed into sound — the crossing is not earned by worthiness but enacted by repetition.',
          'Graded honestly: that a practice reliably produces the felt shift from drowning to being-carried is Anubhāva — massive, cross-cultural practitioner testimony across two religions, not laboratory fact. What the texts state flatly (Āgama): the tradition considers rescue a technology with protocols, not a lottery of grace.',
        ],
      },
      {
        label: '04 · KALKI Diagnostic',
        heading: 'The loop she governs: the drowning / needing to be ferried',
        paragraphs: [
          'In the KALKI framework, Tārā governs the loop of drowning — the pattern of experiencing ordinary difficulty as deep water: every setback existential, every request an imposition, every gap in support a betrayal. Its signature: helplessness that recurs despite competence (the capable person who collapses at thresholds), rescue-seeking that alternates with rescue-refusing, and the specific fatigue of someone swimming hard in place.',
          'The diagnostic questions: Where am I treating waist-deep water as an ocean? What would "being carried" actually require me to allow? Whose ferry am I refusing to board because I insist on swimming my own way? In the platform, Tārā\u2019s force links to specific Archive folios (her rescue protocols are among the documented, caution-graded practices) and to the Pattern Atlas loops that carry the drowning signature. The advanced Tārā sādhanas — including the forms the tradition rates Ugra — stay behind their gates.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Are the Hindu Tārā and the Buddhist Tārā the same goddess?',
        a: 'Historically entangled, doctrinally distinct. Both traditions worship a savioress named Tārā with overlapping iconography and mantra, and the cross-pollination is documented; but the Mahāvidyā Tārā of the Śākta tantras and the Bodhisattva Tārā of Vajrayāna Buddhism operate inside different theological frames. The honest answer to "which came first" is: contested. KALKI grades it Parīkṣā — the evidence supports the entanglement, not a verdict.',
      },
      {
        q: 'Why does Tārā carry scissors?',
        a: 'The kartrī (scissors) is Tārā\u2019s distinctive implement: the instrument of precise severance — cutting the seeker free from what drags them under, with discrimination rather than destruction. Where Kālī\u2019s sword levels, Tārā\u2019s scissors edit. Iconographically it pairs with the lotus: cut what binds, bloom on the other side. The reading is classical commentary, graded here as interpretive where sources differ.',
      },
      {
        q: 'What does "Tārā" actually mean?',
        a: 'From the Sanskrit root tṛ — to cross over: "she who carries across", and secondarily "star" (tārā), the navigational light. Both readings are traditional and both are teaching: the crossing and the navigation. The Todala Tantra\u2019s identification of Tārā with Matsya — the fish who ferries the Vedas across the great flood — confirms the ferry symbolism was always the load-bearing layer of her name.',
      },
      {
        q: 'How is the Tārā loop different from ordinary overwhelm?',
        a: 'Everyone feels occasionally out of their depth; the Tārā loop is a standing posture, not a mood — difficulty is preemptively rendered as deep water, and help is simultaneously craved and refused. The diagnostic in the Pattern Atlas separates them by one question: does the drowning feeling survive the evidence (competence, past rescues, actual water level)? If yes, the loop is running — and the tradition\u2019s ferry protocols, Tārā\u2019s whole domain, are the documented counter-practice.',
      },
    ],
  },

  /* ─────────────────── ṢOḌAŚĪ / TRIPURASUNDARĪ ─────────────────── */
  shodashi: {
    title: 'Ṣoḍaśī Tripurasundarī — Third Mahāvidyā, The Beauty of the Three | KALKI',
    description:
      'Ṣoḍaśī decoded: the sixteen-syllable vidyā, the goddess as the beauty of the three states, Śrī Vidyā\u2019s summit — sources, symbolism, and the KALKI reading of beauty-as-avoidance.',
    intro: [
      'Ṣoḍaśī — Tripurasundarī, "the beauty of the three cities" — is the third Mahāvidyā and, within Śrī Vidyā, the summit of the entire pantheon: the goddess as the sixteen-phase fullness from which the other nine are said to be projections. Her vidyā (the sixteen-syllable Ṣoḍaśākṣarī mantra) is among the most closely held transmissions in the tradition — not because the syllables are secret, but because the practice is graded for maturity.',
      'The Mahāvidyā list is deliberately wide-ranging — Kālī\u2019s cremation ground, Dhūmāvatī\u2019s widowhood, and then this: the goddess as absolute beauty. The tradition\u2019s implicit argument: beauty is not the opposite of the path. Unexamined, it is the most effective avoidance there is; examined, it is the destination.',
    ],
    sections: [
      {
        label: '01 · Identity & Textual Context',
        heading: 'The sixteen syllables and the three cities',
        paragraphs: [
          'Ṣoḍaśī ("the sixteen-syllabled one", also "the sixteen-year-old" — the fullness at which Hindu law-canon considered a person complete) anchors the Śrī Vidyā tradition: the worship of the goddess as Lalitā-Tripurasundarī through the Śrī Cakra yantra, the Lalitā Sahasranāma (the thousand-name hymn), and the Tripurā Upaniṣad. The three cities (tripura) read on multiple classical layers: the three worlds (earth, atmosphere, heaven), the three bodies, the three states of consciousness — waking, dream, deep sleep. She is the beauty that pervades and transcends all three.',
          'Textual note (Āgama register): the Ṣoḍaśākṣarī mantra\u2019s full form is transmitted only through initiation in the Śrī Vidyā lineages, and the tradition itself grades its practice by adhikāra — readiness. KALKI documents the architecture and keeps the transmission where the tradition keeps it: in the lineage, behind vetting — the Lineage Introduction exists precisely for this tier of practice.',
        ],
      },
      {
        label: '02 · Symbolism Decoded',
        heading: 'The fullness that the other nine divide',
        paragraphs: [
          'Where the other Mahāvidyās are facets — Kālī the severance, Tārā the crossing, Dhūmāvatī the void — Ṣoḍaśī is presented by the tradition as the undivided whole: sixteen syllables, sixteen nityās (the sixteen phases of the moon-goddess), the fullness of which the other nine are specializations. Her iconography: seated on the lap of Kāmeśvara (the lord of desire) in equal union — not conquest, not submission, but parity; the red of her form is the color of rajas in its sattvic transmutation: desire, refined, as the engine of creation rather than its captivity.',
          'Interpretive register (Pratibimba): this is why the Mahāvidyā sequence places her third, between the fierce operations (Kālī, Tārā) and the elemental ones (Bhuvaneśvarī onward). The sequence states a claim: after severance and crossing, the seeker must confront desire itself — not as enemy (Kālī handled aversion\u2019s object) but as the current to be ridden to its source.',
        ],
      },
      {
        label: '03 · The Teaching',
        heading: 'Beauty: the obstacle that is also the door',
        paragraphs: [
          'The philosophical weight the tradition places on Ṣoḍaśī is a specific claim: saundarya — beauty — is not aesthetic preference but ontological signal. The three states of consciousness are pervaded by a coherence the mind registers as beauty before it can name it; the Śrī Vidyā practitioner is trained to follow that signal inward, through the cakras of the Śrī Cakra\u2019s nine enclosures, to the center where the signal originates. The Lalitā Sahasranāma\u2019s opening sequence — she who is saluted from the heart-space — is an instruction, not a metaphor.',
          'Graded honestly: the map (nine āvaraṇas, the psycho-architecture of the Cakra) is Āgama — textually dense and verifiable. The claim that following it terminates in nondual realization is the tradition\u2019s standing testimony (Anubhāva). KALKI\u2019s contribution is the audit layer: the registers stated, the claims kept separate.',
        ],
      },
      {
        label: '04 · KALKI Diagnostic',
        heading: 'The loop she governs: beauty-as-avoidance',
        paragraphs: [
          'In the KALKI framework, Ṣoḍaśī governs the loop of beauty-as-avoidance — the pattern of curating life into an aesthetic object so that nothing in it requires actual confrontation. Its signature: the flawlessly arranged existence (practice, home, feed, persona) that consumes the energy transformation would require; spirituality as interior decorating; the specific stall of "I am still refining my practice" recurring year over year. It is the most flattering loop in the Atlas — which is precisely why it survives every casual audit.',
          'The diagnostic questions: What would break if this arrangement were genuinely tested? Where is beauty doing the work that confrontation should? What am I curating instead of crossing? In the platform, Ṣoḍaśī\u2019s force links to Archive folios on the Śrī Vidyā architecture (documented, graded) and the Atlas loops carrying the avoidance signature. Transmission-grade practice stays in the lineage — the platform\u2019s honesty about that boundary is itself part of the teaching.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Why is the Ṣoḍaśī mantra not published openly?',
        a: 'Because the tradition grades it: the Ṣoḍaśākṣarī is transmitted through Śrī Vidyā lineages with an adhikāra assessment — the practice is considered mature-work, where an unprepared practitioner does real psychological damage to themselves rather than mystical damage to the syllables. Publishing a syllable string online bypasses the assessment while keeping the risk. KALKI documents the architecture (what the practice is for, how it sits in the tradition) and states plainly that transmission stays in the lineage.',
      },
      {
        q: 'What are the "three cities" in Tripurasundarī?',
        a: 'Layered readings, all classical: the three worlds (earth, atmosphere, heaven); the three states of consciousness (waking, dream, deep sleep); the three bodies. The goddess is the beauty pervading and transcending all three — hence Tripurasundarī, "beautiful in the three cities". The consciousness-state reading is the one Śrī Vidyā praxis works with most directly.',
      },
      {
        q: 'How can beauty be an avoidance pattern?',
        a: 'When curation replaces confrontation. The beauty-as-avoidance loop arranges life into an aesthetic object — refined, presentable, always "almost ready" for the real work — and the arrangement itself consumes the energy transformation would need. It is the most socially rewarded stall in the Atlas, which is why it needs the sharpest diagnostic: the test is not whether your life is beautiful, but whether anything in it is still untested.',
      },
      {
        q: 'Is Śrī Vidyā part of the Mahāvidyā tradition?',
        a: 'They interlock without being identical. The ten Mahāvidyās are a pantheon (the Kālī-knowledge sequence); Śrī Vidyā is the specific worship-system of Ṣoḍaśī-Tripurasundarī (Śrī Cakra, Lalitā Sahasranāma, the panchadashi/ṣoḍaśī mantra lineages). Ṣoḍaśī\u2019s position as the third Mahāvidyā places the Śrī Vidyā summit inside the broader tenfold map — one tradition documenting its own summit from within a larger architecture.',
      },
    ],
  },

  /* ────────────────────── BHUVANEŚVARĪ ────────────────────── */
  bhuvaneshvari: {
    title: 'Bhuvaneśvarī — Fourth Mahāvidyā, Queen of Worlds, Space Itself | KALKI',
    description:
      'Bhuvaneśvarī decoded: the goddess as spatial substrate, the hrīṃ bīja, the world as her body — textual sources, symbolism, and the KALKI reading of the sovereignty-control loop.',
    intro: [
      'Bhuvaneśvarī is the fourth Mahāvidyā — "the queen of the worlds" (bhuvana = world; īśvarī = queen). The tradition reads her more radically still: not the queen OF space but space AS queen — the goddess as the spatial substrate within which every world, body, and thought appears. If Kālī is time (kāla), Bhuvaneśvarī is space (bhuvana): the two great containers, personified at the head of the Mahāvidyā sequence.',
      'Her bīja is hrīṃ — the māyā bīja, the seed-syllable of manifestation\u2019s illusion — which tells you immediately what her teaching is about: the relationship between the space in which things appear and the things that appear in it.',
    ],
    sections: [
      {
        label: '01 · Identity & Textual Context',
        heading: 'The goddess who is the room',
        paragraphs: [
          'Bhuvaneśvarī\u2019s principal textual home is the Mahābhāgavata Purāṇa (one of the core Mahāvidyā sources), which devotes substantial chapters to her as the supreme reality: the goddess who precedes manifestation, who contains all worlds (the fourteen bhuvanas of the classical cosmology), and who manifests them from herself without effort. She is repeatedly identified with hrīṃ — the bīja that classical mantra-śāstra assigns to cosmic illusion-and-revelation simultaneously.',
          'Textual note (Āgama register): the cosmological frame (worlds arising within her, as bubbles in an ocean) is standard Śākta nondualism — the same architecture Advaita Vedānta argues abstractly, the Devī tradition renders personally. Whether the frame is literal cosmology or contemplative map is exactly the kind of claim the tradition itself argues about internally; KALKI grades the architecture as Āgama (textually dense) and the ontological literalism as contested — by the tradition\u2019s own commentators, historically.',
        ],
      },
      {
        label: '02 · Symbolism Decoded',
        heading: 'The crown, the noose, the goad, the gesture of fearlessness',
        paragraphs: [
          'Bhuvaneśvarī\u2019s iconography is minimal and luminous where her sister Mahāvidyās are grotesque or fierce: three-eyed, crowned as sovereign, smiling, four-armed — carrying the noose (pāśa) and goad (aṅkuśa) of sovereignty, showing the gestures of fearlessness (abhaya) and boons (vara). The smile is the part the tradition lingers on: she is described as laughing — the specific serenity of someone for whom no content in the space can threaten the space itself.',
          'Interpretive register (Pratibimba): the icon is a positional teaching. Kālī stands on the corpse of identity; Tārā ferries across danger; Bhuvaneśvarī is simply seated — because the seat is everything: consciousness as the room in which experience happens, unthreatened by any furniture. The noose and goad — normally instruments of control — here characterize sovereignty: what arises in her space is managed by her nature, not her effort.',
        ],
      },
      {
        label: '03 · The Teaching',
        heading: 'Space: the nothing that is not lacking',
        paragraphs: [
          'Bhuvaneśvarī\u2019s philosophical teaching: the substrate is not empty in the way absence is empty. The hrīṃ bīja encodes māyā — the mystery that appearances are neither real (they change) nor unreal (they appear) — and the practice Tradition assigns her is the relocation of identity from the contents of experience to the space of it. The classical instruction sequence: see the objects; see the seeing; notice what never moves.',
          'This is the teaching modern contemplatives keep rediscovering under other names — awareness as the unmoved context. The tradition\u2019s distinctive move is devotional: rather than the seeker discovering the space impersonally, it is personified as the Queen, and the relationship (bhāva) does the work that pure insight sometimes cannot: surrender is faster than analysis for patterns that analysis built.',
        ],
      },
      {
        label: '04 · KALKI Diagnostic',
        heading: 'The loop she governs: control and the sovereignty wound',
        paragraphs: [
          'In the KALKI framework, Bhuvaneśvarī governs the loop of control — the sovereignty wound: the person who manages every room because somewhere early, no room was managing them. Its signature: hypervigilant planning presented as responsibility; the inability to delegate outcomes (only tasks); relationships managed like operations; the specific exhaustion of someone holding the world up while insisting they are not holding anything.',
          'The diagnostic questions: What catastrophe am I pre-living right now? Whose responsibility did I swallow, and when? What would one genuinely unmanaged hour reveal? The loop\u2019s antidote in the tradition is precisely the positional practice her icon teaches — the relocation of identity from contents to container — applied behaviorally: the deliberate, dosed practice of unmanaged time, delegated outcomes, and held-but-not-fixed spaces. Her Archive folios document the contemplative version, caution-graded; the Atlas loops carry the behavioral signature.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What does the name Bhuvaneśvarī mean?',
        a: 'Queen (īśvarī) of the worlds (bhuvana). The tradition\u2019s radical reading: not a queen who rules space, but space itself as sovereign — the goddess as the spatial substrate within which all fourteen classical bhuvanas (worlds/planes) appear. She is paired conceptually with Kālī: time and space, the two containers, personified at the head of the Mahāvidyā list.',
      },
      {
        q: 'What is the hrīṃ bīja?',
        a: 'Hrīṃ is Bhuvaneśvarī\u2019s seed-syllable, known in mantra-śāstra as the māyā bīja — the syllable encoding manifestation\u2019s paradox: appearances that are neither absolutely real nor absolutely unreal. It is used across the Śākta tradition wherever the practice addresses the appearance-space relationship. Its disciplined repetition is a graded practice; the tradition transmits it with an adhikāra assessment, which KALKI respects rather than bypasses.',
      },
      {
        q: 'Why is Bhuvaneśvarī depicted smiling when her sister goddesses are fierce?',
        a: 'Because each Mahāvidyā\u2019s icon encodes that goddess\u2019s specific teaching. Bhuvaneśvarī\u2019s subject is the unthreatenable: consciousness as the space in which all content arises. Nothing that appears in the room can damage the room — hence the serenity, the crown worn lightly, the laugh the texts describe. The fierce forms handle what must be severed or crossed; her form models what was never at risk.',
      },
      {
        q: 'How is a "sovereignty wound" a spiritual pattern?',
        a: 'In KALKI\u2019s diagnostic frame, the control loop is the behavioral shadow of a real spiritual insight misapplied: somewhere early, the person learned that nothing held them unless they held it — and generalized a survival strategy into an identity ("the responsible one"). The tradition\u2019s counter-practice is Bhuvaneśvarī\u2019s own teaching: identity relocated from managing contents to being the container — which, dosed behaviorally, is the practice of genuinely unmanaged time. The insight is not "control is bad"; it is "control is a substitute for a ground".',
      },
    ],
  },

  /* ────────────────────── BHAIRAVĪ ────────────────────── */
  bhairavi: {
    title: 'Bhairavī — Fifth Mahāvidyā, The Fire of the Terrible | KALKI',
    description:
      'Bhairavī decoded: the consort of terror, the tapas fire that burns the false, the Rudrayāmala sources — symbolism, textual context, and the KALKI reading of refusing the teacher.',
    intro: [
      'Bhairavī is the fifth Mahāvidyā — "the terrifying one", feminine counterpart and consort of Bhairava, Śiva\u2019s fierce form. Where Kālī devours and Tārā ferries, Bhairavī burns: her domain is tapas, the incandescent inner heat that incinerates what is false without negotiating with it.',
      'The Mahāvidyā sequence places her at the center — the exact middle of the ten — which the tradition reads deliberately: fire belongs at the heart, because fire is what transformation actually feels like from the inside.',
    ],
    sections: [
      {
        label: '01 · Identity & Textual Context',
        heading: 'The Rudrayāmala\u2019s fierce consort',
        paragraphs: [
          'Bhairavī\u2019s textual ground is the Rudrayāmala-tantra and the wider Bhairava-āgama corpus: the goddess as the Śakti of the terrifying — the energy that does not pacify illusion but combusts it. In the Tripurabhairavī form she is worshipped as the fire of the three cities; in her Mahāvidyā register she is the standing flame — the tradition describes her crowned with a diadem of light, seated on a lotus-as-bier, self-luminous.',
          'Textual note (Āgama register): the Bhairava corpus is where the tantras treat tapas most technically — heat as an actual practice variable (breath ratio, austerity dosage, confrontation protocols), not a metaphor. The tradition grades these HIGH-caution across the board: spiritual bypassing\u2019s ugly twin, spiritual combustion, is a documented failure mode. KALKI\u2019s caution levels on the relevant folios follow the tradition\u2019s own gates.',
        ],
      },
      {
        label: '02 · Symbolism Decoded',
        heading: 'The diadem, the bier, the self-luminous body',
        paragraphs: [
          'Bhairavī\u2019s iconography compresses the fire teaching into three images. The diadem of light: the crown is not received but generated — sovereignty as radiance, the byproduct of burn-off. The seat as bier: what she sits on is funerary — the practice itself is a cremation, and the sitting is what remains. The self-luminous body: unlike Bhuvaneśvarī (who IS the space) or Ṣoḍaśī (who IS the beauty), Bhairavī IS the burning — no borrowed light, no reflected glory.',
          'Interpretive register (Pratibimba): read as sequence pedagogy, the middle of the Mahāvidyā list is where the seeker\u2019s accumulated material — concepts, identities, half-truths carried from Kālī\u2019s audit forward — meets combustion. The tradition\u2019s word for the resistance is ego\u2019s last strategy: refusing the fire, which is refusing the teacher. Hence her loop (below).',
        ],
      },
      {
        label: '03 · The Teaching',
        heading: 'Tapas: heat as the price and the method',
        paragraphs: [
          'Tapas — from the root tap, to burn — is the Vedic and Tantric name for deliberate, dosed self-heat: the voluntary holding of intensity (austerity, silence, confrontation with what is avoided) until the avoidant structure combusts. The Bhairava corpus is blunt about the economics: nothing false survives the fire; what is real is revealed as fire-proof. The practice question is never whether to burn but what dose — which is why the tradition gates it.',
          'Graded honestly: that sustained tapas produces durable transformation is the standing testimony of the tradition (Anubhāva, across thousands of years of practitioner reports) and the explicit mechanics are Āgama (the texts specify protocols, dosages, and failure modes in detail). What no honest source claims: that it is comfortable, or that the dose can be self-prescribed safely at intensity. The teacher-gate in this tradition exists for reasons written in the failure cases.',
        ],
      },
      {
        label: '04 · KALKI Diagnostic',
        heading: 'The loop she governs: refusing the teacher',
        paragraphs: [
          'In the KALKI framework, Bhairavī governs the loop of refusing the teacher — the pattern of terminating transmission the moment it demands change. Its signature: the serial dabbler with a graveyard of abandoned practices (each abandoned at the exact point of demand); the spiritual collector who audits teachers for flaws as a pre-emptive defense ("no one qualified to teach me"); the seeker who wants the fire\u2019s results while holding the fire\u2019s price in escrow. The loop is subtle because discernment is real — the tradition itself commands testing a teacher. The diagnostic is behavioral, not doctrinal: whether testing ends only after the demand arrives.',
          'The questions the Atlas prescribes: At what exact point did I stop practicing last time — and was it the flaw I cited, or the demand I cited it to avoid? What would staying through one full demand cost me? What have I not been taught, because I left before it could be given? Her Archive folios document the graded fire-practices with their caution gates; the Atlas loop carries the behavioral signature.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What does the name Bhairavī mean?',
        a: 'The feminine of Bhairava — "the terrifying one". In the tantras the name is parsed as bha-rava (the root-sounds of dissolution) or as "she who maintains the world in terror-awe" — the fierce face of reality that incinerates the false. She is the Shakti-consort of Bhairava, Śiva\u2019s fierce form, and in her own right the Mahāvidyā of transformative fire.',
      },
      {
        q: 'Why is Bhairavī placed fifth — the center of the ten?',
        a: 'The Mahāvidyā list is read as deliberate sequence, and the center is the fire seat: transformation\u2019s actual mechanism. The four before her (Kālī, Tārā, Ṣoḍaśī, Bhuvaneśvarī) audit, ferry, reveal desire, and establish the ground; the fire at the center burns what cannot be carried forward; the four after her (Chinnamastā onward) handle what remains. This sequential reading is traditional commentary — graded interpretive where sources differ on the mapping.',
      },
      {
        q: 'Is "refusing the teacher" really a spiritual pattern — what about bad teachers?',
        a: 'Both things are true, which is why the diagnostic is behavioral. The tradition commands testing teachers (the texts list disqualifying flaws explicitly) — discernment is required, not optional. The Bhairavī loop is not discernment: it is the reflex that terminates transmission specifically when the demand for change arrives, dressed retroactively as discernment. The Atlas diagnostic asks the behavioral question: does the exit reliably follow the demand, rather than the flaw?',
      },
      {
        q: 'What is tapas, practically?',
        a: 'Deliberately dosed intensity held until an avoidant structure combusts: austerity, silence, breath protocols, confrontation practices — the tantras specify all of it technically (dosage, ratio, failure modes). What it is not: self-punishment, or intensity self-prescribed at high dose. The tradition gates serious tapas practice as HIGH-caution with teacher assessment — a gate KALKI\u2019s documentation respects and does not bypass.',
      },
    ],
  },

  /* ────────────────────── CHINNAMASTĀ ────────────────────── */
  chinnamasta: {
    title: 'Chinnamastā — Sixth Mahāvidyā, The Self-Decapitated | KALKI',
    description:
      'Chinnamastā decoded: the severed head, the three blood streams as three nāḍīs, standing on Rati-Kāma — textual sources, symbolism, and the KALKI reading of the self-sacrifice loop.',
    intro: [
      'Chinnamastā is the sixth Mahāvidyā — the self-decapitated goddess, holding her own severed head, drinking from the blood-stream at her own throat. She is the most visually shocking figure in the Hindu pantheon and among the least understood: the tradition reads her not as violence but as the completed circuit — the energy that feeds others, fed first from its own source; desire not suppressed but run to ground.',
      'She is also, historically, the crossover point where the Hindu and Buddhist Vajrayāna streams meet most literally: her Buddhist counterpart Vajravairoḍhanī (and Vajrayoginī iconography generally) shares the self-severed-head motif — the two traditions document the same contemplative technology under two names.',
    ],
    sections: [
      {
        label: '01 · Identity & Textual Context',
        heading: 'The Prāṇatoṣinī narrative and the instant-gratifying one',
        paragraphs: [
          'The standard narrative source is the Prāṇatoṣinī-tantra: the goddess, bathing in a river with her two companions Ḍākinī and Varṇinī, turns black as storm-cloud; asked by her starving companions for food, she severs her own head with her own blade, and the three drink — she from the center stream, they from the sides. She stands (in most iconography) atop Rati and Kāmadeva — the god and goddess of erotic love, in union — the whole scene energized by, and standing on, sexuality\u2019s raw power.',
          'Textual register (Āgama): her epithets in the Chinnamastā-tantra and allied sources include Kṣipra-prasādinī — "she who is gratified instantly, and gratifies instantly": among the Mahāvidyās she is the fast-acting one, which the tradition pairs with a genuinely steep readiness requirement. Her practice corpus is graded vīra (heroic) at minimum; KALKI\u2019s caution gate on her folios is HIGH, following the tradition\u2019s own assessment — the documentation explains the architecture and does not issue protocols.',
        ],
      },
      {
        label: '02 · Symbolism Decoded',
        heading: 'Three streams, three nāḍīs, one standing',
        paragraphs: [
          'The three blood streams: classical haṭha-yogic commentary reads them as iḍā, piṅgalā, and suṣumnā — the three principal channels of the subtle body. The icon is, on this reading, a kundalinī diagram: the central channel flowing (the goddess drinking her own current — consciousness consuming its own vital juice), flanked by the two laterals feeding the companions (the paired energies serving the periphery). The severed head: the cutting of the discursive mind — exactly the function haṭha methodology attributes to the kundalinī\u2019s rise.',
          'And the couple beneath her: desire (Rati-Kāma) as the platform the whole operation stands on — not renounced, not indulged, but stood upon. Interpretive register (Pratibimba): the icon\u2019s total claim is that self-transcendence and life-energy are one circuit, not enemies — the head comes off so the current can flow; the current was always erotic; the discipline is the routing, not the suppression.',
        ],
      },
      {
        label: '03 · The Teaching',
        heading: 'The circuit: feeding others without bleeding to death',
        paragraphs: [
          'The contemplative teaching the tradition draws from Chinnamastā: energy flows in a closed loop — the source drinks from itself and the drinking feeds everything downstream. Applied, this is the tradition\u2019s sharpest counter to two failure modes at once: the martyr (who feeds others by hemorrhaging, with no return circuit) and the consumer (who only drinks, never pours). Chinnamastā\u2019s icon forbids both: the head is severed BY HER OWN HAND (self-sourcing), and the streams FEED (outpouring).',
          'Graded honestly: the kundalinī reading of her iconography is classical commentary — well-attested, and still interpretation (Pratibimba). The claim that her practice instantaneously gratifies is the tradition\u2019s own testimony (Anubhāva) — and the same sources are explicit that instant-acting practices are the ones that most require assessment, the reason her gate sits where it does.',
        ],
      },
      {
        label: '04 · KALKI Diagnostic',
        heading: 'The loop she governs: feeding others from your own life-force',
        paragraphs: [
          'In the KALKI framework, Chinnamastā governs the loop of self-sacrifice — the pattern of feeding others from your own substance with the return circuit cut. Its signature: depletion presented as love; the rescue identity that collapses when no one needs rescuing; giving that insists on being one-directional (help received feels like theft); the body\u2019s bill arriving as illness, burnout, or sudden collapse — the loop\u2019s tuition, paid somatically.',
          'The tradition\u2019s counter-teaching is the icon itself: even the self-sacrificer must self-source — the head severed by her own hand, not demanded by the feeders. The diagnostic questions: Who would I be if no one needed me this week? Where is giving actually controlling (safety purchased through indispensability)? What is my actual rate of reception — not my policy on it, my practice? In the platform, her force links to caution-graded Archive folios and the Atlas loops carrying the depletion signature.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Why is Chinnamastā shown holding her own head?',
        a: 'The image is a contemplative diagram, not a horror scene: the self-severed head is the discursive mind cut by its own owner — transcendence as self-sourcing, not imposed from outside. The haṭha-yogic reading takes the three blood streams as iḍā, piṅgalā and suṣumnā, making the whole icon a kundalinī circuit. The reading is classical commentary (graded interpretive), and it is the one the tradition itself prefers.',
      },
      {
        q: 'Why does she stand on a copulating couple?',
        a: 'Rati and Kāmadeva — the god and goddess of erotic desire — in union, beneath her feet: desire as the platform, not the enemy. The icon\u2019s claim: the energy that animates self-transcendence is the same vital-erotic current; the practice routes it rather than renouncing it. This is why her corpus belongs to the vīra (heroic) register, where desire is worked with directly.',
      },
      {
        q: 'Is Chinnamastā related to Vajrayoginī?',
        a: 'Yes — the closest cross-tradition parallel in the entire Mahāvidyā list. The self-severed-head motif (Chinnamastā in Hindu tantra; Vajravairoḍhanī/Vajrayoginī forms in Buddhist tantra) is shared iconography with overlapping contemplative function. Which direction the borrowing ran is a genuine scholarly debate; the entanglement itself is well-documented (Parīkṣā register).',
      },
      {
        q: 'What does the Chinnamastā loop look like in daily life?',
        a: 'The KALKI diagnostic: depletion-as-love. Giving that is structurally one-directional, identity that requires being needed, collapse arriving through the body when the circuit has run unbalanced too long. The Atlas separates it from ordinary generosity by the return-circuit test: can you receive without it feeling like theft? The Pattern Atlas folio carries the full behavioral signature.',
      },
    ],
  },

  /* ────────────────────── DHŪMĀVATĪ ────────────────────── */
  dhumavati: {
    title: 'Dhūmāvatī — Seventh Mahāvidyā, The Widow of Smoke | KALKI',
    description:
      'Dhūmāvatī decoded: the smoky widow, the inauspicious made divine, the teaching of the void — textual sources, symbolism, and the KALKI reading of the widowhood-of-the-soul loop.',
    intro: [
      'Dhūmāvatī is the seventh Mahāvidyā — the widow, the smoky one (dhūma = smoke), the only goddess in the pantheon depicted as old, ugly, destitute, and alone. She is inauspiciousness made divine: the tradition deliberately worships what every other form of the religion averts its eyes from — loss, loneliness, the season when nothing fruits.',
      'She is the hardest Mahāvidyā to explain and, for many practitioners, the one that finally makes the list make sense: the claim hidden in her form is that there is no state of life in which the ground is absent — not even this one.',
    ],
    sections: [
      {
        label: '01 · Identity & Textual Context',
        heading: 'The goddess who is what remains',
        paragraphs: [
          'Dhūmāvatī\u2019s textual home is the Dhūmāvatī-tantra and the Phetkārinī-tantra tradition; her origin myth (recorded in the Prāṇatoṣinī narrative) makes her Satī, burning herself in Dakṣa\u2019s fire — Dhūmāvatī is what is left: the smoke. Widowhood as cosmology: the goddess who outlived her own form. Her iconography is relentlessly unappealing by design — aged, wrinkled, white-sari widow, crow-bannered, perpetually hungry and thirsty, quarrelsome, seated unattended in a broken chariot.',
          'Textual register (Āgama): the sources are candid that she grants unusual boons — she is petitioned for solitariness, for the destruction of enemies by their own discord, and for shelter in deprivation — and equally candid that her worship stands outside the auspicious economies of ordinary household religion. KALKI grades her practice corpus MODERATE-to-HIGH caution (the tradition\u2019s own assessment), with the documentation explaining the architecture and leaving protocols gated.',
        ],
      },
      {
        label: '02 · Symbolism Decoded',
        heading: 'Smoke, the crow, the empty chariot',
        paragraphs: [
          'Smoke: the residue of fire — what Kālī\u2019s combustion leaves in the air; form dissolved, presence persisting. The tradition reads her smoke as the interval state: after a structure dies and before the next appears, that fog IS her body. The crow — her banner and her vāhana: the bird that eats what no one else will touch, the scavenger that thrives in every ecosystem\u2019s discarded layer: sustenance where others see only remains.',
          'The broken chariot: movement without propulsion — the carried-along state, agency suspended. Interpretive register (Pratibimba): the three images together define her domain precisely — the involuntary interval: unemployment, bereavement, the collapse of a plan that organized your identity, the decade that feels like standing water. She is worshipped not because the interval is good, but because it is where the tradition insists the goddess still, specifically, is.',
        ],
      },
      {
        label: '03 · The Teaching',
        heading: 'Śūnya with a face: the shelter of the void',
        paragraphs: [
          'The philosophical claim encoded in Dhūmāvatī: emptiness has two aspects — the terrifying (what you fear when you fear loss) and the sheltering (the same openness, once the flailing stops). Her practice aims at the swap: the tradition describes her gracing the practitioner with the gifts of the void — patience (time stops hurting when nothing is owed to it), discrimination (loss reveals which attachments were structural), and the strange contentment of needing nothing.',
          'Graded honestly: that a deliberate relationship with the void-state produces those gifts is Anubhāva — the testimony of practitioners who have done the practice inside actual loss, not around it. The tradition\u2019s boundary is precise: Dhūmāvatī is not grief-avoidance in exotic clothing; she is approached through the loss, not instead of it. Clinical grief work and this contemplative work are different instruments, and honest practice says which is which.',
        ],
      },
      {
        label: '04 · KALKI Diagnostic',
        heading: 'The loop she governs: widowhood-of-the-soul',
        paragraphs: [
          'In the KALKI framework, Dhūmāvatī governs the loop of inauspiciousness — the widowhood-of-the-soul: a life organized around an absence. Its signature: identity contracted to the loss (the career that ended, the person who left, the future that was cancelled) — kept alive as a residence; the reflex to find the grief-narrative in every present season; opportunity rendered invisible because the schedule of loss has no column for it. The loop\u2019s marker: the absence is not visited; it is inhabited.',
          'The diagnostic questions: Whose death am I still living as? (A person\u2019s — or a self\u2019s, a plan\u2019s, an era\u2019s?) What in this actual week is alive, and am I attending its funeral instead? What would the crow find here — what does this season contain that only its scavenger-layer reveals? Her Archive folios document the contemplative approach (caution-graded); the Atlas loop carries the behavioral signature — and the honest boundary: acute grief needs clinical care first; this is contemplative work for the interval that follows.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Why would anyone worship an ugly, inauspicious widow goddess?',
        a: 'Because that is precisely her teaching: the tradition is asserting there is no human state — including the ones religion usually cannot look at — where the divine ground is absent. Dhūmāvatī is inauspiciousness incorporated: loss, age, poverty, solitude, worshipped directly. Practitioners approach her inside those seasons. The worship is not affection for misery; it is the refusal to exile the ground from the worst room of the house.',
      },
      {
        q: 'What does her smoke represent?',
        a: 'Dhūma — smoke: the residue of fire. Her origin myth has her as Satī\u2019s remains after the pyre; symbolically, smoke is the interval state — after a form has burned and before the next has formed. She governs that fog: the bereaved season, the collapsed plan, the standing-water years. Her banner-bird, the crow, completes the icon: the scavenger that finds sustenance in what every other layer of the ecosystem discards.',
      },
      {
        q: 'Is working with Dhūmāvatī a substitute for grief therapy?',
        a: 'No — and the tradition\u2019s own boundary is precise here. Acute grief, especially traumatic loss, belongs with clinical care. Dhūmāvatī\u2019s contemplative work is for the interval that follows: the standing-water season, the identity question ("who am I after"), the relationship with the void itself. KALKI\u2019s documentation states this boundary on the relevant folios; conflating the two instruments would serve neither.',
      },
      {
        q: 'How is the Dhūmāvatī loop different from actual grieving?',
        a: 'Grieving processes a loss; the widowhood-of-the-soul loop residentializes it — identity contracted to the absence, kept as a residence rather than visited as an event. The Atlas diagnostic tests the difference behaviorally: does the loss-narrative select what you see in the present (opportunity rendered invisible), and does attending to what is actually alive this week feel like betrayal? If yes, the loop is running — and her contemplative protocols, the tradition\u2019s void-shelter work, are the documented counter-practice.',
      },
    ],
  },

  /* ────────────────────── BAGALĀMUKHĪ ────────────────────── */
  bagalamukhi: {
    title: 'Bagalāmukhī — Eighth Mahāvidyā, The Stambhanā Power | KALKI',
    description:
      'Bagalāmukhī decoded: the goddess who freezes, stambhana as the technology of stillness, the yellow and the tongue-grab — sources, symbolism, and the KALKI reading of the silenced loop.',
    intro: [
      'Bagalāmukhī is the eighth Mahāvidyā — "she whose face has the power to seize". Her specialty, stated without euphemism by the sources: stambhana — the paralysis, the freeze. In classical usage she is petitioned to stop lawsuits, silence slander, immobilize adversaries. In the contemplative register the tradition reads her more radically: the power to arrest movement itself — the pause between impulse and action where freedom actually lives.',
      'She is the only Mahāvidyā whose iconography shows a face-grab: she grips an adversary\u2019s tongue — the organ of speech, the instrument of the harm most often prayed about: the lie, the accusation, the word that outruns the truth.',
    ],
    sections: [
      {
        label: '01 · Identity & Textual Context',
        heading: 'The yellow one and the freeze',
        paragraphs: [
          'Bagalāmukhī\u2019s textual ground is the Brahmāstra-tantra and the Bagalāmukhī sections of the Rudrayāmala tradition; her worship centers on the stambhana applications the classical paddhatis catalog — immobilization of adversaries, neutralization of hostile speech, the stopping of harm in motion. Her color is unambiguous: yellow — pitāmbara, the golden-yellow garment; turmeric is her ritual substance (used across her worship as the emblem of the sun\u2019s arrested noon — fullness held static).',
          'Textual register (Āgama): she is one of the few Mahāvidyās whose folk-level practice (the "Pītāmbarā protection" petitions, widespread across North India) and whose formal tantric corpus both remain living. KALKI grades her practice corpus MODERATE caution at the documented level — the stambhana technologies are real instruments in the paddhatis and the documentation explains their mechanism honestly while leaving operative protocols gated.',
        ],
      },
      {
        label: '02 · Symbolism Decoded',
        heading: 'The seized tongue and the arrested moment',
        paragraphs: [
          'The icon: she grips an adversary\u2019s tongue with her right hand; his club (raised to strike) drops from a paralyzed hand; her left hand shows the boon gesture. Read technically: speech as the primary weapon-stream, arrested at the source; the aggression already in motion, stilled; the grace-note — the boon — offered by the same hand that does not strike. The adversary is not killed: he is stopped. Stambhana\u2019s ethic, embedded in the icon itself: neutralize, do not destroy.',
          'The yellow: the color of harvested ripeness — solar energy held at its peak rather than spent. Interpretive register (Pratibimba): Bagalāmukhī\u2019s whole symbol set is about containment of force at maximum charge — the tongue seized before the word, the club stopped mid-swing, the noon held before it declines. Contemplatively, the tradition reads her as the master-image for śamatha-adjacent stillness: the psyche\u2019s reactive machinery, seized, mid-impulse.',
        ],
      },
      {
        label: '03 · The Teaching',
        heading: 'Stambhana as a technology of the pause',
        paragraphs: [
          'The philosophical layer the tradition builds on her freeze: between stimulus and response there is a gap, and everything the path calls freedom lives there. Reactive life is continuous motion — word firing into word, action into consequence. Bagalāmukhī\u2019s stambhana is the deliberate cultivation of arrest: the practitioner learns to seize the rising impulse the way her icon seizes the tongue — at the root, before discharge. What the texts apply against external adversaries, the contemplative corpus applies against the internal ones: the reflex that speaks, the habit that strikes, the fear that flees.',
          'Graded honestly: the external-applications material (stambhana of enemies, lawsuits) is the tradition\u2019s own recorded use-case — presented as such, neither endorsed as mechanism nor dismissed as folklore: Āgama-recorded, mechanically unverified. The internal application is the one KALKI documents in practice terms — it is where the evidence (contemplative, cross-tradition: the pause-teachings recur across Buddhist, Yogic and Stoic sources) is strongest.',
        ],
      },
      {
        label: '04 · KALKI Diagnostic',
        heading: 'The loop she governs: the silenced voice',
        paragraphs: [
          'In the KALKI framework, Bagalāmukhī governs the loop of being silenced — the pattern of the frozen voice: the person whose speech arrests at the moments that matter (confrontation, negotiation, boundary-setting), whose yes means no, whose no arrives as silence, and who then runs the adversary\u2019s monologue in their own head for days. Its signature: the frozen meeting, the drafted-and-never-sent message, the comeback arriving three days late, and the specific self-contempt of someone who watched themselves not speak.',
          'The irony the tradition intends: the goddess of stambhana heals the frozen voice — because her technology is arrest, not suppression. The diagnostic questions: Whose voice is running in my head right now? At what age did speaking cost more than it returned? What is the smallest live sentence I have been freezing? In the platform, her force links to caution-graded Archive folios (voice, stambhana, the arrested-moment practices) and the Atlas loops carrying the freeze signature.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What does stambhana mean?',
        a: 'Arrest, paralysis, the freeze — one of the six classical ṣaṭ-karma actions of the tantric paddhatis. Applied: stopping hostile motion (speech, litigation, aggression). Contemplatively: the trained arrest of impulse in the gap between stimulus and response. Bagalāmukhī is the Mahāvidyā who embodies the technology — her icon shows it literally: the adversary\u2019s tongue seized, the raised club stilled.',
      },
      {
        q: 'Why is Bagalāmukhī associated with the color yellow?',
        a: 'Yellow (pitāmbara) is her ritual color across her worship: garments, turmeric offerings, the golden complexion. The traditional reading: harvested solar ripeness — energy held at fullness rather than discharged. The arrest-theme runs through the whole symbol set: the noon sun held before it declines, the peak state contained, force contained at maximum charge.',
      },
      {
        q: 'Do the "stop your enemies" practices actually work?',
        a: 'Stated honestly: the stambhana applications against external adversaries are extensively recorded in the paddhatis (Āgama register) and remain a major living folk-practice; their mechanism is not verified, and KALKI presents that material as tradition-recorded, not as established fact. The contemplative application — trained arrest of one\u2019s own reactive impulses — is where the evidence base is strong across multiple contemplative traditions, and it is the layer KALKI documents in operational terms.',
      },
      {
        q: 'How is the "silenced voice" loop related to a goddess of freezing?',
        a: 'By design, not irony. The Bagalāmukhī loop is the voice that freezes at load-bearing moments — confrontation, boundary, negotiation. Her technology is precisely trained arrest: seizure of the reactive machinery (the inner adversary\u2019s monologue included) at the root. The tradition\u2019s wager: the same muscle that freezes your voice can be re-trained to freeze the freeze — arrest the arrest, speak from the stilled state. Her Archive folios document the graded practices; the Atlas loop carries the behavioral signature.',
      },
    ],
  },

  /* ────────────────────── MĀTAṄGĪ ────────────────────── */
  matangi: {
    title: 'Mātaṅgī — Ninth Mahāvidyā, The Outcaste Voice | KALKI',
    description:
      'Mātaṅgī decoded: the ucchiṣṭa goddess of leftovers and transgression, the outcaste Sarasvatī, speech as power — sources, symbolism, and the KALKI reading of the outcaste-within loop.',
    intro: [
      'Mātaṅgī is the ninth Mahāvidyā — the outcaste goddess, the Tantric Sarasvatī: divinity dwelling deliberately in what the purity system rejects. Her iconography and mythology place her at the margins by design: she is Ucchiṣṭa-Cāṇḍālinī — the goddess of leftovers (ucchiṣṭa: the food that has touched the eater\u2019s mouth, rendered ritually impure by orthodox framing), of the caṇḍāla station the caste order placed at the bottom, of the voice that speaks from outside the gate.',
      'Her teaching, compressed: power does not live where the system filed it. Speech, art, and authenticity come from the residue the respectable world discards — and the tradition installs a goddess to prove it.',
    ],
    sections: [
      {
        label: '01 · Identity & Textual Context',
        heading: 'The goddess of the leftover',
        paragraphs: [
          'Mātaṅgī\u2019s textual ground includes the Śāradātilaka-tantra (her core bīja and forms), the Todala Tantra\u2019s Mahāvidyā list, and the Rāja-Mātaṅgī corpus; her mythology ties her to Mataṅga the sage and to the story of Pārvatī incarnating as a caṇḍāla huntress to test — and teach — Śiva\u2019s own son. Her defining cult-title: Ucchiṣṭa-Cāṇḍālinī — she who dwells in, and empowers from, the leftover and the outcaste station.',
          'Textual register (Āgama): her worship explicitly transgresses purity boundaries — offerings include ucchiṣṭa (eaten food), her practice locates power precisely in the impure, and the sources are unembarrassed about it. This makes her the sharpest internal critique the tradition possesses of its own purity apparatus: the goddess she is, is a standing argument against the system her worshippers live inside.',
        ],
      },
      {
        label: '02 · Symbolism Decoded',
        heading: 'The parrot, the veena, the polluted gift',
        paragraphs: [
          'Mātaṅgī\u2019s iconography overlays Sarasvatī (the goddess of speech, art, learning) with the marks the purity system forbids: dark-complexioned, dwelling at the margins, fed on leftovers, accompanied by the parrot — the mimic, the uncanny voice. She is called the Tantric Sarasvatī: the same domain (speech, music, knowledge) located in the opposite postcode — power from the gate\u2019s outside, not the temple\u2019s inside.',
          'Interpretive register (Pratibimba): the ucchiṣṭa is the philosophical key. Leftover food is matter that has crossed a boundary — between food and body, pure and impure — and the system\u2019s answer to boundary-crossing matter is exile. Mātaṅgī\u2019s answer: consecration. What the boundary system discards, she indwells. Read contemplatively: every authentic voice begins as residue — the experiences, truths and qualities that did not fit the presentable self\u2019s diet — and the discarded matter is exactly where the goddess and the art live.',
        ],
      },
      {
        label: '03 · The Teaching',
        heading: 'Speech as the transmissive edge',
        paragraphs: [
          'The tradition assigns Mātaṅgī the domain of vāk — speech — in its most literal registers: eloquence, music, persuasion, the arts. The philosophical claim: speech is the karma-indriya closest to thought — the edge where interiority transmits — and therefore the precise place where authenticity is won or lost. The fabricated voice (the presentable self\u2019s dialect) transmits nothing; the ucchiṣṭa voice (the one that has actually eaten life) transmits instantly — which is why her practitioners include poets, musicians, and teachers across the tradition\u2019s history.',
          'Graded honestly: the claim that voice-power concentrates at the margins is the tradition\u2019s standing testimony (Anubhāva) and a standing sociological observation — the art that outlives an era is disproportionately made by its boundary-crossers. KALKI keeps the two claims distinct: the contemplative mechanism (authenticity as transmission) is documentable; the metaphysical garnish is the tradition\u2019s poetry, presented as its poetry.',
        ],
      },
      {
        label: '04 · KALKI Diagnostic',
        heading: 'The loop she governs: the outcaste within',
        paragraphs: [
          'In the KALKI framework, Mātaṅgī governs the loop of the transgressive voice — the outcaste within: the person whose authentic register was exiled early (the family where feeling was too much, the school where the accent was wrong, the profession where the real vocabulary is forbidden) and whose speech has run on the presentable dialect ever since. Its signature: fluency that feels like costume; the exhaustion of code-switching as a baseline; creativity that stalls at the threshold of the true material; the specific loneliness of being praised for the imitation.',
          'The diagnostic questions: What register did I speak before I learned this one? What do I actually know that I have never said in the presentable dialect? Where is my residue — the discarded experiences — and who told me they were impure? Her Archive folios document the voice practices (caution-graded); the Atlas loop carries the behavioral signature. The tradition\u2019s promise, via her ucchiṣṭa logic: the exile ends by consecration, not by debate — the material is retrieved by use, not by permission.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Why is Mātaṅgī called the goddess of leftovers?',
        a: 'Her cult-title Ucchiṣṭa-Cāṇḍālinī names it: ucchiṣṭa is food that has crossed the eater\u2019s mouth — ritually impure under the orthodox framing — and she deliberately indwells it. The teaching is architectural: power lives where the purity system says it cannot. Her worship uses the transgression itself as the instrument, which makes her the tradition\u2019s sharpest internal critique of its own purity apparatus.',
      },
      {
        q: 'Is Mātaṅgī the same as Sarasvatī?',
        a: 'Same domain, opposite station — the tradition calls her the Tantric Sarasvatī: speech, music, and knowledge located at the outcaste margin rather than the brahminical center. Dark where Sarasvatī is white, fed on leftovers where Sarasvatī is fed on purity, accompanied by the parrot (the uncanny, mimicking voice) where Sarasvatī has the swan (the discriminating one). The pairing is deliberate commentary: the same power, documented from both banks of the boundary.',
      },
      {
        q: 'What does "the outcaste within" mean as a pattern?',
        a: 'The KALKI diagnostic: an authentic register of self exiled early — by family, class, profession — and speech running on the presentable dialect ever since. Fluency-as-costume, code-switching exhaustion, creativity that cannot reach the true material. The loop is the mirror-image of the goddess herself: what she consecrates (the residue), the loop keeps exiled. The Atlas folio carries the full behavioral signature and the retrieval questions.',
      },
      {
        q: 'Is Mātaṅgī worship connected to the caste system?',
        a: 'Inversely — and this is the historically striking part. Her cult stations power at the caṇḍāla margin and sacralizes the impure, which functions as an internal critique of the purity hierarchy her worshippers inhabited. Scholars read the Mahāvidyā\u2019s margins generally (Mātaṅgī, Dhūmāvatī, Chinnamastā\u2019s transgressive registers) as the tradition\u2019s own pressure-valves against orthodoxy. That is commentary (Parīkṣā/Pratibimba registers), not apology for the caste order — it documents where the tradition argued with itself.',
      },
    ],
  },

  /* ────────────────────── KAMALĀ ────────────────────── */
  kamala: {
    title: 'Kamalā — Tenth Mahāvidyā, The Lotus Goddess | KALKI',
    description:
      'Kamalā decoded: the Tantric Lakṣmī, prosperity as the tenth doorway, the lotus mechanics of grounded abundance — sources, symbolism, and the KALKI reading of prosperity-without-integration.',
    intro: [
      'Kamalā is the tenth Mahāvidyā — Kamalātmikā, "the lotus-soul", the Tantric Lakṣmī. She closes the sequence as its most serene figure: golden, lotus-seated, flanked by elephants, the goddess of prosperity, fertility, and material grace. No gore, no widowhood, no severed heads — which is exactly why the tradition placed her last.',
      'The Mahāvidyā sequence is a curriculum, and its final exam is this: after nine doorways have dismantled every false relationship you have with power, voice, desire, and loss — can you hold abundance without losing the plot? Kamalā is the prosperity test.',
    ],
    sections: [
      {
        label: '01 · Identity & Textual Context',
        heading: 'The Tantric Lakṣmī',
        paragraphs: [
          'Kamalā\u2019s textual ground in the Mahāvidyā corpus (Todala Tantra and allied lists) presents her as the tenth vidyā — functionally Lakṣmī drawn into the Śākta tantric frame: the same lotus-goddess of Vaiṣṇava devotion, documented here with bīja, yantra, and tantric methodology. Her iconography is the pantheon\u2019s gentlest: four or ten arms bearing lotuses, elephants flanking (the gaja-lakṣmī motif of royal abundance), full-bodied, golden, smiling.',
          'Textual register (Āgama): her placement last is documented in the Mahāvidyā lists themselves, and the traditional commentary reads it pedagogically — the sequence runs from severance (Kālī) through every confrontation the path requires and terminates in grace. The claim is directional: prosperity is not rejected by this path; it is de-toxified and returned at the end.',
        ],
      },
      {
        label: '02 · Symbolism Decoded',
        heading: 'The lotus is the whole teaching',
        paragraphs: [
          'The lotus: rooted in mud, growing through water, opening above the surface — unstained by any layer it passed through. Classical commentary reads it as the complete diagram of right relationship with the material: rooted (in the mud of conditions, unashamed), traversing (the waters of desire without drowning), open (to the light, unsullied by the route). The elephants: abundance that arrives with thunder — rain-bearing, royal, large. The gold: weight — prosperity as gravity, not glitter.',
          'Interpretive register (Pratibimba): set beside her sisters, Kamalā\u2019s serenity is the argument. Kālī\u2019s severance without Kamalā\u2019s integration produces the spiritual-bypass ascetic (renunciation as avoidance); Kamalā without Kālī produces the prosperity-preacher (abundance as anesthesia). The sequence\u2019s last word: both, in order, held together.',
        ],
      },
      {
        label: '03 · The Teaching',
        heading: 'Artha dignified: money as a spiritual instrument',
        paragraphs: [
          'The philosophical weight the tradition places on Kamalā: the dignification of artha — material well-being — as a legitimate stage of the path rather than its enemy. The puruṣārtha frame (dharma, artha, kāma, mokṣa) never demonized wealth; the Mahāvidyā sequence operationalizes the relationship: abundance handled with lotus-mechanics (rooted, traversed, open) supports practice — the endowed practitioner feeds the temple, funds the lineage, sustains the family, and does not mistake the gilding for the practice.',
          'Graded honestly: the tradition\u2019s prosperity practices (Lakṣmī sādhanā of every register) carry the usual spectrum — from documented devotional disciplines (Anubhāva-rich) to the transactional folklore that promises returns (which KALKI documents as folklore, not mechanism). The honest line: practice reorganizes the practitioner\u2019s relationship with wealth reliably; whether it reorganizes the wealth is the folklore question the tradition itself is fond of asking back.',
        ],
      },
      {
        label: '04 · KALKI Diagnostic',
        heading: 'The loop she governs: prosperity-without-integration',
        paragraphs: [
          'In the KALKI framework, Kamalā governs the loop of prosperity-without-integration — the pattern of material life running on a severed chassis. Its signature in the over-integrated direction: the earner whose identity is the income (self-worth pegged to the number, rest outsourced); in the under-integrated direction: the spiritualized renouncer whose finances are a standing emergency (poverty as credential, abundance as contamination). Both are the same loop — the number and the soul, unacquainted.',
          'The diagnostic questions: If my income doubled tomorrow, what would break first — and what does that answer say is actually unintegrated? Where am I purchasing worth (through excess) or purchasing virtue (through refusal)? What would lotus-mechanics change first: the earning, the spending, or the shame? Her Archive folios document the graded Lakṣmī-line practices; the Atlas loop carries the behavioral signature. The final Mahāvidyā\u2019s final diagnostic: abundance held without anesthesia, renunciation held without debt — the lotus grows in the mud and opens in the light, and skips neither layer.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Kamalā just Lakṣmī under another name?',
        a: 'Functionally yes, contextually no. Kamalā (Kamalātmikā — "lotus-souled") is Lakṣmī absorbed into the Mahāvidyā framework, with tantric bīja, yantra and methodology documented alongside. The placement matters: as the tenth Mahāvidyā she closes a sequence that began with Kālī\u2019s severance — which reframes prosperity as the path\u2019s terminus, not its starting fantasy.',
      },
      {
        q: 'Why is the prosperity goddess placed LAST in a fierce pantheon?',
        a: 'Because the sequence is a curriculum: severance, crossing, desire confronted, ground established, fire, circuit, void, freeze, voice — and only after all nine: abundance, as a test. The traditional reading is pedagogical — prosperity handled before the ego-work is the anesthesia loop; prosperity handled after is grace. The placement is the warning and the promise at once.',
      },
      {
        q: 'What does the lotus symbolize in her iconography?',
        a: 'The complete mechanics of right relationship with the material: rooted in the mud (conditions, unashamed), traversing the water (desire, without drowning), opening above the surface (light, unstained by the route). Every Kamalā image is the same three-sentence teaching. The elephant motif adds abundance\u2019s nature: thunderous, rain-bearing, royal — weight rather than glitter.',
      },
      {
        q: 'What is the "prosperity-without-integration" loop?',
        a: 'The KALKI diagnostic for a severed money-soul relationship, in either direction: identity pegged to income (worth = number) or identity pegged to refusal (poverty as spiritual credential). Both sever the same circuit. The Atlas diagnostic runs the doubling question — what would break if income doubled tomorrow? — and the shame question, since the loop\u2019s fuel is usually worth-purchase in one direction or virtue-purchase in the other.',
      },
    ],
  },
};

