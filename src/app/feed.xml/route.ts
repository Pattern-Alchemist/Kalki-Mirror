import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';

const BASE_URL = 'https://www.astrokalki.com';

export async function GET() {
  const siddhis = allSiddhis.slice(0, 10);
  const patterns = allPatterns.slice(0, 10);

  const items: string[] = [];
  const maxLength = Math.max(siddhis.length, patterns.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < siddhis.length) {
      const s = siddhis[i];
      const title = s.title ?? s.name ?? 'Siddhi';
      const slug = s.slug ?? String(i);
      const link = `${BASE_URL}/siddhis/${slug}`;
      const description = (s.description ?? '').slice(0, 200);
      items.push(`
    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <description>${escapeXml(description)}</description>
      <guid>${link}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`);
    }
    if (i < patterns.length) {
      const p = patterns[i];
      const title = p.title ?? p.name ?? 'Pattern';
      const slug = p.slug ?? String(i);
      const link = `${BASE_URL}/patterns/${slug}`;
      const description = (p.description ?? '').slice(0, 200);
      items.push(`
    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <description>${escapeXml(description)}</description>
      <guid>${link}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KALKI — Pattern Intelligence Feed</title>
    <link>${BASE_URL}</link>
    <description>Latest siddhis and behavioral patterns from the Kalki Mirror archive.</description>
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
