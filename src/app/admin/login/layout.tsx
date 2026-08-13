import type { Metadata } from "next";

/*
 * Admin login metadata.
 *
 * CRITICAL: Next.js App Router MERGES child metadata into root metadata.
 * Omitting a field does NOT remove the root's value — the root's OG/Twitter/
 * canonical all cascade down. To actually suppress them, we must explicitly
 * override with empty/minimal values.
 *
 * - title: { absolute: ... } prevents the root's template suffix
 * - openGraph/twitter: explicit empty overrides kill root's values
 * - alternates: not set here (root's canonical still leaks via metadataBase,
 *   but X-Robots-Tag + meta robots noindex makes this irrelevant for indexing)
 */
export const metadata: Metadata = {
  title: { absolute: 'Admin Login — KALKI' },
  description: 'Archivist console login. Access restricted to authorized personnel.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'Admin Login — KALKI',
    description: 'Access restricted.',
    url: 'https://www.astrokalki.com/admin/login',
    siteName: 'KALKI',
    type: 'website',
    locale: 'en_US',
    images: [],
  },
  twitter: {
    card: 'summary',
    title: 'Admin Login — KALKI',
    description: 'Access restricted.',
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
