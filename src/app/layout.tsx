import type { Metadata } from "next";
import "./globals.css";
import { SacredNav } from "@/components/nav/SacredNav";
import { SacredFooter } from "@/components/nav/SacredFooter";
import { WhatsAppCTA } from "@/components/booking/WhatsAppCTA";
import { TierProvider } from "@/components/layout/TierProvider";
import { PaywallModal } from "@/components/monetization/PaywallModal";

export const metadata: Metadata = {
  title: {
    default: 'AstroKalki — The Living Archive of Siddhi Heritage',
    template: '%s | AstroKalki',
  },
  description:
    'Where the Living Archive of tantric/siddhi heritage meets the Mirror Method of psychological pattern recognition.',
  keywords: ['siddhi', 'tantra', 'sadhana', 'meditation', 'pattern recognition', 'japa', 'breathwork', 'Indian spirituality'],
  openGraph: {
    title: 'AstroKalki',
    description: 'The Living Archive of Siddhi Heritage',
    siteName: 'AstroKalki',
    type: 'website',
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
          <SacredNav />
          <main className="pt-16">{children}</main>
          <SacredFooter />
          <WhatsAppCTA variant="floating" />
          <PaywallModal />
        </TierProvider>
      </body>
    </html>
  );
}
