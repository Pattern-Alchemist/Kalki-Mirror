import type { Metadata } from 'next';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/archetypes'),
  title: 'The Ten Mahavidyas',
  description:
    'Decode the 16 archetypes of tantrik psychology — from Kali to Bhuvaneshvari. Discover your dominant patterns, shadow aspects, and growth pathways.',
  openGraph: {
    url: canonicalUrl('/archetypes'),
    title: 'The Ten Mahavidyas | KALKI',
    description:
      'Decode the 16 archetypes of tantrik psychology — from Kali to Bhuvaneshvari. Discover your dominant patterns, shadow aspects, and growth pathways.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/yantra-hero',
        width: 1200,
        height: 630,
        alt: 'The Ten Mahavidyas — KALKI',
      },
    ],
  },
};

const archetypesJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'The Ten Mahāvidyās',
      description: 'Decode the 16 archetypes of tantrik psychology — from Kali to Bhuvaneshvari.',
      url: `${SITE_URL}/archetypes`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      numberOfItems: 16,
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What are the Mahāvidyās in Tantric psychology?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Mahāvidyās ("Great Wisdoms") are ten goddess forms of the Śākta tradition — Kālī, Tārā, Tripura Sundarī, Bhuvaneśvarī, Bhairavī, Chinnamastā, Dhūmāvatī, Bagalāmukhī, Mātaṅgī, and Kamalā. KALKI reads them as archetypal forces of consciousness: each governs a specific karmic-loop pattern, a shadow expression, and a growth pathway. The reading is framed honestly as Pratibimba — interpretive — while the iconography and mantras are attested textual sources (Āgama register).',
          },
        },
        {
          '@type': 'Question',
          name: 'How many archetypes does KALKI use, and why 16 rather than 10?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The system works with 16 archetypal forces: the ten classical Mahāvidyās plus six supplementary archetypes that the corpus documents across Śaiva and Śākta sources. All 16 are documented with their Sanskrit names, bija mantras, governing patterns, and practice prescriptions on the archetypes page.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I find my dominant archetype?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Dossier — the platform\'s rite of entry — asks behavioral questions and maps your dominant pattern, the governing force behind it, and the station where your work begins. You can also read each archetype directly and test the mapping against your lived experience, which the Mirror Method treats as the final evidence.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is archetype work the same as Western personality typing?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. A personality type describes; a Tantric force prescribes. Each KALKI archetype comes with a practice stack — specific mantras, breathwork, and contemplations — that classical Tantra prescribed for the loop that force governs. The mapping is diagnostic instrumentation, not identity: you are not the archetype, you are caught in its loop until the practice dissolves it.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: 'The Ten Mahāvidyās', item: `${SITE_URL}/archetypes` },
      ],
    },
  ],
};

export default function ArchetypesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(archetypesJsonLd) }}
      />
      {children}
    </>
  );
}