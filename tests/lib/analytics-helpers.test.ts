import { describe, it, expect } from 'vitest';
import {
  EVENT_NAMES,
  GROUP_NAMES,
  normalizeRange,
  referrerDomain,
  contentHref,
  csvEscape,
  parseDbDate,
  timeAgo,
} from '@/lib/analytics-shared';
import { groupColumnSql } from '@/lib/analytics-db';

/* ══════════════════════════════════════════════════════════════
   Founder analytics dashboard — pure helper guards
   ══════════════════════════════════════════════════════════════ */

describe('normalizeRange', () => {
  it('accepts the three supported windows as numbers', () => {
    expect(normalizeRange(7)).toBe(7);
    expect(normalizeRange(30)).toBe(30);
    expect(normalizeRange(90)).toBe(90);
  });

  it('accepts numeric strings (query params arrive as strings)', () => {
    expect(normalizeRange('7')).toBe(7);
    expect(normalizeRange('90')).toBe(90);
  });

  it('clamps everything else to the 30-day default', () => {
    expect(normalizeRange('forever')).toBe(30);
    expect(normalizeRange('')).toBe(30);
    expect(normalizeRange('45')).toBe(30);
    expect(normalizeRange(-7)).toBe(30);
    expect(normalizeRange(null)).toBe(30);
    expect(normalizeRange(undefined)).toBe(30);
    expect(normalizeRange(NaN)).toBe(30);
  });
});

describe('referrerDomain', () => {
  it('extracts the hostname and strips protocol + www', () => {
    expect(referrerDomain('https://www.google.com/')).toBe('google.com');
    expect(referrerDomain('https://t.co/abc123')).toBe('t.co');
    expect(referrerDomain('http://facebook.com/l.php?u=https://x')).toBe('facebook.com');
  });

  it('handles protocol-less values like document.referrer edge cases', () => {
    expect(referrerDomain('instagram.com/reel/xyz')).toBe('instagram.com');
  });

  it('maps empty and nullish to (direct)', () => {
    expect(referrerDomain('')).toBe('(direct)');
    expect(referrerDomain(null)).toBe('(direct)');
    expect(referrerDomain(undefined)).toBe('(direct)');
    expect(referrerDomain('   ')).toBe('(direct)');
  });

  it('falls back to a trimmed raw value for unparseable strings', () => {
    expect(referrerDomain('not a url at all ::')).toBe('not a url at all ::');
  });
});

describe('contentHref', () => {
  it('maps every content event to its public URL', () => {
    expect(contentHref('folio_viewed', 'the-trishula')).toBe('/archive/the-trishula');
    expect(contentHref('pattern_viewed', 'the-rescuer')).toBe('/patterns/the-rescuer');
    expect(contentHref('archetype_viewed', null)).toBe('/archetypes');
    expect(contentHref('karma_page_viewed', 'karma')).toBe('/karma');
    expect(contentHref('aghori_phase_viewed', 'phase-1')).toBe('/aghori-tantra/phase-1');
    expect(contentHref('aghori_lesson_viewed', 'phase-1/lesson-2')).toBe('/aghori-tantra/phase-1/lesson-2');
    expect(contentHref('breathwork_viewed', 'nadi-shuddhi')).toBe('/breathwork/nadi-shuddhi');
    expect(contentHref('sequence_viewed', 'dawn-sadhana')).toBe('/sequences/dawn-sadhana');
    expect(contentHref('pricing_viewed', null)).toBe('/pricing');
  });

  it('deep-links to the term page, diacritic-safe (Vol. 3 #4: pages replace #anchors)', () => {
    const href = contentHref('glossary_term_viewed', 'Prāṇāyāma');
    expect(href).toBe('/glossary/pranayama');
  });

  it('deep-links studio entries to /library/type/slug (Vol. 3 #2)', () => {
    expect(contentHref('library_entry_viewed', 'practice/trataka-protocol')).toBe(
      '/library/practice/trataka-protocol'
    );
  });

  it('falls back to hub pages when the slug is missing', () => {
    expect(contentHref('folio_viewed', null)).toBe('/archive');
    expect(contentHref('breathwork_viewed', '')).toBe('/breathwork');
    expect(contentHref('glossary_term_viewed', '  ')).toBe('/glossary');
  });

  it('returns null for non-content events', () => {
    expect(contentHref('search_performed', 'query')).toBeNull();
    expect(contentHref('dossier_started', null)).toBeNull();
    expect(contentHref('unknown_event', 'x')).toBeNull();
  });
});

describe('csvEscape', () => {
  it('passes plain values through untouched', () => {
    expect(csvEscape('founder@astrokalki.com')).toBe('founder@astrokalki.com');
    expect(csvEscape(42)).toBe('42');
  });

  it('quotes and doubles embedded quotes', () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
  });

  it('quotes commas and newlines', () => {
    expect(csvEscape('a,b')).toBe('"a,b"');
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"');
  });

  it('renders nullish as empty', () => {
    expect(csvEscape(null)).toBe('');
    expect(csvEscape(undefined)).toBe('');
  });
});

describe('parseDbDate / timeAgo', () => {
  const NOW = new Date('2026-08-30T12:00:00Z');

  it('parses SQLite UTC datetimes with the Z they never carried', () => {
    expect(parseDbDate('2026-08-30 11:59:30').toISOString()).toBe('2026-08-30T11:59:30.000Z');
    // without the UTC patch this would parse as local time and drift
    expect(parseDbDate('2026-08-30 11:59:30').getTime()).toBeLessThan(NOW.getTime());
  });

  it('parses ISO strings unchanged', () => {
    expect(parseDbDate('2026-08-30T12:00:00Z').getTime()).toBe(NOW.getTime());
  });

  it('renders compact relative times', () => {
    expect(timeAgo('2026-08-30 11:59:56', NOW)).toBe('just now');
    expect(timeAgo('2026-08-30 11:58:00', NOW)).toBe('2m ago');
    expect(timeAgo('2026-08-30 08:00:00', NOW)).toBe('4h ago');
    expect(timeAgo('2026-08-27 12:00:00', NOW)).toBe('3d ago');
  });
});

describe('groupColumnSql (dictionary ↔ chart drift guard)', () => {
  it('emits one column per lattice group', () => {
    const sql = groupColumnSql();
    for (const g of GROUP_NAMES) {
      expect(sql).toContain(`AS "${g}"`);
    }
    expect(sql.match(/AS "/g)).toHaveLength(GROUP_NAMES.length);
  });

  it('counts every dictionary event exactly once across the group columns', () => {
    const sql = groupColumnSql();
    for (const name of EVENT_NAMES) {
      const occurrences = sql.split(`'${name}'`).length - 1;
      expect(occurrences, `${name} must appear exactly once in the daily query`).toBe(1);
    }
  });
});
