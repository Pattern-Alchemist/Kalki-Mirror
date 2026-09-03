// =============================================================
// KALKI — TANTRA EDUCATIONAL CLUSTER (Phase A, spec §7)
// -------------------------------------------------------------
// The /tantra route is RECLAIMED from its former 308 (→ /practice)
// and becomes the serious educational hub for the "what is tantra"
// query family. Anti-cannibalization (spec §8): /tantra/* owns the
// INFORMATIONAL tantra queries; /aghori-tantra keeps the course
// pitch; /practice stays the noindexed application.
// Each entry individually authored; no template text. Claims about
// tradition graded honestly (Āgama = textual, Anubhāva = testimony,
// Parīkṣā = cross-source, Pratibimba = interpretive).
// =============================================================

export interface TantraSection {
  label: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface TantraFaq {
  q: string;
  a: string;
}

export interface TantraPage {
  slug: string;
  path: string;
  topic: string;
  title: string;
  description: string;
  label: string;
  h1: string;
  h1Accent?: string;
  intro: string[];
  sections: TantraSection[];
  faqs: TantraFaq[];
  related: { href: string; label: string }[];
}

/* ───────────────────────────── HUB ───────────────────────────── */

export const tantraHub: TantraPage = {
  slug: '',
  path: '/tantra',
  topic: 'tantra-hub',
  title: 'What Is Tantra? The Tradition, Decoded | KALKI',
  description:
    'Tantra decoded without the clichés: the loom etymology, the textual corpus, what tantric practice actually is — and what it is not. The educational hub for the KALKI platform.',
  label: 'The Tradition · Educational',
  h1: 'Tantra is not what',
  h1Accent: 'the internet told you.',
  intro: [
    'Ask the internet what tantra is and you get two answers, both wrong. The first is the New Age flattening — tantra as exotic sexuality, candle-lit weekends, "sacred union" workshops. The second is the horror flattening — tantra as black magic, skull-cups, and curses. Neither survives contact with the actual tradition: a vast, technically documented body of practice literature — the Āgamas and Tantras — that has shaped Hindu and Buddhist contemplative life for over fifteen centuries.',
    'The word itself is the first correction. Tantra (तन्त्र) means loom, warp — "that which is woven" — and by extension a system, a technology, a framework of threads. The tradition chose the metaphor deliberately: tantric practice is weaving — the deliberate integration of body, breath, sound, image, and ritual into one fabric where ordinary life is the material, not the obstacle. KALKI\u2019s entire method descends from that premise.',
  ],
  sections: [
    {
      label: '01 · The Family',
      heading: 'Three streams, one architecture',
      paragraphs: [
        'The tantric traditions divide historically into streams that share an architecture while differing in emphasis: the Śaiva stream (worship and yoga centered on Śiva, culminating in the nondual schools of Kashmir — see the Kashmiri Shaivism page), the Śākta stream (the Goddess as supreme — the tradition of the ten Mahāvidyās, Śrī Vidyā, and the devi-worship lineages), and the Buddhist Vajrayāna (the tantric vehicle that carried much of the shared technology — mantra, maṇḍala, deity-yoga — into Tibet).',
        'What they share is the method-typology the scholar-teachers themselves used: practice through mantra (sound), yantra and maṇḍala (sacred geometry), deity-yoga (embodied identification with a chosen force), breath and body discipline, and ritual — all graded by the readiness (adhikāra) of the practitioner. The KALKI platform documents the Śākta and Aghorī registers of this architecture with evidence grades.',
      ],
    },
    {
      label: '02 · The Corpus',
      heading: 'What the source texts actually are',
      paragraphs: [
        'The tantras are not one book. They are a literature: dozens of Sanskrit texts — the Śaiva Āgamas, the Śākta tantras (Todala, Rudrayāmala, Kālikā Purāṇa\u2019s tantric strata), the Buddhist tantras — composed largely between roughly the 6th and 14th centuries CE, each a mix of theology, ritual protocol, yoga methodology, and lineage record. Add to these the commentarial classics (Abhinavagupta\u2019s Tantrāloka; the Karpūrādi-stotra\u2019s commentary tradition) and you have one of the largest contemplative libraries on earth.',
        'Two honest notes on sources. First, dating is contested and the tradition itself layers composition — a text "of" the 9th century may carry 12th-century strata; scholarly claims here are stated as scholarly claims. Second, accessibility varies wildly: some tantras are published and translated; others survive in manuscript, and some remain transmitted-in-lineage by the tradition\u2019s own rule. KALKI\u2019s Archive grades each folio\u2019s sources accordingly — you always know what rests on published text versus lineage testimony.',
      ],
    },
    {
      label: '03 · The Misreadings',
      heading: 'Neither the bedroom nor the graveyard',
      paragraphs: [
        'The sexual flattening deserves a technical correction rather than a blush. The tradition does work with desire as an energy — the Chinnamastā iconography stands on Rati and Kāmadeva, and vīra-register practices engage the vital-erotic current directly — but as one current among many, routed through discipline, not romanticized into self-help. The Western "tantric sex" industry is a 20th-century invention with a thin citation chain back to the sources; presenting it as tantra is presenting a candle-factory as an electrical grid.',
        'The dark flattening: yes, the corpus contains the ṣaṭ-karma — six classical action-technologies including forms of subjugation and hostile magic — and KALKI documents that fact honestly (see the karma map). But that register is a minority wing inside a tradition whose mainstream is nondual metaphysics, mantra-yoga, and devotional practice; defining tantra by its hex registry is defining chemistry by gunpowder. The platform\u2019s evidence grades exist precisely so the sensational and the textual never blur.',
      ],
    },
    {
      label: '04 · The Map on This Platform',
      heading: 'Where to go inside KALKI',
      paragraphs: [
        'This hub anchors the educational cluster: what tantra is (this page), how its meditation actually works, how it relates to yoga, and its two great streams — the Goddess-centered Śākta tradition and the nondual Śaivism of Kashmir. The commercial and application surfaces live elsewhere and are linked, not duplicated: the Aghorī Tantra course is the structured curriculum; the Akashic Archive holds the evidence-graded sādhana folios; the Pattern Atlas is the behavioral diagnostic; and consultations with Kaustubh are the personal layer.',
      ],
      bullets: [
        '/tantra/what-is-tantra — the definitional deep-dive',
        '/tantra/tantric-meditation — how the practice actually works',
        '/tantra/tantra-and-yoga — the interlace, honestly mapped',
        '/tantra/shakta-tantra — the Goddess-centered stream',
        '/tantra/kashmiri-shaivism — the nondual Śaiva philosophy',
        '/aghori-tantra — the structured course (separate surface)',
      ],
    },
  ],
  faqs: [
    {
      q: 'What does the word "tantra" actually mean?',
      a: 'Loom, warp — "that which is woven" — and by extension: system, framework, technology. The tradition uses the weaving metaphor as a method statement: tantric sādhanā weaves body, breath, sound, image, and ritual into one integrated fabric, with ordinary life as the material. Later commentaries also derive it as tan (to expand) + tra (instrument) — "the instrument of expansion" — a devotional reading layered on the technical one.',
    },
    {
      q: 'Is tantra a religion?',
      a: 'It is a method-family that lives inside religions — primarily Śaiva Hinduism, Śākta Hinduism, and Buddhist Vajrayāna — rather than a religion of its own. The tantras supply technologies (mantra, yantra, deity-yoga, breath, ritual) that each host tradition deploys around its own theology. This is why a Śākta practitioner, a Śaiva, and a Vajrayāna Buddhist can share methodology while holding different metaphysics.',
    },
    {
      q: 'Is tantric practice dangerous?',
      a: 'Graded answer. The open registers — mantra japa, breath discipline, devotional and contemplative practice — are as safe as any serious contemplative discipline. The intense registers (vīra-mode work, high-charge bīja practice, the ṣaṭ-karma\u2019s hostile wing) are gated by the tradition itself with real justification: psychological destabilization is a documented failure mode when intensity exceeds readiness. KALKI carries the tradition\u2019s gates (OPEN / MODERATE / HIGH / SEALED) on every folio rather than pretending they do not exist.',
    },
    {
      q: 'Can I practice tantra without a guru?',
      a: 'You can begin — mantra japa, breath, study, and the open contemplative registers are documented and self-startable, and KALKI\u2019s Archive is built to make that start honest. The tradition\u2019s own position is that transmission-grade practice (initiation, advanced bīja, the gated registers) requires a qualified teacher — a position KALKI does not dilute, and the reason its Lineage Introduction exists for practitioners who genuinely reach that ground. What no serious source offers: guru-avoidance as ideology, or guru-dependence as business. Both are marketplace distortions.',
    },
  ],
  related: [
    { href: '/aghori-tantra', label: 'The Aghorī Tantra Course' },
    { href: '/archive', label: 'The Akashic Archive' },
    { href: '/karma', label: 'The Karma Map' },
  ],
};

/* ──────────────────────── CHILD PAGES ──────────────────────── */

export const tantraPages: TantraPage[] = [
  {
    slug: 'what-is-tantra',
    path: '/tantra/what-is-tantra',
    topic: 'tantra:what-is-tantra',
    title: 'What Is Tantra? Definition, History & Texts | KALKI',
    description:
      'A serious definition of tantra: the loom etymology, 1,500 years of textual history, the three streams, what tantric practice actually consists of — and the two misreadings corrected.',
    label: 'Foundations · Definition',
    h1: 'A working definition',
    h1Accent: 'of tantra.',
    intro: [
      'Tantra is the name for a family of practice-systems — Hindu and Buddhist — that emerged as a distinct, documented tradition in roughly the first millennium CE and went on to reshape both religions. Its method: the deliberate weaving (tantra — loom, warp) of body, breath, sound, image, and ritual into a single technology of transformation, in which ordinary experience is the substrate of practice rather than its rival.',
      'This page is the definitional deep-dive the hub gestures at: the history in outline, the textual corpus, the shared architecture of the streams, and the precise reasons both popular misreadings — the bedroom and the graveyard — fail as descriptions.',
    ],
    sections: [
      {
        label: '01 · History in Outline',
        heading: 'From the early medieval turn to today',
        paragraphs: [
          'Scholars generally date the tantric turn to the mid-first millennium CE — the earliest recognizably tantric texts and inscriptional evidence cluster in the 6th–9th centuries — with the tradition reaching its classical creative peak between the 9th and 12th (the age of Abhinavagupta in Kashmir, of the great Śākta and Buddhist tantras) and diffusing across South and Southeast Asia thereafter. The later story includes formalization (the Nāth lineage, the Śrī Vidyā ordering), suppression-era contraction, and the 20th-century re-emergence — both academic (the great manuscript surveys) and popular (including, regrettably, the New Age rebrand).',
          'Stated as scholarship: dating and diffusion are active research areas, and the tradition\u2019s own self-accounting (texts claiming timeless revelation) runs deliberately against philological dating. KALKI holds both registers apart: Āgama claims are the tradition\u2019s voice; the history above is the scholarly one.',
        ],
      },
      {
        label: '02 · The Shared Architecture',
        heading: 'Five technologies, one grammar',
        paragraphs: [
          'Across the streams, tantric practice runs on a shared grammar — five technology families the texts themselves classify. Mantra: sound as operative instrument, from the great seed-syllables (bīja) to full liturgies. Yantra and maṇḍala: sacred geometry as cognitive technology — diagrams that map a force\u2019s architecture (the Śrī Cakra is the most famous). Deity-yoga: the disciplined identification with a chosen force (iṣṭa-devatā), bodying forth its qualities. Breath and body: prāṇāyāma and the subtle-body work (nāḍī, cakra, kuṇḍalinī) that haṭha methodology inherited from tantra. And ritual: the choreographed enactment — pūjā, homa, the initiatory sequences.',
          'The grammar is graded: the tradition sorts practices and practitioners by adhikāra — readiness — and gates its intense registers accordingly. That grading instinct is the tradition\u2019s most under-copied feature and the one KALKI borrows most completely.',
        ],
      },
      {
        label: '03 · The Two Misreadings, Corrected',
        heading: 'What tantra is not',
        paragraphs: [
          'Not the bedroom: the "sacred sexuality" industry cites a thread of the tradition (the vīra registers\u2019 engagement with desire; the kula rites of certain lineages) while severing it from its discipline, its grading, and its metaphysics — a citation pattern scholars have traced cleanly to 19th–20th century rewrites, not to the Sanskrit corpus. The tradition\u2019s actual treatment of desire is more interesting: an energy to be routed (see Chinnamastā), neither indulged nor demonized.',
          'Not the graveyard: the ṣaṭ-karma\u2019s hostile wing is textually real and platform-documented — and a minority register inside a literature dominated by metaphysics, yoga, and devotion. The cremation-ground imagery that scares the squeamish is, in the sources, primarily pedagogy: the deliberate classroom of impermanence. Fear was never the curriculum; familiarity with death was.',
        ],
      },
    ],
    faqs: [
      {
        q: 'When did tantra begin?',
        a: 'Scholarly consensus places the emergence of recognizably tantric texts and practice communities in roughly the 6th–9th centuries CE, with classical florescence 9th–12th. The tradition\u2019s own texts claim timeless, revealed origin — a claim KALKI reports as the tradition\u2019s claim rather than endorsing or dismissing. Both registers appear throughout the Archive, graded accordingly.',
      },
      {
        q: 'What are the main tantric texts?',
        a: 'The Śaiva Āgamas (28 principal tantras in the classical listing), the Śākta corpus (Todala Tantra, Rudrayāmala, Kālikā Purāṇa strata, Yoni-tantra and others), the Buddhist tantras (Hevajra, Guhyasamāja, Kālacakra), plus commentarial classics — Abhinavagupta\u2019s Tantrāloka chief among them — and practice stotras like the Karpūrādi-stotra. Access varies from fully published-and-translated to manuscript-only to lineage-transmitted, which is why KALKI grades source accessibility folio by folio.',
      },
      {
        q: 'Is tantra Hindu or Buddhist?',
        a: 'Both, and neither exclusively. The same technology-family (mantra, maṇḍala, deity-yoga, subtle-body yoga) runs through Śaiva and Śākta Hinduism and Buddhist Vajrayāna, with shared imagery (Tārā/Chinnamastā crossover is the textbook case) and cross-borrowing documented by scholarship. The metaphysical wrapping differs by religion; the methodological skeleton is recognizably one tradition of practice.',
      },
      {
        q: 'What is the difference between tantra and tantric yoga?',
        a: 'Yoga names the technology; tantra names the system that deploys it. Tantric yoga is precisely the yogic methodology the tantras codified — the subtle-body map (nāḍī, cakra, kuṇḍalinī), bīja-mantra practice, deity-yoga — much of which later entered haṭha yoga and modern postural yoga by inheritance. See the tantra-and-yoga page for the full interlace.',
      },
    ],
    related: [
      { href: '/tantra/tantric-meditation', label: 'Tantric Meditation' },
      { href: '/tantra/tantra-and-yoga', label: 'Tantra & Yoga' },
      { href: '/tantra/shakta-tantra', label: 'Śākta Tantra' },
    ],
  },
  {
    slug: 'tantric-meditation',
    path: '/tantra/tantric-meditation',
    topic: 'tantra:tantric-meditation',
    title: 'Tantric Meditation — How the Practice Actually Works | KALKI',
    description:
      'What distinguishes tantric meditation from generic mindfulness: bīja-mantra, deity-yoga, the subtle body, and samāveśa — the graded mechanics, honestly documented.',
    label: 'Practice · Method',
    h1: 'Tantric meditation:',
    h1Accent: 'not relaxation with deities.',
    intro: [
      'Strip the mystique and tantric meditation is a precise set of contemplative technologies with a distinctive thesis: consciousness is not best approached by emptying alone, but by informed engagement — sound, image, breath, and imagination deployed as instruments, graded by readiness. Where mindfulness observes what arises, the tantric practitioner deliberately shapes what arises, until the shaping itself dissolves into absorption (the tradition\u2019s word: samāveśa).',
      'This page documents the actual mechanics — bīja-mantra, deity-yoga, the subtle-body frame — with the tradition\u2019s own grading respected, and the honest caveats where the claims are testimony rather than verified mechanism.',
    ],
    sections: [
      {
        label: '01 · Bīja-Mantra',
        heading: 'Sound as instrument, not decoration',
        paragraphs: [
          'The seed-syllables (bīja) — oṁ, hrīṃ, śrīṃ, krīṃ, and their kin — are the tradition\u2019s most concentrated instruments. The mechanics as the texts specify them: a bīja is repeated (japa) with attention at a designated locus in the body, at prescribed counts, through prescribed durations; the sound functions as both anchor (occupying the discursive mind) and entrainment (tuning attention to a defined quality — hrīṃ to the space-appearance field, krīṃ to the severing current). The tradition treats incorrect practice as merely ineffective; the gradings exist because intensity compounds.',
          'Graded honestly: that structured japa reliably stabilizes attention is cross-tradition consensus (and mirrors what attention research calls focused-attention training). That specific bījas carry specific energetic charges is the tradition\u2019s standing testimony (Anubhāva) — real in practice reports, not laboratory-verified. KALKI\u2019s Archive keeps the registers labeled so you always know which claim you are standing on.',
        ],
      },
      {
        label: '02 · Deity-Yoga',
        heading: 'Embodied identification with a force',
        paragraphs: [
          'Deity-yoga (the Buddhist term; the Hindu streams say iṣṭa-devatā practice) is the tradition\u2019s signature move: the practitioner generates — with increasing stability — the felt embodiment of a chosen contemplative force (Kālī\u2019s severance, Tārā\u2019s rescue, Tārā\u2019s Buddhist counterparts, and so on), using visualization, mantra, and ritual gesture. The philosophical justification is the tradition\u2019s nondualism: if the force is a real structure of consciousness, its disciplined embodiment is not pretending — it is rehearsing a recognition.',
          'The failure modes are documented too, which is why grading exists: fantasy-spirals (practice as daydream), inflation (identifying with the icon\u2019s power without its discipline), and bypass (using the imagery to avoid the pattern-work). The tradition\u2019s guard is structural — visualization is always paired with dissolution (the deity dissolves back into the practitioner\u2019s own nature), and the sequence is taught in stages.',
        ],
      },
      {
        label: '03 · The Subtle Body',
        heading: 'The map: nāḍī, cakra, kuṇḍalinī',
        paragraphs: [
          'Tantric meditation\u2019s cartography is the subtle body: the nāḍī channels (iḍā, piṅgalā, suṣumnā), the cakra junctions, and the kuṇḍalinī — the coiled potential at the base that the practices aim to raise through the central channel. The map is operative, not anatomical: the tradition never claimed dissection would find the cakras; it claims that attention trained on this map produces the described effects — warmth, movement, dissolution-events — reliably enough to build a technology on.',
          'Modern readers should hold two facts together. The phenomenology is real and reproducible in practice communities (extensively reported, cross-tradition — Anubhāva); the map\u2019s metaphysical literalism is contested within the tradition itself. And the safety note is the tradition\u2019s own: intense kuṇḍalinī work sits in the HIGH-caution registers precisely because the phenomenology can destabilize unprepared practitioners — a gate KALKI does not bypass.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How is tantric meditation different from mindfulness?',
        a: 'Different thesis, not different planet. Mindfulness trains choiceless observation of what arises; tantric meditation deliberately shapes what arises — through sound, image, and breath — toward defined contemplative forces, then lets the shaping dissolve into absorption. They also differ in substrate: tantra works explicitly with the subtle-body map and devotion, which secular mindfulness brackets. The two are complementary; many serious practitioners run both.',
      },
      {
        q: 'Can I learn tantric meditation from a website?',
        a: 'The open registers — japa with published mantras, breath discipline, contemplative reading — genuinely can be started from documentation, which is why KALKI\u2019s Archive exists. The intense registers (advanced bīja work, kuṇḍalinī protocols, deity-yoga at vīra intensity) are gated by the tradition with documented reasons: assessment of readiness is part of the technology. A site that sells you the gated registers online with no assessment is selling past the tradition\u2019s own safety rail.',
      },
      {
        q: 'What is samāveśa?',
        a: 'The Kashmiri Śaiva term for absorption — the " plunging-in" states where ordinary subject-object structure relaxes and the practitioner\u2019s awareness merges with the contemplative support. The tradition grades samāveśa (from momentary dips to the sustained absorption of the advanced practitioner) and treats these states as the practice\u2019s actual deliverable — see the Kashmiri Shaivism page for the nondual frame that makes the grading coherent.',
      },
      {
        q: 'How long before tantric meditation "does something"?',
        a: 'The honest answer: the stabilizing effects (attention, affect regulation, the felt shift the tradition calls sattva) typically register within weeks of daily practice — this matches cross-tradition contemplative consensus. The distinctive tantric claims (energetic phenomena, deity-yoga\u2019s felt presence) vary enormously by person and practice, and the tradition itself warns against chasing them as benchmarks — the texts treat experiences (kriyā) as weather, not attainment. Chasing phenomena is its own documented failure mode.',
      },
    ],
    related: [
      { href: '/tantra/what-is-tantra', label: 'What Is Tantra' },
      { href: '/archive', label: 'The Archive — Graded Practices' },
      { href: '/breathwork', label: 'Prāṇāyāma Protocols' },
    ],
  },
  {
    slug: 'tantra-and-yoga',
    path: '/tantra/tantra-and-yoga',
    topic: 'tantra:tantra-and-yoga',
    title: 'Tantra & Yoga — The Real Relationship, Mapped | KALKI',
    description:
      'Tantra and yoga: rivals, synonyms, or inheritance? The historical interlace — how haṭha yoga descended from tantric methodology, and what each tradition does best today.',
    label: 'Comparisons · History',
    h1: 'Tantra and yoga:',
    h1Accent: 'the inheritance nobody mentions.',
    intro: [
      'The public imagines yoga and tantra as different planets — yoga pure, tantra weird. The textual history says otherwise: the yoga most people practice today is, by documented inheritance, a descendant of tantric methodology. The haṭha-yoga corpus — the texts that first systematized the postures, breath ratios, and subtle-body work now globally practiced — is itself tantric literature: written within tantric lineages, using tantric maps (nāḍī, cakra, kuṇḍalinī), for tantric aims.',
      'This page maps the interlace honestly: what each tradition took from the other, what the differences actually are, and why the distinction still matters for a practitioner choosing a path today.',
    ],
    sections: [
      {
        label: '01 · The Historical Interlace',
        heading: 'How the currents braided',
        paragraphs: [
          'The Patañjali yoga of the Yoga Sūtras (classical, pre-tantric in orientation) built its edifice on Sāṃkhya metaphysics and ascetic discipline — little ritual, no subtle-body map as later understood, no bīja-mantra. The tantric turn (from roughly the mid-first millennium CE) rewired the contemplative economy: deity-yoga, mantra as operative technology, the subtle body as the practice arena, and — crucially — the world-affirming stance (the body as instrument, not prison).',
          'The haṭha-yoga corpus (the Amṛtasiddhi, the Gorakṣa-śataka tradition, the Haṭha Yoga Pradipikā) emerges from precisely that tantric-Nāth matrix: its techniques — prāṇāyāma ratios, bandha and mudrā, the kuṇḍalinī ascent through the cakras — are tantric technology inside a body-positive frame. Stated as scholarship: this descent is mainstream history-of-yoga; the "yoga is purely Vedic, tantra is a late corruption" story survives in marketing, not in the literature.',
        ],
      },
      {
        label: '02 · The Practical Differences',
        heading: 'What each tradition does best',
        paragraphs: [
          'Where the methods differ in emphasis. Classical (Patañjali) yoga: a purificational ladder — restraint, observance, posture, breath, withdrawal, concentration, meditation, absorption — aiming at the isolation of pure awareness (puruṣa) from nature (prakṛti). Its genius: systematic psychological clarity; its grammar is renunciatory. Tantra: the world-affirming grammar — body, desire, sound, and image engaged as instruments, aiming at recognition and integration; its genius is engagement with the energies the classical frame tries to still.',
          'Modern postural yoga sits downstream of the haṭha (hence tantric) corpus but re-aims the technology at health and fitness. That is not a slur — it is a different contract. What the comparison means practically: if you want systematic mind-training with a renunciatory spine, the classical frame is precise. If you want the energy-body methodology with its devotional and ritual arms, that is the tantric inheritance — and calling it by its own name is the first act of respect.',
        ],
      },
      {
        label: '03 · The KALKI Position',
        heading: 'One body, both maps, honest grading',
        paragraphs: [
          'KALKI\u2019s platform runs on the tantric side of the inheritance — the Mirror Method\u2019s diagnostic, the sādhana corpus, the breath protocols — while teaching the classical frame accurately wherever it appears (the Lexicon carries both vocabularies). The reason is practical, not partisan: the pattern-work this platform does targets the loops as they live — in energy, affect, and behavior — which is the arena the tantric grammar was built for.',
          'The honest boundary: this is a selection, not a hierarchy. The tradition\u2019s own teachers routinely trained across both grammars; the competition narrative is modern marketplace noise, from both sides.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is yoga derived from tantra?',
        a: 'Partially — the accurate statement. Classical yoga (Patañjali) predates the tantric corpus and stands on Sāṃkhya metaphysics. Haṭha yoga — the body-and-breath methodology ancestral to modern postural yoga — emerges from the tantric-Nāth matrix and uses tantric maps (kuṇḍalinī, cakras, bīja) explicitly. So: modern "yoga" carries a tantric inheritance through its haṭha stratum, while the classical Sūtra tradition is pre-tantric. The two threads braided over centuries.',
      },
      {
        q: 'What is the main difference between tantric and classical yoga?',
        a: 'The stance toward the world and the body. Classical yoga aims at the isolation of awareness from nature — a renunciatory grammar where the body is disciplined into stillness. Tantra is world-affirming: body, breath, sound, image, even desire engaged as instruments of recognition. The subtle-body methodology (nāḍī, cakra, kuṇḍalinī) that most people associate with "yoga" is, historically, the tantric contribution.',
      },
      {
        q: 'Did tantra invent the chakras?',
        a: 'In their influential form, largely yes — the cakra system as commonly understood (the six-plus-one axis, the lotus-and-petal iconography) crystallizes in tantric and haṭha literature (the Ṣaṭ-cakra-nirūpaṇa is the classic source), with earlier proto-references in the Upanishadic strata. The Buddhist tantras developed parallel channel-systems. "Invent" overstates it; "codified into the operative map" is the defensible claim.',
      },
      {
        q: 'Should a yoga practitioner study tantra?',
        a: 'If the subtle-body and mantra layers of the practice interest you, you are already studying tantra — under an unattributed name. The serious question is what depth you want: the fitness-contract of modern postural practice, or the full methodology (devotional, energetic, contemplative) that the haṭha corpus condensed. Starting points on this platform: the what-is-tantra page for the frame, the Archive for graded practice, and the breathwork section for the intersection of the two grammars.',
      },
    ],
    related: [
      { href: '/tantra/what-is-tantra', label: 'What Is Tantra' },
      { href: '/tantra/kashmiri-shaivism', label: 'Kashmiri Shaivism' },
      { href: '/breathwork', label: 'Prāṇāyāma Protocols' },
    ],
  },
  {
    slug: 'shakta-tantra',
    path: '/tantra/shakta-tantra',
    topic: 'tantra:shakta-tantra',
    title: 'Śākta Tantra — The Goddess-Centered Tradition | KALKI',
    description:
      'Śākta tantra decoded: the Goddess as supreme, the Mahāvidyās and Śrī Vidyā, vāmācāra and dakṣiṇācāra explained honestly — texts, lineages, and the KALKI frame.',
    label: 'Streams · Śākta',
    h1: 'Śākta tantra:',
    h1Accent: 'the Goddess as the ground.',
    intro: [
      'Śākta tantra is the stream of the tradition that holds the Goddess — Devī, in her ten thousand forms — as supreme reality, and builds its practice technology around her: the ten Mahāvidyās as doorways, Śrī Vidyā\u2019s disciplined aesthetics, the devi-worship lineages whose ritual science is among the most precise in the Sanskrit corpus.',
      'Where the Śaiva streams speak of consciousness as the ground, the Śākta frame speaks of power — śakti — as the ground\u2019s very nature. The practical consequence runs through everything: practice is relationship with a living force, not merely analysis of a mechanism. This page maps the stream\u2019s architecture, its texts, and the left-hand/right-hand distinction that popular writing keeps getting wrong.',
    ],
    sections: [
      {
        label: '01 · The Architecture',
        heading: 'Śakti as substance, not staff',
        paragraphs: [
          'The Śākta metaphysical claim: the absolute is not inert consciousness occasionally assisted by an energy — the energy (śakti) IS the absolute\u2019s nature; Śiva without Śakti is śava (a corpse), the texts say, and the iconography of Kālī standing on Śiva encodes exactly that dependency. Practice therefore aims at śakti-saṅkarṣaṇa — contact, alignment, embodiment of the force — through the standard tantric grammar (mantra, yantra, deity-yoga) personalized around specific goddess-forms.',
          'The organizational genius of the stream is its pantheon-as-curriculum: the ten Mahāvidyās (Kālī through Kamalā) are documented as a graded sequence of contemplative doorways — each governing specific karmic loops (see the archetype pages on this platform), each with its bīja, yantra, and sādhana corpus. Śrī Vidyā — the Ṣoḍaśī system with the Śrī Cakra — is the stream\u2019s most systematized summit.',
        ],
      },
      {
        label: '02 · The Texts',
        heading: 'From hymn to tantra',
        paragraphs: [
          'The stream\u2019s textual shelf spans registers. The purāṇic base: the Devī-Māhātmya (the Goddess\u2019s great battle-hymn-cycle) and the Devī-Bhāgavata Purāṇa. The tantric corpus proper: the Kālikā Purāṇa\u2019s tantric strata, the Todala Tantra (the Mahāvidyā list), the Rudrayāmala tradition, the Yoni-tantra, the Mahānirvāṇa-tantra (late, famous, much-quoted), and the Śrī Vidyā line\u2019s works (the Tripurā Upaniṣad, the Lalitā Sahasranāma as the devotional spine).',
          'A note on the Mahānirvāṇa-tantra since quotation-mills love it: it is widely held by scholarship to be a late 18th-century composition — a reformist codification, not an early source. KALKI grades its claims accordingly, which is exactly the kind of distinction the evidence-register exists to keep visible.',
        ],
      },
      {
        label: '03 · Vāmācāra and Dakṣiṇācāra',
        heading: 'The left and right hands, without the folklore',
        paragraphs: [
          'The famous "left-hand" (vāmācāra) / "right-hand" (dakṣiṇācāra) distinction is a register distinction, not a moral one: dakṣiṇācāra practices work in substitutionary, symbolic mode (the ritual substances represented by safe equivalents); vāmācāra practices engage the actual substances and transgressive contexts — the pañca-makāra (the five "m" substances, including meat, wine, and ritualized sexuality) — as direct instruments. The rationale in the sources: transgression as accelerant — confronting the mind\u2019s purity-conditioning directly where it lives.',
          'The tradition\u2019s own governance of vāmācāra is strict: initiation, assessment, and the standing judgment that most practitioners should stay in the right-hand registers — a gate modern commerce ignores and KALKI\u2019s caution levels preserve. Graded honestly: the transgression-as-accelerant rationale is the tradition\u2019s testimony (Anubhāva); its psychological reading (exposure and reconsolidation of conditioned aversion) is the modern interpretive frame (Pratibimba) — both are documented, neither is embellished.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What does "Śākta" mean?',
        a: 'From śakti — power, the dynamic energy of the divine. A Śākta is a practitioner for whom the Goddess (the personified śakti) is supreme reality. The stream\u2019s signature claim: Śiva, the static ground, is śava — a corpse — without Śakti; the energy is not the ground\u2019s assistant but its very nature. Devotionally and methodologically, everything follows from that placement.',
      },
      {
        q: 'Are the ten Mahāvidyās part of Śākta tantra?',
        a: 'Yes — the Mahāvidyā pantheon is one of Śākta tantra\u2019s signature architectures: ten goddesses (Kālī, Tārā, Ṣoḍaśī, Bhuvaneśvarī, Bhairavī, Chinnamastā, Dhūmāvatī, Bagalāmukhī, Mātaṅgī, Kamalā) read as graded doorways of contemplative practice. KALKI documents each with an individual folio — sources, iconography, and the diagnostic loop she governs — linked from the archetypes hub.',
      },
      {
        q: 'Is vāmācāra "black magic"?',
        a: 'No — the conflation is lazy. Vāmācāra names a ritual register (actual substances and transgressive contexts used as practice instruments), while the ṣaṭ-karma\u2019s hostile wing (the hex-technologies) names an application family — and the two cross-cut: right-hand lineages also documented hostile applications, and left-hand practice is mostly aimed at liberation, not harm. The honest summary: registers describe method, not morality — and the tradition\u2019s own gating is the safety rail for both.',
      },
      {
        q: 'How do I start with Śākta practice?',
        a: 'The open registers are documented and startable: devotional japa (a published mantra of a goddess whose force matches your work — see the archetype pages), the breath practices, study of the hymns (the Lalitā Sahasranāma and Devī-Māhātmya are the classics), and the Pattern Atlas work that locates which force is operative in your patterns. The gated registers require lineage assessment — the tradition\u2019s rule, which KALKI states rather than bypasses.',
      },
    ],
    related: [
      { href: '/archetypes', label: 'The Ten Mahāvidyās' },
      { href: '/tantra/what-is-tantra', label: 'What Is Tantra' },
      { href: '/tantra/kashmiri-shaivism', label: 'Kashmiri Shaivism' },
    ],
  },
  {
    slug: 'kashmiri-shaivism',
    path: '/tantra/kashmiri-shaivism',
    topic: 'tantra:kashmiri-shaivism',
    title: 'Kashmiri Shaivism — The Nondual Recognition | KALKI',
    description:
      'Kashmiri Shaivism decoded: Trika, the Śiva Sūtras, spanda and pratyabhijñā, Abhinavagupta\u2019s synthesis — the nondual philosophy underneath KALKI\u2019s method, honestly mapped.',
    label: 'Streams · Śaiva Nondual',
    h1: 'Kashmiri Shaivism:',
    h1Accent: 'recognition, not attainment.',
    intro: [
      'Kashmiri Shaivism — the nondual Śaiva tantra (Trika) of medieval Kashmir — is the tradition\u2019s philosophical summit: a complete nondual system that reads the whole of experience, including desire, anger, and forgetting, as movements of one consciousness. Its central wager, radical then and now: liberation is not produced; it is RECOGNIZED (pratyabhijñā) — what you are seeking is what you are looking with.',
      'For KALKI\u2019s method this stream is load-bearing: the Mirror Method\u2019s frame — patterns as movements of one ground, not enemies to be exterminated — is Kashmiri Śaivism applied to behavioral diagnosis. This page maps the school\u2019s history, texts, concepts, and practices.',
    ],
    sections: [
      {
        label: '01 · History & Texts',
        heading: 'Nine centuries in the valley',
        paragraphs: [
          'The school\u2019s founding moment: the Śiva Sūtras revealed to Vasugupta (c. 9th century CE, in the valley of Kashmir — the tradition\u2019s own account). The line then compounds fast: Kallaṭa\u2019s Spanda-kārikā (the vibration doctrine), Somānanda and Utpaladeva\u2019s Pratyabhijñā system (the recognition philosophy, argued with Buddhist logicians in rigorous epistemology), and the synthesis — Abhinavagupta (c. 950–1016), whose Tantrāloka codifies the ritual and yogic corpus and whose aesthetic works fold art and rasa into the nondual frame.',
          'The textual shelf: the Śiva Sūtras and Spanda-kārikā (the pith), the Pratyabhijñā-hṛdayam (Kṣemarāja\u2019s short masterpiece), the Mālinīvijayottara-tantra (the ritual base), and Abhinavagupta\u2019s Tantrāloka and Parātriśikā-vivaraṇa (the summits). The school declined with the valley\u2019s political catastrophes and survives today substantially through the Kashmiri Pandit transmission and the 20th-century scholarly recovery (the Kashmir Series of Texts and Studies) — and through teachers who carried the lineages onward.',
        ],
      },
      {
        label: '02 · The Concepts',
        heading: 'Spanda, pratyabhijñā, the 36 tattvas',
        paragraphs: [
          'Spanda — the vibration: consciousness is not static; its nature is a primal pulse that appears as the world. The path is not stopping the pulse but recognizing it as one\u2019s own nature. Pratyabhijñā — recognition: liberation is not a new acquisition but the collapse of a mis-recognition; the arguments (Utpaladeva\u2019s) are genuinely rigorous epistemology, argued against Buddhist idealists on shared logical ground. The 36 tattvas: the school\u2019s manifest-level map — reality from Śiva-tattva down through the classical Sāṃkhya categories to earth — a deliberately wider ladder than Sāṃkhya\u2019s 25, because the nondual claim needs the divine and the material on one continuous staircase.',
          'The upāyas — the means: śāmbhava (the non-conceptual, grace-flavored entry), śākta (the mind-engaged path of mantra and imagination), and āṇava (the body-and-breath path) — graded to the practitioner, exactly the adhikāra instinct the rest of the tradition shares. Kṣemarāja\u2019s Pratyabhijñā-hṛdayam reads today as a manual of contemplative psychology: every experience, honored as the pulse, followed to its source.',
        ],
      },
      {
        label: '03 · Why It Matters Here',
        heading: 'The nondual frame underneath the Mirror Method',
        paragraphs: [
          'The Mirror Method\u2019s working stance is recognizably this stream\u2019s: the pattern is not an enemy garrison to be shelled but a mis-recognized movement of your own ground — severance (Kālī\u2019s move) is one operation among several, and integration is the real aim. The practice implication: you do not fight the rescuer, the saboteur, the avoidant; you recognize the force underneath the costume, honor its protected function, and re-route its energy — which is precisely the śākta-upāya logic applied to behavioral loops.',
          'Graded honestly: that the nondual frame produces better pattern-work is the platform\u2019s working thesis — Anubhāva register, offered as testimony, not theorem. The philosophy itself stands on its own nine centuries of argument, and the Tantrāloka remains one of the great works of Indian thought regardless of anyone\u2019s practice outcomes.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is Kashmiri Shaivism in one paragraph?',
        a: 'The nondual Śaiva tantra of medieval Kashmir (Trika): a complete philosophy-and-practice system holding that one consciousness — whose nature is a primal pulse (spanda) — appears as the world, and that liberation is recognition (pratyabhijñā) of that fact rather than an achievement. Founded textually by the Śiva Sūtras (c. 9th c.), systematized by Utpaladeva and perfected by Abhinavagupta, it graded its practices into body-, mind-, and grace-paths (āṇava, śākta, śāmbhava upāyas) matched to the practitioner.',
      },
      {
        q: 'How is Kashmiri Shaivism different from other Vedanta?',
        a: 'Śaṅkara\u2019s Advaita Vedānta holds the world to be ultimately illusory (māyā) and the Self absolutely other than it; Kashmiri Śaivism holds the world to be the real unfolding of consciousness\u2019s own pulse — appearance and ground continuous, not a veil to be seen through and discarded. Practically: the Śaiva frame affirms the body, desire, and world as practice-material (hence its tantric method), while classical Advaita\u2019s grammar is renunciatory. Both are nondual; the disagreement is about whether the world is a mistake or a gesture.',
      },
      {
        q: 'What is spanda?',
        a: '"Vibration" — the school\u2019s name for consciousness\u2019s primal pulse, the subtle throb that precedes and generates thought, perception, and world. The Spanda teaching\u2019s practical edge: the pulse is detectable in ordinary moments (the startle, the awe, the falling-asleep threshold), and the practitioner trains to catch it there — recognition available in the middle of life, not only on the cushion. Kallaṭa\u2019s Spanda-kārikā is the classic text.',
      },
      {
        q: 'Do I need initiation to study this philosophy?',
        a: 'To study — no: the core texts are published and translated (the Śiva Sūtras, Spanda-kārikā, Pratyabhijñā-hṛdayam, and the major commentaries), and serious reading is available to anyone. To practice the ritual and yogic registers at intensity — the tradition\u2019s own rule says transmission and assessment are required, and KALKI\u2019s documentation respects that line. Philosophy first is also the tradition\u2019s own sequencing: the school argued that recognition must be intellectually honest before it is ritually reinforced.',
      },
    ],
    related: [
      { href: '/tantra/what-is-tantra', label: 'What Is Tantra' },
      { href: '/method', label: 'The Mirror Method' },
      { href: '/tantra/shakta-tantra', label: 'Śākta Tantra' },
    ],
  },
];
