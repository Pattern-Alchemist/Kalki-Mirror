import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildFeedXml,
  buildFeedJson,
  LETTER_LIMIT,
  escapeXml,
  type FeedLetter,
} from '@/lib/seo/feed-builder';

/**
 * Vol. 5 #6 — the broadcast letters pipeline.
 *
 * The machinery existed (Letter model, studio editor, live sitemap,
 * /letters hub) but the shelf was empty AND the feed ignored letters
 * entirely. This suite pins the full publish contract:
 *
 *   publish one (isPublic flip) → sitemap /letters/[slug]
 *                                + feed.xml item (full body)
 *                                + hub card
 *                              within one revalidation (≤1h).
 *
 * The db-mocked pins run the REAL sitemap() and feed GET() against a
 * public-letter row; the draft posture proves isPublic:false stays
 * invisible on every surface.
 */

// ── db mock — honors the isPublic filter the way Turso would ──
interface LetterRow {
  slug: string;
  subject: string;
  body: string;
  sentAt: Date;
  isPublic: boolean;
}
let letterRows: LetterRow[] = [];
let letterQueries: { where?: { isPublic?: boolean }; take?: number }[] = [];
let dbHealthy = true;

vi.mock('@/lib/db', () => ({
  db: {
    letter: {
      findMany: async (args: { where?: { isPublic?: boolean }; take?: number }) => {
        if (!dbHealthy) throw new Error('turso unreachable');
        letterQueries.push(args ?? {});
        const want = args?.where?.isPublic;
        return letterRows.filter((r) => want === undefined || r.isPublic === want);
      },
    },
  },
}));

const PUBLIC_LETTER: LetterRow = {
  slug: 'the-mirror-does-not-flatter',
  subject: 'The mirror does not flatter',
  body: 'The Mirror begins with something rarer: attention. & <testing> grounds.',
  sentAt: new Date('2026-09-01T06:30:00.000Z'),
  isPublic: true,
};
const DRAFT_LETTER: LetterRow = {
  slug: 'the-mantra-that-breathes-you',
  subject: 'The mantra that breathes you',
  body: 'So on the inhale. Ham on the exhale.',
  sentAt: new Date('2026-09-02T06:30:00.000Z'),
  isPublic: false,
};

beforeEach(() => {
  letterRows = [];
  letterQueries = [];
  dbHealthy = true;
});

// ── 1. feed builder (pure) ────────────────────────────────────

