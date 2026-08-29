import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'The Kalki Codex — Digital Manifesto',
  description: 'A Five-Part Digital Manifesto on the Architecture of Consciousness, Pattern, and Sovereign Awareness. Classified. Shambhala Protocol.',
};

const CodexPageClient = dynamic(
  () => import('./CodexPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-end">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 pb-20 md:pb-28">
          <p className="section-label mb-6">CLASSIFIED DOCUMENT</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            The Kalki Codex
          </h1>
          <p className="text-foreground text-xl md:text-2xl max-w-3xl editorial-spacing text-shadow-deep">
            A Five-Part Digital Manifesto&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function CodexPage() {
  return <CodexPageClient />;
}
