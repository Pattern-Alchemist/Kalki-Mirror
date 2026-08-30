import { allSequences, getSequenceBySlug } from '@/lib/data/sequences';
import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import type { Pattern } from '@/lib/data/types';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SequenceFolioClient from './SequenceFolioClient';

export function generateStaticParams() {
  return allSequences.map(s => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const sequence = getSequenceBySlug(slug);
    if (!sequence) return { title: 'Not Found' };
    return {
      title: `${sequence.name}${sequence.sanskrit ? ` — ${sequence.sanskrit}` : ''}`,
      description: sequence.description,
    };
  });
}

export default async function SequenceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sequence = getSequenceBySlug(slug);
  if (!sequence) notFound();

  // Resolve related data server-side — client only receives what it needs
  const stepSiddhis = sequence.steps.map(step => {
    const s = allSiddhis.find(s => s.slug === step.siddhiSlug);
    return s ? { slug: s.slug, name: s.name, sanskrit: s.sanskrit, category: s.category, level: s.level } : null;
  });

  const targetPatternData = sequence.targetPatterns
    .map(slug => allPatterns.find(p => p.slug === slug))
    .filter((p): p is Pattern => p !== undefined);

  return (
    <SequenceFolioClient
      sequence={sequence}
      stepSiddhis={stepSiddhis}
      targetPatterns={targetPatternData}
    />
  );
}
