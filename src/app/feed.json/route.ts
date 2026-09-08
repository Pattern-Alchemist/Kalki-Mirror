import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import {
  buildFeedJson,
  SIDDHI_LIMIT,
  PATTERN_LIMIT,
  LETTER_LIMIT,
  type FeedLetter,
} from '@/lib/seo/feed-builder';

/* Vol. 5 #13 — JSON Feed 1.1 at /feed.json: the same window /feed.xml
 * serves, one serializer over (modern readers prefer JSON Feed; it costs
 * nothing to serve both from the same gather). Parity contract with the
 * RSS gate: identical item composition — siddhis, patterns, letters, the
 * same caps, the same full-text bodies (Vol. 2 #16 posture, kept).
 *
 * Letters gather fail-soft (dynamic import + catch, mirroring feed.xml):
 * no DB at build time → letters absent from the first static render,
 * picked up on the first revalidation. revalidate 3600 — the same ≤1h
 * freshness the RSS window and the sitemap already carry. */

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

  const feed = buildFeedJson({ siddhis, patterns, letters });

  return new Response(JSON.stringify(feed), {
    headers: { 'Content-Type': 'application/feed+json' },
  });
}
