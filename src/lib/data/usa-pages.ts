// =============================================================
// KALKI — US ACQUISITION LAYER (Phase A of the US Search Engine)
// -------------------------------------------------------------
// Commercial-intent pages for seekers in the United States. Each
// entry is individually authored — no template text — targeting
// one primary commercial query family per page (anti-cannibalization:
// informational queries stay owned by /patterns, /karma, /archetypes).
// See docs/seo/keyword-url-matrix.md for the full query→URL map.
// =============================================================

export interface UsaSection {
  label: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface UsaFaq {
  q: string;
  a: string;
}

export interface UsaPage {
  /** Route slug under /usa — empty string for the hub itself. */
  slug: string;
  path: string;
  /** WhatsApp attribution topic stamped into the CTA handoff. */
  topic: string;
  /** Page title — ≤60 characters where practical. */
  title: string;
  description: string;
  label: string;
  h1: string;
  h1Accent?: string;
  intro: string[];
  sections: UsaSection[];
  faqs: UsaFaq[];
  related: { href: string; label: string }[];
}

/* ─────────────────────────────────────────────────────────────
   THE HUB — /usa
   ───────────────────────────────────────────────────────────── */

export const usaHub: UsaPage = {
  slug: '',
  path: '/usa',
  topic: 'usa-hub',
  title: 'KALKI for Seekers in the United States — Online Tantric Consultations',
  description:
    'Evidence-graded Tantric pattern work, now open to seekers in the US. Online consultations with Kaustubh in your time zone — USD pricing, free discovery call, no fortune telling.',
  label: 'KALKI · United States',
  h1: 'Tantrik pattern intelligence,',
  h1Accent: 'now open to American seekers.',
  intro: [
    'KALKI is a Tantric knowledge and consultation platform built on a simple premise: the recurring patterns in your life — the same relationship, the same self-sabotage, the same dead end — are not random, and they are not destiny. They are loops, and loops can be mapped, understood, and interrupted. This work is called the Mirror Method, and it fuses classical Tantric psychology with modern pattern analysis.',
    'Every claim on this platform carries an evidence grade — Āgama (textual authority), Anubhāva (practitioner testimony), Parīkṣā (cross-source evidence), Pratibimba (interpretive reading) — so you always know whether you are reading a citation from a classical text or a lineage holder\u2019s lived report. We do not predict the future, promise supernatural outcomes, or trade in guarantees. That honesty is the product.',
    'Consultations run online, one-on-one, over WhatsApp video — scheduled in your time zone, priced in USD for visitors outside India, and beginning with a free discovery call. Seekers in the United States are the fastest-growing part of the KALKI community, and this page is the front door built for you.',
  ],
  sections: [
    {
      label: '01 · What KALKI Is',
      heading: 'A serious system, not an astrology stall',
      paragraphs: [
        'KALKI documents a working corpus: an Akashic Archive of evidence-graded sādhana folios, a Pattern Atlas of twenty recurring emotional loops, the ten Mahāvidyās mapped as diagnostic archetypes, and a complete map of karma as Tantric psychology understands it. The founder, Kaustubh, works at the intersection of classical Tantra — Kashmiri Shaivism, Shakta traditions, the Aghorī path — and modern behavioral method.',
        'What KALKI is not matters as much. It is not a psychic hotline. It does not sell "100% accurate" readings, black-magic removal, or guaranteed results — the vocabulary most astrology sites reach for, and the reason most of them deserve the skepticism they get. If you want your chart used as a mirror rather than a fortune-telling device, you are in the right place.',
      ],
    },
    {
      label: '02 · Working With Kaustubh From the US',
      heading: 'Online, in your time zone, priced in dollars',
      paragraphs: [
        'Every session is a one-on-one WhatsApp video call. You propose two or three windows in your local time — sessions routinely land within US morning and evening hours (EST/PST friendly) — and confirm the one that works. USD display is automatic for visitors outside India: the Pattern Consultation runs $29, the 90-minute Shadow Dossier deep-dive runs $49, and the 30-minute Archival Discovery call is free. International cards are accepted.',
        'Before booking anything paid, most seekers start with one of three free routes: the discovery call to talk through where you are, the Ten Doors email course to learn the framework across ten days, or the Pattern Atlas to find your own loop in twenty minutes of reading. None of them require a credit card, and none of them put you on a mailing list you did not ask to join.',
      ],
      bullets: [
        'Free 30-minute Archival Discovery call — no obligation',
        'Pattern Consultation — $29 / 60 minutes',
        'Shadow Dossier deep-dive — $49 / 90 minutes, written summary included',
        'Ten Doors email course — free, ten days, the full framework',
      ],
    },
    {
      label: '03 · Start Where You Are',
      heading: 'Three doors, depending on why you came',
      paragraphs: [
        'If a specific pattern keeps repeating — the rescuer reflex, the sabotage at the threshold of success, the partner who keeps arriving in a different body with the same face — start with the Pattern Atlas and then book a Pattern Consultation. If you came for chart work — a kundli or birth-chart reading in the Vedic tradition — the chart page explains exactly what a responsible reading covers and what it deliberately does not.',
        'If you came for practice — mantra, breath, sādhanā — the spiritual consultation path and the Archive are built for that, with caution levels and lineage attributions stated plainly. And if you are simply curious whether any of this holds water, start with the karma map: it is the platform\u2019s most complete single document, and it plays fair with skeptics.',
      ],
    },
    {
      label: '04 · The Honest Scope',
      heading: 'What a consultation can and cannot do',
      paragraphs: [
        'A session with Kaustubh is a diagnostic and prescriptive conversation: you bring a repeating situation, it gets mapped to the mechanics driving it, and you leave with a practice — a mantra, a breath protocol, a confrontation exercise, an observation drill — that addresses the loop at the level it actually operates. What it is not: therapy (find a licensed therapist for clinical work), a medical service, a prediction service, or a substitute for the decisions only you can make.',
        'KALKI is based in India and operates fully online — no US office, no in-person sessions, and no pretense otherwise. The trade is straightforward: you get the source tradition rather than a franchise of it, and the scheduling friction of a time-zone gap instead of a local strip-mall astrologer who tells you what you want to hear.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is KALKI based in the United States?',
      a: 'No — and it does not pretend to be. KALKI is based in India and works with seekers worldwide entirely online. Consultations are scheduled in your local time zone, and USD pricing displays automatically for US visitors. If you are looking for a local in-person astrologer, other sites serve that; if you want the source tradition delivered with evidence grades and no theatrics, this is it.',
    },
    {
      q: 'Do I need to know astrology or Hinduism to start?',
      a: 'No. The Mirror Method is designed for people with zero background — every Sanskrit term is translated the first time it appears, and the Lexicon holds the full vocabulary if you want depth. Seekers from secular, Christian, Jewish, Buddhist, and "none of the above" backgrounds all work inside this framework; it is a psychological and contemplative system, not a conversion.',
    },
    {
      q: 'How much does a consultation cost in US dollars?',
      a: 'The 30-minute Archival Discovery call is free. The 60-minute Pattern Consultation is $29. The 90-minute Shadow Dossier — a deep-dive into your dominant shadow patterns with a written summary — is $49. International cards are accepted, and nothing is auto-billed: you pay per session, when you book it.',
    },
    {
      q: 'What technology do I need for an online session?',
      a: 'WhatsApp — that is the entire stack. Video calls, scheduling, and follow-up all happen there, which is why the platform is built around it: no Zoom accounts, no meeting links that expire, no apps to install beyond what your phone already has. A stable connection and a private space for the hour are the only real requirements.',
    },
    {
      q: 'Is this religious? Will I be asked to believe something?',
      a: 'The tradition KALKI draws from is Tantric — classical texts, mantra methodology, the Mahāvidyā archetypes — but the working posture is empirical: every claim carries an evidence grade, and contested claims are labeled as contested. You are never asked to adopt a belief; you are asked to observe your own patterns and test the practices against your own experience. Practitioners of any faith or none work inside this material.',
    },
    {
      q: 'What if I book and it is not for me?',
      a: 'The free discovery call exists precisely for this: you talk with Kaustubh for thirty minutes, see how the method thinks, and decide whether to continue — no card required, no follow-up sequence if you walk away. Paid sessions come with a written summary you keep regardless. If a session materially fails to deliver what this page describes, say so on the call; refunds are handled like adults, case by case.',
    },
  ],
  related: [
    { href: '/method', label: 'The Mirror Method' },
    { href: '/karma', label: 'The Karma Map' },
    { href: '/consultations', label: 'Book a Consultation' },
  ],
};

/* ─────────────────────────────────────────────────────────────
   P0 COMMERCIAL PAGES — one query family per page
   ───────────────────────────────────────────────────────────── */

export const usaPages: UsaPage[] = [
  {
    slug: 'vedic-astrology-consultation',
    path: '/usa/vedic-astrology-consultation',
    topic: 'usa:vedic-astrology-consultation',
    title: 'Vedic Astrology Consultation Online — US Seekers | KALKI',
    description:
      'A Vedic astrology consultation that treats your chart as a diagnostic instrument, not a fortune-telling device. Online sessions for US seekers — $29, your time zone, evidence-graded method.',
    label: 'Consultations · Jyotisha',
    h1: 'Vedic astrology consultation,',
    h1Accent: 'without the fortune-telling.',
    intro: [
      'A Vedic astrology consultation at KALKI is a diagnostic session built on jyotisha — the classical Indian science of the chart — fused with the Mirror Method\u2019s pattern analysis. The chart is read the way the tradition intends it: as a map of tendencies (vāsanā), timing (daśā), and the specific loops your constitution is prone to run. It is not read as a verdict on your fate, because that is not what the instrument does.',
      'Sessions run online over WhatsApp video, scheduled in your local time zone — US morning and evening windows are routinely available. The 60-minute Pattern Consultation is $29 for visitors outside India; the free 30-minute discovery call exists so you can see how this thinks before paying for anything.',
    ],
    sections: [
      {
        label: '01 · The Reading',
        heading: 'What actually happens in your session',
        paragraphs: [
          'You bring a real situation — a career stall, a relationship that keeps rhyming, a threshold you cannot cross. Kaustubh reads the chart\u2019s relevant structure: the houses governing the domain, the daśā sequence you are running, and the placements that describe your pattern-prone edges. Then the Mirror Method layer goes on top: the chart\u2019s tendencies are cross-referenced against the twenty documented emotional loops in the Pattern Atlas, so what you get is not "Saturn is in your seventh house" but a coherent account of how that shows up behaviorally — and what interrupts it.',
          'You leave the session with three things: a plain-language map of the pattern in question, the timing context the tradition would actually weight, and a prescribed practice — mantra, breath protocol, or observation drill — targeted at the loop the reading surfaced. Paid sessions include a written summary you keep.',
        ],
      },
      {
        label: '02 · Vedic vs Western',
        heading: 'Why the Vedic frame does something different',
        paragraphs: [
          'Western astrology as commonly practiced is largely psychological and solar; the Jyotisha tradition KALKI draws from is sidereal, lunar-weighted, and daśā-driven — it thinks in periods and tendencies rather than static personality labels. For pattern work this matters practically: the daśā framework gives a timing dimension that describes why the same loop erupts now and lay dormant five years ago, which is exactly the question most seekers arrive with.',
          'That said, this is not a tournament. If you have worked with Western astrology for years, your familiarity is an asset — the consultation translates across the frames rather than demanding you unlearn anything. The claim is narrower and more defensible than "Vedic is superior": for mapping recurring patterns and their timing, this is the instrument the tradition built.',
        ],
      },
      {
        label: '03 · The Honest Scope',
        heading: 'What this consultation will not do',
        paragraphs: [
          'It will not predict your future, pick your lottery numbers, name your wedding date, or promise that a gemstone will fix your career. Kaustubh does not sell remedial products, does not upsell ritual packages, and does not claim powers the tradition does not grant. Where a classical technique is contested or anecdotal, the session says so — the same evidence-grading used across the platform applies to every statement made in a reading.',
          'It is also not therapy. Chart work illuminates patterns; it does not treat clinical depression, trauma, or psychiatric conditions, and a responsible practitioner says this plainly. If clinical work is what you need, the right referral is part of the session.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How much does a Vedic astrology consultation cost in the US?',
        a: 'The 60-minute Pattern Consultation is $29 USD for visitors outside India (displayed automatically). The 90-minute Shadow Dossier deep-dive is $49 with a written summary included. The 30-minute Archival Discovery call is free. You pay per session when you book — no packages, no auto-billing.',
      },
      {
        q: 'What birth details do I need to provide?',
        a: 'Date, place, and time of birth — as exact as you can get it. The time matters most: it fixes the ascendant and house structure, which the reading leans on heavily. If your birth time is unknown or approximate, say so when booking; the session adapts by weighting lunar and daśā analysis, which tolerate approximation better than house-based reading.',
      },
      {
        q: 'Is the session on video? What time zones work?',
        a: 'Yes — one-on-one WhatsApp video. Sessions are scheduled in your local time: propose two or three windows and the call is confirmed around them. US seekers typically book morning (EST) or evening (PST) slots; Kaustubh operates on IST and holds sessions across both US windows regularly.',
      },
      {
        q: 'How is this different from a psychic reading?',
        a: 'A psychic reading claims direct access to information about you; a jyotisha consultation interprets a symbolic system — the chart — through a documented tradition, then cross-references the interpretation against your lived experience. KALKI grades its claims (textual, testimonial, cross-source, interpretive) and tells you which is which. Nothing in a session requires you to believe anything; it requires you to test what is offered against your own pattern history.',
      },
      {
        q: 'Will you tell me when I will get married / get a job?',
        a: 'No — and a practitioner who confidently gives you dates is selling certainty the instrument does not have. The daśā framework describes periods and tendencies: favorable and strained seasons, not appointment calendars. The session will tell you what the tradition would actually weight about your current period, what it recommends practicing during it, and what it refuses to claim. That honesty is the difference between a consultation and a horoscope.',
      },
      {
        q: 'Do I need to be Hindu or religious to book?',
        a: 'No. The chart is a diagnostic instrument, not a liturgy. Seekers of every background — including committed secularists — use jyotisha at KALKI as a mirror for patterns and timing. Where practices have a ritual dimension (a mantra, an observance), the traditional context is explained and your participation is always your call.',
      },
    ],
    related: [
      { href: '/usa/kundli-birth-chart-reading', label: 'Kundli & Birth-Chart Reading' },
      { href: '/usa/relationship-pattern-reading', label: 'Relationship Pattern Reading' },
      { href: '/patterns', label: 'The Pattern Atlas' },
    ],
  },
  {
    slug: 'online-vedic-astrologer',
    path: '/usa/online-vedic-astrologer',
    topic: 'usa:online-vedic-astrologer',
    title: 'How to Choose an Online Vedic Astrologer — 2026 Guide | KALKI',
    description:
      'Choosing an online Vedic astrologer? The seven-point checklist that separates practitioners from performers — credentials, claims, pricing, and the red flags that end the call.',
    label: 'Buyer\u2019s Guide · US Seekers',
    h1: 'Choosing an online Vedic astrologer:',
    h1Accent: 'the seven-point checklist.',
    intro: [
      'The online astrology market is loud, and most of it is engineered to separate you from a recurring subscription. This page is the guide KALKI would hand a friend: seven checks that take twenty minutes and reliably separate serious practitioners from performers — written honestly enough that you can run them against KALKI itself and walk away if it fails.',
      'If you want the short version: never book anyone who guarantees outcomes, names your future dates, or sells remedial products before the first real conversation. The rest of this page is the long version.',
    ],
    sections: [
      {
        label: '01 · The Checklist',
        heading: 'Seven checks before you book anyone',
        paragraphs: [
          'These checks are ordered by how much disappointment they prevent. The first three eliminate the outright predatory; the last four distinguish between competent and exceptional.',
        ],
        bullets: [
          'Claims audit — does the practitioner guarantee outcomes ("100% accurate", "guaranteed results")? Guaranteed outcomes are the single most reliable marker of a sales operation wearing astrology as a costume.',
          'Pricing transparency — are prices published in a currency you can read, per session, before contact? Opaque pricing ("contact for rates") plus upsell scripts is the classic funnel.',
          'Scope honesty — does the practitioner state what the work cannot do? A serious jyotishi names the limits: no death predictions, no medical claims, no "black magic removal" upsells.',
          'Method visibility — can you learn how they actually read? KALKI publishes its entire framework — the Mirror Method, the evidence grades, the pattern corpus — before you pay anything, because a method you cannot inspect is a method you must take on faith.',
          'Who is the practitioner — a real, named person with a traceable practice history, or a call center? The KALKI founder is Kaustubh; his public work is on the platform and the YouTube channel.',
          'Evidence posture — does the site distinguish textual claims from testimonial ones? Vague spirituality that never says "this part is interpretive" is marketing, not tradition.',
          'Session structure — is there a free or cheap first conversation? The free discovery call is not generosity; it is what confidence looks like.',
        ],
      },
      {
        label: '02 · The Red Flags',
        heading: 'End the call when you hear these',
        paragraphs: [
          'Fear hooks: "there is a curse on you", "negative energy is blocking your success", "I see something dark that must be removed" — these are the opening moves of the ritual-scam playbook, and they end with four-figure "remedies". An honest reading of the same chart would describe a saṃskāra, a timing period, or a behavioral loop — none of which are exorcised by a $900 puja.',
          'Urgency and dependency hooks: "book now, this window closes", "you must not tell anyone about this remedy", weekly "check-ins" that are actually weekly billing. Serious practice builds autonomy — the stated goal of KALKI\u2019s method is that you need the practitioner less over time, not more.',
        ],
      },
      {
        label: '03 · Online vs In-Person',
        heading: 'Whether the medium changes the work',
        paragraphs: [
          'Jyotisha consultation is a conversation about a chart — nothing in the classical workflow requires physical presence, and the tradition has always worked by letter when distance demanded it. What the online medium changes is verification economics: you can inspect a practitioner\u2019s published thinking, cross-check their claims, and walk away from a bad session without a street address holding you hostage. The practical requirements are mundane: a stable video call, a practitioner who schedules in your time zone, and pricing in a currency you understand.',
          'The one thing online practice cannot fake is preparation — a practitioner who has not read your intake before the call is improvising, and it shows inside five minutes. This is the reason the KALKI intake exists: the Pattern Consultation and Shadow Dossier both begin with your written context, not with cold reading.',
        ],
      },
      {
        label: '04 · Running the Checks on KALKI',
        heading: 'The self-audit, published',
        paragraphs: [
          'Claims: no outcome guarantees anywhere on the platform — the word "guaranteed" does not appear in any session description, and the FAQ states plainly that predictions are not offered. Pricing: $29 and $49, published, per session, USD-displayed for US visitors, with the discovery call free. Scope: the limitations page is this page — the scope sections across the /usa pages name what the work does not do.',
          'Method: published in full — Mirror Method, twenty pattern folios, the karma map, the evidence-grade register. Practitioner: Kaustubh, founder, with a documented corpus rather than testimonials-only marketing. Evidence posture: every platform claim is graded Āgama, Anubhāva, Parīkṣā, or Pratibimba. Structure: the 30-minute discovery call is free. Seven checks, seven passes — and if you find a check that fails, the failure is worth an email.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What should an online Vedic astrology consultation cost?',
        a: 'For a competent one-on-one session, expect roughly $25–$80 for an hour from a serious independent practitioner. Below that range you are usually buying call-center volume; above it, verify what exactly is being sold — premium pricing is legitimate for deep-dive work with written deliverables, and suspicious when attached to outcome promises. KALKI\u2019s sessions run $29 (60 min) and $49 (90 min, written summary included), with a free 30-minute discovery call.',
      },
      {
        q: 'Can a Vedic astrology session be done effectively online?',
        a: 'Yes — the session is a structured conversation about a chart, and the tradition has a long history of remote consultation. What matters is preparation (the practitioner reads your context beforehand), scheduling in your time zone, and a medium you are comfortable with. KALKI runs entirely on WhatsApp video: no accounts beyond the app on your phone.',
      },
      {
        q: 'How do I verify an online astrologer is legitimate?',
        a: 'Run the seven-point checklist: claims audit, pricing transparency, scope honesty, method visibility, practitioner identity, evidence posture, and session structure. Twenty minutes of reading their public material tells you more than an hour on a call with them. The non-negotiables: no outcome guarantees, published prices, and a named practitioner whose work you can inspect before paying.',
      },
      {
        q: 'What are the warning signs of an astrology scam?',
        a: 'Fear hooks ("curse", "dark energy"), urgency hooks ("this window closes today"), dependency hooks (mandatory weekly paid check-ins), remedial-product upsells before any real consultation, opaque pricing, and guarantees of specific outcomes. Any two of these together: end the call. A serious practitioner describes patterns and practices, not curses and deadlines.',
      },
      {
        q: 'Why does KALKI publish a guide to choosing its competitors?',
        a: 'Because the market\u2019s noise is the platform\u2019s actual competitor — most people who could benefit from serious pattern work get burned once by a performance-astrology site and write off the whole category. This guide is the filter. If KALKI is the right fit, running the checklist on it will show that; if it is not, the checklist will have found you a better one.',
      },
    ],
    related: [
      { href: '/usa/vedic-astrology-consultation', label: 'Vedic Astrology Consultation' },
      { href: '/method', label: 'The Mirror Method — Published in Full' },
      { href: '/consultations', label: 'The Free Discovery Call' },
    ],
  },
  {
    slug: 'kundli-birth-chart-reading',
    path: '/usa/kundli-birth-chart-reading',
    topic: 'usa:kundli-birth-chart-reading',
    title: 'Kundli & Birth Chart Reading Online — What It Covers | KALKI',
    description:
      'What a kundli reading actually contains — houses, daśās, and the patterns they describe — and what a responsible reader refuses to claim. Online sessions for US seekers, $29, your time zone.',
    label: 'Consultations · The Chart',
    h1: 'A kundli reading',
    h1Accent: 'that respects the instrument.',
    intro: [
      'Your kundli — the Vedic birth chart, cast for your exact date, time, and place — is the most detailed self-instrument the classical Indian tradition built: twelve houses, nine grahas, twenty-seven nakshatras, and a daśā clock that cycles through planetary periods across a lifetime. Read responsibly, it describes tendencies and timing. Read irresponsibly, it becomes a slot machine with Sanskrit decoration. This page is about the first kind of reading — what it contains, what it costs, and what a serious reader refuses to do with it.',
      'KALKI kundli sessions run online over WhatsApp video, in your time zone, at $29 for a 60-minute reading (USD display is automatic for US visitors). A free 30-minute discovery call is available if you want to see how the chart gets read before booking the full session.',
    ],
    sections: [
      {
        label: '01 · What the Chart Contains',
        heading: 'The four layers a real reading covers',
        paragraphs: [
          'A complete kundli reading moves through four layers in order. The ascendant and house structure: the map of life-domains — self, resources, communication, home, and so on — and which grahas sit in or govern them. The graha placements: the classical significations, read sidereal (the Vedic zodiac), which shifts most placements by roughly 24 degrees from the Western tropical frame — this is why "I am a different sign in Vedic" surprises newcomers, and why the two systems genuinely measure different things.',
          'The nakshatra layer: the 27 lunar mansions, which carry the finer psychological texture the houses alone miss. And the daśā sequence: the planetary periods that answer the question most people actually came with — why is this theme loud now when it was quiet five years ago. A reading that skips the daśā layer skips timing entirely; a reading that ONLY does timing is doing astrology without psychology. The session covers both.',
        ],
      },
      {
        label: '02 · The Pattern Layer',
        heading: 'Where KALKI\u2019s reading goes further',
        paragraphs: [
          'The distinguishing move of a KALKI chart reading is the cross-reference: after the classical layers, the chart\u2019s tendencies are mapped against the twenty documented loops of the Pattern Atlas — the rescuer, the perfectionist, the saboteur, the avoidant — so the grahas stop being abstract and start describing the specific recurring situations you recognize. Saturn\u2019s pressure stops being a mood and becomes "this is why you over-prepare and still feel behind". This is the Mirror Method\u2019s contribution, and it is what most seekers describe as the moment the chart stopped feeling like a horoscope.',
          'The reading ends prescriptively: the tradition\u2019s actual antidotes — a mantra matched to the graha in question, a breath protocol, a targeted observation practice — not gemstones, not remedial products, not a subscription. Paid sessions include a written summary of the pattern-map and the prescription.',
        ],
      },
      {
        label: '03 · Birth Time and Accuracy',
        heading: 'The honest answer about your 11:42 AM',
        paragraphs: [
          'The chart is only as good as its birth time: a few minutes\u2019 error shifts the ascendant and can redraw the whole house structure. If your birth time is known and documented (birth certificate, hospital record), the full reading runs as designed. If it is approximate — "my mother says around 7 in the evening" — the session adapts: lunar-based analysis (nakshatra, Chandra lagna) and the daśā sequence tolerate approximation far better than house-based reading, and the session says which conclusions rest on solid ground and which on sand.',
          'What no honest reader can do is reverse-engineer certainty: "rectification" that confidently names your minute of birth from life events is a parlor trick with a refund rate the industry does not publish. The KALKI session spends your hour on what the evidence supports, and labels the rest.',
        ],
      },
      {
        label: '04 · What This Reading Will Not Do',
        heading: 'The refusals that define the practice',
        paragraphs: [
          'It will not name your death date, predict your marriage date, or tell you the sex of a child — the classical tradition itself places life-span and progeny predictions among the topics a responsible jyotishi must refuse, and modern practitioners who offer them are advertising their own carelessness. It will not sell you a gemstone, a yantra plate, or a ritual package to "fix" a graha; the tradition\u2019s real remedies are behavioral, contemplative, and free. And it will not read a chart as fate — the same classical sources that describe karma also describe its exhaustion, which is the entire reason the reading is worth doing.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What do I need for a kundli reading?',
        a: 'Your date, place, and time of birth — the more exact the time, the more the house structure can be trusted. Approximate time is workable: the reading shifts weight to lunar analysis and daśā timing, which tolerate approximation, and tells you plainly which conclusions are strong and which are soft. No prior astrology knowledge is needed; every term is translated as it appears.',
      },
      {
        q: 'Why is my Vedic sign different from my Western sign?',
        a: 'The Vedic (sidereal) zodiac is fixed to the stars; the Western (tropical) zodiac is fixed to the seasons, and precession has drifted them roughly 24 degrees apart. Both systems are internally coherent — they simply measure against different reference frames, so most placements shift one sign back in the Vedic frame. The session explains which frame a given conclusion rests on, because conflating the two is the most common source of bad astrology on the internet.',
      },
      {
        q: 'How much does an online kundli reading cost?',
        a: 'A 60-minute kundli and pattern reading is $29 USD for visitors outside India — displayed automatically, pay per session, no packages. The 90-minute Shadow Dossier ($49) extends the reading into a full shadow-pattern analysis with a written summary. The 30-minute discovery call is free.',
      },
      {
        q: 'Can you read my chart without my exact birth time?',
        a: 'Partially, honestly. The nakshatra of the Moon and the daśā sequence are robust to moderate time error; the ascendant and house placements are not. A responsible reading with an approximate time says which layer is which. What is not responsible is "rectifying" your birth time from life events with false confidence — KALKI does not offer that.',
      },
      {
        q: 'Do you do kundli matching for marriage?',
        a: 'Guna-milan (the 36-point compatibility score) is offered as context, not verdict — the score alone is the weakest instrument in the tradition\u2019s toolkit, and marriages are not decided by points. If you are evaluating a relationship, the stronger KALKI offering is the relationship-pattern reading, which examines the loops each person runs and how they interlock. See the relationship page for that format.',
      },
      {
        q: 'Is a free horoscope app just as good?',
        a: 'Apps are excellent at computing charts and terrible at reading them — a transit notification is not a consultation. The value of a session is the synthesis: which of the thousand signals the chart contains matter for the situation you are actually in, cross-referenced against documented behavioral patterns, ending in a practice rather than a push notification. The chart is free; the reading is the product.',
      },
    ],
    related: [
      { href: '/usa/vedic-astrology-consultation', label: 'Vedic Astrology Consultation' },
      { href: '/usa/relationship-pattern-reading', label: 'Relationship Pattern Reading' },
      { href: '/glossary', label: 'The Lexicon — 86 Sanskrit Terms' },
    ],
  },
  {
    slug: 'relationship-pattern-reading',
    path: '/usa/relationship-pattern-reading',
    topic: 'usa:relationship-pattern-reading',
    title: 'Why the Same Relationship Repeats — Pattern Reading | KALKI',
    description:
      'The same partner, different face — the pattern behind repeating relationships, read through Tantric psychology. Online sessions for US seekers at $29, not couples therapy, not synastry bingo.',
    label: 'Consultations · Relationships',
    h1: 'Same partner, different face.',
    h1Accent: 'There is a reason.',
    intro: [
      'You changed cities, changed apps, changed your type — and six months in, the same architecture reappears: the withdrawer, the project, the one who needs saving, the one you end up saving against your will. Classical psychology calls these repetition compulsions; the Tantric frame calls the mechanism saṃskāra and vāsanā — imprint and tendency — and, unlike most modern framings, it prescribes something. A relationship-pattern reading is the session built for exactly this.',
      'This is not synastry bingo (your Venus on their Mars), and it is not couples therapy. It is a 60-minute diagnostic that maps the loop you are running, where it came from, why it keeps selecting the same partner, and what the tradition prescribes to interrupt it. $29 online, in your time zone, with a free discovery call available first.',
    ],
    sections: [
      {
        label: '01 · The Mechanism',
        heading: 'Why the loop keeps casting the same co-star',
        paragraphs: [
          'A pattern is a loop with three parts: an imprint (a charged experience, usually early), a tendency (the automatic strategy the imprint built — rescue, control, avoidance, performance), and a selection pressure (the tendency\u2019s talent for finding people who will reactivate it). The avoidant does not accidentally keep meeting anxious partners; the strategy is doing the selecting. This is why willpower and geography fail — you brought the casting director with you.',
          'In Tantric psychology the loop is literally karmic: saṃskāra drives vāsanā, vāsanā drives action, action deepens saṃskāra. The platform\u2019s karma map documents the full mechanism, and the Pattern Atlas names twenty of the loops in their everyday costumes. A session locates yours precisely — most people run one primary loop with two supporting loops — and shows you the re-creation moment: the exact point in a new relationship where the old script takes over.',
        ],
      },
      {
        label: '02 · The Reading',
        heading: 'What the 60 minutes actually cover',
        paragraphs: [
          'First, the map: your primary pattern, its origin architecture, and its selection signature — the traits your system scans for. Second, the chart layer if you want it (optional, no birth time required for the core work): what the Vedic frame adds about the timing of relational periods — the daśā logic of why the pattern flared in certain seasons. Third, the prescription: a targeted practice — a mantra matched to the loop\u2019s governing force, a breath protocol for the somatic charge, a confrontation or observation drill for the avoidance structure — drawn from the tradition\u2019s documented antidotes, not from a self-help grab bag.',
          'The written summary you keep translates all of it into plain English, including the questions for self-observation the tradition prescribes between sessions. Most seekers run the prescription for some weeks and return for one follow-up, not a standing weekly appointment — the method\u2019s explicit design is autonomy, not dependency.',
        ],
      },
      {
        label: '03 · The Boundaries',
        heading: 'What this session is not',
        paragraphs: [
          'It is not couples therapy — no co-attendance format, no mediation, no structured couples work; if the relationship itself needs repair work, a licensed couples therapist is the right referral and the session will say so. It is not trauma treatment — patterns rooted in acute trauma deserve a trauma-trained clinician, and the reading distinguishes a saṃskāra from a wound that needs clinical care. And it is not a "will we get back together" oracle: the work treats you as the constant across your relationships, because that is where the leverage lives.',
          'What it is: a precise, source-grounded reading of the mechanism that keeps producing the same relationship — and a practice with a classical pedigree for interrupting it. The platform\u2019s evidence grades apply throughout: what is textual, what is testimonial, what is interpretive, stated as such.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Why do I keep attracting the same type of partner?',
        a: 'Because attraction is not neutral — it is a pattern\u2019s selection system doing its job. Each of us carries imprints (early charged experiences) that consolidated into automatic strategies: rescuing, pleasing, avoiding, controlling, performing. Those strategies are talented scouts for people who will reactivate the original charge, which is why changing cities or apps changes the face but not the architecture. The reading maps your specific loop — origin, selection signature, and the interruption point — and prescribes the practice the tradition built for that loop.',
      },
      {
        q: 'Is this couples therapy? Can my partner attend?',
        a: 'No and no. This is individual diagnostic work: the session examines the pattern YOU run across relationships — which is why it works even if your partner wants nothing to do with introspection. For relationship repair itself (communication structures, conflict mediation), a licensed couples therapist is the correct tool, and the session will refer you if that is what the situation needs.',
      },
      {
        q: 'I am not spiritual — will this still make sense?',
        a: 'Yes. The framework is presented in plain behavioral language first — imprints, strategies, selection — and the Tantric layer (saṃskāra, the governing archetypes, the prescriptive practices) is offered as the tradition\u2019s own working model, with evidence grades, not as a belief requirement. Committed secularists are among the platform\u2019s most engaged readers; the practices are tested against your own experience, never against faith.',
      },
      {
        q: 'Do you need my birth chart for this?',
        a: 'No — the core pattern work stands on its own. If you want the timing layer (why the pattern flared in specific seasons), the Vedic daśā frame adds real value and your birth date, place, and time get read. But no birth time? The session runs complete without it. The chart is an optional instrument here, not a gate.',
      },
      {
        q: 'How is this different from reading my attachment style online?',
        a: 'Attachment vocabulary is a useful map that most people use as a label — a thing to be, rather than a loop to interrupt. The difference is diagnostic precision and prescription: twenty documented patterns with origin architecture and selection signatures; the tradition\u2019s specific antidotes (mantra, breath, confrontation) rather than generic advice; and a live session that catches what self-diagnosis almost always misses — the supporting loops hiding under the obvious one. The Pattern Atlas is free to read; the session is for when reading stops being enough.',
      },
      {
        q: 'How many sessions does this take?',
        a: 'Usually one, plus an optional follow-up after some weeks of practice. The design goal is autonomy: you leave with the map and the practice, run the prescription, and return only if you want the next layer examined. A method that requires you forever has confused service with dependency — KALKI\u2019s stated goal is that you need the practitioner less over time.',
      },
    ],
    related: [
      { href: '/patterns', label: 'The Pattern Atlas — 20 Loops, Free to Read' },
      { href: '/karma', label: 'The Karma Map — Saṃskāra & Vāsanā' },
      { href: '/usa/vedic-astrology-consultation', label: 'Vedic Astrology Consultation' },
    ],
  },
  {
    slug: 'spiritual-consultation',
    path: '/usa/spiritual-consultation',
    topic: 'usa:spiritual-consultation',
    title: 'Spiritual Consultation & Sādhanā Guidance Online | KALKI',
    description:
      'Mantra, breath, and sādhanā guidance grounded in classical sources and graded honestly. Online sessions with Kaustubh for US seekers — free discovery call, $29 consultations, no gurudom.',
    label: 'Consultations · Sādhanā',
    h1: 'Spiritual consultation',
    h1Accent: 'for people who read the footnotes.',
    intro: [
      'Most spiritual guidance online fails a basic test: it cannot show its sources. KALKI\u2019s spiritual consultation is the opposite arrangement — a practice advisory grounded in documented tradition (Kashmiri Shaivism, Shakta Tantra, the Aghorī path, Haṭha methodology), where every technique carries its textual attribution, its caution level, and an honest evidence grade. You bring your practice, or your longing for one; the session builds or repairs the path with you.',
      'Sessions run online over WhatsApp video in your time zone — $29 for 60 minutes for visitors outside India, and a free 30-minute discovery call to start. The free Ten Doors email course teaches the framework across ten days if you want the map before the conversation.',
    ],
    sections: [
      {
        label: '01 · Who This Is For',
        heading: 'Four seekers who book this session',
        paragraphs: [
          'The stalled practitioner: you have a practice — japa, breath, meditation — that has gone flat, or hit an obstacle the books do not address. The tradition has a module for this (it is called adhikāra assessment — readiness and fit), and the session runs it: what you are actually doing, what stage it serves, what to adjust or drop.',
          'The starting seeker: you know there is something real in the tradition but every path online either demands gurudom or sells watered-down content. The session builds a beginning practice matched to your constitution and schedule — one mantra, one breath protocol, honest about what each does and does not do — with sources you can actually read. The builder: you have read the platform\u2019s corpus — the Archive, the Lexicon, the karma map — and want to go deeper with guidance: which folios, which sequence, which caution gates apply to you. And the skeptic-with-a-drawer: the meditation app veteran with a drawer of half-finished practices, seeking one honest audit of what worked, what was marketing, and what the classical sources actually say about the experiences you have had.',
        ],
      },
      {
        label: '02 · The Method',
        heading: 'Evidence grades, caution levels, no gurudom',
        paragraphs: [
          'Every practice discussed in a session is treated the way the platform treats everything: graded. Āgama — the classical texts attest it. Anubhāva — practitioner testimony supports it. Parīkṣā — cross-source evidence converges. Pratibimba — interpretive reading, labeled as such. The same grading extends to caution: practices are OPEN, MODERATE, HIGH, or SEALED, and the restricted ones stay restricted — not as marketing mystique but because the tradition itself gated them, and a system that ignores its own gates is a system you should not trust with the open ones.',
          'There is no initiation-for-sale, no secret mantra unlock behind a paywall, no obedience demand. The classical relationship between teacher and seeker is real — KALKI\u2019s Lineage Introduction exists for practitioners who reach genuinely advanced ground — but it is earned through practice and vetting, not purchased in a first session, and a platform that sells you "your personal mantra, guaranteed by ancient rishis, $199" has confused commerce with lineage.',
        ],
      },
      {
        label: '03 · What You Leave With',
        heading: 'A practice, its sources, and its gates',
        paragraphs: [
          'Every session ends with a written practice sheet: the technique (mantra, prāṇāyāma, or contemplative protocol) with its exact classical reference, the dose and timing the tradition prescribes, the caution notes specific to it, and the self-observation questions that tell you whether it is working. You also keep the map — where your practice sits in the tradition\u2019s architecture and what the next gate, if you choose to approach it, actually requires.',
          'The Ten Doors email course runs ahead of or alongside this: ten days, the full framework — patterns, archetypes, karma, sādhanā — free. Many seekers use it as the shared vocabulary that makes the first session twice as efficient.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I need to be Hindu to receive sādhanā guidance?',
        a: 'No. The practices are techniques with documented sources, not membership rites — mantra, breath regulation, and contemplative protocols are taught with their traditional context explained and your participation always your call. Seekers from every background and none work inside this material. The one requirement is seriousness: an honest practice, actually done, beats a beautiful practice, occasionally admired.',
      },
      {
        q: 'What does "evidence-graded" mean in practice?',
        a: 'Every significant claim or technique carries a register: Āgama (the classical texts attest it), Anubhāva (practitioner testimony), Parīkṣā (cross-source evidence), Pratibimba (interpretive reading). In a session, this means you always know the difference between "the texts prescribe this" and "practitioners report this" — and contested claims are labeled contested. It is the same standard you would apply to any field that respects its own sources.',
      },
      {
        q: 'Is initiation required? Will you become my guru?',
        a: 'No, and no. KALKI does not sell initiation, does not demand obedience, and does not position Kaustubh as a guru — the role is practice advisor and guide through a documented corpus. Genuine lineage transmission exists in the tradition and matters at advanced stages; KALKI\u2019s Lineage Introduction (Akash tier, vetted) exists precisely for practitioners who reach that ground honestly. What is NOT legitimate is purchasing "initiation" in a first session — any platform selling that is selling costume jewelry.',
      },
      {
        q: 'What practices does a session cover?',
        a: 'The open and moderate registers of the tradition: japa (mantra repetition) with correct methodology, prāṇāyāma protocols matched to the nervous system\u2019s actual behavior, contemplative and confrontation practices from the documented corpus, and sādhanā sequencing — what to practice, in what order, at what dose. High-caution and sealed practices are documented on the platform but are not dispensed in a first session; the tradition\u2019s own gates are respected here, plainly and without apology.',
      },
      {
        q: 'I have had strange experiences in meditation. Can you help?',
        a: 'This is one of the most common reasons serious practitioners book — and one of the places honest guidance matters most. The session distinguishes documented experiences the tradition names and maps (kriyā, prāṇa phenomena, viśeṣa states) from ordinary nervous-system noise, and from experiences that warrant clinical care. What it does not do is inflate the experiences into attainment claims — the tradition\u2019s own texts warn against exactly that, repeatedly.',
      },
      {
        q: 'How much does it cost, and how do I start?',
        a: 'The free 30-minute Archival Discovery call is the standard entry — thirty minutes on where you are and what the path forward looks like. The 60-minute consultation is $29 USD for visitors outside India; the 90-minute Shadow Dossier ($49) goes deeper into the patterns your practice is addressing. The Ten Doors email course is free and teaches the full framework in ten days. Start anywhere; nothing auto-bills.',
      },
    ],
    related: [
      { href: '/archive', label: 'The Akashic Archive' },
      { href: '/aghori-tantra', label: 'The Aghorī Tantra Course' },
      { href: '/email-course', label: 'The Ten Doors — Free Email Course' },
    ],
  },
];

