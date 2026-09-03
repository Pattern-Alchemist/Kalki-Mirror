import type { Metadata } from 'next';
import { consultationServices } from '@/lib/data/consultations';
import { allPatterns } from '@/lib/data/patterns';
import dynamic from 'next/dynamic';
import type { ConsultationsPageProps } from './ConsultationsPageClient';

export const metadata: Metadata = {
  title: 'Consultations — Consult the Archivist',
  description: 'Book a consultation with Kaustubh — Tantric Technologist & Pattern Intelligence Architect. Mirror Method diagnostic, personalized sādhana prescriptions, and WhatsApp video sessions.',
};

// Extract only the fields the wizard needs (avoid sending 44KB of pattern data)
const patternSummaries = allPatterns.map(p => ({
  slug: p.slug,
  name: p.name,
  signs: p.signs,
}));

const pageProps: ConsultationsPageProps = {
  consultationServices,
  patterns: patternSummaries,
};

/* FAQPage structured data — server-rendered so the Q&A graph ships in the
 * initial HTML (crawlable without JS execution). Questions mirror the real
 * objections observed in the consultation flow: delivery format, time zones,
 * pricing currency, and the honest scope of what a KALKI session is not. */
const CONSULTATION_FAQS = [
  {
    q: 'How does an online consultation with Kaustubh work?',
    a: 'Every session runs as a one-on-one WhatsApp video call. You book by messaging Kaustubh directly, complete a short intake describing your background and what brought you here, and confirm a time. The Archival Discovery call is free; Pattern Consultation and Shadow Dossier sessions are paid and include a written summary of the patterns identified and the prescribed practices.',
  },
  {
    q: 'I live in the United States — what time zones do consultations use?',
    a: 'Sessions are scheduled in your local time. Kaustubh operates on IST (UTC+5:30) and regularly holds morning sessions that fall within US evening hours (EST/PST) as well as slots suited to Europe and Asia. When you message on WhatsApp, propose two or three windows in your own time zone and the session is confirmed around them.',
  },
  {
    q: 'What does a consultation cost?',
    a: 'The 30-minute Archival Discovery call is free. The 60-minute Pattern Consultation is ₹1,999 (about $29 USD), and the 90-minute Shadow Dossier deep-dive is ₹3,499 (about $49 USD). USD display is automatic for visitors outside India. International cards are accepted at checkout.',
  },
  {
    q: 'Is this a psychic reading or fortune telling?',
    a: 'No. KALKI consultations are pattern-analysis sessions: a structured examination of the recurring emotional and behavioral loops the Mirror Method maps, grounded in Tantric psychology and classical sources. Kaustubh does not predict the future, promise supernatural outcomes, or claim guarantees — the work is diagnostic and practical, and its limits are stated plainly in the session.',
  },
  {
    q: 'What do I need to prepare before a session?',
    a: 'Nothing formal. If you have completed the pattern intake on the consultations page, that summary is already a strong starting point. Otherwise come with an honest account of the situation or repeating pattern you want examined — specific incidents and dates are more useful than self-diagnosis. Birth details are only relevant for sessions that explicitly involve jyotisha.',
  },
  {
    q: 'Is my personal information kept private?',
    a: 'Yes. Intake details are used solely to prepare your session, are stored in KALKI\'s own database — not shared with any third party — and are never sent into analytics. WhatsApp conversations remain end-to-end on WhatsApp\'s infrastructure between you and Kaustubh.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: CONSULTATION_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const ConsultationsPageClient = dynamic(
  () => import('./ConsultationsPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-end">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 md:pb-28">
          <p className="section-label mb-4">WITH KAUSTUBH</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-wide hero-heading"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            Consult the Archivist
          </h1>
        </div>
      </div>
    ),
  }
);

export default function ConsultationsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ConsultationsPageClient {...pageProps} />
    </>
  );
}
