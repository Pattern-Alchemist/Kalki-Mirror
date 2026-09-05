# GSC Indexing Automation — Runbook (Roadmap #11)

> Status: partially automated. IndexNow (Bing/Yandex/Seznam/Naver fan-out)
> is fully automated — daily full-sitemap ping at 07:30 IST via `/api/indexnow`
> (cron in `vercel.json`), plus a publish-time ping of `/consultations` whenever
> a testimonial is approved (`testimonial.approve` → `pingIndexNow`).
> **Google** is not an IndexNow participant: GSC submission needs Google
> OAuth — only the founder can provision that.

## What is already automated (no action needed)

| Surface | Mechanism | Cadence |
|---|---|---|
| IndexNow full sitemap | `/api/indexnow` cron, CRON_SECRET-gated | daily 02:00 UTC |
| Sitemap freshness | `src/app/sitemap.ts` (dynamic, 170+ URLs) | every request |
| Publish-time ping | `pingIndexNow()` hooks in admin actions | on publish |
| Search engines' discovery of sitemap | `robots.ts` `Sitemap:` directive | continuous |

## The remaining manual piece: Google

Two provisioning-free wins first:

1. **GSC sitemap submit (one-time, 2 min)** — GSC → Sitemaps → submit
   `https://www.astrokalki.com/sitemap.xml`. Already covered by
   `docs/geo/gsc-property-10min-runbook.md` if not done yet.
2. **Request indexing after meaningful publishes** — GSC → URL Inspection →
   request indexing for `/`, `/consultations`, `/pricing` after any change
   that alters their rendered content. Frequency-capped by Google; use only
   for real changes.

## Optional: full automation via the Indexing API (service account)

The Indexing API officially supports `URL_UPDATED` jobs for **broadcast
(JobPosting/Livestream) pages only**; Google applies it to other pages with
strongly diminishing returns. If you still want it:

1. Google Cloud Console → new project → enable **Web Search Indexing API**.
2. Create a **service account** → JSON key → keep it OUT of the repo.
3. GSC → Settings → Users → add the service-account email as **Owner** (via
   the property's owner verification page) or Full user.
4. Vercel → Environment Variables → `GSC_INDEXING_CREDENTIALS` = the full
   JSON (Production + Preview, sensitive).
5. Extend `/api/indexnow` (or a new `/api/cron/gsc-submit`) to mint a JWT
   (RS256) against that JSON and POST batch `urlNotifications` for the
   sitemap's top-priority URLs. Guarded by `CRON_SECRET` like every cron.

Estimate: ~1 hour of engineering once the service account exists. Until the
JSON secret lands in Vercel, nothing to build — the API is unreachable.
