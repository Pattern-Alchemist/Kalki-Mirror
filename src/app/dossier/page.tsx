import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Dossier — Your Pattern Diagnosis',
  description: 'Your personal pattern dossier — Mirror Method diagnosis, prescribed sādhana arc, and progress tracking.',
};

const DossierPageClient = dynamic(
  () => import('./DossierPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-end">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 pb-20 md:pb-28">
          <p className="section-label mb-6">YOUR DOSSIER</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            Dossier
          </h1>
          <p className="text-foreground text-xl md:text-2xl max-w-3xl editorial-spacing text-shadow-deep">
            Your pattern diagnosis&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function DossierPage() {
  return <DossierPageClient />;
}