describe('buildFeedXml — letters as first-class citizens', () => {
  const base = {
    siddhis: [
      {
        slug: 'manasika-japa',
        name: 'Manasika Japa',
        category: 'Meditation',
        summary: 'Mental repetition of mantra.',
        benefits: ['Attention'],
        warnings: ['Force spoils it'],
      },
    ],
    patterns: [
      {
        slug: 'the-witness',
        name: 'The Witness',
        subtitle: 'The one who watches',
        description: 'Observation without agenda.',
        signs: ['Quiet eyes'],
        practice: 'Watch for one minute.',
      },
    ],
  };

  it('carries a published letter as a full-body item with its own date', () => {
    const letter: FeedLetter = {
      slug: PUBLIC_LETTER.slug,
      subject: PUBLIC_LETTER.subject,
      body: PUBLIC_LETTER.body,
      sentAt: PUBLIC_LETTER.sentAt,
    };
    const xml = buildFeedXml({ ...base, letters: [letter] });
    expect(xml).toContain('<title>The mirror does not flatter</title>');
    expect(xml).toContain('<link>https://www.astrokalki.com/letters/the-mirror-does-not-flatter</link>');
    expect(xml).toContain('<guid>https://www.astrokalki.com/letters/the-mirror-does-not-flatter</guid>');
    expect(xml).toContain('<category>Letter</category>');
    // the FULL body rides the item (Vol. 2 #16 full-text posture)
    expect(xml).toContain('&lt;testing&gt;');
    // pubDate comes from sentAt, not build time
    expect(xml).toContain(new Date('2026-09-01T06:30:00.000Z').toUTCString());
  });

  it('escapes XML specials in letter subjects and bodies', () => {
    const xml = buildFeedXml({
      ...base,
      letters: [{ slug: 'x', subject: 'A & B <C>', body: 'Body & <more>', sentAt: new Date() }],
    });
    expect(xml).toContain('A &amp; B &lt;C&gt;');
    expect(xml).toContain('Body &amp; &lt;more&gt;');
  });

  it(`caps letters at ${LETTER_LIMIT} — a feed is a window, not an archive dump`, () => {
    const six: FeedLetter[] = Array.from({ length: 6 }, (_, i) => ({
      slug: `letter-${i}`,
      subject: `L${i}`,
      body: 'b',
      sentAt: new Date(),
    }));
    const xml = buildFeedXml({ ...base, letters: six });
    expect(xml.split('<category>Letter</category>').length - 1).toBe(LETTER_LIMIT);
  });

  it('keeps the given order (latest first is the route\u2019s job, not the builder\u2019s)', () => {
    const xml = buildFeedXml({
      ...base,
      letters: [
        { slug: 'first', subject: 'First', body: 'b', sentAt: new Date() },
        { slug: 'second', subject: 'Second', body: 'b', sentAt: new Date() },
      ],
    });
    expect(xml.indexOf('/letters/first')).toBeLessThan(xml.indexOf('/letters/second'));
  });

  it('omits letters entirely when none are published (backward-compatible shape)', () => {
    const xml = buildFeedXml({ ...base, letters: [] });
    expect(xml).not.toContain('<category>Letter</category>');
    expect(xml).toContain('/archive/manasika-japa');
    expect(xml).toContain('/patterns/the-witness');
    expect(xml).toContain('atom:link');
    expect(xml.startsWith('<?xml version="1.0"')).toBe(true);
  });

  it('escapeXml covers all five XML specials', () => {
    expect(escapeXml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&apos;');
  });

  // ── Vol. 5 #13 — JSON Feed 1.1: truth parity with the RSS gate ──

  describe('buildFeedJson — same window, one serializer over', () => {
    it('declares the JSON Feed 1.1 contract fields', () => {
      const feed = buildFeedJson({ ...base, letters: [] });
      expect(feed.version).toBe('https://jsonfeed.org/version/1.1');
      expect(feed.feed_url).toBe('https://www.astrokalki.com/feed.json');
      expect(feed.home_page_url).toBe('https://www.astrokalki.com');
      expect(feed.title).toContain('KALKI');
      expect(feed.language).toBe('en-us');
    });

    it('carries the SAME items as the RSS window — folios, patterns, letters, full body', () => {
      const letter: FeedLetter = {
        slug: PUBLIC_LETTER.slug,
        subject: PUBLIC_LETTER.subject,
        body: PUBLIC_LETTER.body,
        sentAt: PUBLIC_LETTER.sentAt,
      };
      const feed = buildFeedJson({ ...base, letters: [letter] });
      expect(feed.items.map((i) => i.url)).toEqual([
        'https://www.astrokalki.com/archive/manasika-japa',
        'https://www.astrokalki.com/patterns/the-witness',
        'https://www.astrokalki.com/letters/the-mirror-does-not-flatter',
      ]);
      const letterItem = feed.items[2];
      expect(letterItem.title).toBe('The mirror does not flatter');
      expect(letterItem.content_text).toBe(PUBLIC_LETTER.body); // full body, not a headline
      expect(letterItem.tags).toEqual(['Letter']);
    });

    it('dates are honest: letters carry sentAt, code-backed folios carry none', () => {
      const feed = buildFeedJson({
        ...base,
        letters: [{ slug: 'l', subject: 'L', body: 'b', sentAt: new Date('2026-09-01T06:30:00.000Z') }],
      });
      expect(feed.items[0].date_published).toBeUndefined();
      expect(feed.items[1].date_published).toBeUndefined();
      expect(feed.items[2].date_published).toBe('2026-09-01T06:30:00.000Z');
    });

    it(`caps letters at ${LETTER_LIMIT} — parity with the RSS window`, () => {
      const six: FeedLetter[] = Array.from({ length: 6 }, (_, i) => ({
        slug: `letter-${i}`,
        subject: `L${i}`,
        body: 'b',
        sentAt: new Date(),
      }));
      const feed = buildFeedJson({ ...base, letters: six });
      const letterItems = feed.items.filter((i) => i.tags?.includes('Letter'));
      expect(letterItems).toHaveLength(LETTER_LIMIT);
    });
  });
});

// ── 2. the publish pin — real surfaces, mocked db ─────────────

describe('publish pin: isPublic flip lights up sitemap + feed; drafts stay dark', () => {
  it('sitemap() lists /letters/[slug] for a public letter within one revalidation', async () => {
    letterRows = [PUBLIC_LETTER];
    const { default: sitemap } = await import('@/app/sitemap');
    const entries = await sitemap();
    const hit = entries.find((e) => e.url.endsWith('/letters/the-mirror-does-not-flatter'));
    expect(hit).toBeTruthy();
    expect(new Date(hit!.lastModified as Date).toISOString()).toBe(PUBLIC_LETTER.sentAt.toISOString());
  });

  it('feed GET() carries the published letter with its full body', async () => {
    letterRows = [PUBLIC_LETTER];
    const { GET } = await import('@/app/feed.xml/route');
    const res = await GET();
    expect(res.headers.get('content-type')).toBe('application/xml');
    const xml = await res.text();
    expect(xml).toContain('/letters/the-mirror-does-not-flatter');
    expect(xml).toContain('The mirror does not flatter');
    expect(xml).toContain('rarer: attention');
    expect(xml).toContain('<category>Letter</category>');
  });

  it('draft posture: isPublic:false is invisible on sitemap AND feed', async () => {
    letterRows = [PUBLIC_LETTER, DRAFT_LETTER];
    const { default: sitemap } = await import('@/app/sitemap');
    const entries = await sitemap();
    expect(entries.some((e) => e.url.includes(DRAFT_LETTER.slug))).toBe(false);
    const { GET } = await import('@/app/feed.xml/route');
    const xml = await (await GET()).text();
    expect(xml).not.toContain(DRAFT_LETTER.slug);
    // both surfaces asked the db for public rows only
    for (const q of letterQueries) expect(q.where?.isPublic).toBe(true);
  });

  it('letters gather fail-soft: a DB outage leaves the feed serving the corpus', async () => {
    dbHealthy = false;
    letterRows = [];
    const { GET } = await import('@/app/feed.xml/route');
    const res = await GET();
    const xml = await res.text();
    expect(res.status).toBe(200);
    expect(xml).toContain('/archive/');
    expect(xml).not.toContain('<category>Letter</category>');
  });
});

// ── 3. fs truth — route contracts that must not drift ─────────

describe('letters pipeline fs truth', () => {
  const feedRoute = readFileSync(
    join(__dirname, '..', '..', 'src', 'app', 'feed.xml', 'route.ts'), 'utf8');
  const lettersRoute = readFileSync(
    join(__dirname, '..', '..', 'src', 'app', 'api', 'admin', 'letters', 'route.ts'), 'utf8');
  const seeder = readFileSync(
    join(__dirname, '..', '..', 'scripts', 'seed-launch-letters.mjs'), 'utf8');
  const sitemap = readFileSync(
    join(__dirname, '..', '..', 'src', 'app', 'sitemap.ts'), 'utf8');

  it('feed route filters public rows, caps the window, and revalidates within the hour', () => {
    expect(feedRoute).toContain('isPublic: true');
    expect(feedRoute).toContain('revalidate = 3600');
    expect(feedRoute).toContain('take: LETTER_LIMIT');
  });

  it('feed route keeps the fail-soft catch (a letters outage never kills the feed)', () => {
    const idx = feedRoute.indexOf('await import(\'@/lib/db\')');
    expect(feedRoute.slice(idx, idx + 600)).toMatch(/catch/);
  });

  it('sitemap keeps the letters live-query (Vol. 4 #7 pin, still standing)', () => {
    expect(sitemap).toContain('isPublic: true');
  });

  it('curation API is admin-gated and never lists bodies', () => {
    expect(lettersRoute).toContain('authenticateRequest');
    expect(lettersRoute).toContain("'ADMIN', 'SUPERADMIN'");
    // GET select excludes body — bodies never leave the admin boundary
    const getBlock = lettersRoute.match(/export async function GET[\s\S]*?\n}/)?.[0] ?? '';
    expect(getBlock).not.toContain('body: true');
    expect(lettersRoute).toContain('letters.upsert');
  });

  it('curation API re-dates sentAt only on the draft→public flip', () => {
    expect(lettersRoute).toContain('flippingPublic');
    expect(lettersRoute).toContain('sentAt: new Date()');
  });

  it('seeder defaults to drafts — public only behind the explicit --publish flag', () => {
    expect(seeder).toContain("hasFlag('--publish')");
    expect(seeder).toContain('isPublic: PUBLISH');
    expect(seeder).toContain('isPublic:false (drafts');
  });
});

