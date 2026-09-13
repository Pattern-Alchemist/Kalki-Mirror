import { describe, it, expect } from 'vitest';
import {
  buildWeeklyDigestEmail,
  utmTag,
  excerptBody,
  type WeeklyDigestContent,
  type WeeklyDigestLetterPreview,
} from '@/lib/emails/weekly-digest';

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #13 — Seeker weekly digest.
   The subscriber list gets a weekly beat — the week's new letters,
   one spotlight, UTM-tagged links. Single-opt-in posture untouched.
   ══════════════════════════════════════════════════════════════ */

const SITE = 'https://www.astrokalki.com';

const sampleLetter = (slug: string, subject: string, body = 'A body excerpt.'): WeeklyDigestLetterPreview => ({
  slug,
  subject,
  bodyExcerpt: body,
  sentAt: '2026-09-10T12:00:00.000Z',
});

const sampleContent = (letters: WeeklyDigestLetterPreview[], spotlight: WeeklyDigestLetterPreview | null = null): WeeklyDigestContent => ({
  newLetters: letters,
  spotlight,
  weekStart: '2026-09-06T12:00:00.000Z',
});

describe('utmTag — the campaign link builder', () => {
  it('adds UTM params to a plain URL', () => {
    const tagged = utmTag(`${SITE}/letters/some-slug`, 'alice@example.com');
    expect(tagged).toContain('utm_source=weekly-digest');
    expect(tagged).toContain('utm_medium=email');
    expect(tagged).toContain('utm_campaign=kalki-weekly');
    expect(tagged).toContain('utm_content=alice');
  });

  it('strips existing query params + fragments before tagging', () => {
    const tagged = utmTag(`${SITE}/letters/slug?old=param#frag`, 'bob@test.com');
    expect(tagged).not.toContain('old=param');
    expect(tagged).not.toContain('#frag');
    expect(tagged).toContain('utm_content=bob');
  });

  it('uses the email local-part (before @) as utm_content, capped at 20 chars', () => {
    const longEmail = 'a-very-long-username-that-exceeds-twenty-chars@example.com';
    const tagged = utmTag(`${SITE}/letters/slug`, longEmail);
    const content = new URL(tagged).searchParams.get('utm_content');
    expect(content!.length).toBeLessThanOrEqual(20);
    // The local-part is 'a-very-long-username-that-exceeds-twenty-chars' (44 chars);
    // slice(0, 20) = 'a-very-long-username' (exactly 20 chars)
    expect(content).toBe('a-very-long-username');
  });

  it('preserves the base URL path', () => {
    const tagged = utmTag(`${SITE}/letters/some-deep-slug`, 'x@y.com');
    expect(tagged.startsWith(`${SITE}/letters/some-deep-slug?`)).toBe(true);
  });
});

describe('excerptBody — the letter body excerpt', () => {
  it('whitespace-normalizes and truncates to 160 chars', () => {
    const body = 'This is a letter body with multiple sentences.\n\n  It has line breaks and extra spaces.';
    const excerpt = excerptBody(body);
    expect(excerpt).toBe('This is a letter body with multiple sentences. It has line breaks and extra spaces.');
    expect(excerpt.length).toBeLessThanOrEqual(160);
  });

  it('returns empty string for null/undefined/empty', () => {
    expect(excerptBody(null)).toBe('');
    expect(excerptBody(undefined)).toBe('');
    expect(excerptBody('')).toBe('');
  });

  it('respects a custom max length', () => {
    const body = 'A'.repeat(200);
    expect(excerptBody(body, 50)).toHaveLength(50);
  });
});

describe('buildWeeklyDigestEmail — the digest builder', () => {
  it('subject reflects the letter count', () => {
    const one = buildWeeklyDigestEmail({
      email: 'x@y.com',
      content: sampleContent([sampleLetter('a', 'Letter A')]),
      siteUrl: SITE,
    });
    expect(one.subject).toBe('This week at KALKI — 1 new letter');

    const two = buildWeeklyDigestEmail({
      email: 'x@y.com',
      content: sampleContent([sampleLetter('a', 'A'), sampleLetter('b', 'B')]),
      siteUrl: SITE,
    });
    expect(two.subject).toBe('This week at KALKI — 2 new letters');
  });

  it('subject handles zero letters (quiet week)', () => {
    const e = buildWeeklyDigestEmail({
      email: 'x@y.com',
      content: sampleContent([]),
      siteUrl: SITE,
    });
    expect(e.subject).toBe('This week at KALKI');
  });

  it('text body includes spotlight + letter links with UTM tags', () => {
    const content = sampleContent(
      [sampleLetter('letter-a', 'Letter A', 'Body A')],
      sampleLetter('spotlight-slug', 'Spotlight Subject', 'Spotlight body'),
    );
    const e = buildWeeklyDigestEmail({
      email: 'alice@example.com',
      content,
      siteUrl: SITE,
    });
    expect(e.text).toContain('★ Spotlight: Spotlight Subject');
    expect(e.text).toContain('utm_content=alice');
    expect(e.text).toContain('/letters/letter-a');
    expect(e.text).toContain('/letters/spotlight-slug');
  });

  it('html body includes the spotlight block + letter list', () => {
    const content = sampleContent(
      [sampleLetter('a', 'Letter A')],
      sampleLetter('spotlight', 'Spotlight Subject'),
    );
    const e = buildWeeklyDigestEmail({
      email: 'x@y.com',
      content,
      siteUrl: SITE,
    });
    expect(e.html).toContain('★ Spotlight');
    expect(e.html).toContain('Spotlight Subject');
    expect(e.html).toContain('Letter A');
  });

  it('every link carries UTM tags', () => {
    const content = sampleContent([sampleLetter('a', 'A'), sampleLetter('b', 'B')]);
    const e = buildWeeklyDigestEmail({
      email: 'test@example.com',
      content,
      siteUrl: SITE,
    });
    // Count utm_source occurrences — should be at least: 2 letters + 1 archive link = 3
    const utmCount = (e.html.match(/utm_source=weekly-digest/g) || []).length;
    expect(utmCount).toBeGreaterThanOrEqual(3);
  });

  it('handles empty content gracefully (quiet week)', () => {
    const e = buildWeeklyDigestEmail({
      email: 'x@y.com',
      content: sampleContent([]),
      siteUrl: SITE,
    });
    expect(e.text).toContain('A quiet week at the archive');
    expect(e.html).toContain('A quiet week at the archive');
  });

  it('includes the full archive link', () => {
    const e = buildWeeklyDigestEmail({
      email: 'x@y.com',
      content: sampleContent([sampleLetter('a', 'A')]),
      siteUrl: SITE,
    });
    expect(e.text).toContain('/letters?');
    expect(e.html).toContain('/letters?');
  });

  it('signs as Kaustubh, KALKI', () => {
    const e = buildWeeklyDigestEmail({
      email: 'x@y.com',
      content: sampleContent([]),
      siteUrl: SITE,
    });
    expect(e.text).toContain('— Kaustubh, KALKI');
    expect(e.html).toContain('— Kaustubh, KALKI');
  });
});
