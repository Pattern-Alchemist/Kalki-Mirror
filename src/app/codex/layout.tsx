import type { Metadata } from 'next';
import { canonicalUrl, SITE_URL, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/codex'),
  title: 'The Codex',
  description:
    'The KALKI Codex — a five-part digital manifesto covering the Shambhala Protocol, Mirror Method, and tantrik cosmology. The foundational text of the KALKI system.',
  openGraph: {
    title: 'The Codex | KALKI',
    url: canonicalUrl('/codex'),
    description:
      'The KALKI Codex — a five-part digital manifesto covering the Shambhala Protocol, Mirror Method, and tantrik cosmology. The foundational text of the KALKI system.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/codex/sanskrit-plate-hero',
        width: 1200,
        height: 630,
        alt: 'The Codex — KALKI',
      },
    ],
  },
};

const codexJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'The Codex',
      description: 'The KALKI Codex — a five-part digital manifesto covering the Shambhala Protocol, Mirror Method, and tantrik cosmology.',
      url: canonicalUrl('/codex'),
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'The Codex', item: canonicalUrl('/codex') },
      ],
    },
  ],
};

export default function CodexLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(codexJsonLd) }}
      />
      {children}
    </>
  );
}
