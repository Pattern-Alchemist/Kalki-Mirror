import type { Metadata } from 'next';
import { canonicalUrl, pageAlternates, SITE_URL } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/consultations'),
  title: 'Consult the Archivist',
  description:
    'Book a private consultation with the Archivist. Birth-chart analysis, pattern decoding, siddhi pathway mapping, and tantrik guidance — in person or remote.',
  openGraph: {
    url: canonicalUrl('/consultations'),
    title: 'Consult the Archivist | KALKI',
    description:
      'Book a private consultation with the Archivist. Birth-chart analysis, pattern decoding, siddhi pathway mapping, and tantrik guidance — in person or remote.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/consult/contemplation-hero',
        width: 1200,
        height: 630,
        alt: 'Consultations — KALKI',
      },
    ],
  },
};

const consultationsJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Consult the Archivist',
      description: 'Book a private consultation with the Archivist. Birth-chart analysis, pattern decoding, siddhi pathway mapping, and tantrik guidance.',
      url: `${SITE_URL}/consultations`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'Service',
      name: 'Tantric Consultation',
      description: 'Private consultation with the Archivist for pattern decoding, siddhi pathway mapping, and tantrik guidance.',
      provider: {
        '@type': 'Organization',
        name: 'KALKI',
        url: SITE_URL,
      },
      serviceType: 'Spiritual Guidance',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Consultations', item: `${SITE_URL}/consultations` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What happens during a consultation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The consultation begins with the Mirror Method diagnostic — identifying your dominant karmic loop through behavioral pattern analysis. Based on your birth chart and behavioral query, you receive a prescribed sādhana drawn from the Akashic Archive, tailored to your specific pattern configuration.',
          },
        },
        {
          '@type': 'Question',
          name: 'How are consultations conducted?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Consultations are conducted via WhatsApp video call. After booking, you will receive a confirmation with the scheduled time. Sessions typically last 45-60 minutes and include follow-up practice review.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to be a paid member for a consultation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Consultations are available to Agni tier members and above as part of their membership. Prithvi and Jal members can access the AI-powered dossier diagnostic, which provides pattern analysis and sādhana recommendations without a live session.',
          },
        },
      ],
    },
  ],
};

export default function ConsultationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(consultationsJsonLd) }}
      />
      {children}
    </>
  );
}
