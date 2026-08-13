import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/practice', '/practice/japa', '/practice/timer', '/redeem', '/dossier'] },
    ],
    sitemap: 'https://www.astrokalki.com/sitemap.xml',
  };
}
