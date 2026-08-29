import type { MetadataRoute } from 'next';
import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import { allBreathPatterns } from '@/lib/data/breath-patterns';
import { allSequences } from '@/lib/data/sequences';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.astrokalki.com';

  // Kit refinement (Dossier No. 03 §3.1): patterns carry the strongest
  // search intent (US queries like “emotional pattern”, “people pleasing
  // roots”) and rise to 0.75; folio deep pages rise to 0.7.

  // Only indexable public pages — excluded: /practice, /practice/*, /redeem, /dossier (noindexed)
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/archive`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/archetypes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    // /deities canonicalized to /archetypes (308) — removed from sitemap
    { url: `${base}/patterns`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/method`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/research`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/consultations`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/aghori-tantra`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/library`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/codex`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/breathwork`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/glossary`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/sequences`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const siddhiPages: MetadataRoute.Sitemap = allSiddhis.map((s) => ({
    url: `${base}/archive/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const patternPages: MetadataRoute.Sitemap = allPatterns.map((p) => ({
    url: `${base}/patterns/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const breathworkPages: MetadataRoute.Sitemap = allBreathPatterns.map((b) => ({
    url: `${base}/breathwork/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const sequencePages: MetadataRoute.Sitemap = allSequences.map((s) => ({
    url: `${base}/sequences/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...siddhiPages, ...patternPages, ...breathworkPages, ...sequencePages];
}
