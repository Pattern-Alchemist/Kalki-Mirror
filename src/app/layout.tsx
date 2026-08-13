import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google';
import "./globals.css";
import { TierProvider } from "@/components/layout/TierProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PublicShell } from "@/components/layout/PublicShell";
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

const SITE_URL = 'https://www.astrokalki.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'KALKI — Light for the Dark Age.',
    template: '%s | KALKI',
  },
  description:
    'Tantrik Intelligence. Sacred Architecture. Pattern Recognition. Where ancient Tantric geometry meets modern computational intelligence. The Architecture of Karma.',
  keywords: ['kalki', 'siddhi', 'tantra', 'yantra', 'akasha', 'sadhana', 'pattern recognition', 'karma', 'shambhala', 'tantrik intelligence', 'mahavidya', 'ten mahavidyas', 'siddhi archive', 'behavioral patterns', 'tantric psychology'],
  authors: [{ name: 'Kaustubh', url: SITE_URL }],
  creator: 'Kaustubh',
  publisher: 'KALKI',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'x-default': SITE_URL,
    },
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
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ritual-chamber-alt',
        width: 1200,
        height: 630,
        alt: 'KALKI — Tantrik Intelligence',
      },
    ],
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
    apple: '/apple-touch-icon.png',
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
              <a href="/practice" style={{ color: '#d4af37' }}>Practice</a>
              <a href="/pricing" style={{ color: '#d4af37' }}>Membership</a>
            </nav>
          </div>
        </noscript>
        <TierProvider>
          <SmoothScroll>
            <PublicShell>{children}</PublicShell>
            <Analytics />
          </SmoothScroll>
        </TierProvider>
      </body>
    </html>
  );
}