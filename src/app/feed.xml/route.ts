import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import {
  buildFeedXml,
  SIDDHI_LIMIT,
  PATTERN_LIMIT,
  LETTER_LIMIT,
  type FeedLetter,
} from '@/lib/seo/feed-builder';

/* Vol. 2 #16 — full-text RSS. Headlines-only feeds starve the readers (and
 * the LLM crawlers) that prefer complete documents; each item now carries
 * the folio's full body. Capped at the 5 latest per corpus per the
 * roadmap — a feed is a window, not an archive dump (sitemap + llms.txt
 * remain the complete surfaces).
 *
 * Vol. 5 #6 — broadcast letters joined the feed. The publish pin: flipping
 * a Letter row to isPublic surfaces it here within one revalidation, the
 * same ≤1h freshness the sitemap already guarantees (revalidate 3600).
 * Letters gather fail-soft (dynamic import + catch, mirroring sitemap.ts):
 * no DB at build time → letters absent from the first static render, picked
 * up on the first revalidation. */

export const revalidate = 3600;

export async function GET() {
  const siddhis = allSiddhis.slice(0, SIDDHI_LIMIT);
  const patterns = allPatterns.slice(0, PATTERN_LIMIT);

  // Letters archive — public rows only, latest first. Fail-soft: a DB
  // outage must never take the whole feed down with it.
  let letters: FeedLetter[] = [];
  try {
    const { db } = await import('@/lib/db');
    const rows = await db.letter.findMany({
      where: { isPublic: true },
      orderBy: { sentAt: 'desc' },
      take: LETTER_LIMIT,
      select: { slug: true, subject: true, body: true, sentAt: true },
    });
    letters = rows.map((l) => ({
      slug: l.slug,
      subject: l.subject,
      body: l.body,
      sentAt: l.sentAt,
    }));
  } catch {
    // no DB at build/dev time → letters simply absent from the feed
  }

  const xml = buildFeedXml({ siddhis, patterns, letters });

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
