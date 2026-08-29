import Link from 'next/link';
import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import { CANONICAL } from '@/lib/canonical';
import type { Metadata } from 'next';
import HomePageShell from './HomePageShell';

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
            <p className="text-editorial text-foreground/90 editorial-spacing leading-relaxed mb-6">
              KALKI is an online platform where ancient Tantra meets rigorous modern methodology. The
              Akashic Archive holds {CANONICAL.folios} siddhi folios — practices drawn from the Upaniṣads,
              Tantras, Āgamas, and the Haṭha Yoga Pradīpikā, across the Aghorī, Kashmiri Shaiva, and
              Vajrayāna lineages. Every teaching is graded for authenticity, caution level, and tier of
              readiness, so you always know exactly what a practice demands before you begin.
            </p>
            <p className="text-editorial text-foreground/90 editorial-spacing leading-relaxed mb-6">
              The heart of the system is the Mirror Method: {CANONICAL.patterns} recurring emotional and
              behavioral patterns — the loops that quietly run your relationships, ambition, and fear —
              each mapped to the specific sādhanas classical Tantra designed to dissolve it. The
              {CANONICAL.pantheonForces} forces of the Mahāvidyā pantheon act as diagnostic archetypes,
              and the Lexicon defines {CANONICAL.lexiconTerms} Sanskrit terms with scholarly precision.
              For seekers who want to begin with the body, {CANONICAL.breathwork} guided prāṇāyāma
              practices and {CANONICAL.sequences} structured sequences are available with no prior
              experience required.
            </p>
            <p className="text-editorial text-foreground/90 editorial-spacing leading-relaxed">
              KALKI was founded by Kaustubh, a Tantric Technologist and practicing lineage-holder, for
              the international seeker who wants depth over decoration — source texts over slogans,
              evidence over hype, and a direct, respectful path into the world&rsquo;s most
              misunderstood spiritual tradition. Explore the <Link href="/archive" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">Akashic Archive</Link>,
              take the <Link href="/archetypes" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">archetype diagnostic</Link>,
              or read the <Link href="/method" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold">Mirror Method</Link> in full.
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
