import { UsaPageShell, usaPageMetadata } from '@/components/usa/UsaPageShell';
import { usaHub, usaPages } from '@/lib/data/usa-pages';

const page = usaPages.find((p) => p.slug === 'vedic-astrology-consultation') ?? usaHub;

export const metadata = usaPageMetadata(page);

export default function Page() {
  return (
    <UsaPageShell
      page={page}
      crumbs={[
        { name: 'United States', path: '/usa' },
        { name: page.h1, path: page.path },
      ]}
      trackSlug={page.slug}
      service={{
        name: 'Vedic Astrology Consultation',
        description: 'A 60-minute online jyotisha and pattern-analysis session for US seekers - the chart read as a diagnostic instrument, cross-referenced with the Mirror Method, ending in a prescribed practice.',
        priceUSD: 29,
      }}
    />
  );
}
