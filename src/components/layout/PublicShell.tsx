"use client";

import { usePathname } from "next/navigation";
import { SacredNav } from "@/components/nav/SacredNav";
import { SacredFooter } from "@/components/nav/SacredFooter";
import { WhatsAppCTA } from "@/components/booking/WhatsAppCTA";
import dynamic from 'next/dynamic';

// ── Performance: dynamically import heavy animation components ──
// These pull in framer-motion (~40KB) — keep them out of the critical
// render path so the initial paint is not blocked by JS download/parse.
const ScrollProgress = dynamic(
  () => import('@/components/ui/ScrollProgress').then(m => ({ default: m.ScrollProgress })),
  { ssr: false }
);

const PaywallModal = dynamic(
  () => import('@/components/monetization/PaywallModal').then(m => ({ default: m.PaywallModal })),
  { ssr: false, loading: () => null }
);

const SITE_URL = 'https://www.astrokalki.com';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-gold focus:text-deep-black focus:text-sm focus:font-ui focus:tracking-wider focus:uppercase focus:rounded-sm"
      >
        Skip to content
      </a>
      <header role="banner">
        <SacredNav />
      </header>
      <ScrollProgress />
      <main id="main-content" className="pt-16 md:pt-20">
        {/* PageTransition removed — template.tsx already provides CSS-only fade */}
        {children}
      </main>
      <SacredFooter />
      <div className="fixed-bottom-stack">
        <WhatsAppCTA variant="floating" />
      </div>
      <PaywallModal />
      <div className="page-vignette" aria-hidden="true" />

      {/* JSON-LD Structured Data — the ONE consolidated @graph.
          Engine II · Entity: exactly one WebSite, one Organization,
          one Person. No page may emit a competing WebSite node. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                '@id': `${SITE_URL}/#website`,
                url: SITE_URL,
                // Brand-token alignment (2026-08-31): the DOMAIN is
                // astrokalki.com, so the machine-readable site name must
                // carry the same token users type into Google — otherwise
                // the query "astrokalki" has no on-site brand anchor and
                // Google's spell-correction routes it to "astrotalk".
                // alternateName preserves the display brand KALKI.
                name: 'AstroKalki',
                alternateName: 'KALKI',
                description: 'Tantrik Intelligence. Sacred Architecture. Pattern Recognition.',
                inLanguage: 'en-US',
                publisher: { '@id': `${SITE_URL}/#organization` },
                potentialAction: {
                  '@type': 'SearchAction',
                  target: `${SITE_URL}/archive?q={search_term_string}`,
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@type': 'Organization',
                '@id': `${SITE_URL}/#organization`,
                name: 'KALKI',
                alternateName: 'AstroKalki',
                url: SITE_URL,
                logo: `${SITE_URL}/favicon.svg`,
                description: 'Tantrik Intelligence. The Architecture of Karma.',
                // Entity separation for both classical search and
                // generative engines: state what the brand IS NOT.
                // Complaint on record (2026-08-31): Google auto-corrects
                // "astrokalki" to "astrotalk" and LLMs conflate the two.
                disambiguatingDescription:
                  'AstroKalki is the platform home of KALKI, the Tantrik intelligence system founded by Kaustubh, published at astrokalki.com. Distinct from and not affiliated with Astrotalk (astrotalk.com), a separate astrology-services company.',
                founder: { '@id': `${SITE_URL}/#person` },
                // Entity cross-references. Add real public profiles here as
                // they come online (YouTube channel, Instagram, LinkedIn) —
                // never invent URLs. Each sameAs entry is a brand-entity
                // anchor Google uses to bind "AstroKalki" to this domain.
                sameAs: [
                  'https://github.com/Pattern-Alchemist',
                  // TODO(owner): append YouTube + Instagram profile URLs
                  // branded exactly "AstroKalki", e.g.
                  // 'https://www.youtube.com/@astrokalki',
                  // 'https://www.instagram.com/astrokalki',
                ],
              },
              {
                '@type': 'Person',
                '@id': `${SITE_URL}/#person`,
                name: 'Kaustubh',
                jobTitle: 'Tantric Technologist',
                url: `${SITE_URL}/method`,
                description:
                  'Founder of KALKI. Tantric technologist working with the Mahavidya pantheon, evidence-graded sadhana, and pattern-based spiritual psychology.',
                // Entity cross-references generative engines use to verify
                // authority. Add public profiles here as they come online
                // (LinkedIn, X, YouTube) — never invent URLs.
                sameAs: ['https://github.com/Pattern-Alchemist'],
                // Factual domains of expertise drawn from the corpus itself —
                // strengthens topical-authority signals for the Person entity.
                knowsAbout: [
                  'Tantra',
                  'Kashmiri Shaivism',
                  'Vajrayāna Buddhism',
                  'Aghorī tradition',
                  'Haṭha Yoga',
                  'Prāṇāyāma',
                  'Mahāvidyās',
                  'Sanskrit tantric texts',
                  'Tantric psychology',
                  'Meditation and sādhana practice',
                ],
              },
            ],
          }),
        }}
      />
    </>
  );
}