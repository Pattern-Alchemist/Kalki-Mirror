import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login — KALKI",
  description: "Archivist console login. Access restricted to authorized personnel.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  /*
   * Intentionally NO alternates.canonical, NO openGraph, NO twitter.
   * Next.js metadata resolution: omitting these fields means the root layout's
   * values will NOT cascade into this route segment. The page gets a bare
   * <title> + robots noindex meta — nothing else leaks.
   */
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/*
        Suppress the root layout's homepage JSON-LD (WebSite + Organization schema)
        by rendering an empty script that overrides @graph with a no-op page reference.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": "https://www.astrokalki.com/admin/login#webpage",
                "url": "https://www.astrokalki.com/admin/login",
                "name": "Admin Login",
                "isPartOf": {
                  "@id": "https://www.astrokalki.com/#website"
                },
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
