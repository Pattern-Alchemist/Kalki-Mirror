import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: 'Admin Login — KALKI' },
  description: 'Archivist console login. Access restricted to authorized personnel.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Admin Login — KALKI',
    description: 'Access restricted.',
    url: 'https://www.astrokalki.com/admin/login',
    siteName: 'KALKI',
    type: 'website',
    locale: 'en_US',
    images: [],
  },
  twitter: { card: 'summary', title: 'Admin Login — KALKI', description: 'Access restricted.' },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
