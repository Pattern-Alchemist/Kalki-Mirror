// =============================================================
// KALKI — The 10 Doors: email content (welcome + days 1–10 + completion)
// -------------------------------------------------------------
// Single source of copy truth: docs/growth/doors-email-course.md.
// Subjects, loops, CTAs and conversion days (1 · 5 · 10) are the
// doc's — structured here ONCE and rendered to HTML + text.
//
// Conventions enforced (per doc §2):
//   · every link carries utm_source=email&utm_medium=course&
//     utm_campaign=doors-email-course&utm_content=day-N
//   · ONE CTA per email
//   · every email ends with a signed unsubscribe footer (doc §6)
// =============================================================

import { unsubscribeUrl, unsubHeaders } from "@/lib/emails/course-unsubscribe";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.astrokalki.com";

export interface CourseEmail {
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
}

/** UTM-stamped link — the War Room door board depends on this shape (doc §2). */
function utm(path: string, day: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${SITE}${path}${sep}utm_source=email&utm_medium=course&utm_campaign=doors-email-course&utm_content=${day}`;
}

// ── email-safe HTML shell (dark, serif, matches the platform) ──

function shell(dayLabel: string, title: string, bodyHtml: string, day: string, email: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0d0b09;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:560px;margin:0 auto;padding:36px 24px;color:#e8e0d4;">
<p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a89880;margin:0 0 24px;">KALKI · The 10 Doors · ${dayLabel}</p>
${bodyHtml}
<p style="font-size:14px;line-height:1.6;color:#a89880;margin:24px 0 0;">— Kaustubh</p>
<hr style="border:none;border-top:1px solid #2a241d;margin:32px 0 16px;">
<p style="font-size:12px;line-height:1.6;color:#6b6154;margin:0;">The 10 Doors · astrokalki.com<br><a href="${unsubscribeUrl(email)}" style="color:#6b6154;">Close this door</a> — one click, no questions, no friction.</p>
</div></body></html>`;
}

function p(text: string): string {
  return `<p style="font-size:16px;line-height:1.7;margin:0 0 16px;">${text}</p>`;
}

function nightLine(text: string): string {
  return `<p style="font-size:16px;line-height:1.7;margin:0 0 16px;">Tonight's one line: <em style="color:#c9a86a;">${text}</em></p>`;
}

function loopBox(text: string): string {
  return `<div style="border-left:3px solid #a89880;padding:4px 0 4px 16px;margin:20px 0;"><p style="font-size:16px;line-height:1.7;margin:0;">${text}</p></div>`;
}

function ctaButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:#c9a86a;border-radius:4px;"><a href="${href}" style="display:inline-block;padding:12px 24px;color:#0d0b09;font-family:Georgia,serif;font-size:15px;text-decoration:none;">${label}</a></td></tr></table>`;
}

function ctaSoft(text: string, href: string): string {
  return `<p style="font-size:16px;line-height:1.7;margin:0 0 16px;">${text} <a href="${href}" style="color:#c9a86a;text-decoration:underline;">→</a></p>`;
}

function textFooter(email: string): string {
  return `———
The 10 Doors · astrokalki.com
Close this door (unsubscribe): ${unsubscribeUrl(email)}`;
}

// ── structured door copy → rendered both ways ──

interface DoorCopy {
  n: number;
  goddess: string;
  subject: string;
  paras: string[];
  loop?: string;
  night?: string;
  /** Conversion CTA → consultations (days 1, 5, 10). */
  cta?: { label: string; href: string };
  /** Soft CTA → related surface (all other days). */
  soft?: { text: string; href: string };
}

