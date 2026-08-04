import type { MetadataRoute } from 'next';
import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://astrokalki.com';
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/archive`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/patterns`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/practice`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/method`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/research`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/consultations`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];

  const siddhiPages: MetadataRoute.Sitemap = allSiddhis.map((s) => ({
    url: `${base}/archive/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const patternPages: MetadataRoute.Sitemap = allPatterns.map((p) => ({
    url: `${base}/patterns/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...siddhiPages, ...patternPages];
}
