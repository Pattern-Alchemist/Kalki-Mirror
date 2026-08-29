import type { Metadata } from 'next';
import Link from 'next/link';
import { CANONICAL } from '@/lib/canonical';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  title: 'About Kaustubh — Tantric Technologist & Lineage-Holder | KALKI',
  description:
    'KALKI was founded by Kaustubh, a Tantric Technologist and practicing lineage-holder — for the international seeker who wants depth over decoration. The story, the standing, and the standard of evidence behind the platform.',
  alternates: pageAlternates('/about'),
  openGraph: {
    url: canonicalUrl('/about'),
    title: 'About Kaustubh — Tantric Technologist & Lineage-Holder | KALKI',
    description:
      'The story, the standing, and the standard of evidence behind KALKI — founded for the international seeker who wants depth over decoration.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/auth/dark-texture-bg',
        width: 1200,
        height: 630,
        alt: 'About KALKI — Kaustubh, Tantric Technologist',
      },
    ],
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      name: 'About KALKI and Kaustubh',
      url: `${SITE_URL}/about`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      inLanguage: 'en',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <div className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          {/* ── Hero ── */}
          <header className="mb-16">
            <p className="section-label mb-5">The Founder</p>
            <h1 className="font-display text-4xl md:text-6xl text-foreground leading-[1.0] tracking-[0.04em] engraved-heading font-light mb-6">
              Depth over decoration.
            </h1>
            <p className="text-editorial text-foreground/80 text-lg leading-relaxed">
              KALKI was founded by <strong className="text-foreground">Kaustubh</strong> — a Tantric
              Technologist and practicing lineage-holder — for the international seeker who wants source
              texts over slogans, evidence over hype, and a direct, respectful path into the world&rsquo;s
              most misunderstood spiritual tradition.
            </p>
          </header>

          <div className="divider-subtle mb-16" />

          {/* ── Why KALKI exists ── */}
          <section className="mb-16">
            <p className="section-label mb-6">Why This Exists</p>
            <div className="space-y-6">
              <p className="text-editorial text-foreground/85 leading-relaxed">
                Tantra arrived in the West in two equally distorted forms: the sanitized workshop version
                that sells intimacy retreats, and the horror-movie version that sells fear. Both profit from
                the same ignorance. The actual tradition — a rigorous, technical, 1,500-year engineering
                project for consciousness — stayed locked behind Sanskrit, lineage gatekeeping, and the
                genuine dangers of practicing without preparation.
              </p>
              <p className="text-editorial text-foreground/85 leading-relaxed">
                KALKI&rsquo;s answer is not to dilute the tradition but to make its claims auditable. Every
                practice in the {CANONICAL.folios}-folio Archive carries an authenticity score, a lineage
                attribution, and an evidence register. When the tradition itself disagrees, the disagreement
                is documented. When a practice is reconstructed rather than attested, it says so. When a
                technique is dangerous, the caution label is on the tin. The seeker&rsquo;s judgment is
                treated as the final authority — and given everything required to exercise it.
              </p>
              <p className="text-editorial text-foreground/85 leading-relaxed">
                The method behind the platform — the Mirror Method — maps {CANONICAL.patterns} recurring
                emotional patterns to the Tantric forces that govern them and the classical practices that
                dissolve each loop. It is a diagnostic instrument, not a belief system: you bring your own
                experience as the evidence, and the map either matches it or it does not.
              </p>
            </div>
          </section>

          {/* ── The standard ── */}
          <section className="mb-16">
            <p className="section-label mb-6">The Standard</p>
            <div className="space-y-6">
              <p className="text-editorial text-foreground/85 leading-relaxed">
                Four evidence registers govern every claim on this platform. <strong className="text-foreground">Āgama</strong> —
                textual authority, cited to source. <strong className="text-foreground">Anubhāva</strong> — practitioner
                testimony, attributed to lineage. <strong className="text-foreground">Parīkṣā</strong> — cross-source
                evidence, where independent traditions converge. <strong className="text-foreground">Pratibimba</strong> —
                interpretive reading, clearly framed as such. The register travels with the claim: when KALKI
                says a practice dissolves a pattern, you can see whether that is a textual citation, a
                lineage report, or an interpretation before you commit a single hour of practice.
              </p>
              <p className="text-editorial text-foreground/85 leading-relaxed">
                This is also why several practices are tier-gated. The ṣaṭ-karma ritual technologies, the
                sealed Aghorī practices, the advanced Kuṇḍalinī protocols — the tradition gates them behind
                preparation for reasons that are themselves documented. KALKI honors that gating rather than
                auctioning shortcuts.
              </p>
            </div>
          </section>

          {/* ── For the international seeker ── */}
          <section className="mb-16">
            <p className="section-label mb-6">Who This Is For</p>
            <div className="space-y-6">
              <p className="text-editorial text-foreground/85 leading-relaxed">
                The platform is built first for the international seeker — the reader in Ohio or Berlin or
                Melbourne who feels the pull toward this material and keeps finding either costume-shop
                mysticism or paywalled jargon. You are the reason KALKI exists. The Sanskrit is preserved
                because precision matters, but every term is defined in the {CANONICAL.lexiconTerms}-term
                Lexicon, and nothing is gatekept behind vocabulary.
              </p>
              <p className="text-editorial text-foreground/85 leading-relaxed">
                Respect runs in both directions. KALKI treats the tradition as a living lineage — honoring
                its teachers, its gatekeeping, and its dangers — while refusing the knowledge-hoarding that
                has historically kept sincere seekers dependent on gatekeepers. Provenance is the
                compromise: here is everything, with its sources, and the judgment is yours.
              </p>
            </div>
          </section>

          <div className="divider-subtle mb-16" />

          {/* ── Standing / credentials ── */}
          <section className="mb-16">
            <p className="section-label mb-6">Standing</p>
            <div className="space-y-6">
              <p className="text-editorial text-foreground/85 leading-relaxed">
                Kaustubh works at the intersection of classical Tantra and modern computational
                intelligence — a practicing lineage-holder with direct exposure to living traditions,
                including Aghorī and Śākta sources, and the engineering discipline to build the evidence
                architecture you see throughout this platform. Field notes on individual folios record
                observations from this practice; where a claim rests on reconstruction, the reconstruction
                notes say exactly which fragments were used.
              </p>
              <p className="text-editorial text-foreground/85 leading-relaxed">
                The work is offered in the spirit it was received: the tradition belongs to no one because
                it belongs to everyone willing to do the work. The gate is practice, not payment — and the
                first tiers of the Archive, the full Pattern Atlas, the Lexicon, the breathwork library,
                and the entire Aghorī course are open to begin.
              </p>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="glass-chip px-8 py-10 text-center">
            <p className="section-label mb-4">Begin the Work</p>
            <p className="text-editorial text-foreground/80 leading-relaxed max-w-2xl mx-auto mb-8">
              Start with the method, test it against your own experience, and let the evidence registers
              earn your trust one folio at a time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/method" className="gold-cta text-sm">The Mirror Method</Link>
              <Link href="/research" className="ghost-cta text-sm">Epistemic Standards</Link>
              <Link href="/dossier" className="ghost-cta text-sm">The Dossier</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
