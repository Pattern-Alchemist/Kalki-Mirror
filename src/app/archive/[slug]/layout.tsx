import type { Metadata } from 'next';
import { allSiddhis } from '@/lib/data/siddhis';

const SITE_URL = 'https://astrokalki.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const siddhi = allSiddhis.find((s) => s.slug === slug);

  if (!siddhi) {
    return { title: 'Siddhi Not Found | KALKI' };
  }

  const title = `${siddhi.name} — ${siddhi.sanskrit || 'Siddhi'} | KALKI Archive`;
  const description = siddhi.summary
    ? siddhi.summary.slice(0, 160)
    : `${siddhi.name}: a ${siddhi.cautionLevel ? siddhi.cautionLevel.toLowerCase() : ''} siddhi from the Tantric tradition.`;

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 160),
      type: 'article',
    },
  };
}

export default async function SiddhiFolioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const siddhi = allSiddhis.find((s) => s.slug === slug);

  const jsonLd = siddhi
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: siddhi.name,
        description: siddhi.summary?.slice(0, 200) || `${siddhi.name} from the Tantric tradition.`,
        url: `${SITE_URL}/archive/${siddhi.slug}`,
        isPartOf: {
          '@type': 'CollectionPage',
          name: 'The Akashic Archive',
          url: `${SITE_URL}/archive`,
        },
        about: {
          '@type': 'Thing',
          name: siddhi.sanskrit || siddhi.name,
          description: `${siddhi.level} siddhi in the ${siddhi.tradition} tradition. ${siddhi.lineage ? `Lineage: ${siddhi.lineage}.` : ''}`,
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
