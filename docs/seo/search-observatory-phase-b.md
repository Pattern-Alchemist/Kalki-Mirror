# KALKI SEARCH OBSERVATORY — Phase-B Build Spec

> The spec's §9/§18 "SEO Observatory" renamed to fit the brand. This document is
> the implementation-ready spec so the build is a same-day job once the Google
> service-account credentials exist. Status: DESIGNED, NOT BUILT (needs user-side
> credentials).

## What it answers

Continuously: **What are Americans searching for that KALKI is uniquely
qualified to answer?** — with the pipeline: query → intent → current page →
ranking → content gap → opportunity score → recommended action → WhatsApp
conversion.

## Prerequisite (user action, ~10 minutes)

1. Google Cloud Console → create/select a project.
2. Enable **Search Console API**.
3. Create a **Service Account** (no roles needed for read-only), generate a
   JSON key, download it.
4. In Search Console (Domain property astrokalki.com): Settings → Users and
   permissions → Add user → paste the service account's email (the
   `client_email` inside the JSON) with **Restricted** permission.
5. Hand me the JSON (transient use, like the PAT) — or store it as a Vercel
   encrypted env var: `GSC_SERVICE_ACCOUNT_JSON`.

## Data model (Turso, via Prisma migration)

```prisma
model SeoSnapshot {
  id          String   @id @default(cuid())
  fetchedAt   DateTime
  dimension   String   // 'query' | 'page' | 'device'
  countryCode String   // 'USA' filter applied at fetch time
  clicks      Int
  impressions Int
  ctr         Float
  position    Float
  key         String   // the query text / page path / device name
  startDate   DateTime
  endDate     DateTime
}
model SeoOpportunity {
  id            String   @id @default(cuid())
  query         String
  impressions   Int
  position      Float
  pagePath      String?
  status        String   // 'new' | 'triaged' | 'actioned' | 'dismissed'
  score         Float
  recommended   String?  // generated action note
  createdAt     DateTime
  updatedAt     DateTime
}
```

## API route

`GET /api/admin/seo/sync` (ADMIN+, `requireAdmin`) — server-side:

1. Load the service-account JSON from env; sign a JWT (RS256, `jsonwebtoken`
   + the private key), exchange for an access token (scope
   `https://www.googleapis.com/auth/webmasters.readonly`).
2. POST `searchconsole/v1/sites/https%3A%2F%2Fwww.astrokalki.com/searchAnalytics/query`
   with `{ startDate: -28d, endDate: yesterday, dimensions: ['query','page'],
   dimensionFilterGroups: [{ filters: [{ dimension: 'country', expression: 'USA' }] }],
   rowLimit: 2500 }`.
3. Upsert rows into `SeoSnapshot`; compute opportunities.
4. Rate/latency: one call per sync; cron daily is plenty.

## Opportunity scoring (spec §10, simplified but honest)

```
score = impressions_log * proximity * ctr_gap * intent_weight
proximity   = max(0, (25 - position) / 20)      // positions 5–20 are the gold
ctr_gap     = clamp(expected_ctr(position) / actual_ctr, 0.5, 3)
intent_weight = 2.0 commercial | 1.0 informational
```
P0 = score in top decile AND commercial intent. P1 = informational authority
gaps. P2 = experimental long-tail. Chased volume alone: never.

## War Room integration

New tab in the existing `/admin/warroom` (15× layout): KPI row (US clicks,
impressions, CTR, avg position, delta vs prior 28d), opportunities table
(query / impressions / position / page / score / status-chips), and the
conversion join — WhatsApp handoff events (already tracked, with `topic`) and
`usa_page_viewed` events plotted per landing page. No new admin page; no
parallel panel.

## Explicitly out of scope (per spec §28)

- No auto-generated content from opportunities: the engine recommends, a human
  writes, the keyword-url-matrix gates publication.
- No rank-scraping of Google; Search Console data only.
- No PII: queries and paths only — never user identifiers.

## Effort estimate

Route + sync + scoring: one session. War Room tab: one session. Prisma
migration: trivial. Total: 1 working session after credentials exist.
