import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google';
import "./globals.css";
import { SacredNav } from "@/components/nav/SacredNav";
import { SacredFooter } from "@/components/nav/SacredFooter";
import { WhatsAppCTA } from "@/components/booking/WhatsAppCTA";
import { TierProvider } from "@/components/layout/TierProvider";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PaywallModal } from "@/components/monetization/PaywallModal";

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
      <body className="min-h-screen bg-deep-black text-foreground antialiased">
        <TierProvider>
          <SmoothScroll>
            <SacredNav />
            <main className="pt-16 md:pt-20">{children}</main>
            <SacredFooter />
            <div className="fixed-bottom-stack">
              <WhatsAppCTA variant="floating" />
            </div>
            <PaywallModal />
            <div className="page-vignette" aria-hidden="true" />
          </SmoothScroll>
        </TierProvider>
      </body>
    </html>
  );
}
