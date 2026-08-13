const SITE_URL = 'https://www.astrokalki.com';

/** Generate canonical URL for a given path */
export function canonicalUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean.replace(/\/+$/, '')}`;
}

export { SITE_URL };
