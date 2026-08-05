import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import { SacredNav } from "@/components/nav/SacredNav";
import { SacredFooter } from "@/components/nav/SacredFooter";
import { WhatsAppCTA } from "@/components/booking/WhatsAppCTA";
import { TierProvider } from "@/components/layout/TierProvider";
import { PaywallModal } from "@/components/monetization/PaywallModal";

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

export const metadata: Metadata = {
  title: {
    default: 'KALKI — Light for the Dark Age.',
    template: '%s | KALKI',
  },
  description:
    'Esoteric Intelligence. Sacred Architecture. Pattern Recognition. Where ancient Tantric geometry meets modern computational intelligence.',
  keywords: ['kalki', 'siddhi', 'tantra', 'yantra', 'akasha', 'sadhana', 'pattern recognition', 'karma', 'shambhala', 'esoteric intelligence'],
  openGraph: {
    title: 'KALKI',
    description: 'Light for the Dark Age. The Architecture of Karma.',
    siteName: 'KALKI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-deep-black text-foreground antialiased">
        <TierProvider>
          <SacredNav />
          <main className="pt-16 md:pt-20">{children}</main>
          <SacredFooter />
          <WhatsAppCTA variant="floating" />
          <PaywallModal />
          <div className="page-vignette" aria-hidden="true" />
        </TierProvider>
      </body>
    </html>
  );
}