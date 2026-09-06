import { describe, it, expect } from 'vitest';
import {
  CONTENT_TYPES,
  isPublicContentType,
  isPubliclyRenderable,
  contentEntryPath,
  contentDescription,
  contentArticleJsonLd,
  contentDateIso,
  CONTENT_TYPE_LABELS,
  type PublicContentEntry,
} from '@/lib/seo/content-seo';

/**
 * Vol. 3 #2 — Content Studio public renderer.
 *
 * The studio's publish pipeline is DB-backed, so the vitest layer pins
 * the PURE gate + graph builders: what may render, what may never, and
 * the exact Article JSON-LD the renderer emits.
 */

function entry(overrides: Partial<PublicContentEntry> = {}): PublicContentEntry {
  return {
    type: 'practice',
    slug: 'trataka-protocol',
    title: 'Trāṭaka — The Steady Gaze Protocol',
    excerpt: 'A 21-day gazing protocol.',
    body: 'Trāṭaka is the practice of the unwavering gaze.\n\nSecond paragraph with more detail.',
    status: 'PUBLISHED',
    caution: 'OPEN',
    publishedAt: new Date('2026-09-06T00:00:00.000Z'),
    updatedAt: new Date('2026-09-06T12:00:00.000Z'),
    ...overrides,
  };
}

describe('public gate (isPubliclyRenderable)', () => {
  it('renders PUBLISHED + OPEN', () => {
    expect(isPubliclyRenderable(entry())).toBe(true);
  });

  it('refuses every non-PUBLISHED status', () => {
    for (const status of ['DRAFT', 'IN_REVIEW', 'ARCHIVED']) {
      expect(isPubliclyRenderable(entry({ status })), status).toBe(false);
    }
  });

  it('refuses SEALED even when published (studio-internal stays internal)', () => {
    expect(isPubliclyRenderable(entry({ caution: 'SEALED' }))).toBe(false);
  });

  it('renders MODERATE and HIGH behind the caution band (page decides presentation)', () => {
    expect(isPubliclyRenderable(entry({ caution: 'MODERATE' }))).toBe(true);
    expect(isPubliclyRenderable(entry({ caution: 'HIGH' }))).toBe(true);
  });
});

describe('type guard + labels', () => {
  it('accepts exactly the five studio types', () => {
    expect(CONTENT_TYPES).toEqual(['practice', 'archetype', 'pattern', 'research', 'codex']);
    for (const t of CONTENT_TYPES) expect(isPublicContentType(t)).toBe(true);
  });

  it('rejects unknown types before the DB is ever queried', () => {
    for (const t of ['../etc', 'practice/x', '', 'PRACTICE', 'blog']) {
      expect(isPublicContentType(t)).toBe(false);
    }
  });

  it('every type has a human label', () => {
    for (const t of CONTENT_TYPES) {
      expect(CONTENT_TYPE_LABELS[t].length).toBeGreaterThan(3);
    }
  });
});

describe('metadata builders', () => {
  it('path is /library/[type]/[slug]', () => {
    expect(contentEntryPath('practice', 'trataka-protocol')).toBe('/library/practice/trataka-protocol');
  });

  it('description prefers the excerpt', () => {
    expect(contentDescription(entry())).toBe('A 21-day gazing protocol.');
  });

  it('description falls back to the body opening and clips at word boundary', () => {
    const long = entry({ excerpt: null, body: 'x'.repeat(200) + '.\n\nMore.' });
    expect(contentDescription(long).length).toBeLessThanOrEqual(155);
    expect(contentDescription(long).endsWith('x')).toBe(true);
  });

  it('date uses publishedAt, falling back to updatedAt', () => {
    expect(contentDateIso(entry())).toBe('2026-09-06T00:00:00.000Z');
    expect(contentDateIso(entry({ publishedAt: null }))).toBe('2026-09-06T12:00:00.000Z');
  });
});

describe('Article JSON-LD', () => {
  it('emits an Article addressable at its canonical URL', () => {
    const graph = contentArticleJsonLd(entry());
    expect(graph['@context']).toBe('https://schema.org');

    const [article, crumbs] = graph['@graph'];
    expect(article['@type']).toBe('Article');
    expect(article['headline']).toBe(entry().title);
    expect(article['url']).toBe('https://www.astrokalki.com/library/practice/trataka-protocol');
    expect(article['mainEntityOfPage']).toBe(article['url']);
    expect(article['datePublished']).toBe('2026-09-06T00:00:00.000Z');
    expect(article['dateModified']).toBe('2026-09-06T12:00:00.000Z');
    expect(article['author']['@id']).toMatch(/#organization$/);
    expect(article['publisher']['@id']).toBe(article['author']['@id']);
    expect(article['inLanguage']).toBe('en-US');
    expect(crumbs['@type']).toBe('BreadcrumbList');
    expect(crumbs['itemListElement']).toHaveLength(4);
    expect(crumbs['itemListElement'][3].item).toBe(article['url']);
  });

  it('carries the section label for every studio type', () => {
    for (const t of CONTENT_TYPES) {
      const article = contentArticleJsonLd(entry({ type: t }))['@graph'][0];
      expect(article['articleSection']).toBe(CONTENT_TYPE_LABELS[t]);
    }
  });
});
