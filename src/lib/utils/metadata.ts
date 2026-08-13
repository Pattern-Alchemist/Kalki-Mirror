const SITE_URL = 'https://www.astrokalki.com';

/** Generate canonical URL for a given path */
export function canonicalUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean.replace(/\/+$/, '')}`;
}

/**
 * hreflang-aware alternates for a page.
 * Single-language site (English) → en + x-default, both self-referencing.
 * Ensures Google never assigns a wrong language to a page.
 */
export function pageAlternates(path: string) {
  const url = canonicalUrl(path);
  return {
    canonical: url,
    languages: {
      'x-default': url,
      en: url,
    },
  };
}

export { SITE_URL };
