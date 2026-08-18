import type { Metadata } from 'next';
import { consultationServices } from '@/lib/data/consultations';
import { allPatterns } from '@/lib/data/patterns';
import dynamic from 'next/dynamic';
import type { ConsultationsPageProps } from './ConsultationsPageClient';

export const metadata: Metadata = {
  title: 'Consultations — Consult the Archivist | KALKI',
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
  return <ConsultationsPageClient {...pageProps} />;
}