// ── 4. manifest truth — the five launch letters ───────────────

describe('launch letters manifest', () => {
  const ROOT = join(__dirname, '..', '..', 'content', 'launch-letters');
  const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8')) as {
    letters: { slug: string; subject: string; file: string; grounds: string[] }[];
  };

  it('ships exactly five founder-review letters with unique kebab slugs', () => {
    expect(manifest.letters.length).toBe(5);
    const slugs = manifest.letters.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(5);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('every letter file exists, carries real body weight, and grounds in site surfaces', () => {
    for (const l of manifest.letters) {
      const path = join(ROOT, l.file);
      expect(existsSync(path), l.file).toBe(true);
      const text = readFileSync(path, 'utf8');
      const body = text.replace(/^# (?!#).*\n/gm, '').trim();
      expect(body.length).toBeGreaterThanOrEqual(800);
      expect(l.grounds.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('metadata comment lines appear only in the leading block (seeder strip contract)', () => {
    for (const l of manifest.letters) {
      const text = readFileSync(join(ROOT, l.file), 'utf8').replace(/\r\n/g, '\n');
      const lines = text.split('\n');
      let i = 0;
      while (i < lines.length && /^# (?!#)/.test(lines[i])) i += 1;
      const tail = lines.slice(i).join('\n');
      expect(tail).not.toMatch(/^# (?!#)/m);
    }
  });
});
