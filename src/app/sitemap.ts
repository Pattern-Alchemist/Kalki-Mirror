import type { MetadataRoute } from 'next';
import { allSiddhis } from '@/lib/data/siddhis';
import { TEN_MAHAVIDYAS } from '@/lib/data/archetypes';
import { allPatterns } from '@/lib/data/patterns';
import { allBreathPatterns } from '@/lib/data/breath-patterns';
import { allSequences } from '@/lib/data/sequences';
import { aghoriCourse } from '@/lib/data/aghori-tantra-course';
import { SITE_LASTMOD } from '@/lib/canonical';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.astrokalki.com';
  // lastmod policy (Search Console quality): stable content dates from
  // SITE_LASTMOD — never new Date(). Bump the constant in
  // src/lib/canonical.ts on meaningful content changes.

  // Kit refinement (Dossier No. 03 §3.1): patterns carry the strongest
  // search intent (US queries like “emotional pattern”, “people pleasing
  // roots”) and rise to 0.75; folio deep pages rise to 0.7.

  // Only indexable public pages — excluded: /practice, /practice/*, /redeem, /dossier (noindexed)
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/archive`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/archetypes`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'weekly', priority: 0.85 },
    // /deities canonicalized to /archetypes (308) — removed from sitemap
    { url: `${base}/patterns`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/method`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/research`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/pricing`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/consultations`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/email-course`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.85 },
    // US acquisition layer (Phase A): hub + 5 commercial-intent pages.
    // 0.85 hub / 0.8 children — commercial intent, one query family per page.
    { url: `${base}/usa`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${base}/usa/vedic-astrology-consultation`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/usa/online-vedic-astrologer`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/usa/kundli-birth-chart-reading`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/usa/relationship-pattern-reading`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/usa/spiritual-consultation`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/aghori-tantra`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/guhya`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/library`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/codex`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/breathwork`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/glossary`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/sequences`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/karma`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(SITE_LASTMOD), changeFrequency: 'monthly', priority: 0.6 },
  ];

  const siddhiPages: MetadataRoute.Sitemap = allSiddhis.map((s) => ({
    url: `${base}/archive/${s.slug}`,
    lastModified: new Date(SITE_LASTMOD),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const patternPages: MetadataRoute.Sitemap = allPatterns.map((p) => ({
    url: `${base}/patterns/${p.slug}`,
    lastModified: new Date(SITE_LASTMOD),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const breathworkPages: MetadataRoute.Sitemap = allBreathPatterns.map((b) => ({
    url: `${base}/breathwork/${b.slug}`,
    lastModified: new Date(SITE_LASTMOD),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // Aghorī Tantra course — 8 phase indexes + 54 standalone lesson pages
  const aghoriPhasePages: MetadataRoute.Sitemap = aghoriCourse.map((m) => ({
    url: `${base}/aghori-tantra/${m.id}`,
    lastModified: new Date(SITE_LASTMOD),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const aghoriLessonPages: MetadataRoute.Sitemap = aghoriCourse.flatMap((m) =>
    m.lessons.map((l) => ({
      url: `${base}/aghori-tantra/${m.id}/${l.id}`,
      lastModified: new Date(SITE_LASTMOD),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  const sequencePages: MetadataRoute.Sitemap = allSequences.map((s) => ({
    url: `${base}/sequences/${s.slug}`,
    lastModified: new Date(SITE_LASTMOD),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // Mahāvidyā folio pages (/archetypes/[id]) — 10 authoritative pages, spec §5
  const mahavidyaPages: MetadataRoute.Sitemap = TEN_MAHAVIDYAS.map((m) => ({
    url: `${base}/archetypes/${m.id}`,
    lastModified: new Date(SITE_LASTMOD),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [...staticPages, ...siddhiPages, ...patternPages, ...mahavidyaPages, ...breathworkPages, ...sequencePages, ...aghoriPhasePages, ...aghoriLessonPages];
}
