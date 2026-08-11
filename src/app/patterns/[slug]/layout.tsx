import type { Metadata } from 'next';
import { allPatterns } from '@/lib/data/patterns';

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
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default function PatternFolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
