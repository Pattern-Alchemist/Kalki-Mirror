import Link from 'next/link';
import { allSiddhis, SIDDHI_COUNT } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import type { Metadata } from 'next';
import HomePageShell from './HomePageShell';

export const metadata: Metadata = {
  title: 'KALKI — Tantrik Intelligence. Sacred Architecture. Pattern Recognition.',
  description: 'Where ancient Tantric geometry meets modern computational intelligence. 48 siddhis, 12 emotional patterns, and the Mirror Method framework.',
};

/* ── Static data resolved at build/request time, passed to client shell ── */
const featured = allSiddhis.slice(0, 3);
const patternPreview = allPatterns.slice(0, 4);

export default function HomePage() {
  return (
    <>
    <div className="bg-deep-black">
      {/* ═══ HERO — pure server-rendered, zero JS required for LCP ═══ */}
      <section className="relative min-h-[100svh] md:h-[120vh] flex items-end overflow-hidden">
        {/* Mobile: inline background for instant paint */}
        <div
          aria-hidden="true"
          className="md:hidden absolute inset-0 w-full h-full object-cover"
          style={{
            zIndex: 0,
            backgroundImage: 'url(https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_640,c_limit/kalki-mirror/home/ancient-temple-midnight)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.65) 40%, rgba(5,5,5,0.82) 100%)' }}
        />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-deep-black/60 to-transparent z-[2] pointer-events-none" />

        <div className="hero-brand-lockup" aria-label="KALKI-TANTRA, The Gate Beyond Shambhala">
          <span className="hero-brand-name">KALKI-TANTRA</span>
          <span className="hero-brand-subtitle">The Gate Beyond Shambhala</span>
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 hero-content-safe">
          <div className="hero-text-entrance">
            <div className="hero-glow-container relative inline-block">
              <h1 className="hero-glow-text font-display text-white hero-heading tracking-[0.08em] uppercase"
                style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', lineHeight: 1 }}
              >KALKI</h1>
            </div>
            <p className="font-ui text-base md:text-lg tracking-[0.35em] uppercase mt-4 mb-10"
              style={{
                color: 'var(--gold-label)',
                textShadow: '0 2px 18px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.15)',
              }}
            >Tantrik Intelligence</p>
          </div>
          <div className="hero-actions-entrance flex flex-wrap gap-4 mt-4">
            <Link href="/archive" className="gold-cta">Akashic</Link>
            <Link href="/practice" className="ghost-cta">Tantra</Link>
          </div>
        </div>
      </section>

      {/* ═══ REMAINING SECTIONS — loaded client-side via shell ═══ */}
      <HomePageShell featured={featured} patternPreview={patternPreview} siddhiCount={SIDDHI_COUNT} />
    </div>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'KALKI -- Tantrik Intelligence',
          description: 'Precision instrument for inner transformation. 48 siddhis from the Akashic Archive, 12 emotional patterns mapped to specific tantric practices, and the Mirror Method framework for pattern dissolution.',
          url: 'https://www.astrokalki.com',
        }),
      }}
    /></>
  );
}
