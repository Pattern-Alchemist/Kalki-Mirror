import { breathPatterns } from '@/lib/data/breath-patterns';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BreathFolioClient from './BreathFolioClient';

export function generateStaticParams() {
  return breathPatterns.map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const pattern = breathPatterns.find(p => p.slug === slug);
    if (!pattern) return { title: 'Not Found', robots: { index: false, follow: true } }; // Vol.4 #18: soft-404 guard — streaming shells ship HTTP 200; the miss body must never be indexable
    return {
      title: `${pattern.name} — Prāṇāyāma Laboratory`,
      description: pattern.description,
    };
  });
}

export default async function BreathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pattern = breathPatterns.find(p => p.slug === slug);
  if (!pattern) notFound();
  return <BreathFolioClient pattern={pattern} />;
}
