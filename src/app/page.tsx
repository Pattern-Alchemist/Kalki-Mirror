import Link from 'next/link';
import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import { CANONICAL } from '@/lib/canonical';
import { FAQ, FAQ_JSONLD } from '@/lib/data/faq';
import type { Metadata } from 'next';
import HomePageShell from './HomePageShell';
import { HeroBackground } from './HomeClientIslands';

export const metadata: Metadata = {
  // absolute — the root layout template would append "| KALKI" to a
  // brand-first title and produce a double suffix. (GEO kit, fix #2)
  title: {
    absolute: 'KALKI — Tantrik Intelligence. Sacred Architecture. Pattern Recognition.',
  },
  description: `Where ancient Tantric geometry meets modern computational intelligence. ${CANONICAL.folios} siddhi folios, ${CANONICAL.patterns} emotional patterns, and the Mirror Method framework for pattern dissolution.`,
};

/* ── Static data resolved at build/request time, passed to client shell ── */
const featured = allSiddhis.slice(0, 3);
const patternPreview = allPatterns.slice(0, 4);

export default function HomePage() {
  return (
    <>
    <div className="bg-deep-black">
      {/* ═══ HERO — pure server-rendered, zero JS required for LCP ═══
          One stage, one title, nothing clipped: the full composition
          completes inside the first viewport on every device. The
          mid-frame floating lockup is gone — a single inscription
          anchors the lower third, cinematic-scrim guaranteed. */}
      <section className="hero-stage relative flex items-end overflow-hidden">
        {/* Instant-paint still frame (LCP) — the video fades in over it */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: 0,
            backgroundImage: 'url(https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_960,c_limit/kalki-mirror/home/ancient-temple-midnight)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* The Kalki avatar riding — every viewport, fades in over the still */}
        <HeroBackground />

        {/* Cinematic scrim stack: top seam → clear mid → deep text floor.
            The white horse can no longer wash out the inscription. */}
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(5,5,5,0.58) 0%, rgba(5,5,5,0.16) 24%, rgba(5,5,5,0.20) 50%, rgba(5,5,5,0.68) 74%, rgba(5,5,5,0.95) 100%)' }}
        />
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(120% 90% at 50% 40%, transparent 52%, rgba(5,5,5,0.52) 100%)' }}
        />
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-deep-black/70 to-transparent z-[2] pointer-events-none" />

        {/* Single bottom-anchored lockup */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 hero-content-safe">
          <div className="hero-text-entrance">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-rule" aria-hidden="true" />
              <span className="hero-eyebrow-text">The Gate Beyond Shambhala</span>
            </div>
            <h1 className="hero-title-gold font-display uppercase"
              style={{ fontSize: 'clamp(4.25rem, 14vw, 10.5rem)', lineHeight: 0.92, fontWeight: 700, letterSpacing: '0.04em', marginTop: '0.9rem' }}
            >KALKI</h1>
            <p className="hero-tagline">Tantrik Intelligence
              <span className="hero-tagline-ext"> · Sacred Architecture · Pattern Recognition</span>
            </p>
          </div>
          <div className="hero-cta-row hero-actions-entrance flex flex-wrap items-center gap-4 mt-7 md:mt-9">
            <Link href="/archive" className="gold-cta">Enter the Archive</Link>
            <Link href="/practice" className="ghost-cta">Begin the Practice</Link>
          </div>
        </div>

        {/* Scroll cue — a breathing thread of light (lg+ only) */}
        <div className="hero-scroll-cue" aria-hidden="true" />
      </section>

      {/* ═══ WHAT IS KALKI — server-rendered GEO corpus block ═══
          Generative engines answer "what is KALKI / astrokalki.com"
          from this section. Substantial, factual, canonical-numbered;
          rendered on the server so it ships in the initial HTML. */}
      <section className="relative py-16 md:py-24" aria-labelledby="what-is-kalki">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="section-label mb-8">What Is KALKI</p>
            <h2 id="what-is-kalki" className="font-display text-2xl md:text-4xl text-foreground leading-tight tracking-wide mb-10 hero-heading">
              A complete system of authentic Tantric learning — built for serious practitioners worldwide.
            </h2>
            <p className="text-editorial text-foreground/90 editorial-spacing leading-relaxed text-left mb-6">
              KALKI is an online platform where ancient Tantra meets rigorous modern methodology. The
              Akashic Archive holds {CANONICAL.folios} siddhi folios — practices drawn from the Upaniṣads,
              Tantras, Āgamas, and the Haṭha Yoga Pradīpikā, across the Aghorī, Kashmiri Shaiva, and
              Vajrayāna lineages. Every teaching is graded for authenticity, caution level, and tier of
              readiness, so you always know exactly what a practice demands before you begin.
            </p>
            <p className="text-editorial text-foreground/90 editorial-spacing leading-relaxed text-left mb-6">
              The heart of the system is the Mirror Method: {CANONICAL.patterns} recurring emotional and
              behavioral patterns — the loops that quietly run your relationships, ambition, and fear —
              each mapped to the specific sādhanas classical Tantra designed to dissolve it. The
              {CANONICAL.pantheonForces} forces of the Mahāvidyā pantheon act as diagnostic archetypes,
              and the <Link href="/glossary" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">Lexicon</Link> defines {CANONICAL.lexiconTerms} Sanskrit terms with scholarly precision.
              For seekers who want to begin with the body, <Link href="/breathwork" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">{CANONICAL.breathwork} guided prāṇāyāma
              practices</Link> and <Link href="/sequences" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">{CANONICAL.sequences} structured sequences</Link> are available with no prior
              experience required.
            </p>
            <p className="text-editorial text-foreground/90 editorial-spacing leading-relaxed text-left">
              KALKI was founded by Kaustubh, a Tantric Technologist and practicing lineage-holder, for
              the international seeker who wants depth over decoration — source texts over slogans,
              evidence over hype, and a direct, respectful path into the world&rsquo;s most
              misunderstood spiritual tradition. Explore the <Link href="/archive" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">Akashic Archive</Link>,
              study the <Link href="/patterns" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">Pattern Atlas</Link>,
              take the <Link href="/archetypes" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">archetype diagnostic</Link>,
              or read the <Link href="/method" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">Mirror Method</Link> in full.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FAQ — server-rendered questions + FAQPage schema ═══
          Direct-answer blocks targeting the questions seekers actually
          ask AI engines and Google ("what is kalki", "is tantra safe
          for beginners", "ten mahavidyas list"). Visible content and
          FAQPage JSON-LD derive from ONE dataset (src/lib/data/faq.ts). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <section className="relative py-16 md:py-24" aria-labelledby="faq-heading">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="max-w-3xl mx-auto">
            <p className="section-label mb-8">Questions Seekers Ask</p>
            <h2 id="faq-heading" className="font-display text-2xl md:text-4xl text-foreground leading-tight tracking-wide mb-12 hero-heading">
              Straight answers, before you commit to anything.
            </h2>
            <div>
              {FAQ.map((item) => (
                <div key={item.q} className="border-t border-gold/15 py-7 last:border-b">
                  <h3 className="font-display text-lg md:text-xl text-foreground tracking-wide mb-3">{item.q}</h3>
                  <p className="text-editorial text-foreground/85 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-foreground/60 mt-8 text-center">
              Something more specific?{' '}
              <Link href="/consultations" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">Request a consultation</Link>
              {' '}or explore the <Link href="/method" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">Mirror Method</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ REMAINING SECTIONS — loaded client-side via shell ═══ */}
      <HomePageShell featured={featured} patternPreview={patternPreview} siddhiCount={CANONICAL.folios} />
    </div>
    {/* NOTE: the site-wide consolidated @graph (one WebSite, one
        Organization, one Person) lives in PublicShell — this page
        previously emitted a second, competing WebSite node with
        drifted counts. Removed per GEO kit fix #3 (duplicate schema). */}
    </>
  );
}
