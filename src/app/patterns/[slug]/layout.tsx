import type { Metadata } from 'next';
import { allPatterns } from '@/lib/data/patterns';

import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pattern = allPatterns.find((p) => p.slug === slug);

  if (!pattern) {
    return { title: 'Pattern Not Found | KALKI' };
  }

  const title = `${pattern.name} — ${pattern.subtitle} | KALKI`;
  const description = pattern.description
    ? pattern.description.slice(0, 160)
    : `${pattern.name} in the Mirror Method — recognize, confront, dissolve.`;

  return {
    title,
    description,
    alternates: pageAlternates(`/patterns/${pattern.slug}`),
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default async function PatternFolioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = allPatterns.find((p) => p.slug === slug);

  const jsonLd = pattern
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${pattern.name} — ${pattern.subtitle}`,
        description: pattern.description?.slice(0, 200) || `${pattern.name} in the Mirror Method.`,
        url: `${SITE_URL}/patterns/${pattern.slug}`,
        isPartOf: {
          '@type': 'CollectionPage',
          name: 'Pattern Atlas',
          url: `${SITE_URL}/patterns`,
        },
        about: {
          '@type': 'Thing',
          name: 'The Mirror Method',
          description: pattern.origin,
        },
        author: { '@type': 'Person', name: 'Kaustubh', jobTitle: 'Tantric Technologist' },
        publisher: { '@id': `${SITE_URL}/#organization` },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
