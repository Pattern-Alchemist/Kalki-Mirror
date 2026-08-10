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
    id: "orientation",
    phase: "Phase 0",
    phaseSanskrit: "Discipline",
    title: "The Aghori Way: Orientation and Foundations",
    titleSanskrit: "The Non-Terrible",
    description: "Before any mantra is chanted or any ritual performed, the vessel must be prepared. This phase strips away every assumption, every comfort, every identity that the sadhaka carries. You will learn what Aghora truly is, the lineage of Bhairava, the sacred geography of the Smashana, and the foundational disciplines that every Aghori sadhaka must internalize.",
    duration: "Self-paced - minimum 7 days before proceeding",
    difficulty: "Foundational",
    minTier: "prithvi",
    image: "/assets/tantra/aghoiri-course/aghoiri-sadhu-meditation.jpeg",
    lessons: [
      {
        id: "what-is-aghoira",
        title: "What is Aghora? The Non-Terrible",
        content: "The word Aghora literally means not terrible - a-ghora, the absence of ghora (terror). This is the supreme irony of the tradition: those whom the world perceives as most terrifying have internalized a state so beyond fear that they have become one with that which the world fears most. Death, decay, impurity, the burning ground - these are not symbols of horror for the Aghori. They are mirrors reflecting the ultimate truth that the ego desperately avoids: everything you identify with will be reduced to ash. The Aghori does not worship death. The Aghori has transcended the distinction between life and death, purity and impurity, sacred and profane. This is a lived state of consciousness achieved through systematic practice that strips away every layer of conditioning until only awareness remains - naked, unmediated, and free.",
        mantras: [
          { sanskrit: "om aghora aghora aghorabhyo namah", transliteration: "om aghora aghora aghorabhyo namah", meaning: "Salutations to the Aghora forms", count: "Daily" },
          { sanskrit: "om kalabhairavaya namah", transliteration: "om kalabhairavaya namah", meaning: "Salutations to Kala Bhairava", count: "108x evening" },
          { sanskrit: "om hrim bhairavaya namah", transliteration: "om hrim bhairavaya namah", meaning: "Primary Bhairava seed-mantra", count: "108x or 1008x" },
        ],
      },
    ],
  },
  {
    id: "internal-readiness",
    phase: "Phase 1",
    phaseSanskrit: "Internal Readiness",
    title: "The 40-Day Purification: Breaking the Ego",
    titleSanskrit: "40 Days of Ego Dissolution",
    description: "Forty days of systematic ego-dissolution designed to break every identification, every comfort, every pattern that the sadhaka uses to maintain the illusion of a separate self. Cold baths before dawn. Silence that extends for hours. Minimal food. Trataka on fire or skull until the mind stops. This is not austerity for its own sake - it is precision engineering of consciousness.",
    duration: "40 days (continuous)",
    difficulty: "Intermediate",
    minTier: "jal",
    image: "/assets/tantra/aghoiri-course/dhuni-fire-path.jpeg",
    lessons: [
      {
        id: "daily-routine",
        title: "The Daily Discipline: Brahma Muhurta to Sandhyakala",
        content: "The 40-day preparation follows a precise daily structure. Morning (Brahma Muhurta, approx 4-5:30 AM): 108 chants of om kapaline namah (invoking the skull-bearer), followed by Trataka on a flame or skull, then a cold bath. Evening (Sandhyakala, twilight): 108 chants of om namah shivaya aghoraya, yogic breath practice (Bhastrika or Kapalabhati), and 2 hours of Mauna (complete silence - no reading, writing, entertainment, or planning). The cold bath demonstrates the will is stronger than the body comfort patterns. Mauna reveals that silence is the state where Bhairava resides.",
        practice: "Follow the exact morning and evening routine daily for 40 days. Track progress. Notice which elements cause the most resistance - that resistance IS the ego.",
        mantras: [
          { sanskrit: "om kapaline namah", transliteration: "om kapaline namah", meaning: "Salutations to the Skull-Bearer", count: "108x every morning" },
          { sanskrit: "om namah shivaya aghoraya", transliteration: "om namah shivaya aghoraya", meaning: "Salutations to Shiva in his Aghora form", count: "108x every evening" },
        ],
        materials: ["Mala (Rudraksha preferred, 108 beads)", "Candle or ghee lamp for Trataka", "Journal (to be burned on day 33 or 40)", "Cold water source for morning bath"],
        warnings: ["Cold baths are not safe for everyone - those with heart conditions should use cool water instead", "Trataka can cause temporary eye strain - blink naturally when tears flow heavily", "Kapalabhati should not be done by pregnant women or those with high blood pressure", "Mauna can be psychologically intense - maintain grounding through simple daily tasks"],
      },
      {
        id: "bhuta-offerings",
        title: "Bhuta Offerings: Honoring the Invisible",
        content: "Every Saturday or on Amavasya, the sadhaka makes offerings to the Bhutas (spirits). This practice serves multiple purposes: it is an act of propitiation, a practice in non-duality (feeding beings the ordinary person fears), and a confrontation with rationalist conditioning. The offering consists of black sesame seeds, curd, and rice balls (Pinda) taken to a crossroad or the base of a Peepal tree. The offering mantra: Yatastu Bhutaganah, patham me shuddhikurvantu - meaning, wherever the spirits may be, may they purify my path."  ,
        practice: "Prepare black sesame, curd, and rice balls. Go to a crossroad or Peepal tree base after sunset. Place the offerings. Chant the Bhuta mantra. Leave without looking back.",
        mantras: [
          { sanskrit: "yatastu bhutaganah patham me shuddhikurvantu", transliteration: "yatastu bhutaganah patham me shuddhikurvantu", meaning: "Wherever the spirits may be, may they purify my path", count: "3x at the offering site" },
        ],
        materials: ["Black sesame seeds", "Fresh curd", "Rice flour for Pinda (rice balls)", "A small plate or leaf for offering"],
      },
      {
        id: "intention-declaration",
        title: "The Intention Declaration: Writing and Burning the Ego-Letter",
        content: "On day 33 or 40, the sadhaka writes a letter to Bhairava formally surrendering everything they believe themselves to be. The letter reads: O Bhairava, I surrender my name, my history, and my fear. May your fire consume me and make me naked in truth. Initiate me if I am worthy. The letter is then burned. Fire is the Aghori primary alchemical instrument. When the paper turns to ash, the declaration transforms - the smoke carries the intention into the Akashic medium. This practice marks the transition from preparation to initiation.",
        practice: "On day 33 or 40, sit alone after evening practice. Write the declaration in your own hand. Read it aloud once. Burn it completely in a candle flame. Sit in silence until the ash cools.",
        warnings: ["This practice can trigger intense emotional release - do not suppress it", "The burning should be done safely with water nearby", "Do not share the contents of your letter with anyone", "If you feel unready, repeat on day 40"],
      },
      {
        id: "diet-discipline",
        title: "The Sattvic Discipline: Food as Sadhana",
        content: "Throughout the 40-day preparation, the sadhaka follows a strictly sattvic diet: fresh fruits, milk, honey, moong dal, dry fruits, ghee, and Ganga Jal. These foods carry the lightest energetic signature and support clarity and calm. One day per week, avoid salt and spices entirely - this is one of the most effective ego-dissolution techniques. The tongue craving for flavor is one of the ego most deeply entrenched patterns. When you eat tasteless food without complaint, you demonstrate the body demands no longer control your consciousness. The purpose is not to punish the body but to demonstrate you can override automatic patterns through conscious will.",
        materials: ["Fresh fruits (seasonal)", "Pure milk and ghee", "Honey", "Moong dal", "Dry fruits (almonds, raisins)", "Ganga Jal or filtered water"],
      },
    ],
  },
  {
    id: "bhairava-fire",
    phase: "Phase 2",
    phaseSanskrit: "The Bhairava Fire",
    title: "The Initiation Night: Self-Diksha into Bhairava",
    titleSanskrit: "Self-Initiation into Bhairava",
    description: "The culmination of the 40-day preparation. On the night of Amavasya or Chaturdashi, at midnight (Nishitha Kala), the sadhaka performs the self-initiation ritual that formally opens the Aghori path. This is the point of no return. The ritual takes place in a Smashana, abandoned temple, or dense forest. With skull at center, sindoor mantras drawn around it, fire or camphor burning, the sadhaka chants 108 or 1008 repetitions of the Bhairava mantra until mental activity stops entirely.",
    duration: "One night (Amavasya or Chaturdashi, midnight)",
    difficulty: "Advanced",
    minTier: "agni",
    image: "/assets/tantra/aghoiri-course/hero-cremation-initiation.jpeg",
    lessons: [
      {
        id: "location-preparation",
        title: "Choosing the Threshold: Location and Materials",
        content: "The initiation location must be where the ordinary world has withdrawn: a cremation ground (Smashana) where pyres have recently burned, an abandoned temple, or a dense forest at midnight. The sadhaka carries: a Skull (real or symbolic - the central instrument), a Black blanket (absorbs all frequencies), Camphor (burns without residue - the ego consumed entirely), incense (carries intention into the subtle realm), red sindoor (color of Muladhara and Kundalini Shakti), a Trishul or dagger (three gunas transcended), and a Bhairava image or yantra (focal point for invocation)."  ,
        materials: ["Skull (real or symbolic)", "Black blanket or cloth", "Camphor tablets", "Incense sticks", "Red sindoor", "Trishul or symbolic dagger", "Bhairava image or yantra", "Ghee lamp", "Black sesame seeds", "Red flowers"],
        warnings: ["NEVER perform in a location where you feel unsafe", "Assess cremation grounds during daylight first", "Tell someone your location and expected return", "Emotional intensity can be overwhelming"],
      },
      {
        id: "ritual-setup",
        title: "The Ritual Architecture: Drawing the Bhairava Mandala",
        content: "The ritual space is prepared with exact precision. The sadhaka spreads the black cloth facing south or southwest. The skull is placed at the center. Around the skull, two circles of mantras are drawn in red sindoor. Inner circle: om aghora aghora aghorabhyo namah - invoking the Aghora tattva. Outer circle: om bhairavaya kalabhairavaya mahakalaya namah - invoking the three temporal dimensions of Bhairava. Offerings are then placed: alcohol (symbolic drops near the skull), black sesame seeds (scattered - each seed a soul in transit), blood or red sindoor on the third eye (offering of life-force), and red flowers (Kundalini Shakti)."  ,
        practice: "Prepare the entire mandala in silence. Each element placed is an act of intention.",
      },
      {
        id: "mantra-awakening",
        title: "The Mantra Jagarana: Awakening the Fire Within",
        content: "Jagarana means awakening - the mantra goes from mere syllables to a living vibration that transforms consciousness. The sadhaka sits before the skull and chants: om hrim bhairavaya namah. The count is 108 or 1008. The tradition is explicit: do no japa mechanically - each word should burn inside. The hrim bija is the Maya bija that dissolves the illusion of separateness. When chanted with full attention, it creates a vibration that shakes the subtle body loose from its identification with the physical form. The sadhaka gazes at the skull or flame until mental activity stops - this is the Bhairava state: vast, alert stillness without a center, without a me who is aware.",
        mantras: [
          { sanskrit: "om hrim bhairavaya namah", transliteration: "om hrim bhairavaya namah", meaning: "Primary Bhairava mantra - hrim dissolves illusion", count: "108x or 1008x" },
          { sanskrit: "om kalabhairavaya namah", transliteration: "om kalabhairavaya namah", meaning: "For those whose ishta is Kala Bhairava", count: "108x or 1008x" },
          { sanskrit: "om vajrabhairavaya mahakalaya phat", transliteration: "om vajrabhairavaya mahakalaya phat", meaning: "Vajra Bhairava for fearless detachment", count: "108x" },
        ],
        warnings: ["If you feel overwhelming fear during japa, do not stop - sit with it", "If you experience cessation of thought, remain still", "The 1008 count takes approximately 2-3 hours", "Do not eat for at least 3 hours before the japa session"],
      },
      {
        id: "aghoira-vrat",
        title: "The Aghora Vrat: The Oath of No-Return",
        content: "After the mantra jagarana reaches its climax, the sadhaka speaks the Aghora Vrat aloud: From this moment, I reject all masks. I vow to see no duality - no pure or impure, high or low, god or demon. May Shiva be my breath, may death be my teacher, may silence be my speech. I accept whatever comes. I fear nothing. I renounce everything that does not burn in truth. Every word targets a specific layer of the ego-structure. After speaking, a drop of blood or red sindoor is applied to the third eye as the visible seal of initiation. From this moment the Aghori tattva is active within the sadhaka.",
        practice: "Speak the oath aloud with full voice. Apply sindoor or offer blood. Sit in silence for at least 30 minutes after.",
        warnings: ["This oath is IRREVOCABLE - speak it only if you mean every word", "Emotional aftermath can be intense", "Do not discuss details with anyone who has not walked the path", "The sindoor mark should fade naturally"],
      },
    ],
  },
];

export const COURSE_META = {
  title: "Aghori Tantra",
  subtitle: "The Pathless Path of Bhairava",
  description: "A comprehensive self-learning course in the Aghora tradition - from first principles to advanced Smashana practices.",
  totalDuration: "40 days preparation + 1 initiation night + lifelong daily practice",
  tradition: "Aghora / Saiva / Bhairava",
  source: "Compiled from field manuals and oral tradition compilations",
};
