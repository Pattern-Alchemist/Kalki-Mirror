// =============================================================
// KALKI — CONTENT STUDIO PUBLIC RENDERER (SEO helpers, Vol. 3 #2)
// -------------------------------------------------------------
// The studio's publish pipeline (DRAFT → IN_REVIEW → PUBLISHED,
// publish-gated, audited, webhooks) was wired but rendered by zero
// public routes — publishing into a void. These helpers back the
// /library/[type]/[slug] renderer that gives every PUBLISHED entry
// a public URL.
//
// Pure functions only (no React, no DB) so the renderer, the
// sitemap and the tests share one truth.
// =============================================================

import { SITE_URL } from '@/lib/utils/metadata';

/** The content types the studio accepts (mirror of admin constants.ts). */
export const CONTENT_TYPES = ['practice', 'archetype', 'pattern', 'research', 'codex'] as const;
export type PublicContentType = (typeof CONTENT_TYPES)[number];

export function isPublicContentType(type: string): type is PublicContentType {
  return (CONTENT_TYPES as readonly string[]).includes(type);
}

export const CONTENT_TYPE_LABELS: Record<PublicContentType, string> = {
  practice: 'Sādhana Practice',
  archetype: 'Archetype Study',
  pattern: 'Pattern Study',
  research: 'Research Note',
  codex: 'Codex Entry',
};

export interface PublicContentEntry {
  type: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  status: string;
  caution: string;
  publishedAt: Date | null;
  updatedAt: Date;
}

/**
 * The public gate. Only PUBLISHED entries render; SEALED caution is
 * refused even when published (sealed means "not for public eyes" —
 * an admin can keep it in the studio without it ever hitting the web).
 * MODERATE/HIGH render behind a caution band, like the folios.
 */
export function isPubliclyRenderable(entry: {
  status: string;
  caution: string;
}): boolean {
  return entry.status === 'PUBLISHED' && entry.caution !== 'SEALED';
}

export function contentEntryPath(type: string, slug: string): string {
  return `/library/${type}/${slug}`;
}

/** ISO date for JSON-LD: publishedAt preferred, updatedAt as fallback. */
export function contentDateIso(entry: PublicContentEntry): string {
  return (entry.publishedAt ?? entry.updatedAt).toISOString();
}

/** Meta-description builder: excerpt first, else the body's opening. */
export function contentDescription(entry: {
  excerpt: string | null;
  body: string;
}): string {
  const source = (entry.excerpt?.trim() || entry.body.replace(/[#>*`\[\]]/g, '').trim() || '');
  const firstPara = source.split(/\n\n+/)[0] ?? '';
  // Word-boundary clip only when clipping is actually needed — a short
  // excerpt must survive verbatim.
  if (firstPara.length <= 155) return firstPara;
  return firstPara.slice(0, 155).replace(/\s+\S*$/, '');
}

/**
 * JSON-LD graph for a public entry: Article (scholarly content on a
 * marketing-light surface) + BreadcrumbList. Author/publisher resolve
 * to the site Organization node.
 */
export function contentArticleJsonLd(entry: PublicContentEntry) {
  const url = `${SITE_URL}${contentEntryPath(entry.type, entry.slug)}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: entry.title,
        description: contentDescription(entry),
        articleSection: CONTENT_TYPE_LABELS[entry.type as PublicContentType] ?? entry.type,
        url,
        mainEntityOfPage: url,
        datePublished: contentDateIso(entry),
        dateModified: entry.updatedAt.toISOString(),
        author: { '@id': `${SITE_URL}/#organization` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        isPartOf: { '@id': `${SITE_URL}/#website` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'The Library', item: `${SITE_URL}/library` },
          {
            '@type': 'ListItem',
            position: 3,
            name: CONTENT_TYPE_LABELS[entry.type as PublicContentType] ?? entry.type,
            item: `${SITE_URL}/library`,
          },
          { '@type': 'ListItem', position: 4, name: entry.title, item: url },
        ],
      },
    ],
  };
}
