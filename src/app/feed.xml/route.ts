import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';

const BASE_URL = 'https://www.astrokalki.com';

/* Vol. 2 #16 — full-text RSS. Headlines-only feeds starve the readers (and
 * the LLM crawlers) that prefer complete documents; each item now carries
 * the folio's full body. Capped at the 5 latest per corpus per the
 * roadmap — a feed is a window, not an archive dump (sitemap + llms.txt
 * remain the complete surfaces). */

const PATTERN_LIMIT = 5;
const SIDDHI_LIMIT = 5;

/** Pattern folio body: description, signs, the practice. */
function patternBody(p: (typeof allPatterns)[number]): string {
  const parts = [p.description];
  if (p.signs.length > 0) {
    parts.push('How it shows up: ' + p.signs.map((s) => `• ${s}`).join(' '));
  }
  if (p.practice) parts.push(`The work: ${p.practice}`);
  return parts.join('\n\n');
}

/** Siddhi folio body: summary, benefits, honest warnings. */
function siddhiBody(s: (typeof allSiddhis)[number]): string {
  const parts = [s.summary];
  if (s.benefits.length > 0) parts.push('Benefits: ' + s.benefits.join('; '));
  if (s.warnings.length > 0) parts.push('Cautions: ' + s.warnings.join('; '));
  return parts.join('\n\n');
}

export async function GET() {
  const siddhis = allSiddhis.slice(0, SIDDHI_LIMIT);
  const patterns = allPatterns.slice(0, PATTERN_LIMIT);

  const items: string[] = [];

  for (const s of siddhis) {
    // Folio URLs live under /archive/ (matches sitemap.ts — the old
    // /siddhis/ prefix was a 404).
    const link = `${BASE_URL}/archive/${s.slug}`;
    const body = siddhiBody(s);
    items.push(`
    <item>
      <title>${escapeXml(s.name)}</title>
      <link>${link}</link>
      <description>${escapeXml(body)}</description>
      <guid>${link}</guid>
      <category>${escapeXml(s.category)}</category>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`);
  }

  for (const p of patterns) {
    const link = `${BASE_URL}/patterns/${p.slug}`;
    const body = patternBody(p);
    items.push(`
    <item>
      <title>${escapeXml(p.name)} — ${escapeXml(p.subtitle)}</title>
      <link>${link}</link>
      <description>${escapeXml(body)}</description>
      <guid>${link}</guid>
      <category>Pattern</category>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KALKI — Pattern Intelligence Feed</title>
    <link>${BASE_URL}</link>
    <description>Full-text siddhi and pattern folios from the Kalki Mirror archive.</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />${items.join('')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