const DOORS: DoorCopy[] = [
  {
    n: 1,
    goddess: "Kālī",
    subject: "The ending you keep reopening",
    paras: [
      "Kālimā wears the ending as a garland. Not to celebrate death — to make it visible.",
      "In your life, the ending already happened. What continues is the reopening. The profile you still check. The job you still mourn. The friendship you keep resuscitating with one more message. Every check is a resurrection attempt — and each one costs the same fee: the present tense.",
    ],
    loop: "The Tantric read: Kālī doesn't end things. She ends the ILLUSION that endings are optional. What refuses to close refuses to open what comes next.",
    night: "what ending are you still reopening?",
    cta: {
      label: "Three or more rounds of this loop? That's a diagnosis, not a discipline",
      href: "/consultations",
    },
  },
  {
    n: 2,
    goddess: "Tārā",
    subject: "Why chaos feels like home",
    paras: [
      "Notice how calm makes you itchy. The deadline you manufacture, the drama you walk toward, the crisis you refuse to prevent — urgency is a room you grew up in, so you keep renting it.",
      "Tārā is the navigator: the one who crosses chaos without drinking it. She crosses rivers — she doesn't move into them. The tradition keeps her image green: the colour of a crossing still possible.",
    ],
    loop: "The loop: you manufacture urgency because calm feels unfamiliar — and unfamiliar reads as danger. Chaos isn't your temperament. It's your address.",
    night: "name the last time you were bored and peaceful for a full hour. If you can't — that's the file.",
    soft: { text: "The patterns archive keeps the maps:", href: "/patterns" },
  },
  {
    n: 3,
    goddess: "Tripura Sundarī",
    subject: "The desire that never fills",
    paras: [
      "The buy, the scroll, the next plan, the one-more-thing. The missing thing always feels one purchase away — and arrives, and the shelf behind it is already empty again.",
      "Tripura Sundarī is not the desire. She is what remains when desire stops running — the beauty that was under the wanting the whole time. The tradition places her at the centre of three cities: waking, dreaming, sleeping — the same hunger runs all three.",
    ],
    loop: "The loop: consumption as a cure. But consumption treats the symptom of an unfelt life — it cannot cause one.",
    night: "the last thing you acquired — write the feeling you hoped it would produce. Then write what it actually produced. The gap is the Door.",
    soft: { text: "Where the tradition names this loop directly:", href: "/patterns" },
  },
  {
    n: 4,
    goddess: "Bhuvaneśvarī",
    subject: "Control is a room with no windows",
    paras: [
      "The schedule managed to the minute. The person managed to the sentence. The outcome managed to the fantasy. Control feels like safety — look closer: it's a room with no windows. Nothing gets in. Including what you actually wanted.",
      "Bhuvaneśvarī IS space — the goddess of the room, not the furniture. Where you grip, she is exactly what the grip prevents: room for things to arrange themselves.",
    ],
    loop: "The loop: you control people, outcomes and schedules because space feels like danger. But space is where every good thing in your life entered — uninvited.",
    night: "one thing you will deliberately not control tomorrow. Then watch what actually happens. Write it down exactly.",
    soft: { text: "What the tradition does with space:", href: "/practice" },
  },
  {
    n: 5,
    goddess: "Bhairavī",
    subject: "The anger you swallow comes back wearing your face",
    paras: [
      "You've never 'lost your temper' — that's the problem. The sarcasm that wins the room. The mood everyone walks around. The jaw at 2 AM. The body symptom with no diagnosis. Suppressed fire doesn't disappear; it changes address.",
      "Bhairavī is the fire that digests, not destroys. She is what your unspoken sentence looks like when it stops asking permission. The tradition does not vilify her — it feeds her, because undigested experience is the actual poison.",
    ],
    loop: "The loop: swallowed anger → reflux as sarcasm, symptoms, moods. It never left. It moved in.",
    night: "if the anger has an address in your body, write the address.",
    cta: { label: "One session maps the anger to its source", href: "/consultations" },
  },
  {
    n: 6,
    goddess: "Chhinnamastā",
    subject: "You give until you disappear",
    paras: [
      "The friend who funds everyone's plans with her own exhaustion. The parent who has no biography left. The colleague whose calendar is a public utility. You are generous — and you have also cut off the giver.",
      "Chhinnamastā gives her own head. The image shocks because it should: she severs the part that keeps saying yes past the point of blood. Not to end generosity — to end generosity that costs the self entirely.",
    ],
    loop: "The loop: over-giving as identity. Everyone's life is funded by yours; your own needs are unlisted.",
    night: "the last time someone saw YOUR need. Write the date. If it's blank — that's the finding.",
    soft: { text: "The archetypes corpus — where the tradition maps this file:", href: "/archetypes" },
  },
  {
    n: 7,
    goddess: "Dhūmāvatī",
    subject: "The emptiness you keep busy to avoid",
    paras: [
      "The calendar as a hiding place. Every silence filled with a podcast, every pause with a scroll, every unscheduled hour scheduled — busyness as anesthesia, and the numbness spreading.",
      "Dhūmāvatī is the goddess of the empty room — the most misunderstood of the ten. She doesn't bring the emptiness. She sits IN it, unhurried, until you can too. What you find in minute seven is what the busyness was built to hide.",
    ],
    loop: "The loop: busyness as avoidance. The emptiness isn't the danger; the anesthesia is.",
    night: "sit in an empty room, no screen, ten minutes. Write what arrives in minute seven.",
    soft: { text: "The practice corpus — sitting with what arrives:", href: "/practice" },
  },
  {
    n: 8,
    goddess: "Bagalāmukhī",
    subject: "Starting and stopping is one pattern, not two",
    paras: [
      "The project at 70%. The gym at week three. The language at lesson nine. You've called it procrastination, then discipline problems, then burnout — three names, one mechanism.",
      "Bagalāmukhī is the power of the STILL point. She freezes what should be frozen — the enemy's tongue, the runaway mind. Your problem is not the freeze. It's that she's operating on the wrong targets: frozen mid-launch, thawed mid-crisis.",
    ],
    loop: "The loop: the freeze. Starting and stopping are one pattern wearing two masks — the still point applied backwards.",
    night: "list three things frozen at 70%. One of them deserves the freeze. The other two are waiting.",
    soft: { text: "The sequences corpus — how frozen things move again:", href: "/sequences" },
  },
  {
    n: 9,
    goddess: "Mātaṅgī",
    subject: "You've been rehearsing silence",
    paras: [
      "The opinion edited out of the meeting. The boundary softened into a hint. The sentence rewritten until it asked for nothing. You call it diplomacy — the tradition calls it rehearsal.",
      "Mātaṅgī is the outcaste goddess: she speaks from outside the court, and her speech REMAKES the court. The tradition places her at the margins on purpose — that is where the unsaid sentence lives, and it is louder than everything said politely inside.",
    ],
    loop: "The loop: the swallowed voice. Every edit teaches the throat a smaller vocabulary.",
    night: "the sentence you edited out this week. Say it today — exactly as it was first written.",
    soft: { text: "The archetypes corpus — the voices the court excluded:", href: "/archetypes" },
  },
  {
    n: 10,
    goddess: "Kamalā",
    subject: "The worthiness invoice (collect it)",
    paras: [
      "Ten days ago you started collecting data. Look at your notes: every 'this is where it happens in my life' line is an invoice for worthiness you never submitted. The undercharging. The over-earning-for-others. The 'who am I to…' tax on every ambition.",
      "Kamalā doesn't CREATE worth; she sits in it — the lotus doesn't apologize for the mud it rose from. Her energy is not greed. It is ACCURACY about value.",
      "You've seen all ten loops now. Most people see one clearly — the one that runs them. If yours is now unmistakable, don't let it wait for another cycle.",
    ],
    loop: "The loop: the discounting reflex. Worth withheld is not modesty — it is a debt left uncollected.",
    cta: {
      label: "The Mirror Method names it, maps it, hands you the sequence out",
      href: "/consultations",
    },
  },
];

