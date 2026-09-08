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
  /** Vol. 5 #15 — LocalBusiness-grade area for city surfaces. When present,
   *  the Service JSON-LD emits an @type City areaServed (plus the country)
   *  instead of the default whole-US Country scope. */
  area?: { city: string; region?: string; country: string };
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
    // Vol. 5 #15 — the city surfaces (local-intent doors from the front page)
    { href: '/usa/austin', label: 'Austin, TX' },
    { href: '/usa/new-york', label: 'New York City' },
    { href: '/usa/san-francisco-bay', label: 'San Francisco Bay' },
    { href: '/usa/london', label: 'London' },
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
      // Vol. 5 #15 — the city surfaces (local-intent doors into the same system)
      { href: '/usa/austin', label: 'Austin, TX' },
      { href: '/usa/new-york', label: 'New York City' },
      { href: '/usa/san-francisco-bay', label: 'San Francisco Bay' },
      { href: '/usa/london', label: 'London' },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   THE CITY SURFACES — Vol. 5 #15
   -------------------------------------------------------------
   Local-intent queries ("vedic astrologer austin", "tantric
   consultation london") deserve city pages with genuinely local
   copy — not the service page re-badged. Every paragraph below is
   authored for its city (the uniqueness gate in tests/lib/
   usa-cities.test.ts fails loud on template clones), each page
   carries its own FAQ blocks (FAQPage JSON-LD comes from the
   shared shell), and the Service JSON-LD narrows to the City via
   the `area` field. London deliberately rides under /usa with an
   honest "International" crumb — one acquisition layer, one
   conversion spine, the city is the content.
   ───────────────────────────────────────────────────────────── */

export const usaCityPages: UsaPage[] = [
  {
    slug: 'austin',
    path: '/usa/austin',
    topic: 'usa-austin',
    title: 'Vedic Astrologer for Austin, TX — Online Tantric Consultations',
    description:
      'Evidence-graded Tantric pattern work for Austin seekers. Online consultations with Kaustubh on Central Time — USD pricing, free discovery call, no fortune telling.',
    label: 'KALKI · Austin, Texas',
    h1: 'Austin reads everything carefully.',
    h1Accent: 'Read your own patterns the same way.',
    intro: [
      'Austin is a city that takes inner work seriously — a meditation studio on every corner, a yoga teacher training every weekend, and a tech community that treats consciousness like the next frontier. What most of it does not offer is a map: a documented, source-checked body of knowledge that explains WHY the same relationship, the same burnout, the same self-sabotage keeps recurring. KALKI is that map — a Tantric knowledge platform built on the premise that patterns are loops, and loops can be read, understood, and interrupted.',
      'The Mirror Method fuses classical Tantric psychology — Kashmiri Shaivism, Shakta traditions, the Aghorī path — with modern pattern analysis. Every claim carries an evidence grade (Āgama, Anubhāva, Parīkṣā, Pratibimba) so you always know whether you are reading a citation or a lived report. No psychic hotline energy, no "100% accurate" promises, no black-magic removal — the vocabulary Austin has heard enough of.',
      'Sessions run online over WhatsApp video, scheduled in Central Time, priced in USD — the 60-minute Pattern Consultation at $29, the 90-minute Shadow Dossier at $49, and a free 30-minute discovery call that most Austin seekers start with. No studio to drive to, no incense upcharge; the work happens in the reading, not the room.',
    ],
    sections: [
      {
        label: '01 · Austin, meet the archive',
        heading: 'A documented corpus, not a deck of cards',
        paragraphs: [
          'The platform holds an Akashic Archive of evidence-graded sādhana folios, a Pattern Atlas of twenty recurring emotional loops (the perfectionist, the rescuer, the ghost — you will recognize at least one), the ten Mahāvidyās mapped as diagnostic archetypes, and karma presented as the tradition actually teaches it: a psychology of cause and conditioning, not a cosmic scoreboard. Your chart, when a session calls for it, is read as a diagnostic instrument — cross-referenced with the pattern work, never used to tell you your month is cursed.',
          'That register is deliberate. Austin\'s contemplative community is sophisticated enough to be tired of vague astrology-speak, and honest enough to want sources. This is the rare corner of the field where the sources are on the table — graded, cited, and open to being contested.',
        ],
      },
      {
        label: '02 · Working with Kaustubh from Austin',
        heading: 'Central Time, in dollars, starting free',
        paragraphs: [
          'You propose two or three windows in your local time; sessions routinely land in Austin mornings before work or evenings after the heat breaks. The founder, Kaustubh, works one-on-one over WhatsApp video — no group webinars, no funnel of upsells. USD pricing is automatic for US visitors, and international cards are accepted.',
        ],
        bullets: [
          'Free 30-minute Archival Discovery call — the standard first step, no obligation',
          'Pattern Consultation — $29 / 60 minutes, one loop mapped in depth',
          'Shadow Dossier — $49 / 90 minutes, written summary included',
          'Ten Doors email course — free, ten days, the entire framework first',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do you have an office or studio in Austin?',
        a: 'No — and that is by design, not a limitation. The consultation is a reading and a working conversation; it does not need a room to be real. Everything runs online over WhatsApp video, which means you can book from South Congress or Round Rock with the same experience. If you want in-person energy work, Austin has excellent studios — what they generally do not have is a documented corpus behind the guidance.',
      },
      {
        q: 'What hours do sessions run for Central Time?',
        a: 'You propose the windows and the session confirms one that works — Austin mornings (7–9am CT) and evenings (6–9pm CT) are both routine. The discovery call is thirty minutes; consultations run sixty or ninety depending on the depth you choose. Time-zone math is handled on this side, not yours.',
      },
      {
        q: 'Austin already has yoga, meditation, and astrology everywhere. What makes this different?',
        a: 'Most local astrology is interpretive and most local yoga is somatic — both valuable, neither gives you a MAP of your recurring loops with sources attached. KALKI sits in the gap: a documented Tantric corpus, evidence grades on every claim, and pattern analysis that treats your situation as a readable structure rather than a vibe. It pairs well with a practice you already have; it does not ask you to abandon it.',
      },
      {
        q: 'Is this compatible with a meditation practice I already keep?',
        a: 'Yes — a meaningful share of consultations are booked by people with an existing practice who hit something they cannot name: plateau, strange experiences, a loop the cushion has not touched. The session distinguishes documented phenomena the tradition actually maps from ordinary nervous-system noise, and sequences what to practice next from the open registers of the corpus. High-caution practices are documented on the platform but not dispensed in a first session.',
      },
      {
        q: 'How do I start from Austin?',
        a: 'The free 30-minute Archival Discovery call is the honest entry — thirty minutes on where you are and what the path forward looks like, no payment and no obligation. If you would rather read first, the Pattern Atlas is free, and the Ten Doors email course walks the full framework in ten days. Start anywhere; nothing auto-bills.',
      },
    ],
    related: [
      { href: '/usa', label: 'KALKI for the United States' },
      { href: '/usa/vedic-astrology-consultation', label: 'The Pattern Consultation' },
      { href: '/patterns', label: 'The Pattern Atlas — free' },
      { href: '/usa/new-york', label: 'New York City' },
    ],
    area: { city: 'Austin', region: 'Texas', country: 'United States' },
  },
  {
    slug: 'new-york',
    path: '/usa/new-york',
    topic: 'usa-new-york',
    title: 'Vedic Astrologer for New York City — Online Tantric Consultations',
    description:
      'Evidence-graded Tantric pattern work for New York seekers. Online consultations on Eastern Time — USD pricing, free discovery call, zero fortune-telling.',
    label: 'KALKI · New York City',
    h1: 'The city that has seen everything',
    h1Accent: 'has not seen your patterns read honestly.',
    intro: [
      'New York has more astrologers per square mile than almost anywhere on earth, and more reasons to be skeptical of all of them. KALKI is built for exactly that skepticism: a Tantric knowledge platform where every claim carries an evidence grade, the sources are cited, and the work is not fortune-telling — it is pattern analysis. The recurring relationship, the career loop that resets every eighteen months, the self-sabotage with excellent taste: those are structures, and structures can be read.',
      'The Mirror Method fuses classical Tantric psychology — Kashmiri Shaivism, the Shakta tradition, the Aghorī path — with modern behavioral analysis. Your chart, when a session calls for it, is used as a diagnostic instrument, not a prophecy. What you get is a map of the loop you are in and a prescribed practice from a documented corpus — not a promise that Venus will fix your rent.',
      'Sessions run one-on-one over WhatsApp video, scheduled in Eastern Time around New York hours — early mornings before the city wakes and late evenings after it stops demanding things. The 60-minute Pattern Consultation is $29, the 90-minute Shadow Dossier is $49, and the 30-minute discovery call is free. No studio in Midtown, no waiting room; the work is the reading.',
    ],
    sections: [
      {
        label: '01 · For New Yorkers allergic to fortune-telling',
        heading: 'Skepticism is the right starting posture',
        paragraphs: [
          'You should not trust a field that runs on vibes — and most of what sells as astrology or Tantra in this city runs on vibes. KALKI\'s answer is documentation: an Akashic Archive of evidence-graded sādhana folios, a Pattern Atlas of twenty named loops, the Mahāvidyās mapped as diagnostic archetypes, and karma taught as the tradition\'s own psychology of cause and conditioning. Contested claims are labeled contested. "The texts attest this" and "practitioners report this" are kept visibly different, because collapsing them is how the field earned its reputation.',
          'That posture tends to land with New Yorkers in particular: the city produces pattern-recognition machines. People who can read a market, a room, or a manuscript at speed usually need very little convincing once they see the corpus — they need the map, and someone honest enough to say what the map does not know.',
        ],
      },
      {
        label: '02 · Sessions around New York hours',
        heading: 'Eastern Time, in dollars, no waiting room',
        paragraphs: [
          'Propose two or three windows; the session confirms one. Early morning before the first meeting and evening after nine are both routine — the calendar is built around your city\'s hours, not an ashram\'s. USD pricing is automatic: the 60-minute Pattern Consultation at $29, the 90-minute Shadow Dossier with a written summary at $49, the free 30-minute discovery call most people start with.',
        ],
        bullets: [
          'Free 30-minute Archival Discovery call — the standard entry',
          'Pattern Consultation — $29 / 60 minutes, one loop mapped in depth',
          'Shadow Dossier — $49 / 90 minutes, written summary included',
          'Ten Doors email course — free, ten days, the entire framework',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I ever need to be anywhere in person in New York?',
        a: 'No. The consultation is a reading and a working conversation over WhatsApp video — nothing about it improves by adding a Manhattan waiting room. You bring the pattern; the session brings the map. Everything — booking, the call itself, the written summary if you take the Dossier — happens online.',
      },
      {
        q: 'New York is full of psychics and astrologers. How is this actually different?',
        a: 'Three visible differences: every claim carries an evidence grade (textual authority vs. practitioner report vs. cross-source vs. interpretation), the corpus is documented and readable before you pay anything, and the session output is a pattern map plus a prescribed practice — not a prediction about your future. If you want someone to tell you a man is coming into your life in October, this is the wrong door. If you want to know why the same man keeps arriving in different costumes, it is the right one.',
      },
      {
        q: 'Can I bring a specific problem — a job, a relationship, a decision?',
        a: 'Yes — specific situations are the ideal material. The session reads the loop underneath the situation (the Pattern Atlas\'s twenty named loops cover most of them), cross-references the chart when it adds diagnostic value, and ends with a practice prescription. What it will not do is make the decision for you or promise outcomes; the tradition\'s own texts are blunt about practitioners who do.',
      },
      {
        q: 'What hours work for Eastern Time?',
        a: 'You propose two or three windows in your schedule; sessions routinely land 7–9am ET before the workday and 8–10pm ET after it. The discovery call is thirty minutes; consultations run sixty or ninety. Time-zone handling is this side\'s job.',
      },
      {
        q: 'How do I start from New York?',
        a: 'Book the free 30-minute discovery call — thirty minutes, no payment, no obligation. If reading suits you better first, the Pattern Atlas and the Akashic Archive are free, and the Ten Doors course teaches the full framework in ten days. Start anywhere; nothing auto-bills.',
      },
    ],
    related: [
      { href: '/usa', label: 'KALKI for the United States' },
      { href: '/usa/online-vedic-astrologer', label: 'Choosing an online astrologer' },
      { href: '/archetypes', label: 'The Ten Mahāvidyā Archetypes' },
      { href: '/usa/san-francisco-bay', label: 'San Francisco Bay' },
    ],
    area: { city: 'New York', region: 'New York', country: 'United States' },
  },
  {
    slug: 'san-francisco-bay',
    path: '/usa/san-francisco-bay',
    topic: 'usa-san-francisco-bay',
    title: 'Vedic Astrologer for the SF Bay Area — Online Tantric Consultations',
    description:
      'Evidence-graded Tantric pattern work for Bay Area seekers. Online consultations on Pacific Time — USD pricing, free discovery call, no manifestation talk.',
    label: 'KALKI · San Francisco Bay',
    h1: 'The Bay optimized everything',
    h1Accent: 'except the loops underneath.',
    intro: [
      'The Bay Area has tried every consciousness technology on the market — meditation apps, breathwork festivals, plant medicine circles, retreats in Big Sur — and produced more self-aware people per capita than anywhere in the country. What the market has not produced is a document: a source-checked body of knowledge that maps WHY the founder who can scale a company cannot stop rescuing people, why the exit did not fix the loop, why the same relationship keeps rendering in different fonts. KALKI is that document.',
      'The Mirror Method fuses classical Tantric psychology — Kashmiri Shaivism, the Shakta tradition, the Aghorī path — with modern pattern analysis. Every claim carries an evidence grade; the corpus is the Akashic Archive of graded sādhana folios plus a Pattern Atlas of twenty named loops. No manifestation talk, no vibration pricing tiers, no "abundance alignment" — the tradition\'s own texts are sharper than that, and this platform treats them that way.',
      'Sessions run one-on-one over WhatsApp video, scheduled in Pacific Time — early mornings before standup, evenings after the commute up the 101 or down the 101 from anywhere between San Jose and Marin. The 60-minute Pattern Consultation is $29, the 90-minute Shadow Dossier is $49 with a written summary, and the 30-minute discovery call is free. The work is the reading, not the venue.',
    ],
    sections: [
      {
        label: '01 · For the most optimized city on earth',
        heading: 'Pattern analysis, not another optimization hack',
        paragraphs: [
          'The Bay\'s instinct is to treat inner life like a system to instrument — which is half right. The half that is missing is a corpus: twenty-five centuries of documented practice describing exactly these loops, with the tradition\'s own warning labels attached. KALKI\'s Pattern Atlas names twenty of them (the Perfectionist, the Rescuer, the Ghost — recognizable from any founder\'s retrospective), grades its evidence, and prescribes practices from the open registers of the tradition — japa with correct methodology, prāṇāyāma matched to the nervous system\'s actual behavior, contemplation with a documented target.',
          'What it does not do is promise the loop will disappear after one session or sell you a state. The texts are blunt about practitioners who do, and so is this platform. What you get is a map, a practice, and an honest account of what each is for — which, in a town that has bought everything else, tends to be the novel product.',
        ],
      },
      {
        label: '02 · Sessions around Pacific hours',
        heading: 'PT, in dollars, zero commute',
        paragraphs: [
          'Propose two or three windows in your local time; sessions routinely land 7–9am PT before the workday and 6–9pm after it, from San Francisco, Oakland, Berkeley, San Jose, or wherever you actually are that week. USD pricing is automatic and international cards are accepted — the Shadow Dossier\'s written summary lands in your inbox, not in a follow-up funnel.',
        ],
        bullets: [
          'Free 30-minute Archival Discovery call — the standard first step',
          'Pattern Consultation — $29 / 60 minutes, one loop mapped in depth',
          'Shadow Dossier — $49 / 90 minutes, written summary included',
          'Ten Doors email course — free, ten days, the full framework first',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do you serve the whole Bay Area — San Jose, Oakland, Berkeley?',
        a: 'Yes — the consultation is online, so "the Bay" means anywhere from San Francisco to Santa Cruz and out to Walnut Creek — San Jose, Oakland, Berkeley, the Peninsula, all of it. There is no office to reach and no traffic to fight; the session happens over WhatsApp video at whatever desk, couch, or parked car has the forty-five quiet minutes you need.',
      },
      {
        q: 'What time do sessions run for Pacific Time?',
        a: 'You propose the windows; sessions routinely land 7–9am PT and 6–9pm PT. The discovery call is thirty minutes, consultations run sixty or ninety. The time-zone math is handled on this side — you just pick slots that fit your calendar.',
      },
      {
        q: 'The Bay has every consciousness product on earth. Why this?',
        a: 'Because almost none of it comes with a documented corpus or an evidence grade. KALKI\'s claims are graded — textual authority, practitioner report, cross-source, or labeled interpretation — and the archive is readable before you spend anything. It is the opposite of a retreat upsell: a map you can audit, practices with the tradition\'s own caution gates intact, and no promises about outcomes.',
      },
      {
        q: 'Is this therapy? I am in California — does the licensing question apply?',
        a: 'No — this is not psychotherapy, medical care, or a licensed discipline, and it does not pretend to be one; it is pattern consultation grounded in a classical textual tradition. Where a situation clearly needs clinical care, the honest answer is a referral out — the session distinguishes documented contemplative experiences from things a therapist or physician should handle, and says so plainly.',
      },
      {
        q: 'How do I start from the Bay?',
        a: 'The free 30-minute Archival Discovery call is the standard entry — no payment, no obligation. Read first if you prefer: the Pattern Atlas is free and takes about twenty minutes, and the Ten Doors course teaches the full framework in ten days. Start anywhere; nothing auto-bills.',
      },
    ],
    related: [
      { href: '/usa', label: 'KALKI for the United States' },
      { href: '/usa/vedic-astrology-consultation', label: 'The Pattern Consultation' },
      { href: '/karma', label: 'Karma as Tantric Psychology' },
      { href: '/usa/austin', label: 'Austin, TX' },
    ],
    area: { city: 'San Francisco', region: 'California', country: 'United States' },
  },
  {
    slug: 'london',
    path: '/usa/london',
    topic: 'usa-london',
    title: 'Vedic Astrologer for London — Online Tantric Consultations | KALKI',
    description:
      'Evidence-graded Tantric pattern work for London seekers. Online consultations on UK time — free discovery call, honest pricing, zero fortune-telling.',
    label: 'KALKI · London',
    h1: 'London has tasted every kind of Tantra.',
    h1Accent: 'Here is the one with sources.',
    intro: [
      'London\'s spiritual marketplace is enormous and well-worn — Camden workshops, Soho tarot, festivals selling "Tantra" that has never seen a text. KALKI exists for the seeker who has been burned by that market once already and wants the real discipline underneath: a documented Tantric corpus, every claim graded (Āgama, Anubhāva, Parīkṣā, Pratibimba), and consultations that read patterns instead of predicting futures. This is not the Tantra of a weekend workshop; it is the tradition with its own sources on the table.',
      'The Mirror Method fuses classical Tantric psychology — Kashmiri Shaivism, the Shakta tradition, the Aghorī path — with modern pattern analysis. The recurring relationship, the career loop, the practice that plateaued: those are named, mapped structures in this corpus, and the session\'s job is to show you the structure and prescribe what the tradition actually prescribes. Your chart, when it adds diagnostic value, is read as an instrument — never as a verdict on your year.',
      'Sessions run one-on-one over WhatsApp video, scheduled in UK time — lunch hours and evenings both routine, no gym-honed dawn required unless you like those. Pricing is displayed in USD for visitors outside India ($29 for the 60-minute consultation, $49 for the 90-minute Shadow Dossier, free 30-minute discovery call); your card is billed in USD and your bank handles the conversion at its rate. The work is the reading — no venue, no waiting room, no incense upcharge.',
    ],
    sections: [
      {
        label: '01 · London, the archive, and the long game',
        heading: 'A discipline with sources, not a scene with vibes',
        paragraphs: [
          'The UK\'s Tantra conversation has volume and very little documentation — which is exactly backwards from how a discipline earns trust. KALKI\'s platform holds an Akashic Archive of evidence-graded sādhana folios, a Pattern Atlas of twenty named loops, the ten Mahāvidyās as diagnostic archetypes, and karma taught as the tradition\'s own psychology of cause and conditioning. Contested claims are labeled contested. "The texts attest this" and "a practitioner reports this" never quietly merge — the merger is how the weekend-workshop economy makes its money.',
          'If you have sat in enough London workshops to recognize the pattern — an experience, a burst of insight, and by Thursday the same loop running — the missing piece was never another experience. It was a map with sources. That is what a consultation here provides, and what the free archive lets you audit before you spend a pound.',
        ],
      },
      {
        label: '02 · Working with Kaustubh from the UK',
        heading: 'UK hours, honest pricing, nothing auto-billing',
        paragraphs: [
          'Propose two or three windows in your local time; sessions routinely land 12–2pm and 6–9pm UK time. The entry point most London seekers take is the free 30-minute discovery call; the paid tiers are the 60-minute Pattern Consultation ($29) and the 90-minute Shadow Dossier ($49, written summary included). Cards are charged in USD — the amount your bank shows in GBP depends on its conversion rate, which is stated plainly here because "mystery currency margins" belong to the industry this platform is skeptical of.',
        ],
        bullets: [
          'Free 30-minute Archival Discovery call — the standard first step',
          'Pattern Consultation — $29 / 60 minutes, one loop mapped in depth',
          'Shadow Dossier — $49 / 90 minutes, written summary included',
          'Ten Doors email course — free, ten days, the full framework first',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do you see London clients in person, or online only?',
        a: 'Online only — by design, not as a compromise. The consultation is a reading and a working conversation; a room adds nothing to it. Sessions run over WhatsApp video in UK-friendly hours, which means the work fits a lunch break or an evening in the flat rather than a cross-town journey.',
      },
      {
        q: 'What time do sessions run for the UK?',
        a: 'You propose two or three windows; 12–2pm and 6–9pm UK time are both routine. The discovery call is thirty minutes and consultations run sixty or ninety. Scheduling and time-zone handling are this side\'s job.',
      },
      {
        q: 'London\'s Tantra scene is busy — workshops, festivals, classes. Where does this fit?',
        a: 'Most of that scene delivers experiences; this delivers a map with sources. They are not enemies — a practice you met at a workshop can be examined, graded, and sequenced properly inside the corpus here. What the session will not do is sell "Tantra" as a euphemism, promise neon transcendence, or initiate you in an evening; the tradition\'s own gates are respected, plainly.',
      },
      {
        q: 'Do you charge in GBP?',
        a: 'Pricing is displayed and charged in USD ($29 consultation, $49 dossier, free discovery call) because the payment stack is one system worldwide; your bank converts at its rate and shows you the GBP amount. It is stated here rather than hidden, because a platform this skeptical of astrology-stall pricing has no business introducing its own opaque fees.',
      },
      {
        q: 'How do I start from London?',
        a: 'The free 30-minute Archival Discovery call is the honest entry — no payment, no obligation, thirty minutes on where you are. If you would rather read first, the Akashic Archive and the Pattern Atlas are free, and the Ten Doors course teaches the whole framework in ten days. Start anywhere; nothing auto-bills.',
      },
    ],
    related: [
      { href: '/usa', label: 'KALKI worldwide' },
      { href: '/aghori-tantra', label: 'The Aghorī Tantra Course' },
      { href: '/library', label: 'The Library — free reading' },
      { href: '/usa/new-york', label: 'New York City' },
    ],
    area: { city: 'London', country: 'United Kingdom' },
  },
];

