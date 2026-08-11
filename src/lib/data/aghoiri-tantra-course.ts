import type { Siddhi } from './types';

export interface CourseModule {
  id: string;
  phase: string;
  phaseSanskrit: string;
  title: string;
  titleSanskrit: string;
  description: string;
  duration: string;
  difficulty: string;
  minTier: string;
  image: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  titleSanskrit?: string;
  content: string;
  practice?: string;
  mantras?: { sanskrit: string; transliteration: string; meaning: string; count?: string }[];
  warnings?: string[];
  materials?: string[];
}

export const aghoriCourse: CourseModule[] = [
  {
    id: "phase-0-non-terrible",
    phase: "Phase 0",
    phaseSanskrit: "Aghora \u2014 The Non-Terrible",
    title: "The Non-Terrible: Foundations of Aghora",
    titleSanskrit: "Aghora \u2014 A-Ghora",
    description: "Before any mantra is chanted or any ritual performed, the mind must understand what it is entering. This phase strips away every assumption, every caricature, every colonial distortion of the Aghori tradition. You will learn what Aghora truly is at the level of etymology, philosophy, lineage, sacred geography, and elemental practice.",
    duration: "Self-paced \u2014 minimum 7 days of deep study before proceeding",
    difficulty: "Foundational",
    minTier: "prithvi",
    image: "/assets/tantra/aghoiri-course/aghoiri-sadhu-meditation.jpeg",
    lessons: [
      {
        id: "what-is-aghora",
        title: "What is Aghora Truly? The Non-Terrible",
        titleSanskrit: "Aghora — A-Ghora",
        content: "The word Aghora is built from two Sanskrit roots: the prefix a- (meaning 'not' or 'without') and ghora (meaning 'terrible, fearsome, appalling'). Aghora, therefore, literally means 'not terrible' — the absence of terror. This is the supreme and deliberate irony of the tradition: those whom the world perceives as most terrifying have internalized a state so beyond fear that they have become one with that which the world fears most. Death, decay, impurity, the burning ground — these are not symbols of horror for the Aghori. They are mirrors reflecting the ultimate truth that the ego desperately avoids: everything you identify with will be reduced to ash. The philosophical core of Aghora is Advaita Vedanta taken to its most radical, uncompromising conclusion. Shankara articulated the doctrine — Brahman alone is real, the world is mithya, the individual soul is none other than Brahman. The Aghori lives this doctrine. Where the scholar debates it, the Aghori demonstrates it by eating from a skull, sleeping in a cremation ground, smearing ash on his body — each act a living proof that purity and impurity are constructs of a mind still trapped in duality. Aghoreshwar Bhagwan Ramji, the great 20th-century Aghori sage of Varanasi, taught that Aghora is not a religion, not a philosophy, not even a spiritual path in the conventional sense. It is a state. It is the natural condition of consciousness when every layer of conditioning, every preference, every aversion has been burned away. The common perception of Aghoris — flesh-eating, ash-smeared, frightening — captures only the outer form. The inner reality is the most luminous compassion the world has ever produced, because one who has dissolved the boundary between self and other cannot harm. To understand Aghora, you must begin by unlearning everything you think you know.",
        practice: "For 7 days, sit in silence for 20 minutes each morning. Contemplate the word Aghora — not terrible. Ask yourself: what in me is terrified of what? On the 7th day, write a single paragraph: what do I actually fear losing?",
        mantras: [
          { sanskrit: "ओम अघोराय नमः", transliteration: "om aghoraya namah", meaning: "Salutations to the Non-Terrible — the one beyond all fear", count: "108x daily during this phase" },
          { sanskrit: "ओम अघोर अघोर अघोराभ्यो नमः", transliteration: "om aghora aghora aghorabhyo namah", meaning: "Salutations to the Aghora forms of Shiva — repeated three times for the three gunas transcended", count: "3x at close of each sitting" },
        ],
      },
      {
        id: "lineage-of-bhairava",
        title: "The Lineage of Bhairava: From Svacchanda to the Aghori Sampradaya",
        titleSanskrit: "Bhairava Paramparā",
        content: "Aghora does not exist in a vacuum. It flows from a living lineage that traces its origin to Svacchanda Bhairava — the 'self-willed' form of Shiva described in the Svacchanda Tantra, one of the principal scriptures of the Kashmiri Shaiva tradition. Svacchanda Bhairava is Shiva in his most autonomous, unrestrained expression — the deity who acts from pure will, unbound by any rule, convention, or limitation. This is the theological source from which the Aghori spirit flows. The historical timeline of the Aghori Sampradaya is difficult to fix with precision — the tradition is oral, its records are ash — but certain landmarks are known. The Aghori stream crystallized around the figure of Baba Keenaram (c. 1600s), whose samadhi shrine stands in Varanasi at the Keenaram Sthal in Ravindrapuri. Keenaram Baba is credited with systematizing many of the practices that define the Aghori path: the worship of the skull, the use of cremation-ground ash, the dhuni fire, and the doctrine of Advaita in its most radical application. Following Keenaram, the lineage flows through Kinaram Baba and other realized masters, each adding their own realization to the stream without altering its essence. In the 20th century, Aghoreshwar Bhagwan Ramji (1937-1992) emerged as perhaps the most accessible Aghori sage in modern history. Born in a Brahmin family near Varanasi, he renounced at a young age, lived in cremation grounds, attained realization, and established the Aghor Peeth and the Sri Sarveshwari Samooh. Unlike the more reclusive Aghoris, Aghoreshwar Bhagwan Ramji openly taught that Aghora was not about externals — the ash, the skull, the cremation ground — but about the inner state of non-dual awareness. Dr. Vasant Lad's three-volume 'Aghora' series, based on the teachings of his guru Aghori Vimalananda, remains the most detailed English-language documentation of Aghori philosophy and practice. Understanding this lineage is not academic. It connects you to a stream of realized beings whose consciousness validates the practices you will undertake.",
        practice: "Read or listen to the stories of Baba Keenaram and Aghoreshwar Bhagwan Ramji. Contemplate the transmission: a living state of consciousness passed from guru to disciple, not through books but through presence. Write the lineage in your own hand and keep it near your practice space.",
        mantras: [
          { sanskrit: "ओम स्वच्छन्दभैरवाय नमः", transliteration: "om svacchandabhairavaya namah", meaning: "Salutations to Svacchanda Bhairava — the Self-Willed Lord", count: "108x daily" },
          { sanskrit: "ओम गुरुवे नमः", transliteration: "om gurave namah", meaning: "Salutations to the Guru — the living link in the chain of transmission", count: "3x before and after each practice session" },
        ],
      },
      {
        id: "sacred-geography",
        title: "Sacred Geography: Shakti Peethas, Smashana, and Liminal Spaces",
        titleSanskrit: "Tīrtha — Sacred Geography",
        content: "The Aghori does not practice in a temple built by human hands. The Aghori's temple is the world as it is — raw, uncensored, stripped of human decoration. But within this raw world, certain locations carry an intensified charge of spiritual power, and the Aghori knows precisely where to find them. The 51 Shakti Peethas — the sites where parts of Sati's body are said to have fallen when Shiva carried her corpse and Vishnu's Sudarshana Chakra dismembered it — are the primary power centers of the Tantric world. Each Peetha is a tirtha, a crossing point between dimensions, where the veil between the visible and invisible is thin. For the Aghori, these are not merely pilgrimage sites. They are practice grounds. The energy of each Peetha is specific: Kamakhya in Assam is the seat of the Yoni Peetha and the most powerful center of Kaula Tantra; Kalighat in Kolkata is one of the most intense Kali tirthas; Varanasi's Manikarnika Ghat is where Sati's ear ornament fell and where the cremation fires have burned without interruption for millennia. The Smashana — the cremation ground — is the Aghori's primary tirtha. It is the place where the human body is reduced to its elemental truth. Every identity, every status, every story ends at the pyre. For the Aghori, this is not morbid. This is the most honest place on earth. The Peepal tree (Ficus religiosa) is another sacred locus. Its roots are Brahma, its trunk Vishnu, its branches Shiva. Bhutas are said to reside in its shade. The Sangam — the confluence of rivers, most famously the meeting of Ganga, Yamuna, and the invisible Saraswati at Prayagraj — represents the merging of the three gunas into turiya, the fourth state. The Aghori chooses liminal spaces — abandoned temples, crossroads, the threshold between forest and field — because they mirror the state of consciousness the Aghori seeks: the boundary between worlds already dissolved.",
        practice: "Identify the nearest cremation ground, Peepal tree, river confluence, or abandoned temple to your location. Visit it during daylight first. Sit for 15 minutes in silence. Observe your mind's reactions. This is the beginning of Smashana Bhava.",
        mantras: [
          { sanskrit: "ओम श्मशानवासिने नमः", transliteration: "om smashanavasine namah", meaning: "Salutations to the One Who Dwells in the Cremation Ground", count: "3x when visiting any sacred Aghori site" },
          { sanskrit: "ओम ह्रीं महाकालिकायै नमः", transliteration: "om hrim mahakalikayai namah", meaning: "Salutations to Mahakali of Time and Death", count: "108x at cremation grounds" },
        ],
        warnings: ["Never enter a cremation ground at night alone on your first visit", "Some cremation grounds have active pyres — maintain respectful distance from grieving families", "Abandoned temples may have structural hazards — assess during daylight", "Crossroads rituals should be performed after dark but in familiar, safe areas"],
      },
      {
        id: "five-mahabhutas",
        title: "The Five Mahabhutas: Aghori Elemental Practice",
        titleSanskrit: "Pañca-Mahābhūta",
        content: "The Aghori works directly with the five Mahabhutas — the great elements that compose all of manifested reality. This is not symbolic. Each element is a specific frequency of consciousness, and the Aghori learns to work with each one as a tool for purification, invocation, and ultimately, the dissolution of the bounded self. Prithvi (Earth) is encountered through Bhasm — sacred ash. The Aghori smears ash on the body not as a display but as a practice. Ash is what remains when everything else is burned away. It is the ultimate reality of the physical body. By applying it, the Aghori reminds the body of its destination and aligns it with truth. Jala (Water) is encountered through Ganga Jal — water from the Ganges, the most sacred river in the Aghori tradition. Ganga is not merely water. In the Aghori understanding, Ganga is the manifest flow of consciousness descending from the heavens through Shiva's matted locks. Agni (Fire) is encountered through the Dhuni — the sacred fire that the Aghori maintains continuously. The Dhuni is the Aghori's primary altar. Into it go all offerings: ghee, sesame, camphor. Fire transforms — it is the only element that moves upward by nature, and the Aghori uses this upward movement to carry offerings into the subtler realms. Vayu (Air) is encountered through Pranayama — specifically through Aghori breathing practices that go beyond classical Hatha Yoga. Kapalabhati, Bhastrika, and the supremely subtle Kevala Kumbhaka are the Aghori's tools for working with vital air. When breath stops, mind stops. When mind stops, Bhairava is revealed. Akasha (Ether) is the final element. Akasha is not empty space — it is the substratum of all sound, all vibration, all manifestation. The Aghori enters Akasha through deep silence, through the space between breaths, through the vast emptiness that remains when all content of consciousness has dissolved.",
        practice: "For 7 days, dedicate one day to each element. Earth: apply ash to your forehead and forearms, contemplate impermanence. Water: offer Ganga Jal to a Shiva image, then drink some. Fire: light a ghee lamp, gaze into it for 10 minutes. Air: practice 15 minutes of Kapalabhati. Ether: sit in complete silence for 20 minutes.",
        mantras: [
          { sanskrit: "ओम भूर्भुवः स्वः", transliteration: "om bhur bhuva svah", meaning: "The three vyahritis invoking earth, atmosphere, and heaven", count: "3x at the start of each elemental practice day" },
          { sanskrit: "ओम पञ्चभूताय नमः", transliteration: "om panchabhutaya namah", meaning: "Salutations to the Five Elements", count: "108x on the final day" },
        ],
        materials: ["Vibhuti / Bhasm (sacred ash)", "Ganga Jal (or pure water if unavailable)", "Ghee lamp or candle", "A quiet space for Pranayama", "A small Shiva image or Linga for water offerings"],
      },
    ],
  },
  {
    id: "phase-1-forty-days",
    phase: "Phase 1",
    phaseSanskrit: "Catvāriṁśat Dina — The Forty Days",
    title: "The Forty Days: Internal Purification",
    titleSanskrit: "Catvāriṁśat Dina — Antaḥ-Śuddhi",
    description: "Forty days of systematic internal purification. The daily architecture, the sattvic discipline, the 32-step Bhuta Shuddhi, the bhuta offerings, the ego-letter, and the breaking of rage patterns.",
    duration: "40 days continuous (days 1-40)",
    difficulty: "Foundational",
    minTier: "jal",
    image: "/assets/tantra/aghoiri-course/dhuni-fire-path.jpeg",
    lessons: [
      {
        id: "daily-architecture",
        title: "The Daily Architecture: Brahma Muhurta to Sandhyakala",
        titleSanskrit: "Dina-Krama",
        content: "The forty-day purification follows a precise daily architecture designed to systematically dismantle the ego's control over the body-mind instrument. The day begins at Brahma Muhurta — approximately 96 minutes before sunrise, typically between 4:00 and 5:30 AM. This is when sattva guna predominates and the collective mind is still dreaming. The morning practice: rise immediately — no snooze, no negotiation. Sit facing north or east. Chant Om Kapaline Namah 108 times, invoking the skull-bearer. Follow with 15 minutes of Trataka on a ghee lamp flame or Bhairava image. When tears flow, allow them — they carry impurities from the subtle body. After Trataka, take a cold bath. This is non-negotiable. The cold water breaks the body's comfort patterns. Aghoreshwar Bhagwan Ramji considered this essential because it shatters identification with the body as something to be coddled. The evening practice begins at Sandhyakala — twilight, 20 minutes before and after sunset. This is when boundaries between worlds thin. The practice: 108 chants of Om Namah Shivaya Aghoraya, 20 minutes of Kapalabhati, then 2 hours of Mauna — complete silence. No reading, writing, entertainment, or phone. Mauna is the state in which Bhairava resides. When the tongue stops, the mind's primary engagement tool goes still. What remains is awareness watching awareness. This is the taste of Aghora.",
        practice: "Morning: Brahma Muhurta → Om Kapaline Namah 108x → Trataka 15 min → Cold bath. Evening: Sandhyakala → Om Namah Shivaya Aghoraya 108x → Kapalabhati 20 min → Mauna 2 hours. Notice which elements cause the most resistance — that resistance IS the ego.",
        mantras: [
          { sanskrit: "ओम कपालिने नमः", transliteration: "om kapaline namah", meaning: "Salutations to the Skull-Bearer", count: "108x every morning" },
          { sanskrit: "ओम नमः शिवाय अघोराय", transliteration: "om namah shivaya aghoraya", meaning: "Salutations to Shiva in his Aghora form", count: "108x every evening" },
        ],
        materials: ["Mala (Rudraksha, 108 beads)", "Ghee lamp for Trataka", "Cold water source", "Journal (to be burned on day 40)", "Quiet space for Mauna"],
        warnings: ["Cold baths are unsafe for those with heart conditions — use cool water instead", "Trataka can cause eye strain — blink naturally when tears flow", "Kapalabhati should not be done by pregnant women or those with high BP", "Mauna can be intense — ground through slow walking if anxiety arises"],
      },
      {
        id: "sattvic-discipline",
        title: "The Sattvic Discipline: Food as Sadhana",
        titleSanskrit: "Ahāra-Śuddhi",
        content: "Throughout the forty days, the sadhaka follows a strictly sattvic diet. This is precision engineering of the body-mind. Everything you consume becomes your consciousness. The diet: fresh seasonal fruits (lightest prana), milk and ghee (nourish ojas), honey (never spoils — carries immortality), moong dal (easiest to digest, minimal ama), dry fruits — almonds, raisins, dates (concentrated sattvic energy), and Ganga Jal. Excluded: no meat, fish, eggs. No onion, garlic — rajasic and tamasic. No alcohol, tobacco, drugs. No processed food or refined sugar. The most challenging element: one day per week, eat without salt or spices. Plain rice, plain dal, plain vegetables. This is one of the most effective ego-dissolution techniques in the Aghori toolkit. The tongue's craving for flavor is one of the ego's deepest patterns — invisible until you try to stop it. When you eat tasteless food without complaint, without longing, without reaching for the salt shaker by reflex, you have demonstrated that the body's automatic demands no longer control consciousness. Aghoreshwar Bhagwan Ramji taught fasting once a week on Ekadashi. During the fast, only water or Ganga Jal. The hunger is not suppressed — it is observed. The Aghori watches hunger the way a witness watches a passing storm. It arises, peaks, subsides. The one who watches is not hungry.",
        practice: "Adopt the sattvic diet for 40 days. One tasteless day per week. On fasting days, drink only water and observe hunger as a sensation in awareness, not a command.",
        mantras: [
          { sanskrit: "ओम अन्नपूर्णायै नमः", transliteration: "om annapurnayai namah", meaning: "Salutations to Annapurna — the Goddess of Nourishment", count: "3x before every meal" },
        ],
        materials: ["Fresh fruits", "Pure milk and ghee", "Honey", "Moong dal", "Dry fruits", "Ganga Jal or filtered water"],
      },
      {
        id: "bhuta-shuddhi",
        title: "Bhuta Shuddhi: The 32-Step Tantric Purification",
        titleSanskrit: "Bhūta-Śuddhi",
        content: "Bhuta Shuddhi is the foundational Tantric purification that precedes every serious ritual. The 32-step protocol from the Shaiva Agama tradition systematically dissolves and reconstructs the subtle body. It begins with Nadi Shuddhi — visualizing fire descending from the Brahmarandhra through Sushumna, burning impurities in all 72,000 nadis. Then the six Chakras: Muladhara-Lam (earth), Svadhisthana-Vam (water), Manipura-Ram (fire), Anahata-Yam (air), Vishuddha-Ham (ether), Ajna-Om (transcendental). For each: locate, visualize the Bija, chant it, dissolve it into light. Then the 36 Tattvas of Shaiva philosophy — from Prithvi upward, each dissolved into the one above until only Shiva-tattva remains. Finally the five Koshas — Annamaya, Pranamaya, Manomaya, Vijnanamaya, Anandamaya — purified and dissolved. What remains is the Sakshi, the pure witness. This is the state from which the Aghori acts. The practice takes 30-45 minutes daily.",
        practice: "Perform daily: Nadi Shuddhi → 6 chakras → 36 tattvas → 5 koshas → Sakshi state for 5 minutes.",
        mantras: [
          { sanskrit: "ओम लं वं रं यं हं ओम", transliteration: "om lam vam ram yam ham om", meaning: "The six chakra Bijas", count: "16x each at its chakra" },
          { sanskrit: "ओम भूतशुद्धिं कुरु कुरु स्वाहा", transliteration: "om bhutashuddhim kuru kuru svaha", meaning: "Accomplish the purification of the elements", count: "3x at start and end" },
        ],
        warnings: ["Can release suppressed emotions — observe without engagement", "If dizzy, press palms on earth and breathe normally", "Study the 36 tattvas before working with them internally"],
      },
      {
        id: "bhuta-offerings",
        title: "Bhuta Offerings: Honoring the Invisible",
        titleSanskrit: "Bhūta-Tarpaṇa",
        content: "Every Saturday or Amavasya, the sadhaka offers to the Bhutas — the invisible beings between frequencies of perception. This serves multiple purposes: propitiation, non-dual practice (feeding what the world fears), and confrontation with rationalist conditioning. The Aghori does not believe in Bhutas — the Aghori has experienced them. The tradition is explicit: the visible world is a fraction of total reality. Between human perception and the full spectrum, beings exist — some benevolent, some neutral, some malevolent. The Aghori honors all, seeing no separation. The offering: black sesame (Til), fresh curd, rice balls (Pinda). Placed on a leaf and taken to a crossroad (Vishama Patha) or Peepal tree base after sunset. Place without looking. Chant: Yatastu Bhutaganah, patham me shuddhikurvantu — 'Wherever the spirits may be, may they purify my path.' Walk away without looking back — looking back invites them to follow. This is the Aghori's foundational humility: you are not the most important being in any space. The Bhutas were here before you.",
        practice: "Prepare black sesame, curd, rice balls. Go to crossroad or Peepal after sunset. Place without looking. Chant 3x. Leave without looking back.",
        mantras: [
          { sanskrit: "यतस्तु भूतगणाः पथम मे शुद्धिकुर्वन्तु", transliteration: "yatastu bhutaganah patham me shuddhikurvantu", meaning: "Wherever the spirits may be, may they purify my path", count: "3x at offering site" },
          { sanskrit: "ओम भूतनाथाय नमः", transliteration: "om bhutanathaya namah", meaning: "Salutations to the Lord of Spirits", count: "3x before leaving" },
        ],
        materials: ["Black sesame seeds", "Fresh curd", "Rice flour for Pinda", "Small plate or leaf"],
      },
      {
        id: "ego-letter",
        title: "The Ego-Letter: Writing and Burning the Intention Declaration",
        titleSanskrit: "Ahaṅkāra-Patra",
        content: "On day 33 or 40 of the purification, the sadhaka writes a letter to Bhairava formally surrendering everything they believe themselves to be. This is not a journaling exercise. This is a ritual act of dissolution. The letter begins: 'O Bhairava, I surrender my name, my history, and my fear.' It continues with a systematic listing of every identity the sadhaka clings to — profession, family role, social status, spiritual achievements, fears, desires, resentments. Each item is offered to the fire of Bhairava's awareness. The letter ends: 'May your fire consume me and make me naked in truth. Initiate me if I am worthy. If I am not, burn this as my aspiration.' The letter is then burned completely in a ghee lamp flame. Fire is the Aghori's primary alchemical instrument. When the paper turns to ash, the declaration transforms — the smoke carries the intention into the Akashic medium. Aghoreshwar Bhagwan Ramji taught that the act of writing makes the unconscious conscious. You cannot surrender what you have not named. The act of burning makes the conscious into the formless. You cannot be free while holding even the memory of what you released. The ego-letter practice marks the transition from preparation to initiation.",
        practice: "On day 33 or 40, sit alone after evening practice. Write the declaration in your own hand. Name every identity. Read it aloud once. Burn it completely in a ghee lamp flame. Sit in silence until the ash cools.",
        mantras: [
          { sanskrit: "ओम भैरवायाग्नये नमः", transliteration: "om bhairavayagnaye namah", meaning: "Salutations to Bhairava as Fire", count: "3x before burning" },
          { sanskrit: "ओम नमो भगवते रुद्राय", transliteration: "om namo bhagavate rudraya", meaning: "Salutations to Rudra — the destroyer of illusion", count: "108x during the burning" },
        ],
        warnings: ["This practice triggers intense emotional release — do not suppress it", "Keep water nearby for safety", "Do not share your letter's contents with anyone", "If you feel unready, repeat on day 40"],
        materials: ["Paper and pen", "Ghee lamp or candle", "Water nearby for safety"],
      },
      {
        id: "krodha-bhanga",
        title: "Krodha Bhanga: Breaking Anger Patterns",
        titleSanskrit: "Krodha-Bhaṅga",
        content: "Krodha — anger, rage, fury — is one of the six inner enemies (Shadripus) that the Aghori systematically works with. Unlike traditions that suppress or transcend anger through gentleness, the Aghori approach is characteristically radical: anger is not to be eliminated. It is to be transmuted into fuel. The Aghori understands that rage is compressed pranic energy. When anger arises, it is because a massive amount of life-force has been mobilized and directed toward a perceived threat. The Aghori intercepts this energy at the moment of arising and redirects it. The practice: when you feel anger arising, do not act on it. Do not suppress it. Sit with it. Locate the physical sensation — where in the body does it burn? Typically the chest, the jaw, the temples. Breathe into that location. Chant the Krodha-bhanga mantra: Om Krodhaya Bhairavaya Hum Phat — 'Om, to Bhairava in the form of Anger, Hum Phat.' The Hum bija is the weapon that shatters. The Phat bija is the explosion. Together, they are used to shatter the pattern of rage at its root — not to make you calm, but to free the trapped energy. As the practice deepens over the forty days, the sadhaka begins to notice that anger still arises, but it no longer possesses. It moves through like weather through an open sky. The Aghori does not become passive. The Aghori becomes spacious enough to hold every emotion without being controlled by any of them.",
        practice: "When anger arises, do not act or suppress. Sit. Locate the physical sensation. Breathe into it. Chant Om Krodhaya Bhairavaya Hum Phat 108x. Watch the energy transform. Journal the experience afterward.",
        mantras: [
          { sanskrit: "ओम क्रोधाय भैरवाय हुं फट्", transliteration: "om krodhaya bhairavaya hum phat", meaning: "To Bhairava in the form of Anger — Hum (shatter), Phat (explode)", count: "108x when anger arises" },
          { sanskrit: "ओम शान्तिकराय नमः", transliteration: "om shantikaraya namah", meaning: "Salutations to the Peacemaker — for integration after the practice", count: "3x after the anger work" },
        ],
        warnings: ["Do not attempt this practice during active conflict — wait until you are alone", "If rage is overwhelming, do Kapalabhati for 5 minutes first to discharge excess prana", "This practice can surface childhood trauma — seek a qualified guide if you feel destabilized"],
      },
    ],
  },
  {
    id: "phase-2-bhairava-fire",
    phase: "Phase 2",
    phaseSanskrit: "Bhairava-Agni — The Fire of Bhairava",
    title: "The Bhairava Fire: Initiation",
    titleSanskrit: "Bhairava-Dīkṣā",
    description: "The culmination of the forty days. On the night of Amavasya or Chaturdashi, at midnight, the sadhaka performs the self-initiation that formally opens the Aghori path. This is the point of no return.",
    duration: "One night (Amavasya or Chaturdashi, midnight)",
    difficulty: "Intermediate",
    minTier: "agni",
    image: "/assets/tantra/aghoiri-course/hero-cremation-initiation.jpeg",
    lessons: [
      {
        id: "choosing-threshold",
        title: "Choosing the Threshold: Location Selection",
        titleSanskrit: "Sīmā-Choṣaṇa",
        content: "The initiation location must be where the ordinary world has withdrawn: a Smashana where pyres have recently burned, an abandoned temple, or a dense forest at midnight. This is not theatrical. The Aghori understands that consciousness is affected by its environment. In a temple, the mind automatically becomes devotional. In a cremation ground, the mind automatically confronts mortality. The Aghori uses this environmental imprint to accelerate the dissolution of the ego. Daytime reconnaissance is essential. Visit the location during daylight. Note: which areas are safe, which areas are structurally dangerous, where the ground is uneven, where the nearest exit is. At a Smashana: identify where active pyres are, where the ash pile is deepest, where the Peepal or Banyan trees stand. At an abandoned temple: check for structural integrity, note the orientation, identify the garbhagriha (inner sanctum). At a forest: locate a clearing, note animal tracks, identify the direction of the nearest road or habitation. Safety protocols are non-negotiable. Tell someone your location and expected return time. Carry a charged phone (silenced). Do not consume intoxicants before the ritual — the Aghori needs full awareness, not altered consciousness. The Aghori's fearlessness is not recklessness. It is the result of thorough preparation.",
        practice: "Visit your chosen location during daylight at least three times before the initiation night. Sit for 15 minutes each visit. Memorize the terrain. On the final visit, perform a mental walk-through of the entire ritual.",
        mantras: [
          { sanskrit: "ओम भैरवाय स्थिराय नमः", transliteration: "om bhairavaya sthiraya namah", meaning: "Salutations to Bhairava, the Stable One — for grounding in liminal spaces", count: "3x at the location during reconnaissance" },
        ],
        materials: ["Charged phone (silenced)", "Flashlight", "Water bottle", "Location notes from reconnaissance"],
        warnings: ["NEVER perform in a location where you feel unsafe", "Assess cremation grounds during daylight first", "Tell someone your location and expected return", "Do not consume intoxicants before the ritual"],
      },
      {
        id: "ritual-architecture",
        title: "The Ritual Architecture: Drawing the Bhairava Mandala",
        titleSanskrit: "Maṇḍala-Vidhāna",
        content: "The ritual space is prepared with exact precision. The sadhaka spreads a black cloth facing south or southwest — the direction of Yama, Lord of Death, and therefore the direction of Bhairava's dominion. The skull is placed at the center. This is the axis mundi of the ritual — the point where all dimensions intersect. Around the skull, two concentric circles are drawn in red sindoor (vermilion). Inner circle: Om Aghora Aghora Aghorabhyo Namah — invoking the Aghora tattva, the non-terrible reality that underlies all appearance. Outer circle: Om Bhairavaya Kalabhairavaya Mahakalaya Namah — invoking the three temporal dimensions of Bhairava: the present destroyer, the time-keeper, the great death. Between the circles, at the four cardinal and four ordinal directions, eight small bindu (dots) of sindoor are placed — these are the eight Bhairavas guarding the eight directions. A trishul (trident) or symbolic dagger is placed to the right of the skull, pointing upward — the three prongs representing the three gunas transcended. Offerings are arranged: alcohol or symbolic drops near the skull (the Tantric offering, representing the fire of awareness that intoxicates the mind with truth), black sesame seeds scattered (each seed a soul in transit), red flowers (Kundalini Shakti), and a lit camphor or ghee lamp. The entire mandala is prepared in silence. Each element placed is an act of intention.",
        practice: "Prepare the mandala in silence. Each element placed is an act of intention. Do not rush. When complete, sit before it for 5 minutes before beginning the japa.",
        materials: ["Black cloth or blanket", "Red sindoor", "Skull (real or symbolic)", "Trishul or symbolic dagger", "Black sesame seeds", "Red flowers", "Camphor or ghee lamp", "Small plate for offerings"],
      },
      {
        id: "mantra-jagarana",
        title: "Mantra Jagarana: Awakening the Fire Within",
        titleSanskrit: "Mantra-Jāgaraṇa",
        content: "Jagarana means awakening — the mantra goes from mere syllables to a living vibration that transforms consciousness. The sadhaka sits before the skull and chants: Om Hrim Bhairavaya Namah. The count is 108 or 1008. The tradition is explicit: do no japa mechanically — each word should burn inside. The Hrim bija is the Maya bija, the seed of the entire field of illusion. It does not invoke Maya — it dissolves it. When chanted with full attention, it creates a vibration that shakes the subtle body loose from its identification with the physical form. At approximately the 300-400th repetition, most sadhakas report a shift: the mantra begins to chant itself. The mouth moves, the sound emerges, but the one who began the japa is no longer present. There is only the mantra. This is Jagarana — the mantra has awakened and is now doing the work. The sadhaka's role shifts from doer to witness. The gaze remains fixed on the skull or flame between repetitions. The Aghori gazes until mental activity stops — this is the Bhairava state: vast, alert stillness without a center, without a 'me' who is aware. Dr. Vasant Lad's account of Aghori Vimalananda describes this state precisely: 'When the japa really takes hold, you are not chanting the mantra. The mantra is chanting you.'",
        practice: "Sit before the mandala. Chant Om Hrim Bhairavaya Namah. Begin with awareness of each syllable. When the mantra begins to chant itself, let it. Do not interfere. Gaze at skull or flame between rounds.",
        mantras: [
          { sanskrit: "ओम ह्रीं भैरवाय नमः", transliteration: "om hrim bhairavaya namah", meaning: "Primary Bhairava mantra — Hrim dissolves illusion", count: "108x or 1008x" },
          { sanskrit: "ओम कालभैरवाय नमः", transliteration: "om kalabhairavaya namah", meaning: "For those whose ishta is Kala Bhairava", count: "108x or 1008x" },
        ],
        warnings: ["If overwhelming fear arises during japa, do not stop — sit with it", "If thought ceases, remain still — do not force awareness to return", "1008 repetitions take approximately 2-3 hours", "Do not eat for 3 hours before the session"],
      },
      {
        id: "aghoira-vrat",
        title: "The Aghora Vrat: The Irrevocable Oath",
        titleSanskrit: "Aghora-Vrata",
        content: "After the mantra jagarana reaches its climax, the sadhaka speaks the Aghora Vrat aloud with full voice: 'From this moment, I reject all masks. I vow to see no duality — no pure or impure, high or low, god or demon. May Shiva be my breath, may death be my teacher, may silence be my speech. I accept whatever comes. I fear nothing. I renounce everything that does not burn in truth.' Every word targets a specific layer of the ego-structure. 'I reject all masks' — the social persona. 'No duality' — the conceptual mind. 'Shiva be my breath' — the identification with life itself. 'Death be my teacher' — the fear of mortality. 'Silence be my speech' — the compulsive need to communicate. 'I accept whatever comes' — the preference for pleasure over pain. 'I fear nothing' — the root fear. 'I renounce' — attachment. After speaking, a drop of blood or red sindoor is applied to the third eye as the visible seal. From this moment the Aghori tattva is active within the sadhaka. The vow is irrevocable in the Aghori tradition — not because a deity punishes you for breaking it, but because once consciousness has tasted non-duality, the return to duality is suffering.",
        practice: "Speak the oath aloud with full voice. Apply sindoor or blood to the third eye. Sit in silence for at least 30 minutes after.",
        mantras: [
          { sanskrit: "ओम अघोराय सत्याय नमः", transliteration: "om aghoraya satyaya namah", meaning: "Salutations to Aghora as Truth", count: "3x before the oath" },
        ],
        warnings: ["This oath is IRREVOCABLE — speak it only if you mean every word", "Emotional aftermath can be intense and prolonged", "Do not discuss details with anyone who has not walked the path", "The sindoor mark should fade naturally — do not wash it off"],
      },
      {
        id: "kalabhairava-nyasa",
        title: "Kalabhairava Nyasa: Six-Station Body Sanctification",
        titleSanskrit: "Kālabhairava-Nyāsa",
        content: "Nyasa means 'placing' — the ritual act of placing a deity's presence at specific points in the body, transforming the body into a living temple. Kalabhairava Nyasa uses six stations: (1) Mastaka (Crown) — Om Hrim Svacchandabhairavaya Mastakaya Namah, placing Bhairava's sovereignty at the crown, the seat of Sahasrara; (2) Netra (Eyes) — Om Hrim Bhairavaya Netraya Namah, placing Bhairava's unblinking gaze, the witness that sees all without being affected; (3) Mukha (Mouth) — Om Hrim Bhairavaya Mukhaya Namah, placing Bhairava's speech — the truth that silences all falsehood; (4) Hridaya (Heart) — Om Hrim Bhairavaya Hridayaya Namah, placing Bhairava in the heart center, replacing the ego's throne with Shiva's; (5) Nabhi (Navel) — Om Hrim Bhairavaya Nabhyai Namah, placing Bhairava at the manipura, the fire center that digests all experience; (6) Carana (Feet) — Om Hrim Bhairavaya Caranayai Namah, placing Bhairava at the feet, grounding the entire practice. At each station, the sadhaka touches the location with the right hand's ring finger, chants the mantra, and visualizes a point of golden fire igniting. When all six stations are alight, the body has become Bhairava's living yantra. This practice is performed immediately after the Aghora Vrat and is the bridge between the initiation night and the daily practices that follow.",
        practice: "After the Vrat, perform the six-station Nyasa at each body location. Touch with ring finger. Chant. Visualize golden fire. When all six are alight, sit in the merged state for 10 minutes.",
        mantras: [
          { sanskrit: "ओम ह्रीं स्वच्छन्दभैरवाय मस्तकाय नमः", transliteration: "om hrim svacchandabhairavaya mastakaya namah", meaning: "Crown station — Bhairava's sovereignty", count: "1x" },
          { sanskrit: "ओम ह्रीं भैरवाय नेत्राय नमः", transliteration: "om hrim bhairavaya netraya namah", meaning: "Eye station — Bhairava's unblinking gaze", count: "1x" },
          { sanskrit: "ओम ह्रीं भैरवाय मुखाय नमः", transliteration: "om hrim bhairavaya mukhaya namah", meaning: "Mouth station — truth that silences falsehood", count: "1x" },
          { sanskrit: "ओम ह्रीं भैरवाय हृदयाय नमः", transliteration: "om hrim bhairavaya hridayaya namah", meaning: "Heart station — replacing ego's throne with Shiva's", count: "1x" },
          { sanskrit: "ओम ह्रीं भैरवाय नाभ्यै नमः", transliteration: "om hrim bhairavaya nabhyai namah", meaning: "Navel station — fire that digests all experience", count: "1x" },
          { sanskrit: "ओम ह्रीं भैरवाय चरणायै नमः", transliteration: "om hrim bhairavaya caranayai namah", meaning: "Feet station — grounding", count: "1x" },
        ],
      },
      {
        id: "post-initiation-anchors",
        title: "Post-Initiation Anchors: Locking In the Initiation",
        titleSanskrit: "Dīkṣā-Aṅkura",
        content: "The initiation is not an event — it is a doorway. What matters is what you do every day after walking through it. The Aghori tradition prescribes three anchor practices that lock the initiation into the body-mind permanently. First: Kapal Puja. Every morning, the sadhaka performs a brief worship of the skull — bathing it with water (if using a real skull) or anointing a symbolic one with Ganga Jal, offering a flower, chanting Om Kapaline Namah 3x. This takes 2 minutes but its effect is cumulative. It reminds the subtle body every morning that the skull is not a symbol but a mirror — what you see in it is what you are. Second: Midnight Japa. Every night at Nishitha Kala (the second quarter of the night, approximately midnight to 3 AM), the sadhaka sits and chants Om Hrim Bhairavaya Namah 108x. This is the hour of Bhairava's maximum potency. The world is asleep. The veil is thinnest. The mantra goes deeper at this hour than at any other. Third: Monthly Smashana Bhava. Once a month, preferably on Amavasya, the sadhaka visits a cremation ground or the site of the initiation and sits for 1-2 hours in meditation, recreating the inner state of the initiation night. These three practices — morning, midnight, monthly — form the triangular anchor that holds the Aghori tattva in the sadhaka's field.",
        practice: "Establish the three anchors immediately after initiation: (1) Morning Kapal Puja — 2 min, (2) Midnight Japa 108x — 15 min, (3) Monthly Smashana visit — 1-2 hours on Amavasya. Never skip more than one consecutive day of any anchor.",
        mantras: [
          { sanskrit: "ओम कपालिने नमः", transliteration: "om kapaline namah", meaning: "Daily Kapal Puja mantra", count: "3x every morning" },
          { sanskrit: "ओम ह्रीं भैरवाय नमः", transliteration: "om hrim bhairavaya namah", meaning: "Midnight anchor japa", count: "108x at Nishitha Kala" },
        ],
        warnings: ["Do not skip anchors for more than one consecutive day — the initiation fades without reinforcement", "Midnight japa requires a dedicated space — do not do it in bed", "Monthly Smashana visits should follow daylight safety protocols if visiting a new ground"],
        materials: ["Skull or symbolic Kapal", "Ganga Jal", "Red flowers", "Mala for midnight japa"],
      },
    ],
  },
  {
    id: "phase-3-kapal-path",
    phase: "Phase 3",
    phaseSanskrit: "Kapāla-Mārga — The Skull Path",
    title: "The Kapal Path: Skull Practices",
    titleSanskrit: "Kapāla-Sādhana",
    description: "The skull is the Aghori's primary instrument, altar, and teacher. These five lessons reveal why the Aghori works with the Kapal and how to use it in daily worship, meditation, and advanced Pancha-Kapala practice.",
    duration: "Lifelong daily practice",
    difficulty: "Intermediate",
    minTier: "agni",
    image: "/assets/tantra/aghoiri-course/kapal-puja-ritual.jpeg",
    lessons: [
      {
        id: "skull-as-guru",
        title: "The Skull as Guru",
        titleSanskrit: "Kapāla-Guru",
        content: "Why do Aghoris use the human skull — the Kapal — as the central instrument of their practice? The question reveals more about the questioner than the tradition. The skull is not a morbid curiosity. It is the most powerful teaching tool in the Aghori arsenal, and the Aghori knows this through direct experience, not through theory. First: the cranial vault is the seat of consciousness in the physical body. The brain, the Sahasrara chakra, the Brahmarandhra — all reside within or above the skull. When the Aghori holds a skull, he is holding the container that once held a universe of experience — every thought, every dream, every love, every terror. The skull is the proof that all experience ends in silence. Second: the skull is the mirror of Brahman. When you look into the empty cavity of a skull, what do you see? Emptiness. But this is not the emptiness of absence. This is the emptiness of potential — the same emptiness from which the entire universe arose and into which it will dissolve. The Aghori sees in the skull what the Upanishads describe as the fullness of emptiness. Third: the skull strips away every status distinction. A king's skull is identical to a beggar's skull. In the skull, the Aghori sees the great equalizer — the truth that every social hierarchy is a fiction maintained by the living, instantly dismantled by death. Baba Keenaram taught that the Kapal is the Aghori's external Guru — it teaches what no living guru can: the reality of your own impermanence, presented not as a concept but as a physical object you can hold, wash, and worship.",
        practice: "If you have access to a Kapal (real or symbolic), sit with it for 15 minutes daily. Gaze into the cranial cavity. Ask: what was this? What remains? What am I that will not remain?",
        mantras: [
          { sanskrit: "ओम कपालिने नमः", transliteration: "om kapaline namah", meaning: "Salutations to the Skull-Bearer", count: "108x daily" },
          { sanskrit: "ओम ह्रीं कपालमुखाय नमः", transliteration: "om hrim kapalamukhaya namah", meaning: "Salutations to the Face of the Skull — the face of truth", count: "3x before Kapal meditation" },
        ],
      },
      {
        id: "kapal-puja",
        title: "Kapal Puja: Daily Skull Worship Protocol",
        titleSanskrit: "Kapāla-Pūjā",
        content: "The daily Kapal Puja is the Aghori's most intimate ritual. It takes approximately 5-10 minutes and is performed every morning after the Brahma Muhurta practices. The protocol: (1) The Kapal is placed on a clean cloth, facing the sadhaka. (2) Water (Ganga Jal if available) is poured over the crown — Om Gangayai Namah — invoking the purifying flow of consciousness. (3) A red flower or sindoor tilak is placed on the forehead of the skull — Om Hrim Kapalaya Namah — marking it as the seat of Bhairava. (4) Bhoga is offered — a small portion of whatever food the sadhaka will eat that day, placed inside the cranial cavity — Om Bhogapradaya Namah — an act of offering one's sustenance to Bhairava before consuming it. (5) The primary Kapal mantra is chanted 108x: Om Hrim Kapalaya Aghoraya Namah. (6) The skull is touched to the sadhaka's forehead, then to the heart, then placed back on the altar. This practice, performed daily, creates an extraordinary transformation. The skull ceases to be an object and becomes a living presence. The sadhaka begins to feel that the Kapal is watching — not with the eyes of the deceased, but with the awareness of Bhairava looking through the aperture of impermanence.",
        practice: "Perform the 6-step Kapal Puja every morning. Water, flower, food, mantra, touch to forehead and heart.",
        mantras: [
          { sanskrit: "ओम ह्रीं कपालाय अघोराय नमः", transliteration: "om hrim kapalaya aghoraya namah", meaning: "Primary Kapal Puja mantra", count: "108x daily" },
          { sanskrit: "ओम गंगायै नमः", transliteration: "om gangayai namah", meaning: "While pouring water over the skull", count: "3x" },
        ],
        materials: ["Kapal (real or symbolic)", "Ganga Jal", "Red flower or sindoor", "Small portion of daily food as bhoga", "Clean cloth"],
      },
      {
        id: "kapal-dhyana",
        title: "Kapal Dhyana: Meditation on the Skull",
        titleSanskrit: "Kapāla-Dhyāna",
        content: "Kapal Dhyana is the Aghori's signature meditation — deceptively simple in instruction, extraordinarily profound in effect. The practice: sit before the Kapal at eye level. Gaze into the cranial cavity. Begin with Om Hrim Kapalaya Namah 21x. Then let the mantra drop. Simply gaze. The first layer of practice: you see a skull. You see bone, the empty cavity, the eye sockets. You notice your own reactions — fascination, revulsion, curiosity, fear. Observe these reactions without engaging them. The second layer: the skull begins to feel like a mirror. You are no longer looking at bone. You are looking at the form that consciousness takes when stripped of everything except its container. The boundary between the skull and your own head begins to dissolve. The third layer: consciousness enters the Brahmarandhra visualization. You feel-awareness moving upward through your own Sushumna, entering the crown, expanding into the space above the head — the same space that the skull's cranial cavity represents. You experience what the Aghori calls the 'Great Reversal': instead of being a consciousness inside a body, you become a vast awareness within which the body appears. The skull was teaching you this all along. In the Aghori tradition at Varanasi, advanced practitioners are said to sit in Kapal Dhyana for hours, their eyes open, their bodies still, their awareness expanded far beyond the skull they gaze into. The skull is the door.",
        practice: "Sit before the Kapal. Gaze into the cranial cavity. 21x Om Hrim Kapalaya Namah. Let the mantra drop. Gaze. Let the three layers unfold. Minimum 20 minutes.",
        mantras: [
          { sanskrit: "ओम ह्रीं कपालाय नमः", transliteration: "om hrim kapalaya namah", meaning: "The Kapal Dhyana mantra", count: "21x to begin, then silent gazing" },
        ],
        warnings: ["Kapal Dhyana can trigger profound existential states — do not attempt this practice if you are in a fragile psychological state", "If you experience dissociation, ground immediately by pressing palms to earth and breathing deeply", "Do not force the 'Great Reversal' — it arises naturally from sustained practice"],
      },
      {
        id: "pancha-kapala",
        title: "The Five Skulls: Pancha-Kapala Sadhana",
        titleSanskrit: "Pañca-Kapāla-Sādhanā",
        content: "The Pancha-Kapala Sadhana maps the five faces of Shiva — Sadyojata, Vamadeva, Tatpurusha, Aghora, and Ishana — to five skulls. Each face represents a dimension of consciousness, and each skull becomes the altar for that dimension's worship. This is advanced Aghori practice, taught only after Kapal Puja and Kapal Dhyana have been established for at least six months. The five faces and their skull practices: (1) Sadyojata (West) — the creative principle, the face of manifestation. Skull placed facing west. Mantra: Om Sadyojataya Namah. This practice activates the creative force in the sadhaka — not artistic creativity but the creativity of existence itself, the impulse that manifests form from formlessness. (2) Vamadeva (North) — the sustaining principle, the nurturing face. Skull facing north. Mantra: Om Vamadevaya Namah. This practice stabilizes the sadhaka's energy field and nourishes the subtle body. (3) Tatpurusha (East) — the individualizing principle, the face that creates the illusion of separation. Skull facing east. Mantra: Om Tatpurushaya Namah. Paradoxically, by meditating on the principle of separation, the sadhaka dissolves it. (4) Aghora (South) — the dissolving principle, the face of destruction and transformation. Skull facing south. Mantra: Om Aghoraya Namah. This is the central practice — the face of non-terror, the fire that burns away illusion. (5) Ishana (Above/Crown) — the transcendent principle, the face that is beyond all four directions. Skull placed above the other four or at the crown of the sadhaka's head. Mantra: Om Ishanaya Namah. This is the summit — pure awareness, beyond creation, sustenance, individuality, and dissolution. The complete Pancha-Kapala is performed on Panchami (the fifth day of the lunar fortnight) and takes approximately 2 hours.",
        practice: "On Panchami, arrange five skulls (or one skull moved through five positions) in the five directions. Worship each with its mantra. Begin with Sadyojata (West), proceed clockwise, end with Ishana (Above). Sit in the integrated state for 15 minutes.",
        mantras: [
          { sanskrit: "ओम सद्योजाताय नमः", transliteration: "om sadyojataya namah", meaning: "Sadyojata — the Creative Face", count: "108x" },
          { sanskrit: "ओम वामदेवाय नमः", transliteration: "om vamadevaya namah", meaning: "Vamadeva — the Sustaining Face", count: "108x" },
          { sanskrit: "ओम तत्पुरुषाय नमः", transliteration: "om tatpurushaya namah", meaning: "Tatpurusha — the Individualizing Face", count: "108x" },
          { sanskrit: "ओम अघोराय नमः", transliteration: "om aghoraya namah", meaning: "Aghora — the Dissolving Face", count: "108x" },
          { sanskrit: "ओम ईशानाय नमः", transliteration: "om ishanaya namah", meaning: "Ishana — the Transcendent Face", count: "108x" },
        ],
        warnings: ["Do not attempt Pancha-Kapala until Kapal Puja has been established for at least 6 months", "The Ishana (transcendent) station can cause disorientation — ground immediately after", "This practice is best done at a Smashana or the initiation site"],
        materials: ["Five skulls (real or symbolic) or one skull moved through five positions", "Five small cloths in white, red, yellow, black, and orange", "Ganga Jal, sindoor, flowers, ghee lamp"],
      },
      {
        id: "fear-as-fuel",
        title: "Fear as Fuel: The Aghori Method",
        titleSanskrit: "Bhaya-Anala",
        content: "The Aghori method of working with fear is unique among all spiritual traditions. Where most paths seek to overcome, transcend, or heal fear, the Aghori uses fear as pranic fuel — deliberately entering fear-generating situations and transmuting the terror into spiritual energy. This is not recklessness. It is applied understanding of a physiological mechanism. When fear arises, the adrenal glands flood the body with adrenaline and cortisol. The heart rate accelerates. The pupils dilate. The breath becomes shallow and rapid. This is the body's maximum mobilization of prana — more life-force moves through the system in one minute of genuine terror than in an hour of normal activity. The Aghori does not let this energy dissipate through fight-or-flight. Instead, the sadhaka sits still, breathes deeply, and directs the fear-energy upward through the Sushumna using the bandhas — particularly Mula Bandha (root lock) and Jalandhara Bandha (chin lock). The fear-energy, trapped between these two locks, has nowhere to go but up. It hits the Ajna chakra like a thunderbolt, and the third eye 'blasts open' in the Aghori's experience. This is why advanced Aghori practices are deliberately performed in terrifying locations — cremation grounds at midnight, abandoned temples, forest burial grounds. The fear is not a side effect. It is the fuel. Dr. Vasant Lad's 'Aghora' books document Aghori Vimalananda saying: 'The coward gets nothing from a cremation ground. The brave get everything.' This is literal. The prana released by fear, when captured and directed, accelerates siddhi exponentially.",
        practice: "Choose a practice that generates genuine fear — a midnight cremation ground visit, sitting alone in a dark forest, Kapal Dhyana in absolute darkness. When fear peaks, apply Mula Bandha and Jalandhara Bandha. Breathe the energy upward. Do not move until the fear has transformed.",
        mantras: [
          { sanskrit: "ओम अभयाय भैरवाय नमः", transliteration: "om abhayaya bhairavaya namah", meaning: "Salutations to Fearless Bhairava", count: "108x during the fear practice" },
          { sanskrit: "ओम ह्रीं फट्", transliteration: "om hrim phat", meaning: "Hrim dissolves, Phat shatters — the fear-breaking bija combination", count: "Repeated as needed during peak fear" },
        ],
        warnings: ["Do NOT attempt this practice without a stable meditation practice — the energy can destabilize the unprepared mind", "Mula Bandha and Jalandhara Bandha must be learned from a qualified teacher before applying them in this context", "If you have a history of panic attacks, PTSD, or psychosis, this practice is contraindicated", "Always have a safe exit from the fear-generating location"],
        materials: ["Mala", "Knowledge of Mula Bandha and Jalandhara Bandha", "A genuinely fear-inducing but physically safe location"],
      },
    ],
  },
  {
    id: "phase-4-dhuni",
    phase: "Phase 4",
    phaseSanskrit: "Dhuni — The Sacred Fire",
    title: "The Dhuni: Fire Alchemy",
    titleSanskrit: "Dhuni-Vidyā",
    description: "The Dhuni is the Aghori's primary altar and most constant companion. These five lessons teach the complete science of the sacred fire — from lighting and maintaining to the alchemy of ash and the meditation of pure presence.",
    duration: "Lifelong daily practice",
    difficulty: "Advanced",
    minTier: "akash",
    image: "/assets/tantra/aghoiri-course/bhairava-fierce-form.jpeg",
    lessons: [
      {
        id: "lighting-the-dhuni",
        title: "Lighting the Dhuni: The Sacred Fire of the Aghori",
        titleSanskrit: "Dhuni-Prajvalana",
        content: "The Dhuni is the Aghori's sacred fire — not a campfire, not a havan kund, but a living presence that is treated with the same reverence a householder shows to their family deity. In the Aghori encampments of Varanasi, Girnar, and the Himalayas, the Dhuni has been burning continuously for decades, sometimes centuries, tended by a lineage of Aghoris who add wood and offerings daily. The Dhuni is the Aghori's temple, his kitchen, his cremation ground (for offerings), and his meditation seat all in one. Lighting a personal Dhuni is a significant step. Wood selection matters: dried Palash (Flame of the Forest) is preferred — its red-orange flowers are sacred to Agni and Shiva. Alternative woods: dried mango, neem, or banyan branches. Never use treated or painted wood. The location should be outdoors, on bare earth, preferably in a spot you can return to daily. A shallow pit about 18 inches in diameter is dug. The first fire is lit with the mantra Om Agnaye Dhuniyai Namah 108x as the kindling catches. Ghee is the first offering — a spoonful poured directly onto the emerging flames. The Aghori tends the Dhuni daily. In the morning, ash is collected (more on this in the Bhasm lesson). Fresh wood is added. Offerings are made. At night, the Aghori sits by the Dhuni and meditates. There is no technique. There is only the fire and the one who watches it. Over weeks and months, the Dhuni becomes sentient in the sadhaka's experience. It responds to moods. It flickers during intense japa. It seems to breathe. This is not projection. The Aghori understands that fire is the most conscious of the five elements — it is the only one that moves by its own nature toward the sky, toward the formless.",
        practice: "Dig a shallow pit on bare earth. Gather Palash or mango wood. Light the first fire with Om Agnaye Dhuniyai Namah. Offer ghee. Sit for 30 minutes. Tend it daily.",
        mantras: [
          { sanskrit: "ओम अग्नये धुनिये नमः", transliteration: "om agnaye dhuniyai namah", meaning: "Salutations to Agni as the Dhuni", count: "108x when lighting" },
          { sanskrit: "ओम धूम्राकृतये नमः", transliteration: "om dhumrakritaye namah", meaning: "Salutations to the Smoke-Maker — Agni who transforms form into formless", count: "3x daily when tending" },
        ],
        materials: ["Dried Palash, mango, neem, or banyan wood", "Ghee for first offering", "Matches or traditional fire-starting tools", "Shallow pit on bare earth"],
        warnings: ["Never light a Dhuni near structures, trees, or flammable materials", "Check local fire regulations before establishing an outdoor fire", "Keep water or sand nearby for emergency extinguishing", "Do not leave the Dhuni unattended while flames are active"],
      },
      {
        id: "ahuti",
        title: "Ahuti: Offerings to the Fire",
        titleSanskrit: "Āhuti",
        content: "Ahuti is the act of offering into the Dhuni — the moment when the material world meets the fire of transformation. The Aghori's understanding of fire alchemy is precise: everything offered to the Dhuni is converted from gross form to subtle form. Ghee becomes light. Sesame becomes sound. Camphor becomes the purest Akasha. This is not metaphor. The Aghori experiences the fire as a dimensional gateway — what goes in as matter comes out as prana that directly feeds the subtle body. The primary offerings and their mantras: Ghee — Om Hrim Ghrutam Ahutim Samarpayami — the most sattvic offering, nourishes ojas and produces the purest flame. Offer one spoonful at a time. Black sesame (Til) — Om Hrim Tilam Ahutim Samarpayami — the offering to the ancestors (Pitrs) and Bhutas. Each seed represents a soul. The black color absorbs negativity. Camphor (Karpura) — Om Hrim Karpuram Ahutim Samarpayami — burns completely without residue. The Aghori's ideal offering: the ego that leaves no trace. Sandalwood paste — Om Hrim Chandanam Ahutim Samarpayami — the offering of purity, produces a fragrant smoke that calms the mind and opens the Anahata. Coconut — offered whole, it represents the human head — the ego cracked open by the fire of wisdom. The timing of offerings matters: morning Ahuti is for sustenance and health; evening Ahuti is for dissolution and surrender; midnight Ahuti is for esoteric purposes. Each offering is made with the right hand, the item held at heart level, then released into the flames while chanting the specific mantra. The Aghori watches the offering burn. The moment between the material and the flame is the moment of teaching. Everything you offer will become ash. Everything you are will become ash. Offer it willingly.",
        mantras: [
          { sanskrit: "ओम ह्रीं घृतमाहुतिं समर्पयामि", transliteration: "om hrim ghrutam ahutim samarpayami", meaning: "I offer ghee to the fire", count: "With each spoonful" },
          { sanskrit: "ओम ह्रीं तिलमाहुतिं समर्पयामि", transliteration: "om hrim tilam ahutim samarpayami", meaning: "I offer black sesame to the fire", count: "With each pinch" },
          { sanskrit: "ओम ह्रीं कर्पूरमाहुतिं समर्पयामि", transliteration: "om hrim karpuram ahutim samarpayami", meaning: "I offer camphor to the fire", count: "With each piece" },
        ],
        materials: ["Ghee", "Black sesame seeds", "Camphor", "Sandalwood paste", "Coconut (optional, for special occasions)", "Spoon for ghee"],
      },
      {
        id: "bhasm-ash-alchemy",
        title: "Bhasm: The Alchemy of Ash",
        titleSanskrit: "Bhasma-Vidyā",
        content: "Bhasm — sacred ash — is the Aghori's signature substance and one of the most misunderstood elements of the tradition. To the outsider, it is the mark of the madman who smears himself with cremation ash. To the Aghori, it is the most purified substance on earth, the endpoint of all transformation, the great equalizer. The Aghori tradition recognizes three types of Bhasm. First: Agni Bhasm — ash from the Dhuni or havan fire. This is sattvic, produced by pure offerings (ghee, sesame, camphor). It is used for daily application to the forehead and body. Second: Chita Bhasm — ash from the cremation pyre. This carries the specific frequency of human transformation. It is collected from pyres that have burned for at least three nights (Veergati ash — the ash of one who has died bravely or naturally, not through violence or disease). Third: Vibhuti — the prepared ash, made by drying cow dung, burning it in a copper vessel with specific mantras, and grinding it fine with Ganga Jal. This is the most versatile Bhasm, used for internal and external application. The alchemy of Bhasm lies in what it represents: the final state of every material substance. Gold becomes Bhasm. The body becomes Bhasm. The ego becomes Bhasm. By applying ash, the Aghori aligns his consciousness with this ultimate truth every single day. The Tripundra — three horizontal lines of ash on the forehead — represents the three gunas bound by the knower. The broader application to the limbs is the practice of Bhasma Snana — the ash bath, in which the Aghori rubs ash over the entire body, remembering that this body, too, will be ash.",
        practice: "Collect Dhuni ash daily. Apply Tripundra each morning. On special days, perform full Bhasma Snana (ash bath).",
        mantras: [
          { sanskrit: "ओम भस्माङ्गमृषये नमः", transliteration: "om bhasmam gam mrishaye namah", meaning: "I wear ash to remember mortality", count: "1x while applying Tripundra" },
          { sanskrit: "ओम नमः शिवाय", transliteration: "om namah shivaya", meaning: "The simplest and most powerful Bhasm mantra", count: "3x while applying ash to body" },
        ],
        materials: ["Dhuni Bhasm (daily collection)", "Copper vessel for Vibhuti preparation", "Ganga Jal", "Cotton cloth for straining"],
        warnings: ["Chita Bhasm must be purified in a copper vessel with Panchagavya before application — raw pyre ash may contain harmful residues", "Do not apply Bhasm to open wounds", "Vibhuti for internal use must be prepared under hygienic conditions"],
      },
      {
        id: "agni-hotra",
        title: "Agni Hotra: Vedic Fire Meets Tantric Transformation",
        titleSanskrit: "Agni-Hotra",
        content: "Agni Hotra — the Vedic fire sacrifice — meets Tantra in the Aghori's Dhuni. The classical Agni Hotra is performed at exact sunrise and sunset, timed to the second. Two offerings of ghee and rice are made into the fire while chanting the Agni Hotra mantras. The Aghori preserves this practice but infuses it with Tantric understanding. The sunrise Agni Hotra aligns the Dhuni with the Surya (solar) frequency, activating Pingala nadi and the day's pranic cycle. The sunset Agni Hotra aligns the Dhuni with the Chandra (lunar) frequency, activating Ida nadi and the night's restorative cycle. The mantras: at sunrise — Om Suryaya Swaha, Om Prajapataye Swaha; at sunset — Om Agnaye Swaha, Om Prajapataye Swaha. Each mantra is chanted twice as the offering is made. The Aghori adds a Tantric layer: after the Vedic mantras, Om Hrim Bhairavaya Dhunyai Namah is chanted 3x, dedicating the fire's alchemy not merely to cosmic order (the Vedic purpose) but to the dissolution of the individual ego (the Tantric purpose). The Mantra-pushpanjali — the offering of flowers and mantras to the Dhuni after the Agni Hotra — is the closing act. Red flowers are offered one by one, each accompanied by Om Hrim, creating a cascade of fire and fragrance that marks the transition from the ritual to the meditation that follows.",
        practice: "Perform Agni Hotra at exact sunrise and sunset. Two offerings per session. Add the Tantric dedication mantra. Follow with 15 minutes of Dhuni meditation.",
        mantras: [
          { sanskrit: "ओम सूर्याय स्वाहा", transliteration: "om suryaya svaha", meaning: "Sunrise Agni Hotra — to Surya", count: "2x with offering" },
          { sanskrit: "ओम प्रजापतये स्वाहा", transliteration: "om prajapataye svaha", meaning: "To Prajapati — the Lord of Creatures", count: "2x with offering" },
          { sanskrit: "ओम अग्नये स्वाहा", transliteration: "om agnaye svaha", meaning: "Sunset Agni Hotra — to Agni", count: "2x with offering" },
          { sanskrit: "ओम ह्रीं भैरवाय धुन्यै नमः", transliteration: "om hrim bhairavaya dhunyai namah", meaning: "Tantric dedication of the fire", count: "3x after Vedic mantras" },
        ],
        materials: ["Uncooked rice", "Ghee", "Exact sunrise/sunset times for your location", "Red flowers for Mantra-pushpanjali"],
      },
      {
        id: "dhuni-as-guru",
        title: "The Dhuni as Guru: The Meditation That Requires No Technique",
        titleSanskrit: "Dhuni-Guru",
        content: "Of all Aghori practices, this is the simplest and the most profound. Sit by the Dhuni. Do nothing. No mantra. No visualization. No breath control. No technique of any kind. Just sit and watch the fire. This is the practice the Aghori calls Dhuni Darshan — the vision of the fire. It is the meditation that requires no technique because the fire IS the technique. Fire is the only element that is perpetually in motion yet never goes anywhere. It transforms everything it touches yet is never itself changed. It consumes without being diminished. The Aghori watches the fire for hours — sometimes all night — and learns from it the nature of pure awareness. Awareness consumes experience without being consumed. Awareness transforms without being changed. The fire teaches what no guru can teach with words: the state of being fully present without agenda. Aghoreshwar Bhagwan Ramji would sit by his Dhuni at the Aghor Peeth in Varanasi for entire nights, available to anyone who came, responding to questions only when asked, otherwise simply present with the fire. His disciples reported that sitting near him during these sessions was more transformative than any formal teaching. The fire had entered him, and sitting near him was like sitting near a living Dhuni. This is the goal: not to meditate on the fire, but to become the fire — the state of luminous, transformative presence that requires no effort to maintain because it is your natural condition once every obstruction has been burned away.",
        practice: "Sit by the Dhuni. No technique. Watch the fire. When the mind wanders, return to watching. Do this for at least 30 minutes daily, extending to hours as the practice deepens.",
        mantras: [
          { sanskrit: "(none)", transliteration: "(no mantra — this practice is beyond mantra)", meaning: "The Dhuni teaches in silence", count: "Duration-based, not count-based" },
        ],
        warnings: ["Do not fall asleep by the Dhuni — maintain alert awareness", "If the fire is large, maintain a safe distance", "This practice is deceptively deep — the mind may resist intensely because there is nothing to do"],
      },
    ],
  },
  {
    id: "phase-5-smashana-vision",
    phase: "Phase 5",
    phaseSanskrit: "Śmaśāna-Dṛṣṭi — The Cremation Ground Vision",
    title: "The Smashana Vision: Cremation Ground Practices",
    titleSanskrit: "Śmaśāna-Sādhana",
    description: "The Aghori enters the cremation ground not as a visitor but as a student. These six lessons cover the complete science of Smashana practice — from first entry to the most advanced Kali and Chandika sadhanas performed at the burning ground.",
    duration: "Lifelong practice; specific sadhanas on Amavasya and Gupt Amavasya",
    difficulty: "Advanced",
    minTier: "akash",
    image: "/assets/tantra/aghoiri-course/mahakali-cremation.jpeg",
    lessons: [
      {
        id: "first-entry",
        title: "First Entry: How to Enter a Cremation Ground",
        titleSanskrit: "Śmaśāna-Praveśa",
        content: "The first entry into a Smashana for practice is one of the most significant moments in an Aghori sadhaka's life. It must be done with preparation, respect, and awareness — never with bravado. Timing: the first entry should be during late afternoon, approximately one hour before sunset. This is the transition hour when the ordinary world is withdrawing and the liminal quality of the Smashana begins to emerge. It is dark enough to feel the charge but light enough to see clearly. Approach: walk slowly. Do not rush. As you enter, chant Om Bhairavaya Smashanavasine Namah 3x. This announces your presence to the presiding deities and the Bhutas — not as an intruder but as one who comes with respect. Do not enter areas where active cremations are taking place or where families are mourning. This is their grief and their sacred moment. Choose an area where old pyres have cooled — the ash pile is your seat. The psychology: the first visit will trigger every defense mechanism the ego possesses. Disgust, fear, intellectualization, spiritual bypassing ('I'm above this'), morbid fascination — all of these will arise. Observe them. They are the curriculum. The Aghori tradition teaches that the Smashana has a presiding deity — Smashana Bhairava — and that this deity tests every newcomer. If you come with ego, he will humble you. If you come with fear, he will terrify you. If you come with sincerity and the proper mantras, he will teach you. Sit for a minimum of 30 minutes on the first visit. Do nothing. Observe everything. Smell the air. Listen to the sounds. Watch the crows and dogs — the Aghori's animal gurus who show no revulsion at death. When you leave, do not look back. Chant Om Bhairavaya Namah 3x as you exit.",
        practice: "Visit the Smashana one hour before sunset. Enter slowly. Chant entry mantra. Sit on cooled ash for 30 minutes. Observe all reactions without engagement. Exit without looking back.",
        mantras: [
          { sanskrit: "ओम भैरवाय श्मशानवासिने नमः", transliteration: "om bhairavaya smashanavasine namah", meaning: "Salutations to Bhairava Who Dwells in the Cremation Ground", count: "3x on entry and exit" },
        ],
        warnings: ["Never visit a Smashana at night alone on your first entry", "Maintain respectful distance from grieving families and active pyres", "Do not touch cremation remains without specific instruction", "Trust your instincts — if the location feels wrong, leave immediately", "Carry your charged phone in silent mode"],
      },
      {
        id: "chita-bhasm",
        title: "Chita Bhasm: Collecting and Working with Pyre Ash",
        titleSanskrit: "Chitā-Bhasma",
        content: "Chita Bhasm — ash from the cremation pyre — is the most potent and most carefully handled substance in the Aghori's pharmacopoeia. It is not raw ash scooped from a pyre. It is a carefully collected, specifically selected, and ritually purified substance that carries the frequency of the great transformation. Selection: the Aghori seeks Veergati ash — ash from pyres that have burned for at least three full nights. The three-night pyre (Tribali Chita) has reduced the body to its most elemental state. The ash from the first night's pyre may still contain organic matter. The three-night pyre has produced Bhasm in the truest sense. Collection: the ash is collected from the edges of the pyre, not from the center where unburnt material may remain. It is gathered in a copper vessel — copper being the metal of Agni and the most purifying conductor. Purification: the raw ash is mixed with Panchagavya (five products of the cow: milk, curd, ghee, urine, and dung), dried in sunlight, and ground to a fine powder. This purification removes any residual physical impurities and, in the Aghori understanding, transforms the ash's frequency from tamasic (associated with death) to sattvic (associated with transformation). Application: purified Chita Bhasm is applied to the third eye and the heart center before advanced Smashana practices. It is also used in the preparation of esoteric Tantric medicines and in certain sealed practices of the Aghori tradition. Aghori Vimalananda, in Dr. Vasant Lad's books, describes Chita Bhasm as 'the medicine that cures the only disease worth curing — the disease of being alive.'",
        mantras: [
          { sanskrit: "ओम चिताभस्माय नमः", transliteration: "om chitabhasmaya namah", meaning: "Salutations to the Pyre Ash", count: "3x during collection" },
          { sanskrit: "ओम पञ्चगव्ये शुद्धिं कुरु", transliteration: "om panchagavye shuddhim kuru", meaning: "Purify through Panchagavya", count: "3x during purification" },
        ],
        materials: ["Copper vessel for collection", "Panchagavya (milk, curd, ghee, cow urine, cow dung)", "Sunlight for drying", "Mortar and pestle for grinding"],
        warnings: ["Raw pyre ash must NEVER be applied to the body without Panchagavya purification", "Do not collect ash from pyres of those who died by suicide or violence", "Follow all local laws regarding cremation ground access", "Copper vessels for this purpose should never be used for food"],
      },
      {
        id: "preta-samvada",
        title: "Preta Saṁvāda: Spirit Dialogue",
        titleSanskrit: "Preta-Saṁvāda",
        content: "Preta Saṁvāda — literally 'dialogue with the departed' — is the Aghori practice of communicating with the dead. It is documented here as heritage and tradition. The Aghori's relationship with the dead is not one of mediumship or channeling. It is one of non-dual recognition: the dead are not gone. They have simply changed frequency. The Aghori, whose consciousness has been trained to operate at the Smashana frequency, can perceive and interact with these entities. The protocol, as preserved in the oral tradition: the Aghori sits in the Smashana after midnight. A small Dhuni or camphor flame is lit. The Aghori chants Om Pretanam Pati Bhairavaya Namah 108x — invoking Bhairava as the Lord of the Departed. Then, in a state of deep stillness, the Aghori listens. The communication is not verbal (usually). It is felt — as pressure changes, temperature shifts, emotional impressions, or, in advanced states, as direct knowing. The Aghori tradition has extensive teachings on the categories of Pretas: those who died with unfulfilled desires, those who died violently, those who are bound by attachments, those who have moved toward the next incarnation but linger, and those who have achieved liberation but remain accessible. Each category requires a different approach. The ethics: the Aghori does not initiate Preta Saṁvāda for curiosity, for messages to the living, or for any form of entertainment. It is performed only when a specific need arises — when a departed soul is stuck and seeks assistance in moving on. The Aghori's role is that of a guide, not a messenger.",
        mantras: [
          { sanskrit: "ओम प्रेतानां पते भैरवाय नमः", transliteration: "om pretanam pataye bhairavaya namah", meaning: "Salutations to Bhairava, Lord of the Departed", count: "108x" },
          { sanskrit: "ओम शान्तिं शान्तिं शान्तिः", transliteration: "om shantim shantim shantih", meaning: "Peace peace peace — for the departed soul", count: "3x at close" },
        ],
        warnings: ["This practice is documented as heritage — do not attempt without direct guru guidance", "Never initiate Preta Saṁvāda out of curiosity", "If a negative entity makes contact, chant Om Hum Phat Bhairavaya Phat 21x and leave immediately", "Prolonged engagement with Pretas can destabilize the sadhaka's energy field"],
      },
      {
        id: "smashana-bhava",
        title: "Smashana Bhava: The Cremation-Ground Meditation",
        titleSanskrit: "Śmaśāna-Bhāva",
        content: "Smashana Bhava is the meditation that the Aghori considers the most transformative single practice in the entire tradition. It is simple to describe and devastating to experience. The practice: sit in the cremation ground, ideally in the ash pile where pyres have burned. Close your eyes. Begin with the mantra Om Smashanabhairavaya Namah 108x. Then begin the visualization. See your own body on the pyre. See it clearly — your face, your hands, the clothes you are wearing. See the fire lit. See it catch. Watch your body burn. Watch the skin blister and blacken. Watch the muscles contract. Watch the bones emerge, then calcify, then crumble to ash. Watch the skull roll free. The visualization must be detailed and sustained — not a flash but a full twenty minutes of watching yourself burn. The Aghori calls this the Great Reversal (Maha-Viloma). Every spiritual practice, every meditation, every prayer in every tradition is ultimately an attempt to answer one question: what am I? Smashana Bhava provides the answer by showing you what you are not. The body burns. The name is forgotten. The story ends. What watches the burning? That is what you are. When this practice reaches its peak, the sadhaka experiences a radical reorientation of identity. The body is no longer 'me.' It is a temporary garment that is even now burning, even now returning to the elements. The one who watches is untouched, unborn, undying. Aghoreshwar Bhagwan Ramji said: 'The man who has watched his own cremation in meditation is free. Not because he has conquered death. But because he has seen that there is no one to die.'",
        practice: "Sit in a Smashana at night. Chant 108x. Visualize your own cremation in detail for 20 minutes. Sit in the aftermath. Leave in silence.",
        mantras: [
          { sanskrit: "ओम श्मशानभैरवाय नमः", transliteration: "om smashanabhairavaya namah", meaning: "Salutations to Bhairava of the Cremation Ground", count: "108x to begin" },
        ],
        warnings: ["This is an extremely intense practice — do not attempt if you are in a fragile emotional state", "If the visualization triggers panic, open your eyes and press your palms to the earth", "This practice should be done no more than once per month", "Have a grounding practice ready for after the session — eating warm food, gentle walking"],
      },
      {
        id: "mahakali-amavasya",
        title: "Mahakali Amavasya Sadhana: The Night of Kali",
        titleSanskrit: "Mahākālī-Amāvāsyā-Sādhanā",
        content: "The Amavasya (new moon) night is when the veil between dimensions is thinnest, and the Mahakali Amavasya Sadhana is one of the most powerful practices in the Aghori arsenal. Performed in the Smashana between the second quarter of night (12-3 AM, Nishitha Kala), this sadhana invokes Mahakali in her cremation-ground form — not the benign mother of the devotional tradition, but the fierce, black, blood-drinking Kali who stands on Shiva's corpse in the burning ground. The setup: a triangular Yantra is drawn on the ground using Rakta Chandan (red sandalwood paste) or red sindoor. The triangle points downward — the Yoni Yantra, the source of all creation and destruction. At each corner, a camphor flame is lit. In the center, the Kapal is placed with Chita Bhasm inside. The sadhaka sits facing south. The mantra: Om Kreem Kalikayai Namah — the Kreem bija is Kali's own seed, carrying her transformative power. The count is 1008. As the japa progresses, the sadhaka visualizes Mahakali emerging from the darkness behind the Yantra — black as space, naked as truth, her four arms holding the sword of wisdom, the severed head of ego, the mudra of fearlessness, and the mudra of boons. Her tongue extends beyond her teeth — not in rage but to taste the blood of every demon the sadhaka carries within. At the completion of the 1008th repetition, the sadhaka offers a red hibiscus flower and a drop of blood or red sindoor to the Yantra. The practice closes with Om Kreem Phat 21x — Phat being the bija that seals the practice and grounds the energy. The Aghori tradition warns that this sadhana, when performed correctly, will strip away an entire layer of samskara in a single night. The aftermath is often a day of emotional intensity, followed by extraordinary clarity.",
        practice: "On Amavasya, at midnight, in a Smashana or the initiation site. Draw the triangular Yantra. Light three camphor flames. Place Kapal with Chita Bhasm. Sit facing south. Chant Om Kreem Kalikayai Namah 1008x. Visualize Mahakali. Offer flower and sindoor. Close with Om Kreem Phat 21x.",
        mantras: [
          { sanskrit: "ओम क्रीं कालिकायै नमः", transliteration: "om kreem kalikayai namah", meaning: "Primary Kali bija mantra — Kreem is Kali's transformative seed", count: "1008x" },
          { sanskrit: "ओम क्रीं फट्", transliteration: "om kreem phat", meaning: "Kreem invokes, Phat seals — the closing bija combination", count: "21x at close" },
        ],
        warnings: ["Do not perform without at least one year of consistent Bhairava practice", "The emotional aftermath can last 24-48 hours — do not schedule important activities the next day", "If you experience possession-like symptoms during the sadhana, stop immediately and chant Om Namo Bhagavate Rudraya 108x", "Red sandalwood paste and sindoor should be pure — synthetic substitutes are ineffective"],
        materials: ["Rakta Chandan (red sandalwood paste) or red sindoor", "Three camphor tablets on small plates", "Kapal with Chita Bhasm", "Red hibiscus flowers", "Kali image or Yantra for focus", "Mala (preferably red coral or Rudraksha)"],
      },
      {
        id: "sheetla-chandika",
        title: "Sheetla Chandika Sadhana: The Healer of Death's Door",
        titleSanskrit: "Śītalā-Caṇḍikā-Sādhanā",
        content: "Sheetla Chandika is a rare and esoteric form of the Devi — blood-red, associated with healing at the threshold of death, worshipped in the Aghori tradition for the most serious illnesses and for the final transition itself. The word Sheetla means 'the cooling one' — paradoxically, this red-hot Devi cools the fires of disease and the terror of dying. This sadhana is performed on Gupt Amavasya — the secret new moon, which occurs when two Amavasyas fall within the same lunar month, an event that happens roughly every 32-36 months. The Aghori considers Gupt Amavasya the most potent night of the esoteric calendar, more powerful even than Mahashivratri for certain practices. The sadhana is performed at the bedside of one who is critically ill (with their consent or that of their family) or in the Smashana for those who have recently passed. The setup is similar to the Mahakali sadhana but with key differences: the Yantra is drawn in white ash (not red sindoor) on a black cloth. The Devi is visualized as blood-red but surrounded by a cooling blue aura. The mantra: Om Hreem Sheetla Chandikayai Namah — the Hreem bija (Maya) combined with Sheetla Chandika's name creates a vibration that simultaneously activates and soothes. The Aghori tradition preserves specific applications: disease-sight (seeing the energetic pattern of illness in the patient's body), dying-cure (easing the transition for the departing soul), and death-prevention (in rare cases, reversing the condition — though the tradition warns that this 'cures' by burning the disease out through the Aghori's own body, at great cost to the practitioner). This sadhana is documented here as heritage. The Aghori considers it among the most dangerous practices in the tradition and the one most subject to misuse.",
        mantras: [
          { sanskrit: "ओम ह्रीं शीतला चण्डिकायै नमः", transliteration: "om hreem sheetla chandikayai namah", meaning: "Hreem (Maya bija) + Sheetla Chandika — the cooling fiery healer", count: "1008x on Gupt Amavasya" },
          { sanskrit: "ओम शान्तिदेव्यै नमः", transliteration: "om shantidevyai namah", meaning: "Salutations to the Goddess of Peace — for the patient or the departed", count: "108x" },
        ],
        warnings: ["This sadhana is documented as heritage — direct guru guidance is absolutely required", "Do not perform at a patient's bedside without medical and family consent", "The 'dying-cure' application should only be performed by an established Aghori", "Never attempt the 'death-prevention' application without a living guru present — the cost to the practitioner can be severe"],
        materials: ["White ash for Yantra", "Black cloth", "Red flowers (only if the patient is living)", "Cool water", "Gupt Amavasya calendar tracking"],
      },
    ],
  },
  {
    id: "phase-6-inner-alchemy",
    phase: "Phase 6",
    phaseSanskrit: "Antaḥ-Rasa — The Inner Elixir",
    title: "The Inner Alchemy: Nadi, Kundalini, Prana",
    titleSanskrit: "Nāḍī-Kuṇḍalinī-Prāṇa-Vidyā",
    description: "The internal practices that form the Aghori's mastery of the subtle body. Nadi Shuddhi, Kundalini activation, the five Pranas, Tattva dissolution, death-conquering, and lunar-solar integration.",
    duration: "Lifelong daily practice; specific protocols during retreat",
    difficulty: "Advanced",
    minTier: "akash",
    image: "/assets/tantra/aghoiri-course/abandoned-temple-midnight.jpeg",
    lessons: [
      {
        id: "nadi-shuddhi",
        title: "Nadi Shuddhi: The 12-Stage Aghori Protocol",
        titleSanskrit: "Nāḍī-Śuddhi",
        content: "Nadi Shuddhi in the Aghori tradition goes far beyond the simple alternate nostril breathing taught in yoga studios. The Aghori 12-stage protocol is a systematic clearing of the entire nadi network, proceeding from the gross to the subtle. Stage 1: Surya Bhedana (inhale right, exhale left) — activates Pingala, burns tamas. Stage 2: Chandra Bhedana (inhale left, exhale right) — activates Ida, burns rajas. Stage 3: Nadi Shodhana (alternate nostril) — balances the two. Stage 4: Bhastrika (bellows breath) — blasts through blockages with force. Stage 5: Kapalabhati (skull-shining breath) — purifies the frontal lobes and ajna. Stage 6: Surya Bhedana + Bandhas — inhale right, apply Mula, Jalandhara, and Uddiyana bandhas, hold, release left. Stage 7: Kevala Kumbhaka preparation — the breath begins to pause spontaneously between inhale and exhale. Stage 8: Shakti Chalini — the breath is directed upward through Sushumna using bandhas and visualization. Stage 9: Chakra-by-chakra clearing — breath is held at each chakra for 30 seconds while the Bija is chanted. Stage 10: Sushumna activation — the prana is felt as a thin golden thread moving through the central channel. Stage 11: Brahma Nadi clearing — the finest nadi within Sushumna, where Kundalini travels. Stage 12: Spontaneous Kumbhaka — the breath stops. Not held. It simply stops. The Aghori sits in this breathless state, which is the threshold of Bhairava consciousness. The complete protocol takes 45-60 minutes and is performed daily during intensive practice periods and weekly during normal periods.",
        practice: "Perform the 12 stages sequentially. Each stage builds on the previous. Do not rush. When Stage 12 (spontaneous breath cessation) occurs, remain still for as long as it lasts.",
        mantras: [
          { sanskrit: "ओम नाडीशुद्धिं कुरु", transliteration: "om nadishuddhim kuru", meaning: "Purify the nadis", count: "3x at the start" },
          { sanskrit: "ओम लं वं रं यं हं", transliteration: "om lam vam ram yam ham", meaning: "Chakra Bijas for Stage 9", count: "Chant at each chakra during Stage 9" },
        ],
        warnings: ["Stages 6-12 should only be attempted after 6 months of daily Stages 1-5", "Bandhas must be learned from a qualified teacher before practice", "If you experience pain, dizziness, or irregular heartbeat, stop immediately", "Spontaneous Kumbhaka (Stage 12) arises from practice — it cannot be forced"],
      },
      {
        id: "kundalini-jagarana",
        title: "Kundalini Jagarana: Awakening the Serpent",
        titleSanskrit: "Kuṇḍalinī-Jāgaraṇa",
        content: "The Aghori approach to Kundalini differs significantly from the classical Hatha Yoga of the Gheranda Samhita or Hatha Yoga Pradipika. In classical Hatha, Kundalini is awakened through years of Asana, Pranayama, Mudra, and Bandha, with the goal of Her rising through Sushumna to merge with Shiva in the Sahasrara. The Aghori approach is more direct — and more dangerous. The Aghori uses the Bhairava tattva itself as the Kundalini activator. When the sadhaka has undergone the Bhairava initiation (Phase 2), maintained the Kapal practice (Phase 3), tended the Dhuni (Phase 4), and worked in the Smashana (Phase 5), the Kundalini has already been stirred. The Aghori's role is not to force Her upward but to clear the path and allow Her natural ascent. The key Aghori Kundalini practices: (1) Bhasm application to the Muladhara — the ash carries the frequency of transformation and signals the Kundalini that this body is ready. (2) Kapal Dhyana with the gaze directed downward — this creates a subtle suction that draws Kundalini upward from Her coiled position. (3) Dhuni meditation — sitting by the sacred fire aligns the inner Agni (Kundalini) with the outer Agni (Dhuni), and fire calls to fire. (4) The Bhairava Mantra (Om Hrim Bhairavaya Namah) chanted at Muladhara — the Hrim bija creates a vibrational opening that Kundalini can pass through. The Aghori tradition warns that Kundalini awakening without the container of non-dual awareness leads to what is called 'Kundalini syndrome' — energy movements that the practitioner cannot integrate, leading to physical, emotional, and spiritual crisis. This is why the Aghori does not pursue Kundalini directly. The Aghori pursues Bhairava — the non-dual state — and Kundalini follows as a natural consequence.",
        practice: "Do not pursue Kundalini directly. Continue daily Kapal Puja, Dhuni meditation, and Bhairava japa. When Kundalini stirs, observe without excitement or fear. She rises when the path is clear.",
        mantras: [
          { sanskrit: "ओम ह्रीं भैरवाय नमः", transliteration: "om hrim bhairavaya namah", meaning: "Chanted at Muladhara to create the vibrational opening for Kundalini", count: "108x daily" },
          { sanskrit: "ओम कुण्डलिन्यै नमः", transliteration: "om kundalinyai namah", meaning: "Salutations to the Serpent Power", count: "3x at start of practice" },
        ],
        warnings: ["Do NOT pursue Kundalini awakening directly — let it arise through established practice", "If you experience involuntary energy movements, physical heat, or emotional intensity that you cannot manage, consult a qualified teacher immediately", "Kundalini awakening without non-dual awareness is the most common cause of spiritual crisis in Tantric practice", "The Aghori approach is: pursue Bhairava, and Kundalini follows"],
      },
      {
        id: "five-pranas",
        title: "The Five Pranas: Aghori Mastery of the Vital Winds",
        titleSanskrit: "Pañca-Prāṇa-Vidyā",
        content: "The five Pranas are the five movements of the single cosmic life-force as it expresses through the human body. The Aghori does not merely know these intellectually — the Aghori masters each one through direct experience and learns to direct them at will. Prana (the upward-moving vital breath) resides in the chest and head, governing inhalation, sensory reception, and the heart. It is the breath of life. Apana (the downward-moving vital breath) resides in the lower abdomen, governing exhalation, elimination, and the grounding force. It is the breath of earth. Samana (the equalizing breath) resides at the navel, governing digestion, metabolism, and the balancing of Prana and Apana. It is the breath of fire. Udana (the outward-moving breath) resides in the throat, governing speech, effort, and the upward movement of energy at the moment of death. It is the breath of transcendence. Vyana (the pervasive breath) permeates the entire body, governing circulation, nervous system function, and the coordination of all other Pranas. It is the breath of totality. The Aghori mastery practice: the sadhaka sits in Padmasana or Siddhasana and systematically activates, directs, and integrates each Prana through specific breathing patterns and visualizations. The culmination is Kevala Kumbhaka — the spontaneous cessation of all breathing in which all five Pranas merge into a single unified field of vital energy. In this state, the Aghori experiences the body as a luminous energy body with no boundaries between inside and outside. The breath has stopped not because of effort but because there is no longer a distinction between the breather and the breath.",
        practice: "Systematically work with each Prana: (1) Prana — deep chest breathing, 10 min. (2) Apana — lower abdominal breathing, 10 min. (3) Samana — navel-focused breathing, 10 min. (4) Udana — throat-focused upward breathing, 10 min. (5) Vyana — full-body breath awareness, 10 min. End with silent sitting, allowing Kevala Kumbhaka to arise naturally.",
        mantras: [
          { sanskrit: "ओम प्राणाय नमः", transliteration: "om pranaya namah", meaning: "Salutations to Prana — the upward-moving life force", count: "16x during Prana stage" },
          { sanskrit: "ओम अपानाय नमः", transliteration: "om apanaya namah", meaning: "Salutations to Apana — the downward-moving force", count: "16x during Apana stage" },
          { sanskrit: "ओम समानाय नमः", transliteration: "om samanaya namah", meaning: "Salutations to Samana — the equalizing force", count: "16x during Samana stage" },
          { sanskrit: "ओम उदानाय नमः", transliteration: "om udanaya namah", meaning: "Salutations to Udana — the transcendent force", count: "16x during Udana stage" },
          { sanskrit: "ओम व्यानाय नमः", transliteration: "om vyanaya namah", meaning: "Salutations to Vyana — the pervasive force", count: "16x during Vyana stage" },
        ],
        warnings: ["Do not force Kumbhaka (breath retention) — let it arise naturally from the practice", "If you feel suffocating, breathe normally immediately", "This practice should be done on an empty stomach, ideally in the early morning"],
      },
      {
        id: "tattva-shuddhi",
        title: "Tattva Shuddhi: Purifying the 36 Tattvas",
        titleSanskrit: "Tattva-Śuddhi",
        content: "The Shaiva philosophical system recognizes 36 tattvas — 36 principles of existence that cascade from the most subtle (Shiva-tattva, pure consciousness) to the most gross (Prithvi-tattva, the earth element). Tattva Shuddhi is the systematic dissolution of these 36 principles in reverse order — from earth back to pure consciousness. The 36 tattvas in ascending order: Prithvi (earth), Jala (water), Tejas (fire), Vayu (air), Akasha (ether) — the five Mahabhutas. Then: Shabda, Sparsha, Rupa, Rasa, Gandha — the five Tanmatras (subtle sensory elements). Then: Karna, Tvak, Chakshu, Jihva, Ghrana — the five Jnanendriyas (sense organs). Then: Vak, Pani, Pada, Payu, Upastha — the five Karmendriyas (motor organs). Then: Manas (mind), Buddhi (intellect), Ahamkara (ego), Prakriti (nature). Then: Purusha (soul), Rajas (activity), Tamas (inertia), Sattva (purity), Niyati (destiny), Kala (time), Vidya (knowledge), Raga (attachment), Kalaa (art/skill), Ganesha, Shakti, Shiva-Shakti (the unified field), Shiva (pure consciousness). The Aghori practice: starting from Prithvi, each tattva is visualized at its location in the body, its Bija is chanted, and it is dissolved into the tattva above it. The visualization: imagine each tattva as a colored light that is absorbed into the light above it. Prithvi (yellow) dissolves into Jala (white), Jala into Tejas (red), and so on, until only the luminous void of Shiva-tattva remains. This practice is the intellectual's path to the same state the Smashana teaches through direct experience. Both arrive at the same place. The Aghori has traveled both routes.",
        practice: "Perform the ascending dissolution of all 36 tattvas. Visualize, chant Bija, dissolve upward. Sit in the Shiva-tattva state for 10 minutes. This is an advanced practice — study the 36 tattvas thoroughly before attempting.",
        mantras: [
          { sanskrit: "ओम तत्त्वशुद्धिं कुरु कुरु स्वाहा", transliteration: "om tattvashuddhim kuru kuru svaha", meaning: "Purify the tattvas, purify them", count: "3x at start" },
        ],
        warnings: ["Do not attempt without thorough study of the 36 tattvas of Shaiva philosophy", "This practice can cause extreme disorientation — perform only when you have time to rest afterward", "Work with a teacher who has completed Tattva Shuddhi themselves"],
      },
      {
        id: "mrit-sanjeevani",
        title: "Mrit Sanjeevani: The Death-Conquering Practice",
        titleSanskrit: "Mṛt-Saṁjīvanī",
        content: "Mrit Sanjeevani — literally 'that which revives the dead' — is the most esoteric practice in the Aghori tradition that can be documented. It stands at the intersection of Bhairavi Tantra (the feminine component of the Aghori tradition, working with Shakti as transformative power) and Garud Tantra (the eagle-headed deity's tradition, which specializes in countering poisons, venoms, and death itself). The theoretical basis: the Shaiva tradition holds that death is not an event but a process — a process that can be interrupted, slowed, or in rare cases, reversed. The point of death is not when the heart stops. It is when the Udana Vayu (the upward-moving breath) permanently exits the body through the Brahmarandhra. Between the cessation of heartbeat and the exit of Udana, there is a window — brief, but real. The Mrit Sanjeevani practice aims to keep the Udana tethered to the body beyond the normal point of departure. The method involves three simultaneous operations: (1) Yam Bhairav Dhyan — meditating on Yam Bhairava (Bhairava as Lord of Death) to establish a relationship with death itself. The Aghori does not fight death. The Aghori negotiates with it. (2) The Sanjeevani Bija — Om Hreem Sauh, a three-bija combination where Hreem (Maya/creation), Sauh (the supreme bija of the Sri Vidya tradition, carrying the power of sustenance), and the carrier Om create a vibrational field that opposes the dissolution of the body's energetic structure. (3) Pranic transfer — the Aghori channels his own prana into the dying or recently deceased body through the Sushumna connection established by touch. This practice is documented here as heritage. Aghoreshwar Bhagwan Ramji demonstrated it on multiple documented occasions. But he also warned: 'The one who conquers death becomes responsible for every life he saves.'",
        mantras: [
          { sanskrit: "ओम ह्रीं सौः", transliteration: "om hreem sauh", meaning: "The Sanjeevani Bija — Maya + Supreme Sustaining Power", count: "1080x during the practice" },
          { sanskrit: "ओम यमभैरवाय नमः", transliteration: "om yambhairavaya namah", meaning: "Salutations to Yam Bhairava — Lord of Death", count: "108x" },
        ],
        warnings: ["This is documented as heritage — it requires a living guru's direct transmission", "The Aghori tradition does not publicly teach the complete method", "Mistakes in this practice can harm both practitioner and recipient", "Aghoreshwar Bhagwan Ramji warned that saving a life through this method creates a karmic bond between savior and saved"],
      },
      {
        id: "chandra-surya-yoga",
        title: "Chandra-Surya Yoga: Lunar-Solar Integration",
        titleSanskrit: "Candra-Sūrya-Yoga",
        content: "Chandra-Surya Yoga is the Aghori method of achieving the perfect balance of Ida (lunar, cooling, receptive) and Pingala (solar, heating, active) nadis, not through mechanical alternate nostril breathing alone, but through an entire day-night practice cycle that aligns the sadhaka with the cosmic rhythms of sun and moon. The daytime practice (Surya phase): during daylight hours, the sadhaka maintains subtle awareness of Pingala nadi. The right nostril should dominate during the day. The practice includes: facing east at sunrise, Surya Namaskar (not the physical asana sequence but the mantra sequence — Om Suryaya Namah repeated 108x), eating the main meal at midday when Surya is at its peak, and performing active practices (Kapalabhati, Bhastrika, Dhuni tending) during daylight. The nighttime practice (Chandra phase): after sunset, the sadhaka shifts awareness to Ida nadi. The left nostril should dominate at night. The practice includes: facing north at moonrise, Chandra Namaskar (Om Chandraya Namah 108x), a light evening meal, and receptive practices (Trataka, Mauna, Dhuni meditation, Kapal Dhyana). The integration point: at Sandhyakala (twilight), the two nadis are in perfect balance for approximately 20 minutes. This is the Sushumna window — the brief period each day when the central channel is naturally active. The Aghori uses this window for the most important japa of the day. When Chandra-Surya Yoga is practiced consistently, the sadhaka's entire physiology comes into alignment with the cosmic order. Sleep deepens. Energy increases. The mind becomes naturally sattvic. And the Sushumna window gradually widens — from 20 minutes to an hour to, eventually, the permanent state of Sushumna dominance that is the mark of the Aghori.",
        practice: "Follow the day-night cycle: Surya practices in daylight, Chandra practices after dark. Use the twilight Sushumna window for primary japa. Maintain awareness of which nostril is dominant throughout the day.",
        mantras: [
          { sanskrit: "ओम सूर्याय नमः", transliteration: "om suryaya namah", meaning: "Surya Namaskar — the solar invocation", count: "108x at sunrise" },
          { sanskrit: "ओम चन्द्राय नमः", transliteration: "om chandraya namah", meaning: "Chandra Namaskar — the lunar invocation", count: "108x at moonrise" },
        ],
        warnings: ["Do not force nostril dominance — observe which nostril is naturally active", "If the left nostril dominates during the day (indicating illness or pranic depletion), rest and perform gentle Surya Bhedana", "The Sushumna window is subtle — do not strain to perceive it"],
      },
    ],
  },
  {
    id: "phase-7-sealed-gate",
    phase: "Phase 7",
    phaseSanskrit: "Bandhana-Dvāra — The Sealed Gate",
    title: "The Sealed Gate: Esoteric & Forbidden Practices",
    titleSanskrit: "Guhya-Bandhana",
    description: "The innermost chamber of the Aghori tradition. These practices are documented as heritage — their complete methods are sealed and require a living guru's direct transmission. They are presented here for the sincere student who needs to know the map, even if the territory remains closed until the guru opens the gate.",
    duration: "Sealed — requires guru transmission for practice",
    difficulty: "Forbidden / Sealed",
    minTier: "akash",
    image: "/assets/tantra/aghoiri-course/abandoned-temple-midnight.jpeg",
    lessons: [
      {
        id: "shat-karma",
        title: "The Shat Karma: Six Tantric Acts — Documented, Sealed",
        titleSanskrit: "Ṣaṭ-Karma",
        content: "The Shat Karma — the six Tantric acts — are the most notorious elements of the Aghori and broader Tantric traditions. They are: Shanti (pacification — calming disturbances, healing, bringing peace), Vasikarana (subjugation — influencing the will of another), Stambhana (immobilization — freezing a person, situation, or process), Vidveshana (division — creating conflict between two parties), Uccatana (eradication — uprooting a person from a position or place), and Marana (killing — causing death through Tantric means). These six acts are documented here as heritage. They exist in every Tantric text from the Kubjika Tantra to the Brihat Tantrasara. They are not unique to Aghoris — they belong to the broader Tantric technology of reality manipulation. The Aghori tradition's position is nuanced and must be understood correctly. First: these acts exist. They are real. They have been used throughout history and are used today. Second: the Aghori does not use them for personal gain, revenge, or power. The Aghori who has realized the non-dual state has no personal agenda that these acts could serve. Third: the Aghori may, in rare cases, use Shanti (pacification) to help a suffering person. The other five acts are considered dangerous karmic territory even for the Aghori. Fourth: the methods are sealed. They require specific mantras, specific materials, specific timings, and most importantly, a guru who has mastered them and chooses to transmit. This course documents their existence so the student understands the full scope of the tradition. It does not — and cannot — provide the methods. The seal exists not to keep knowledge secret but to protect both the practitioner and the potential target from consequences the unprepared mind cannot imagine.",
        mantras: [
          { sanskrit: "(SEALED)", transliteration: "(guru transmission required)", meaning: "The specific mantras for Shat Karma are sealed", count: "(SEALED)" },
        ],
        warnings: ["These practices are DOCUMENTED AS HERITAGE — their methods are sealed", "Any teacher who offers to teach Shat Karma methods online or in workshops is not teaching the authentic tradition", "The karmic consequences of misuse are considered severe and inescapable in the Aghori tradition"],
      },
      {
        id: "parashakti-yoni-sadhana",
        title: "Parashakti Yoni Sadhana: The Cosmic Door",
        titleSanskrit: "Parāśakti-Yoni-Sādhanā",
        content: "Parashakti Yoni Sadhana is the most sacred and most guarded practice in the Aghori tradition. It is the Tantric worship of the Divine Feminine in her most transcendent aspect — not as a deity but as the door through which all manifestation arises. The word Yoni in this context does not refer to the physical form but to the metaphysical principle: the source, the origin point, the cosmic womb from which Shiva and Shakti, Purusha and Prakriti, consciousness and its content emerge as an undivided pair. The practice as documented (not taught): it requires a 31-day Agni Pariksha — fire ordeal — during which the sadhaka maintains a continuous Dhuni while performing specific pujas and japa at precise hours. The Yantra is triangular, drawn with Rakta Chandan on a silk cloth, oriented toward the south. The confidential Bija is never written and is transmitted only mouth-to-ear from guru to disciple in a single sitting. The entire 31-day practice demands complete Brahmacharya — not merely celibacy but the redirection of all creative energy toward the practice. The Aghori tradition holds that this sadhana, when completed successfully, grants the practitioner direct access to the Parashakti — the power to perceive and work with the creative principle itself. The tradition also states that only one in thousands of initiates is ready for this practice, and that readiness is determined not by the guru's assessment but by the practice itself — if the sadhaka is not ready, the Agni Pariksha will simply not complete. The fire will not cooperate. The mantras will not take hold. The Parashakti will not open. This is the tradition's built-in safeguard.",
        mantras: [
          { sanskrit: "(SEALED)", transliteration: "(guru transmission required)", meaning: "The primary Bija for this sadhana is the most guarded secret of the Aghori tradition", count: "(SEALED)" },
        ],
        warnings: ["This practice is documented as heritage — the complete method requires a living guru", "The 31-day Agni Pariksha is physically and energetically demanding", "Complete Brahmacharya during the 31 days is non-negotiable — if broken, the practice fails and must be restarted from the beginning", "The tradition warns that premature exposure to this practice can cause energetic damage"],
        materials: ["Rakta Chandan (red sandalwood paste)", "Silk cloth (red or black)", "Continuous Dhuni supplies for 31 days", "Dedicated practice space with no interruption"],
      },
      {
        id: "mahakal-bhasm-sadhana",
        title: "Mahakal Bhasm Sadhana: Ash of Time",
        titleSanskrit: "Mahākāl-Bhasma-Sādhanā",
        content: "Mahakal Bhasm Sadhana works with the most potent ash in the Aghori tradition — ash that has been specifically selected, purified, and charged through a 7-day protocol to carry the frequency of Mahakal (Great Time, Great Death) itself. This is the Bhasm used in the most esoteric applications of the tradition. The 7-day preparation: Day 1 — collection of Veergati Chita Bhasm (from a pyre that has burned three nights, of one who died naturally or bravely). The ash is gathered in a copper vessel with Om Krim Kalabhairavaya Namah chanted throughout. Day 2 — Panchagavya purification. Raw ash is mixed with the five cow products, dried in sunlight, ground fine. Day 3 — Mantra charging. The purified ash is spread on a silk cloth and Om Hrim Mahakalaya Namah is chanted 10,008 times over it. Day 4 — Dhuni firing. The ash is offered into the Dhuni in small quantities throughout the day, each offering accompanied by Om Hrim Phat. Day 5 — Moonlight charging. The ash is placed under the night sky (ideally under the moon, but even starlight suffices) from sunset to sunrise. Day 6 — Kapal charging. The ash is placed inside the Kapal overnight with the Kapal Puja mantras chanted. Day 7 — Integration. The final Bhasm is collected, stored in a copper or clay container, and offered its first Ahuti. The signs of siddhi (perfection) in this practice: the ash takes on a subtle golden shimmer visible only in dim light; the ash feels warm to the touch even when it has been sitting in a cool place; the practitioner begins to perceive time differently — as a flowing substance rather than an abstract measurement. This practice is documented as heritage with enough detail for the student to understand the scope and depth of the Aghori Bhasm science.",
        mantras: [
          { sanskrit: "ओम क्रीं कालभैरवाय नमः", transliteration: "om kreem kalabhairavaya namah", meaning: "During collection — Krim is Kala's bija", count: "Continuous during Day 1" },
          { sanskrit: "ओम ह्रीं महाकालाय नमः", transliteration: "om hrim mahakalaya namah", meaning: "Mantra charging on Day 3", count: "10,008x" },
        ],
        materials: ["Copper vessel", "Panchagavya", "Silk cloth (black)", "Dhuni supplies for Day 4", "Copper or clay storage container"],
        warnings: ["This practice is documented as heritage — complete transmission requires a living guru", "The 7-day protocol must be followed without interruption", "Mahakal Bhasm should never be used casually or for minor purposes"],
      },
      {
        id: "aghoiri-and-society",
        title: "The Aghori and Society: Ethics, Dharma, and the Aghori's Role",
        titleSanskrit: "Aghorī-Saṃsṛti",
        content: "The most important question about the Aghori tradition is not what the Aghori does but why — and to what end. The Aghori's relationship with society is one of the most misunderstood aspects of the tradition, and correcting this misunderstanding is essential. The Aghori does not hate society. The Aghori does not reject society. The Aghori has simply seen through the constructs that society calls reality and has chosen to live in alignment with what is actually true rather than what is conventionally agreed upon. This does not make the Aghori antisocial. It makes the Aghori pre-social — operating from a state that exists before and beyond social agreement. Aghoreshwar Bhagwan Ramji embodied this perfectly. While maintaining his Aghori practices — the ash, the Dhuni, the cremation ground — he also established hospitals, schools, and service organizations that served thousands. He taught that the Aghori's power is never used for personal gain because the Aghori has no personal self to gain for. When a realized Aghori acts, the action arises from the non-dual state — it serves the whole, not the part. The ethical framework: the Aghori follows Dharma not because it is written in a scripture but because Dharma is the natural expression of non-dual awareness. One who sees all beings as oneself does not harm. One who sees all experience as one's own does not exploit. The Aghori's role in the world, as articulated by Aghoreshwar Bhagwan Ramji, is that of a 'spiritual worker' — one who performs the invisible labor of maintaining the balance between the visible and invisible dimensions of reality. When the Aghori sits in the cremation ground, he is not just meditating. He is holding a frequency that allows the departed to transition and the living to continue without the psychic burden of the dead. When the Aghori eats from a skull, he is not being sensational. He is demonstrating the truth that all food is the same food, all matter is the same matter, all existence is the same existence. This demonstration is the Aghori's teaching.",
        mantras: [
          { sanskrit: "ओम सर्वभूतेषु च आत्मानं विद्धि", transliteration: "om sarvabhuteshu ca atmanam viddhi", meaning: "See the Self in all beings — the Aghori's ethical foundation", count: "3x daily reflection" },
        ],
      },
