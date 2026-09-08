import { UsaPageShell, usaPageMetadata } from '@/components/usa/UsaPageShell';
import { usaCityPages } from '@/lib/data/usa-pages';

const page = usaCityPages.find((p) => p.slug === 'new-york')!;

export const metadata = usaPageMetadata(page);

export default function Page() {
  return (
    <UsaPageShell
      page={page}
      crumbs={[
        { name: 'United States', path: '/usa' },
        { name: 'New York', path: page.path },
      ]}
      trackSlug={page.slug}
      service={{
        name: 'Vedic Astrology Consultation — New York',
        description:
          'A 60-minute online jyotisha and pattern-analysis session for New York seekers - the chart read as a diagnostic instrument, cross-referenced with the Mirror Method, ending in a prescribed practice.',
        priceUSD: 29,
      }}
    />
  );
}
