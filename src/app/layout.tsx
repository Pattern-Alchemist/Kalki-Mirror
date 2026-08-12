import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google';
import "./globals.css";
import { SacredNav } from "@/components/nav/SacredNav";
import { SacredFooter } from "@/components/nav/SacredFooter";
import { WhatsAppCTA } from "@/components/booking/WhatsAppCTA";
import { TierProvider } from "@/components/layout/TierProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PageTransition } from "@/components/layout/PageTransition";
import { PaywallModal } from "@/components/monetization/PaywallModal";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Analytics } from "@vercel/analytics/react";

/* ============================================================
   TYPOGRAPHY — The Inscriptions of Time
   Headlines: Cormorant Garamond (luxury editorial serif, closest
   to Canela/Ogg available on Google Fonts). Thin weights only.
   Body/Data: Inter (Geist-class Swiss sans-serif).
   Monospace: JetBrains Mono (pattern intelligence, esoteric codes).
   ============================================================ */

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const SITE_URL = 'https://astrokalki.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'KALKI — Light for the Dark Age.',
    template: '%s | KALKI',
  },
  description:
    'Tantrik Intelligence. Sacred Architecture. Pattern Recognition. Where ancient Tantric geometry meets modern computational intelligence. Discover siddhis, decode behavioral patterns, and walk the path of the Mahavidyas.',
  keywords: ['kalki', 'siddhi', 'tantra', 'yantra', 'akasha', 'sadhana', 'pattern recognition', 'karma', 'shambhala', 'tantrik intelligence', 'mahavidya', 'ten mahavidyas', 'siddhi archive', 'behavioral patterns', 'tantric psychology'],
  authors: [{ name: 'Kaustubh', url: SITE_URL }],
  creator: 'Kaustubh',
  publisher: 'KALKI',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'KALKI — Light for the Dark Age.',
    description: 'Tantrik Intelligence. Sacred Architecture. Pattern Recognition. The Architecture of Karma.',
    siteName: 'KALKI',
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ritual-chamber-alt',
        width: 1200,
        height: 630,
        alt: 'KALKI — Tantrik Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KALKI — Light for the Dark Age.',
    description: 'Tantrik Intelligence. Sacred Architecture. Pattern Recognition.',
    images: ['https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ritual-chamber-alt'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-deep-black text-foreground antialiased">
        <TierProvider>
          <SmoothScroll>
            <SacredNav />
            <ScrollProgress />
            <main className="pt-16 md:pt-20">
              <PageTransition>{children}</PageTransition>
            </main>
            <SacredFooter />
            <div className="fixed-bottom-stack">
              <WhatsAppCTA variant="floating" />
            </div>
            <PaywallModal />
            <div className="page-vignette" aria-hidden="true" />
            <Analytics />

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
                      founder: {
                        '@type': 'Person',
                        name: 'Kaustubh',
                        jobTitle: 'Tantric Technologist',
                      },
                    },
                  ],
                }),
              }}
            />
          </SmoothScroll>
        </TierProvider>
      </body>
    </html>
  );
}
