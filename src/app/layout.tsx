import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cormorant_Garamond, Cinzel } from 'next/font/google';
import "./globals.css";
import { TierProvider } from "@/components/layout/TierProvider";
import { AttributionCapture } from "@/components/analytics/AttributionCapture";
import { PublicShell } from "@/components/layout/PublicShell";
import { Analytics } from "@vercel/analytics/react";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

/* ============================================================
   TYPOGRAPHY
   ============================================================ */

/* Cinzel — Roman-inscription capitals. The monumental brand voice for
   display type (hero, section headings, lockups). Cormorant remains
   available as the elegant fallback under --font-cormorant. */
const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

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

const SITE_URL = 'https://www.astrokalki.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Brand-token strategy (2026-08-31): every title carries BOTH tokens.
  // "AstroKalki" (the domain token users search) leads the brand slot;
  // "KALKI" (the display brand) follows. Before this change Google had
  // zero on-page anchor binding astrokalki.com → the query "astrokalki",
  // so its spell-correction served Astrotalk results instead.
  title: { default: 'AstroKalki — KALKI | Tantrik Intelligence. Sacred Architecture.', template: '%s | AstroKalki — KALKI' },
  description: 'AstroKalki is the home of KALKI — where ancient Tantric geometry meets modern computational intelligence. 56 siddhi folios, 20 emotional patterns, and the Mirror Method. The Architecture of Karma.',
  keywords: ['astrokalki', 'astro kalki', 'astrokalki.com', 'kalki', 'siddhi', 'tantra', 'authentic tantra', 'tantra teacher', 'yantra', 'akasha', 'sadhana', 'pattern recognition', 'karma', 'shambhala', 'tantrik intelligence', 'mahavidya', 'ten mahavidyas', 'siddhi archive', 'behavioral patterns', 'tantric psychology', 'kashmir shaivism', 'spiritual practice online'],
  authors: [{ name: 'Kaustubh', url: SITE_URL }],
  creator: 'Kaustubh',
  publisher: 'AstroKalki — KALKI',
  alternates: { canonical: SITE_URL, languages: { 'x-default': SITE_URL, 'en-US': SITE_URL } },
  openGraph: {
    title: 'AstroKalki — KALKI | Tantrik Intelligence. Sacred Architecture.',
    description: 'AstroKalki is the home of KALKI — Tantrik Intelligence. Sacred Architecture. Pattern Recognition. The Architecture of Karma.',
    siteName: 'AstroKalki — KALKI', type: 'website', locale: 'en_US', url: SITE_URL,
    images: [{ url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ritual-chamber-alt', width: 1200, height: 630, alt: 'KALKI — Tantrik Intelligence' }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'AstroKalki — KALKI | Tantrik Intelligence. Sacred Architecture.',
    description: 'AstroKalki is the home of KALKI — Tantrik Intelligence. Sacred Architecture. Pattern Recognition. The Architecture of Karma.',
    images: ['https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ritual-chamber-alt'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  // Google Search Console — meta-tag verification method (Path C in
  // docs/geo/search-console-us-targeting.md). Set GOOGLE_SITE_VERIFICATION
  // to the TOKEN ONLY (the part after google-site-verification= in GSC's
  // meta tag, e.g. "AbC123..."). Rendered as
  // <meta name="google-site-verification" content="…"> on every page.
  // Runs parallel to the HTML-file route (/google<token>.html via
  // GSC_VERIFICATION_TOKEN) and the DNS TXT method — use whichever
  // path GSC offers first; all three can coexist safely.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
  formatDetection: { telephone: false, email: false, address: false },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  // US-market layer: the site is authored in US English — declare the
  // regional variant so search engines route US seekers here. The 'hi'
  // locale (cookie-based) keeps its own tag when active.
  const htmlLang = locale === 'en' ? 'en-US' : locale;

  return (
    <html lang={htmlLang} suppressHydrationWarning className={`${cinzel.variable} ${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        {/* Mobile hero image preload — LCP element on home page */}
        <link rel="preload" as="image" href="https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_640,c_limit/kalki-mirror/home/ancient-temple-midnight" media="(max-width: 768px)" />
        {/* Archive page hero — most visited landing page after home */}
        <link rel="preload" as="image" href="https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_640,c_limit/kalki-mirror/tantra/hero-ritual-chamber-alt" media="(max-width: 768px)" />
        <meta name="theme-color" content="#0B0C10" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-deep-black text-foreground antialiased">
        <noscript>
          <div style={{ background: '#0B0C10', color: '#d4d0c8', padding: '1rem 2rem', fontFamily: 'Inter, sans-serif', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
            <p style={{ marginBottom: '0.5rem' }}>JavaScript is required for the full KALKI experience.</p>
            <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="/" style={{ color: '#d4af37' }}>Home</a>
              <a href="/archive" style={{ color: '#d4af37' }}>Archive</a>
              <a href="/patterns" style={{ color: '#d4af37' }}>Patterns</a>
              <a href="/practice" style={{ color: '#d4af37' }}>Tantra</a>
              <a href="/pricing" style={{ color: '#d4af37' }}>Membership</a>
            </nav>
          </div>
        </noscript>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TierProvider>
            <AttributionCapture />
            <PublicShell>{children}</PublicShell>
            <Analytics />
          </TierProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}