function renderDoor(d: DoorCopy, email: string): CourseEmail {
  const day = `day-${d.n}`;
  let body = d.paras.map(p).join("");
  if (d.loop) body += loopBox(d.loop);
  if (d.night) body += nightLine(d.night);
  if (d.cta) body += ctaButton(d.cta.label, utm(d.cta.href, day));
  if (d.soft) body += ctaSoft(d.soft.text, utm(d.soft.href, day));

  const text = [
    `KALKI · THE 10 DOORS · DAY ${d.n} · ${d.goddess.toUpperCase()}`,
    "",
    d.subject.toUpperCase(),
    "",
    d.paras.join("\n\n"),
    d.loop ?? "",
    d.night ? `Tonight's one line: ${d.night}` : "",
    d.cta ? `${d.cta.label}: ${utm(d.cta.href, day)}` : "",
    d.soft ? `${d.soft.text} ${utm(d.soft.href, day)}` : "",
    "",
    "— Kaustubh",
    "",
    textFooter(email),
  ]
    .filter((s) => s !== "")
    .join("\n");

  return {
    subject: d.subject,
    html: shell(`Day ${d.n} · ${d.goddess}`, d.subject, body, day, email),
    text,
    headers: unsubHeaders(email),
  };
}

// ── WELCOME (doc §3 — copy verbatim) ─────────────────────────

