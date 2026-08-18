import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';
import { getArchetypeById, PATTERN_ARCHETYPE_MAP } from '@/lib/data/archetypes';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PatternFolioClient from './PatternFolioClient';

export function generateStaticParams() {
  return allPatterns.map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const pattern = allPatterns.find(p => p.slug === slug);
    if (!pattern) return { title: 'Not Found' };
    return {
      title: `${pattern.name} — ${pattern.subtitle}`,
      description: pattern.description,
    };
  });
}

export default async function PatternFolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pattern = allPatterns.find(p => p.slug === slug);
  if (!pattern) notFound();

  // Pre-compute related data on the server
  const relatedSiddhis = allSiddhis.filter(s => pattern.relatedSiddhis.includes(s.slug)).slice(0, 3);
  const archetypeId = PATTERN_ARCHETYPE_MAP[slug];
  const archetype = archetypeId ? getArchetypeById(archetypeId) ?? null : null;

  return (
    <PatternFolioClient
      pattern={pattern}
      relatedSiddhis={relatedSiddhis}
      archetype={archetype}
    />
  );
}
