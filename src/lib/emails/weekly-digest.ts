/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Seeker weekly digest email (Vol. 6 #13)
   ---------------------------------------------------------------------------
   The subscriber list gets a weekly beat: the week's new letters, one
   spotlight letter, UTM-tagged links. Rides the course-send rail (same
   sendEmail + EmailSend ledger pattern). Single-opt-in posture untouched.

   Pure functions — identical server-side (cron) and in tests.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface WeeklyDigestLetterPreview {
  slug: string;
  subject: string;
  bodyExcerpt: string; // first ~160 chars, whitespace-normalized
  sentAt: string; // ISO
}

export interface WeeklyDigestContent {
  newLetters: WeeklyDigestLetterPreview[];
  spotlight: WeeklyDigestLetterPreview | null;
  weekStart: string; // ISO date (7 days ago)
}

export interface WeeklyDigestEmailInput {
  /** The subscriber's email — for UTM-tagged links + personalization. */
  email: string;
  /** The gathered content (letters this week + spotlight). */
  content: WeeklyDigestContent;
  /** Absolute origin, e.g. https://www.astrokalki.com. */
  siteUrl: string;
}

/** UTM-tag a URL for the weekly digest campaign. */
export function utmTag(url: string, email: string): string {
  const base = url.split('?')[0].split('#')[0];
  // Hash the email for the UTM content param (privacy — no raw PII in URLs)
  const content = email.split('@')[0].slice(0, 20);
  const params = new URLSearchParams({
    utm_source: 'weekly-digest',
    utm_medium: 'email',
    utm_campaign: 'kalki-weekly',
    utm_content: content,
  });
  return `${base}?${params.toString()}`;
}

/** Build the body excerpt from a letter body (whitespace-normalized, 160 chars). */
export function excerptBody(body: string | null | undefined, max = 160): string {
  if (!body) return '';
  return body.replace(/\s+/g, ' ').trim().slice(0, max);
}

export function buildWeeklyDigestEmail(
  input: WeeklyDigestEmailInput,
): { subject: string; html: string; text: string } {
  const { content, siteUrl, email } = input;
  const letters = content.newLetters;
  const spotlight = content.spotlight;

  const count = letters.length;
  const subject = count > 0
    ? `This week at KALKI — ${count} new letter${count === 1 ? '' : 's'}`
    : 'This week at KALKI';

  const lettersLinks = letters.map((l) => {
    const url = utmTag(`${siteUrl}/letters/${l.slug}`, email);
    return { subject: l.subject, url, excerpt: l.bodyExcerpt };
  });

  const spotlightUrl = spotlight
    ? utmTag(`${siteUrl}/letters/${spotlight.slug}`, email)
    : null;

  // ── Text body ─────────────────────────────────────────────────
  const textLines: string[] = [
    `Namaste,`,
    ``,
    count > 0
      ? `${count} new letter${count === 1 ? '' : 's'} from the KALKI archive this week:`
      : `A quiet week at the archive — no new letters, but the corpus is always there.`,
    ``,
  ];

  if (spotlight) {
    textLines.push(`★ Spotlight: ${spotlight.subject}`);
    textLines.push(`  ${spotlight.bodyExcerpt}`);
    textLines.push(`  ${spotlightUrl}`);
    textLines.push(``);
  }

  for (const l of lettersLinks) {
    textLines.push(`· ${l.subject}`);
    if (l.excerpt) textLines.push(`  ${l.excerpt}`);
    textLines.push(`  ${l.url}`);
    textLines.push(``);
  }

  textLines.push(`The full archive is always open:`);
  textLines.push(`  ${utmTag(`${siteUrl}/letters`, email)}`);
  textLines.push(``);
  textLines.push(`— Kaustubh, KALKI`);

  const text = textLines.join('\n');

  // ── HTML body ─────────────────────────────────────────────────
  const htmlParts: string[] = [
    `<div style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 560px;">`,
    `<h2 style="font-weight: normal; letter-spacing: 0.02em;">This week at KALKI</h2>`,
    `<p>Namaste — ${count > 0 ? `${count} new letter${count === 1 ? '' : 's'} from the archive this week.` : 'A quiet week at the archive.'}</p>`,
  ];

  if (spotlight) {
    htmlParts.push(`<div style="border-left: 3px solid #c5a059; padding-left: 14px; margin: 18px 0;">`);
    htmlParts.push(`<p style="font-size: 12px; color: #c5a059; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 4px 0;">★ Spotlight</p>`);
    htmlParts.push(`<p style="font-weight: 500; margin: 0 0 4px 0;">${spotlight.subject}</p>`);
    if (spotlight.bodyExcerpt) {
      htmlParts.push(`<p style="font-size: 14px; color: #555; margin: 0 0 6px 0;">${spotlight.bodyExcerpt}</p>`);
    }
    htmlParts.push(`<a href="${spotlightUrl}" style="font-size: 13px; color: #c5a059; text-decoration: none;">Read →</a>`);
    htmlParts.push(`</div>`);
  }

  if (lettersLinks.length > 0) {
    htmlParts.push(`<ul style="list-style: none; padding: 0; margin: 16px 0;">`);
    for (const l of lettersLinks) {
      htmlParts.push(`<li style="margin-bottom: 12px;">`);
      htmlParts.push(`<a href="${l.url}" style="color: #1a1a1a; text-decoration: none; font-weight: 500;">${l.subject}</a>`);
      if (l.excerpt) {
        htmlParts.push(`<br><span style="font-size: 13px; color: #666;">${l.excerpt}</span>`);
      }
      htmlParts.push(`</li>`);
    }
    htmlParts.push(`</ul>`);
  }

  htmlParts.push(`<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">`);
  htmlParts.push(`<p style="font-size: 13px;"><a href="${utmTag(`${siteUrl}/letters`, email)}" style="color: #c5a059; text-decoration: none;">The full archive →</a></p>`);
  htmlParts.push(`<p style="color: #666; font-size: 13px;">— Kaustubh, KALKI</p>`);
  htmlParts.push(`</div>`);

  const html = htmlParts.join('\n');

  return { subject, html, text };
}
