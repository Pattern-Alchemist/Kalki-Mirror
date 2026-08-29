import type { Metadata } from 'next';
import Link from 'next/link';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis, getSiddhiBySlug } from '@/lib/data/siddhis';
import { glossaryEntries } from '@/lib/data/glossary';
import { CANONICAL } from '@/lib/canonical';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';
import { TrackView } from '@/components/analytics/TrackView';

export const metadata: Metadata = {
  title: 'What Is Karma? The Complete Tantric Map — Meaning, Patterns & Dissolution | KALKI',
  description:
    'Karma is not cosmic punishment — it is the loop of saṃskāra and vāsanā that runs your reactions on autopilot. The complete evidence-graded map: what karma means in Tantric psychology, the ṣaṭ-karma six acts, 20 karmic patterns, and the practices that dissolve each one.',
  alternates: pageAlternates('/karma'),
  openGraph: {
    url: canonicalUrl('/karma'),
    title: 'What Is Karma? The Complete Tantric Map | KALKI',
    description:
      'Karma is not cosmic punishment — it is the loop that runs your reactions on autopilot. The complete evidence-graded map from Tantric psychology.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/aghori/ashram/entering-path',
        width: 1200,
        height: 630,
        alt: 'Karma — the complete Tantric map | KALKI',
      },
    ],
  },
};

const SIX_KARMA_SLUGS = [
  'shanti-karma',
  'vashikarana-karma',
  'stambhana-karma',
  'vidveshana-karma',
  'uccatana-karma',
  'marana-karma',
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is the actual meaning of karma in Tantra?',
    a: 'Karma literally means "action," but in Tantric psychology it refers to the self-reinforcing loop of saṃskāra (imprint) and vāsanā (tendency): a repeated experience leaves an imprint, the imprint generates a tendency, the tendency drives repeated action, and the action deepens the imprint. It is not a cosmic scoring system that punishes you — it is a mechanical process of conditioning that can be observed, interrupted, and dissolved through deliberate practice.',
  },
  {
    q: 'Is karma punishment for past-life sins?',
    a: 'No. The popular framing of karma as divine retribution is a modern flattening of a precise psychological model. Classical sources — from the Bhagavad Gītā to the Tantric Āgamas — describe karma as cause-and-effect in the domain of motivation and action. KALKI grades this framing as Āgama register: textual, precise, and often misquoted. The practical question is not "what did I do to deserve this" but "which loop is running me right now."',
  },
  {
    q: 'What are the ṣaṭ-karma — the six acts of Tantra?',
    a: 'The ṣaṭ-karma are six classical ritual action-technologies documented in Tantric paddhatis: śānti (pacification), vaśīkaraṇa (subjugation), stambhana (immobilization), vidveṣaṇa (discord-generation), uccāṭana (driving away), and māraṇa (transformation/death). KALKI documents all six with evidence grades, lineage attributions, and honest caution levels — several are restricted to advanced tiers precisely because the tradition itself gates them.',
  },
  {
    q: 'How does KALKI connect karma to emotional patterns?',
    a: 'The Mirror Method maps 20 recurring emotional and behavioral patterns — the rescuer, the perfectionist, the pleaser, the avoidant — as karmic loops in miniature: each is a saṃskāra-driven cycle that repeats until it is consciously interrupted. Each pattern is mapped to the Tantric force that governs it and the specific sādhana practices classical Tantra prescribed to dissolve that loop.',
  },
  {
    q: 'Can karma actually be dissolved, or only managed?',
    a: 'The Tantric position is stronger than management. Because karma is conditioning rather than essence, the tradition claims it can be exhausted: through japa (mantra repetition that unwinds emotional charge), prāṇāyāma (breath work that regulates the nervous system where patterns are stored), and deliberate confrontation practices (the Aghorī path\u2019s specialty). Whether full dissolution is achievable is a claim KALKI grades honestly as Anubhava — practitioner testimony — rather than laboratory fact.',
  },
  {
    q: 'Where should a beginner start with karma work?',
    a: 'Three entry points: (1) take the archetype diagnostic to identify your dominant force, (2) read the Pattern Atlas to find the loop that most matches your experience, and (3) begin a foundational practice — the breathwork protocols require no prior experience. The Lexicon defines every Sanskrit term used here, so nothing is gatekept behind vocabulary.',
  },
];

