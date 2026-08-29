import type { Metadata } from 'next';
import { TANTRA_CATEGORIES } from '@/lib/data/tantra-categories';
import { sadhanaLibrary, SADHANA_COUNT } from '@/lib/data/sadhana-library';
import { SIDDHI_COUNT } from '@/lib/data/siddhis';
import { aghoriCourse } from '@/lib/data/aghori-tantra-course';
import LibraryPageClient from './LibraryPageClient';

export const metadata: Metadata = {
  title: 'The Sādhanā Library — 13 Categories of Practice',
  description: `${SADHANA_COUNT} structured practice protocols across 13 categories of tantrik practice — Mantra, Yantra, Nyāsa, Pūjā, and beyond. Evidence-graded, lineage-traced.`,
};

// Pre-compute category lookup map so client doesn't need getCategoryById
const categoryMap: Record<string, (typeof TANTRA_CATEGORIES)[number]> = {};
for (const cat of TANTRA_CATEGORIES) {
  categoryMap[cat.id] = cat;
}

export default function LibraryPage() {
  return (
    <LibraryPageClient
      tantraCategories={TANTRA_CATEGORIES}
      sadhanaLibrary={sadhanaLibrary}
      sadhanaCount={SADHANA_COUNT}
      siddhiCount={SIDDHI_COUNT}
      coursePhaseCount={aghoriCourse.length}
      categoryMap={categoryMap}
    />
  );
}