export function buildWelcome(email: string): CourseEmail {
  const day = "welcome";
  const subject = "Door 1 opens tomorrow (here's how to be ready)";
  const library = utm("/library", day);
  return {
    subject,
    html: shell(
      "Welcome",
      subject,
      p("You just did the rarest thing on the internet — you chose a door over a scroll.") +
        p(
          "Here's how this works. One email a day for ten days. Each one opens a Door — a Mahāvidyā, one of the ten great faces of reality in the Tantric tradition. I'm not going to teach you to worship them. I'm going to show you where each one is already operating in your life — as a pattern, a loop, the scene that keeps repeating with different actors.",
        ) +
        p(
          'Two instructions. Read each email at night, not in the morning scroll. And keep one note open — after every email, write the ONE line: <em style="color:#c9a86a;">"this is where it happens in my life."</em> Ten days from now, that note is your diagnosis.',
        ) +
        p(
          "Door 1 arrives tomorrow, 8 PM. Her name is Kālimā — and she's been waiting at the ending you refuse to accept.",
        ) +
        ctaSoft("While you wait, the archive is open:", library),
      day,
      email,
    ),
    text: `You just did the rarest thing on the internet — you chose a door over a scroll.

Here's how this works. One email a day for ten days. Each one opens a Door — a Mahāvidyā, one of the ten great faces of reality in the Tantric tradition. I'm not going to teach you to worship them. I'm going to show you where each one is already operating in your life — as a pattern, a loop, the scene that keeps repeating with different actors.

Two instructions. Read each email at night, not in the morning scroll. And keep one note open — after every email, write the ONE line: "this is where it happens in my life." Ten days from now, that note is your diagnosis.

Door 1 arrives tomorrow, 8 PM. Her name is Kālimā — and she's been waiting at the ending you refuse to accept.

While you wait, the archive is open: ${library}

— Kaustubh

${textFooter(email)}`,
    headers: unsubHeaders(email),
  };
}

// ── COMPLETION (doc §5 — Day 11, morning) ────────────────────

export function buildCompletion(email: string): CourseEmail {
  const day = "day-10-review";
  const subject = "Your ten lines are your diagnosis";
  const consultations = utm("/consultations", day);
  return {
    subject,
    html: shell(
      "Day 11 · Completion",
      subject,
      p(
        "You have a document now that most people never build: ten observations, first-person, dated. That note IS the intake form.",
      ) +
        p(
          "If you book a session, bring it — the first twenty minutes of the Mirror Method are exactly this map, read properly. If you're not booking yet, keep the note; the loops are patient, but so are we.",
        ) +
        ctaButton("Book the session — bring the note", consultations),
      day,
      email,
    ),
    text: `You have a document now that most people never build: ten observations, first-person, dated. That note IS the intake form.

If you book a session, bring it — the first twenty minutes of the Mirror Method are exactly this map, read properly. If you're not booking yet, keep the note; the loops are patient, but so are we.

Book the session — bring the note: ${consultations}

— Kaustubh

${textFooter(email)}`,
    headers: unsubHeaders(email),
  };
}

// ── public API ───────────────────────────────────────────────

/** Day 1–10 course email. Returns null for invalid day. */
export function buildDoorDay(n: number, email: string): CourseEmail | null {
  const d = DOORS.find((x) => x.n === n);
  return d ? renderDoor(d, email) : null;
}

export { buildWelcome as buildWelcomeEmail, buildCompletion as buildCompletionEmail };
