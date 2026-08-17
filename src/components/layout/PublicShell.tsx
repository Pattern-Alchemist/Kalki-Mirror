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

      {/* JSON-LD Structured Data */}
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
                name: 'KALKI',
                description: 'Tantrik Intelligence. Sacred Architecture. Pattern Recognition.',
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
                url: SITE_URL,
                logo: `${SITE_URL}/favicon.svg`,
                description: 'Tantrik Intelligence. The Architecture of Karma.',
                founder: { '@type': 'Person', name: 'Kaustubh', jobTitle: 'Tantric Technologist' },
              },
            ],
          }),
        }}
      />
    </>
  );
}