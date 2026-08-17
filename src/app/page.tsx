import Link from 'next/link';
import { allSiddhis, SIDDHI_COUNT } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { SiddhiCard } from '@/components/archive/SiddhiCard';
import { PatternCard } from '@/components/patterns/PatternCard';
import HomeClientIslands from './HomeClientIslands';
import { Suspense } from 'react';

/* ── Static data resolved at build/request time on the server ── */
const featured = allSiddhis.slice(0, 3);
const patternPreview = allPatterns.slice(0, 4);

export default function HomePage() {
  return (
    <>
    <div className="bg-deep-black">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[100svh] md:h-[120vh] flex items-end overflow-hidden">
        {/* Desktop: video (client-only for autoplay control) */}
        <HomeClientIslands.HeroBackground />
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.65) 40%, rgba(5,5,5,0.82) 100%)',
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-deep-black/60 to-transparent z-[2] pointer-events-none" />

        <div className="hero-brand-lockup" aria-label="KALKI-TANTRA, The Gate Beyond Shambhala">
            <span className="hero-brand-name">KALKI-TANTRA</span>
            <span className="hero-brand-subtitle">The Gate Beyond Shambhala</span>
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 hero-content-safe">
          <HomeClientIslands.HeroText />
        </div>
      </section>

      {/* ═══ CINEMATIC STRIP 1 ═══ */}
      <section aria-hidden="true" className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/stone-gateway-ancient-forest"
          alt="Ancient stone gateway in forest with rudraksha mala, copper pot, and ritual trident"
          filmGrain={false}
        />\n        <div className="cinematic-strip-overlay" />
      </section>

      {/* ═══ TWO-COLUMN: ARCHIVE + PRACTICE ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh] md:min-h-[85vh]">
        <Link href="/archive" className="group relative overflow-hidden block min-h-[70vh] md:min-h-[85vh]">
          <CinematicImage
            src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/manuscript-sacred-geometry"
            alt="Cave with ancient yantra inscriptions and golden butter lamps"
            scrim="bottom"
          />
          <div className="scrim-bottom-anchored" />
          <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
            <p className="section-label mb-4">YANTRA Decoded</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-[0.95] mb-3 hero-heading tracking-wide">
              {SIDDHI_COUNT} Siddhis.{' '}
              <span style={{ display: 'block' }}>Mapped.</span>
            </h2>
            <p className="text-foreground text-base max-w-md editorial-spacing" style={{textShadow: '0 1px 8px rgba(0,0,0,0.7)'}}>
              Decoded by YANTRA. Every mantra, every lineage, every warning.
            </p>
          </div>
        </Link>

        <Link href="/practice" className="group relative overflow-hidden block min-h-[70vh] md:min-h-[85vh]">
          <CinematicImage
            src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ascetic-walking-mountain-path"
            alt="Ascetic walking barefoot on a golden-hour Himalayan mountain path"
            scrim="bottom"
          />
          <div className="scrim-bottom-anchored" />
          <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
            <p className="section-label mb-4">Sadhana Instruments</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-[0.95] mb-3 hero-heading tracking-wide">
              See Yourself.{' '}
              <span style={{ display: 'block' }}>Clearly.</span>
            </h2>
            <p className="text-foreground text-base max-w-md editorial-spacing" style={{textShadow: '0 1px 8px rgba(0,0,0,0.7)'}}>
              Breathwork, japa, meditation -- guided tools for inner work.
            </p>
          </div>
        </Link>
      </section>

      {/* ═══ EDITORIAL BAND ═══ */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 md:py-20">
        <p className="text-text-muted text-sm max-w-3xl mx-auto editorial-spacing leading-relaxed text-center">
          KALKI is a precision instrument for inner transformation -- not a marketplace of generic
          spirituality content. Every practice in the Akashic Archive is sourced from recognized Tantric
          texts, scored for authenticity, and linked to the specific psychological pattern it was designed
          to address. The system draws from the Upaniṣads, Tantras, Āgamas, Haṭha Yoga Pradīpikā, and
          living practitioner lineages across the Aghorī, Kashmiri Shaiva, and Vajrayāna traditions.
        </p>
      </div>

      {/* ═══ MIRROR METHOD ═══ */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-28 md:py-40">
        <div className="divider-gold mb-20" />
        <p className="section-label mb-8 text-center">The Mirror Method</p>
        <p className="text-sub-display text-foreground mb-8 engraved-heading text-center">
          Your patterns{' '}
          <span style={{ display: 'block' }}>have names.</span>
        </p>
        <p className="text-editorial max-w-xl mx-auto text-center">
          Every emotional loop, every recurring relationship dynamic -- they map
          to ancient sadhanas designed for exactly this. The KALKI system identifies
          twelve core patterns drawn from the Aghorī, Kashmiri Shaiva, and Buddhist
          Vajrayāna traditions, each one linked to specific siddhis and prescribed
          practices from the living Tantric lineage.
        </p>
        <div className="divider-gold mt-20" />
      </div>

      {/* ═══ CINEMATIC STRIP 2 ═══ */}
      <section aria-hidden="true" className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/sri-yantra-himalayas"
          alt="Sri Yantra floating above Himalayan peaks at twilight"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </section>

      {/* ═══ PATTERN INTELLIGENCE ═══ */}
      <section className="relative py-20 md:py-32 section-scrim-dim">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior"
          alt="Empty ancient stone ashram interior with firelight and smoke"
          scrim="full"
          vignette
          className="absolute inset-0"
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <p className="section-label editorial-heading mb-6">
            Pattern Intelligence
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {patternPreview.map((p) => (
              <PatternCard key={p.slug} pattern={p} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/patterns" className="ghost-cta text-sm">Decode All 12 Patterns</Link>
          </div>
        </div>
      </section>

      {/* ═══ AKASHIC ARCHIVE PREVIEW ═══ */}
      <section className="relative py-28 md:py-40">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior"
          alt="Ancient stone ashram interior"
          scrim="full"
          vignette
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <p className="section-label editorial-heading mb-8">
            From the Akashic Archive
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((s) => (
              <SiddhiCard key={s.slug} siddhi={s} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/archive" className="ghost-cta text-sm">Browse All {SIDDHI_COUNT} Siddhis</Link>
          </div>
        </div>
      </section>

      {/* ═══ CINEMATIC STRIP 3 ═══ */}
      <section aria-hidden="true" className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior"
          alt="Vast underground library of ancient manuscripts"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </section>

      {/* ═══ PRACTICE SECTION (client-only: breath timer, resonance) ═══ */}
      <section className="relative py-20 md:py-28 lg:py-32 bg-deep-black">
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="practice-layout grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <p className="section-label mb-6">Practice Now</p>
              <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-4 hero-heading tracking-[0.12em] uppercase">
                Breathe.
              </h2>
              <p className="font-ui text-sm tracking-[0.2em] uppercase mb-12"
                style={{ color: 'var(--gold-label)', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                Nadi Shuddhi -- Channel Purification
              </p>
              <HomeClientIslands.BreathSection />
            </div>
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden aspect-[16/10]"
                style={{
                  border: '1px solid rgba(212,175,55,0.3)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(212,175,55,0.06)',
                }}>
                <CinematicImage
                  src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ascetic-water-practice"
                  alt="Ascetic performing water ritual at Himalayan ghat"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING SECTION (client-only: PricingCards is dynamic import) ═══ */}
      <section className="relative py-28 md:py-40">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ascetic-ash-fire-contemplation"
          alt="Rudraksha, copper vessel, ash and fire"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: 'rgba(0,0,0,0.8)' }} />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <HomeClientIslands.PricingSection />
        </div>
      </section>

      {/* ═══ CINEMATIC STRIP 4 ═══ */}
      <section aria-hidden="true" className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ascetic-himalayan-overlook"
          alt="Ascetic performing smoke ritual at twilight overlooking Himalayan valleys"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </section>

      {/* ═══ CLOSING CTA ═══ */}
      <section className="relative py-28 md:py-40 safe-bottom">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-temple-midnight"
          alt="Ancient temple at midnight"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.6) 50%, rgba(5,5,5,0.75) 100%)' }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <p className="section-label mb-6">Enter the Inner Sanctum</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-8 hero-heading tracking-wide">
            The Archive Awaits.
          </h2>
          <p className="text-foreground text-lg mb-12 editorial-spacing" style={{textShadow: '0 1px 8px rgba(0,0,0,0.6)'}}>
            Kaustubh is a Tantric Technologist -- part technologist, part
            practitioner, part pattern-recognizer. He maps your recurring
            behavioral loops to specific siddhis and sadhanas from the
            Akashic Archive, prescribing exact practices for your exact pattern.
            No guesswork. No generic advice. Just precise, lineage-backed
            intervention designed for where you are right now.
          </p>
          <p className="text-text-muted text-sm max-w-lg mx-auto mb-12 editorial-spacing leading-relaxed">
            Each consultation begins with the Mirror Method diagnostic -- identifying your
            dominant karmic loop through behavioral pattern analysis -- and culminates in a
            prescribed sādhana drawn directly from the Archive. Sessions are conducted via
            WhatsApp video call and include follow-up practice review.
          </p>
          <div>
            <HomeClientIslands.WhatsAppInline />
          </div>
        </div>
      </section>
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