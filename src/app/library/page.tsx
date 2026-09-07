import type { Metadata } from 'next';
import Link from 'next/link';
import { TANTRA_CATEGORIES } from '@/lib/data/tantra-categories';
import { sadhanaLibrary, SADHANA_COUNT } from '@/lib/data/sadhana-library';
import { SIDDHI_COUNT } from '@/lib/data/siddhis';
import { aghoriCourse } from '@/lib/data/aghori-tantra-course';
import LibraryPageClient from './LibraryPageClient';
import { CONTENT_TYPES, CONTENT_TYPE_LABELS, libraryTypePath } from '@/lib/seo/content-seo';

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
    <>
      <LibraryPageClient
        tantraCategories={TANTRA_CATEGORIES}
        sadhanaLibrary={sadhanaLibrary}
        sadhanaCount={SADHANA_COUNT}
        siddhiCount={SIDDHI_COUNT}
        coursePhaseCount={aghoriCourse.length}
        categoryMap={categoryMap}
      />
      {/* Vol. 4 #6 — hub cross-links to the five studio shelves. Server-
          rendered and static (no DB): the indexes themselves are live. */}
      <section aria-label="From the studio" className="bg-deep-black border-t border-gold/10 py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <p className="section-label mb-5">FROM THE STUDIO</p>
          <p className="text-editorial text-sm text-foreground/70 leading-relaxed max-w-xl mx-auto mb-8">
            Practice notes, archetype and pattern studies — published under the same
            evidence-first discipline as the folios of the Akashic Archive.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {CONTENT_TYPES.map((t) => (
              <Link key={t} href={libraryTypePath(t)} className="ghost-cta text-xs">
                {CONTENT_TYPE_LABELS[t]}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
