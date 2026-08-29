import type { Metadata } from 'next';
import { allBreathPatterns } from '@/lib/data/breath-patterns';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pattern = allBreathPatterns.find((p) => p.slug === slug);

  if (!pattern) {
    return { title: 'Technique Not Found' };
  }

  const title = `${pattern.name} — Prāṇāyāma Laboratory | KALKI`;
  const description = pattern.description.slice(0, 160);

  return {
    title,
    description,
    alternates: pageAlternates(`/breathwork/${slug}`),
    openGraph: {
      title,
      description,
      url: canonicalUrl(`/breathwork/${slug}`),
      type: 'article',
      siteName: 'KALKI',
    },
  };
}

export default function BreathworkSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
