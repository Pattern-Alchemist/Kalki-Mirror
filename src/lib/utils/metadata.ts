const SITE_URL = 'https://www.astrokalki.com';

/**
 * Market locale. KALKI targets the international (US-first) seeker
 * audience: all public pages are written in US English. The `hi`
 * locale remains available via next-intl (cookie-based, non-routing)
 * but every indexable page declares en-US.
 */
export const SITE_LOCALE = 'en-US';

/** Generate canonical URL for a given path */
export function canonicalUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean.replace(/\/+$/, '')}`;
}

/**
 * hreflang-aware alternates for a page.
 * Single-language site (US English) → en-US + x-default, both
 * self-referencing. Declaring the specific locale variant tells
 * search engines exactly which regional audience the page serves,
 * while x-default keeps the page reachable for everyone else.
 */
export function pageAlternates(path: string) {
  const url = canonicalUrl(path);
  return {
    canonical: url,
    languages: {
      'x-default': url,
      'en-US': url,
    },
  };
}

export { SITE_URL };
