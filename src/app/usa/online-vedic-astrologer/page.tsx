import { UsaPageShell, usaPageMetadata } from '@/components/usa/UsaPageShell';
import { usaHub, usaPages } from '@/lib/data/usa-pages';

const page = usaPages.find((p) => p.slug === 'online-vedic-astrologer') ?? usaHub;

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
        name: 'Online Vedic Astrology - Buyer-Guided Consultation',
        description: 'How to choose an online Vedic astrologer: the seven-point checklist, published pricing, and a practitioner whose entire method is inspectable before you pay anything.',
        priceUSD: 29,
      }}
    />
  );
}
