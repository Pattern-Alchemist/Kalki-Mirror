import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  /* No canonical, no openGraph — prevents homepage SEO leakage */
};

/**
 * Admin route-group layout.
 *
 * The root layout renders SacredNav / SacredFooter / WhatsAppCTA / PaywallModal
 * for every route. This layout injects a tiny blocking script that hides those
 * elements when the admin section is active, so the login page and dashboard
 * don't expose the public site's navigation or floating widgets.
 *
 * Using a blocking <script> (no type="module") ensures it runs before first paint,
 * so the user never sees a flash of the public nav.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var s=document.createElement('style');s.id='admin-hide-public';s.textContent='[role="banner"],#main-content+*,.fixed-bottom-stack,.page-vignette{display:none!important}';document.head.appendChild(s)})()`,
        }}
      />
      {children}
    </>
  );
}
