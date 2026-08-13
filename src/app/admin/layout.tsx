import type { Metadata } from "next";

/*
 * Admin route-group layout.
 *
 * Metadata: robots noindex is the only defense needed here.
 * Nav/footer/JSON-LD stripping is handled in the ROOT layout via
 * pathname detection (x-nextjs-pathname header), so we don't need
 * any client-side script hacks here.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