export default function KarmaPage() {
  const sixKarma = SIX_KARMA_SLUGS.map(getSiddhiBySlug).filter((s) => s !== undefined);
  const karmaTerms = glossaryEntries.filter((g) =>
    ['Karma', 'Saṃskāra', 'Karma Yoga', 'Vāsanā'].some((t) => g.term.toLowerCase() === t.toLowerCase())
  );
  const dissolutionFolios = allSiddhis.filter((s) =>
    ['shanti-karma', 'ajapa-japa', 'nadi-shuddhi', 'bhuta-shuddhi', 'yoga-nidra'].includes(s.slug)
  );

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'Article',
        headline: 'What Is Karma? The Complete Tantric Map',
        description:
          'The evidence-graded map of karma in Tantric psychology: saṃskāra, vāsanā, the ṣaṭ-karma six acts, and the practices of dissolution.',
        url: `${SITE_URL}/karma`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        inLanguage: 'en',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
          { '@type': 'ListItem', position: 2, name: 'Karma', item: `${SITE_URL}/karma` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <TrackView event="karma_page_viewed" slug="karma" />
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          {/* ── Hero ── */}
          <header className="mb-16">
            <p className="section-label mb-5">The Architecture of Karma</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.98] tracking-[0.04em] engraved-heading font-light mb-6">
              Karma is not punishment.
              <br />
              It is a loop.
            </h1>
            <p className="text-editorial text-foreground/80 text-lg leading-relaxed max-w-3xl mb-6">
              The Western idea of karma — a cosmic court that scores your sins and mails back consequences —
              is a flattening of one of the most precise psychological models ever built. In Tantric
              psychology, karma is mechanical, observable, and above all <em>dissolvable</em>. This page is
              the complete map: what karma actually is, how the loop runs, and the exact practices classical
              Tantra prescribed to interrupt it.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/patterns" className="gold-cta text-sm">Find Your Loop — Pattern Atlas</Link>
              <Link href="/archetypes" className="ghost-cta text-sm">Archetype Diagnostic</Link>
            </div>
          </header>

          <div className="divider-subtle mb-16" />

          {/* ── The mechanics ── */}
          <section className="mb-16">
            <p className="section-label mb-6">01 · The Mechanics</p>
            <h2 className="font-display text-2xl md:text-4xl text-foreground tracking-wide mb-8 engraved-heading font-light">
              Saṃskāra → Vāsanā → Karma → Saṃskāra
            </h2>
            <div className="space-y-6">
              <p className="text-editorial text-foreground/85 leading-relaxed">
                Every experience that carries emotional charge leaves an imprint — a{' '}
                <strong className="text-foreground">saṃskāra</strong>. Imprints with enough repetition or
                intensity consolidate into a <strong className="text-foreground">vāsanā</strong>, a tendency:
                the automatic pull toward the same thought, the same reaction, the same person. The tendency
                drives action — <strong className="text-foreground">karma</strong> in its literal sense — and
                the action deepens the imprint. The wheel turns. Nothing supernatural is required; the loop
                is conditioning, and conditioning can be worked with.
              </p>
              <p className="text-editorial text-foreground/85 leading-relaxed">
                This is why the same fight happens in every relationship. Why the same self-sabotage arrives
                at every threshold of success. Why the spiritual seeker who has read five hundred books still
                flinches at the same old wound. The loop does not care what you know — it cares what you have
                repeated. And repetition is precisely the lever Tantra uses against it: mantra replaces the
                repeating thought, breath regulation rewires the nervous system that stores the charge, and
                deliberate confrontation exhausts the avoidance that keeps the loop fed.
              </p>
              <p className="text-editorial text-foreground/85 leading-relaxed">
                KALKI&rsquo;s contribution is to make this auditable. Every claim on this platform carries an
                evidence register — Āgama (textual authority), Anubhāva (practitioner testimony), Parīkṣā
                (cross-source evidence), Pratibimba (interpretive reading) — so you can always see whether a
                statement is citing the Māṇḍūkya Upaniṣad or a lineage-holder&rsquo;s lived report. Karma
                deserves the same rigor as any other mechanism you intend to intervene in.
              </p>
            </div>
          </section>

          {/* ── 20 patterns as karmic loops ── */}
          <section className="mb-16">
            <p className="section-label mb-6">02 · The Loops</p>
            <h2 className="font-display text-2xl md:text-4xl text-foreground tracking-wide mb-6 engraved-heading font-light">
              {CANONICAL.patterns} Patterns, {CANONICAL.patterns} Little Karmas
            </h2>
            <p className="text-editorial text-foreground/85 leading-relaxed mb-8 max-w-3xl">
              The Mirror Method reads emotional patterns as karmic loops in miniature — each one a saṃskāra
              with a name, a governing Tantric force, and a prescribed dissolution practice. These are the
              twenty most common loops the method documents:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allPatterns.map((p) => (
                <Link
                  key={p.slug}
                  href={`/patterns/${p.slug}`}
                  className="glass-chip px-5 py-4 hover:border-gold/30 transition-colors duration-500"
                >
                  <p className="text-foreground text-sm font-medium leading-snug mb-1">
                    The {p.name}
                  </p>
                  <p className="text-text-muted text-xs leading-snug">{p.subtitle}</p>
                </Link>
              ))}
            </div>
            <p className="text-editorial text-foreground/60 text-sm leading-relaxed mt-6">
              Each pattern page maps the loop to its governing Mahāvidyā force and the specific sādhana
              practices classical Tantra prescribed for it.
            </p>
          </section>

          <div className="divider-subtle mb-16" />

          {/* ── Shat-karma ── */}
          <section className="mb-16">
            <p className="section-label mb-6">03 · The Six Acts</p>
            <h2 className="font-display text-2xl md:text-4xl text-foreground tracking-wide mb-6 engraved-heading font-light">
              Ṣaṭ-Karma — The Ritual Action Technologies
            </h2>
            <p className="text-editorial text-foreground/85 leading-relaxed mb-8 max-w-3xl">
              Classical Tantra also uses <em>karma</em> more narrowly: the ṣaṭ-karma are six ritual
              action-technologies documented in the paddhatis — the tradition&rsquo;s engineering of
              intervention at the level of circumstances rather than psychology. KALKI documents all six
              with full evidence grading, lineage attribution, and honest caution levels. Several are
              restricted to advanced tiers — not because the information is dangerous to read, but because
              the tradition itself gates them behind preparation, and KALKI honors that gating.
            </p>
            <div className="space-y-4">
              {sixKarma.map((s, i) => (
                <Link
                  key={s.slug}
                  href={`/archive/${s.slug}`}
                  className="group block glass-chip px-6 py-5 hover:border-gold/30 transition-colors duration-500"
                >
                  <div className="flex items-baseline justify-between gap-4 mb-1">
                    <span className="font-mono text-xs text-gold-dim tracking-[0.15em]">
                      Act {i + 1} · {s.tradition}
                    </span>
                    {s.cautionLevel && (
                      <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-text-muted">
                        {s.cautionLevel} caution
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg text-foreground group-hover:text-gold transition-colors duration-500 leading-snug">
                    {s.name}
                  </h3>
                  <p className="text-foreground/70 text-sm leading-relaxed mt-1">{s.summary.slice(0, 160)}…</p>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Dissolution ── */}
          <section className="mb-16">
            <p className="section-label mb-6">04 · The Dissolution</p>
            <h2 className="font-display text-2xl md:text-4xl text-foreground tracking-wide mb-6 engraved-heading font-light">
              How the Loop Is Interrupted
            </h2>
            <p className="text-editorial text-foreground/85 leading-relaxed mb-8 max-w-3xl">
              The Tantric claim is not that karma can be managed — it is that conditioning, being
              conditional, can be exhausted. The intervention stack works at three levels simultaneously:
              mantra unwinds the emotional charge stored in the saṃskāra, prāṇāyāma regulates the nervous
              system where the loop is physically stored, and confrontation practices (the Aghorī specialty)
              dissolve the avoidance that keeps the loop fed. These are the entry folios:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dissolutionFolios.map((s) => (
                <Link
                  key={s.slug}
                  href={`/archive/${s.slug}`}
                  className="glass-chip px-6 py-5 hover:border-gold/30 transition-colors duration-500"
                >
                  <h3 className="text-foreground text-base font-medium leading-snug mb-1">{s.name}</h3>
                  <p className="text-foreground/60 text-sm leading-snug">{s.summary.slice(0, 120)}…</p>
                </Link>
              ))}
              <Link
                href="/aghori-tantra"
                className="glass-chip px-6 py-5 hover:border-gold/30 transition-colors duration-500 flex flex-col justify-center"
              >
                <p className="font-mono text-xs text-gold tracking-[0.15em] uppercase mb-1">The Deep Path</p>
                <h3 className="text-foreground text-base font-medium leading-snug">
                  Aghorī Tantra Course — Eight Phases, 54 Lessons
                </h3>
              </Link>
            </div>
          </section>

          <div className="divider-subtle mb-16" />

          {/* ── Lexicon ── */}
          {karmaTerms.length > 0 && (
            <section className="mb-16">
              <p className="section-label mb-6">05 · The Vocabulary</p>
              <h2 className="font-display text-2xl md:text-4xl text-foreground tracking-wide mb-8 engraved-heading font-light">
                Precision Terms
              </h2>
              <div className="space-y-4">
                {karmaTerms.map((t) => (
                  <div key={t.term} className="glass-chip px-6 py-5">
                    <p className="font-mono text-gold text-sm tracking-[0.1em] mb-2">
                      {t.term}{t.sanskrit ? ` · ${t.sanskrit}` : ''}
                    </p>
                    <p className="text-foreground/75 text-sm leading-relaxed">{t.definition.slice(0, 260)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6">
                <Link href="/glossary" className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold text-sm">
                  All {CANONICAL.lexiconTerms} terms in the Lexicon →
                </Link>
              </p>
            </section>
          )}

          {/* ── FAQ ── */}
          <section className="mb-16">
            <p className="section-label mb-6">06 · Questions</p>
            <h2 className="font-display text-2xl md:text-4xl text-foreground tracking-wide mb-10 engraved-heading font-light">
              Frequently Asked
            </h2>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <details key={f.q} className="glass-chip px-6 py-5 group">
                  <summary className="text-foreground text-base font-medium cursor-pointer list-none flex items-center justify-between gap-4">
                    {f.q}
                    <span className="text-gold/50 text-xl group-open:rotate-45 transition-transform shrink-0" aria-hidden="true">+</span>
                  </summary>
                  <p className="text-foreground/75 text-sm leading-relaxed mt-4">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="glass-chip px-8 py-10 text-center">
            <p className="section-label mb-4">Begin Where You Are</p>
            <p className="text-editorial text-foreground/80 leading-relaxed max-w-2xl mx-auto mb-8">
              The Dossier is the platform&rsquo;s rite of entry: answer honestly, and it maps your dominant
              pattern, the force that governs it, and the station where your work begins. Or start with the
              body — {CANONICAL.breathwork} breathwork protocols require no prior experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dossier" className="gold-cta text-sm">Enter the Dossier</Link>
              <Link href="/breathwork" className="ghost-cta text-sm">Begin with Breath</Link>
              <Link href="/method" className="ghost-cta text-sm">Read the Method</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
