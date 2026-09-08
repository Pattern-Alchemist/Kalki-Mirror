// =============================================================
// KALKI — RSS feed builder (Vol. 5 #6)
// -------------------------------------------------------------
// Pure assembly for /feed.xml. The route gathers; this module
// decides the XML. Broadcast letters join the siddhi + pattern
// folios as first-class feed citizens: publishing a letter
// (isPublic flip) must surface an item here within one
// revalidation — the same ≤1h contract the sitemap already
// carries (revalidate 3600). Full-text items throughout:
// headlines-only feeds starve the readers (and the LLM crawlers)
// that prefer complete documents (Vol. 2 #16 posture, kept).
// =============================================================

/** Minimal structural shapes — keeps the builder decoupled from the data modules. */
export interface FeedSiddhi {
  slug: string;
  name: string;
  category: string;
  summary: string;
  benefits: string[];
  warnings: string[];
}

export interface FeedPattern {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  signs: string[];
  practice?: string;
}

export interface FeedLetter {
  slug: string;
  subject: string;
  body: string;
  sentAt: Date | string;
}

export const SIDDHI_LIMIT = 5;
export const PATTERN_LIMIT = 5;
export const LETTER_LIMIT = 5;

const BASE_URL = 'https://www.astrokalki.com';

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Pattern folio body: description, signs, the practice. */
function patternBody(p: FeedPattern): string {
  const parts = [p.description];
  if (p.signs.length > 0) {
    parts.push('How it shows up: ' + p.signs.map((s) => `• ${s}`).join(' '));
  }
  if (p.practice) parts.push(`The work: ${p.practice}`);
  return parts.join('\n\n');
}

/** Siddhi folio body: summary, benefits, honest warnings. */
function siddhiBody(s: FeedSiddhi): string {
  const parts = [s.summary];
  if (s.benefits.length > 0) parts.push('Benefits: ' + s.benefits.join('; '));
  if (s.warnings.length > 0) parts.push('Cautions: ' + s.warnings.join('; '));
  return parts.join('\n\n');
}

function siddhiItem(s: FeedSiddhi): string {
  // Folio URLs live under /archive/ (matches sitemap.ts — the old
  // /siddhis/ prefix was a 404).
  const link = `${BASE_URL}/archive/${s.slug}`;
  const body = siddhiBody(s);
  return `
    <item>
      <title>${escapeXml(s.name)}</title>
      <link>${link}</link>
      <description>${escapeXml(body)}</description>
      <guid>${link}</guid>
      <category>${escapeXml(s.category)}</category>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`;
}

function patternItem(p: FeedPattern): string {
  const link = `${BASE_URL}/patterns/${p.slug}`;
  const body = patternBody(p);
  return `
    <item>
      <title>${escapeXml(p.name)} — ${escapeXml(p.subtitle)}</title>
      <link>${link}</link>
      <description>${escapeXml(body)}</description>
      <guid>${link}</guid>
      <category>Pattern</category>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`;
}

function letterItem(l: FeedLetter): string {
  const link = `${BASE_URL}/letters/${l.slug}`;
  // Full body — the archive keeps the same words the inbox received,
  // minus anything personal (no per-recipient links are ever stored).
  return `
    <item>
      <title>${escapeXml(l.subject)}</title>
      <link>${link}</link>
      <description>${escapeXml(l.body)}</description>
      <guid>${link}</guid>
      <category>Letter</category>
      <pubDate>${new Date(l.sentAt).toUTCString()}</pubDate>
    </item>`;
}

/** Assemble the full RSS 2.0 document. Order: siddhis, patterns, letters. */
export function buildFeedXml(opts: {
  siddhis: FeedSiddhi[];
  patterns: FeedPattern[];
  letters: FeedLetter[];
}): string {
  const items: string[] = [];
  for (const s of opts.siddhis.slice(0, SIDDHI_LIMIT)) items.push(siddhiItem(s));
  for (const p of opts.patterns.slice(0, PATTERN_LIMIT)) items.push(patternItem(p));
  for (const l of opts.letters.slice(0, LETTER_LIMIT)) items.push(letterItem(l));

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KALKI — Pattern Intelligence Feed</title>
    <link>${BASE_URL}</link>
    <description>Full-text siddhi and pattern folios from the Kalki Mirror archive, plus the broadcast letters.</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />${items.join('')}
  </channel>
</rss>`;
}

// ── JSON Feed 1.1 (Vol. 5 #13) ─────────────────────────────────────────────
// The same source data, one serializer over: modern readers prefer JSON
// Feed and it costs nothing to serve both windows from the same gather.
// Parity contract with the RSS gate: identical item composition (siddhis
// → patterns → letters, same caps, same URLs, full-text bodies). Honest
// dates only: the corpus is code (no real publication date exists), so
// folio items carry no date_published — letters carry their sentAt.

export interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  tags?: string[];
  /** ISO 8601 — only when an honest date exists (letters). */
  date_published?: string;
}

export interface JsonFeed {
  version: 'https://jsonfeed.org/version/1.1';
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  language: string;
  authors: Array<{ name: string; url: string }>;
  items: JsonFeedItem[];
}

function jsonSiddhiItem(s: FeedSiddhi): JsonFeedItem {
  const link = `${BASE_URL}/archive/${s.slug}`;
  return {
    id: link,
    url: link,
    title: s.name,
    content_text: siddhiBody(s),
    tags: [s.category],
  };
}

function jsonPatternItem(p: FeedPattern): JsonFeedItem {
  const link = `${BASE_URL}/patterns/${p.slug}`;
  return {
    id: link,
    url: link,
    title: `${p.name} — ${p.subtitle}`,
    content_text: patternBody(p),
    tags: ['Pattern'],
  };
}

function jsonLetterItem(l: FeedLetter): JsonFeedItem {
  const link = `${BASE_URL}/letters/${l.slug}`;
  return {
    id: link,
    url: link,
    title: l.subject,
    content_text: l.body,
    tags: ['Letter'],
    date_published: new Date(l.sentAt).toISOString(),
  };
}

/** Assemble the JSON Feed 1.1 document — same items, same order, same caps. */
export function buildFeedJson(opts: {
  siddhis: FeedSiddhi[];
  patterns: FeedPattern[];
  letters: FeedLetter[];
}): JsonFeed {
  const items: JsonFeedItem[] = [];
  for (const s of opts.siddhis.slice(0, SIDDHI_LIMIT)) items.push(jsonSiddhiItem(s));
  for (const p of opts.patterns.slice(0, PATTERN_LIMIT)) items.push(jsonPatternItem(p));
  for (const l of opts.letters.slice(0, LETTER_LIMIT)) items.push(jsonLetterItem(l));

  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'KALKI — Pattern Intelligence Feed',
    home_page_url: BASE_URL,
    feed_url: `${BASE_URL}/feed.json`,
    description:
      'Full-text siddhi and pattern folios from the Kalki Mirror archive, plus the broadcast letters.',
    language: 'en-us',
    authors: [{ name: 'Kaustubh — KALKI', url: BASE_URL }],
    items,
  };
}
