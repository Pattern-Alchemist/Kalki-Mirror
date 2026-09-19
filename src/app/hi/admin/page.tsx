// =============================================================
// VOL. 2 #19 — /hi/admin route
// -------------------------------------------------------------
// Hindi twin entry point of /admin. Reuses the same components
// (sidebar, topbar, pages) — the language toggle in the HUD switches
// labels. This route serves as the discoverable Hindi entry point
// (bookmarked by Hindi-speaking operators).
//
// The route is a redirect to /admin?lang=hi — the TopbarHUD's
// useAdminLanguage hook reads this query param on first load and
// sets the language cookie, then strips it from the URL.
//
// The admin tree is NOT duplicated under /hi/ — that would double
// the maintenance surface. The language is a client-side toggle
// persisted in localStorage.
// =============================================================

import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HiAdminRedirect({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') qs.set(k, v);
    else if (Array.isArray(v) && v.length > 0) qs.set(k, v[0]);
  }
  qs.set('lang', 'hi');
  redirect(`/admin?${qs.toString()}`);
}
