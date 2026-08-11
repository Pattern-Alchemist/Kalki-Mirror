import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: 'KALKI — Light for the Dark Age.',
    template: '%s | KALKI',
  },
  description:
    'Tantrik Intelligence. Sacred Architecture. Pattern Recognition. Where ancient Tantric geometry meets modern computational intelligence.',
  keywords: ['kalki', 'siddhi', 'tantra', 'yantra', 'akasha', 'sadhana', 'pattern recognition', 'karma', 'shambhala', 'tantrik intelligence'],
  openGraph: {
    title: 'KALKI',
    description: 'Light for the Dark Age. The Architecture of Karma.',
    siteName: 'KALKI',
    type: 'website',
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
    <html lang="en" suppressHydrationWarning>
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
