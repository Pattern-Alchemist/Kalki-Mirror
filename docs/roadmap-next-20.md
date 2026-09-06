# KALKI Admin OS — The Next 20 (Upgrade & Development Roadmap)

> Committed 2026-09-05, post-L4. Grounded in the live platform state:
> L1 UPI rail ACTIVE (VPA `8920862931@ibl`) · L2 email engine live (Doors cron 20:00 IST) ·
> L4 FolioChunk RAG live (279/279 chunks @ 2048-dim) · PRs #3–#7 merged.
> Each item lists: what, why now, first move. Zero-cost bias throughout (free tiers only).

## Tier 1 — Close the revenue loop (do first) — SHIPPED 2026-09-06

1. **✅ UPI reconciliation board** (admin/consultations extension)
   - Shipped: `paymentState` lifecycle (UNPAID → CLAIMED → PAID) + `recordPaymentClaim` wired from the wizard's WhatsApp confirm click, filter chips on the admin board; UTR field surfaced via the enriched WhatsApp payload the archivist reconciles from.
   - What: per-lead payment state (UNPAID → CLAIMED → PAID), UTR/reference field, `markPaid`/`markClaimed` actions, filter chips.
   - Why: `upi_pay_clicked` / `payment_confirm_clicked` now exist; Kaustubh reconciles by hand in WhatsApp — give him a ledger.
   - First move: add `paymentState`/`utrRef` columns (schema migration), extend the kanban card.

2. **✅ Membership path (Akash tiers)** — the missing rail from orphaned `6b79bee`
   - Shipped: `Membership` model + admin grant/revoke + audit log, extended with the renewal triple (`renewalCycle`/`nextDueAt`/`lastRenewedAt` + `setRenewalCycle`/`recordRenewal` + renewals-due digest section).
   - What: membership signup → UPI intent (reuse `buildUpiPayUrl`) → manual grant → `UserRole`/tier elevation. Lineage Introduction is membership-only by design (see `src/lib/utils/upi.ts`).
   - Why: L1 covers per-session payment only; recurring membership is the LTV engine.
   - First move: model `Membership` (plan, status, startedAt) + admin grant/revoke flow.

3. **✅ YANTRA synthesis — connect the LLM**
   - Shipped: `yantra-synthesize.ts` on OpenRouter with model-chain walking + synthesis caching; `/api/initiate` now serves LLM dossiers with the pattern-fallback as soft-fail floor (Vol. 2 #8 voice pass sits on top).
   - What: `/api/initiate` already builds `yantra_prompt` (RAG-grounded) but returns the pattern-based fallback. Wire the OpenRouter chat call (key exists) with the folio context + soft-fail to the fallback.
   - Why: this is the AI screener's actual brain — RAG built it the memory, now give it the voice.
   - First move: `src/lib/ai/yantra-synthesize.ts` behind `OPENROUTER_API_KEY` runtime check + rate-limit-aware caching.

4. **✅ Funnel analytics view** (admin/analytics)
   - Shipped: composite funnel on Overview + attribution rollup (campaign chips, Doors day board) proving email→wizard attribution (Vol. 2 #4).
   - What: stage funnel — visit → intake submit → whatsapp_handoff → upi_pay → payment_confirm → PAID; weekly cohort deltas.
   - Why: "The One Funnel That Matters" (Ch 7.2) shipped events; nobody sees the composite yet.
   - First move: query first-party events table, render funnel on Overview.

5. **✅ Daily ops digest email** (Resend, 08:00 IST cron)
   - Shipped: `/api/cron/daily-digest` with leads, subscribers, door stats, bell events, payment confirmations, top referrers, renewals-due.
   - What: new leads (with attribution), new subscribers, door-email stats, bell events, payment confirmations — one email.
   - Why: founder reads email before the console; zero new deps (Resend + cron pattern already live).
   - First move: `/api/cron/daily-digest` mirroring the doors cron + CRON_SECRET.

## Tier 2 — Ops resilience (before the next spike) — SHIPPED 2026-09-05

6. **✅ Rate-limit hardening** — Upstash Redis REST backend (zero-dep fetch pipeline) heads the backend chain in `rate-limit.ts`; falls back to legacy Vercel KV, then in-memory. Flip-on = set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` env vars (free tier, no rebuild). Backend surfaces on `/api/health` as `rateLimitBackend`.

7. **✅ Automated Turso backups** — `.github/workflows/db-backup.yml` runs `scripts/backup-db.mjs` daily 21:30 UTC (03:00 IST), gzipped logical dump uploaded as a private artifact, 30-day retention; manual `workflow_dispatch` supported. Secrets: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.

8. **✅ Admin TOTP 2FA** — was already live (A1): enrollment with QR + backup codes at `/admin/settings`, enforced two-step login via `/api/auth/admin-login` → `/api/auth/2fa-verify`; re-verified in Tier 2.

9. **✅ Uptime + error alerting** — `.github/workflows/uptime.yml` pings `/api/health` + homepage every 15 min (2 attempts), emails via Resend ONLY on ok→down / down→ok transitions. Sentry wiring verified dormant: set `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` env vars to activate capture.

10. **✅ Email analytics loop** — Resend webhooks (svix-verified, zero-dep verifier in `src/lib/webhooks/svix.ts`) → `/api/webhooks/resend` → `EmailEvent`; sends logged to `EmailSend` at dispatch. Engagement rollup + Doors 1–5 non-opener segment with one-click re-send on `/admin/subscribers`.

## Tier 3 — Growth surfaces — SHIPPED 2026-09-06 (core)

11. **✅ SEO automation (IndexNow core)** — daily full-sitemap IndexNow ping (existed) is now joined by a **publish-hook**: approving a testimonial re-pings `/consultations` instantly (`pingIndexNow` in the admin action). Google submission remains manual/OAuth-gated — runbook at `docs/ops/gsc-indexing-automation.md`.

12. **✅ Testimonials / social proof module** — `Testimonial` table + `/admin/testimonials` curation (consent-gated, audit-logged: create → approve → feature → hide → delete) + public wall on `/consultations` (approved + consented rows only; renders nothing while empty — no placeholder praise). WhatsApp collection script inside the admin page's empty-state.

13. **✅ Cal.com booking handoff (env-first)** — `CAL_BOOKING_URL` (runtime env, no rebuild) adds "Step 3 · Claim your time slot" to the wizard's success panel; unset = WhatsApp/UPI-only, exactly as before. `booking_opened` event registered in the dictionary (now 22 events).

14. **✅ n8n automation recipes** — documented (no infra provisioned): Google Sheets CRM, WhatsApp follow-ups, stale-membership reminders — all consuming the site's existing outbound webhooks. `docs/automation/n8n-recipes.md`.

15. **✅ PWA shell** — real PNG icon set (192/512/maskable, generated from the brand mark via `scripts/gen-pwa-icons.mjs` → Cloudinary), installable manifest with app shortcuts, service worker (`public/sw.js`: network-first navigations → offline page; SWR static assets; /api, /admin, /dossier, /redeem never cached), branded `/offline.html`, production-only registration.

## Tier 4 — Depth & quality — CLOSED 2026-09-06

16. **✅ Behavioral bridge for RAG** — the corpus documents *practices*, not *psychology*; shipped 2026-09-06: `src/lib/rag/pattern-bridge.ts` derives the pattern→folio mapping from `relatedSiddhis`, retrieval takes a deterministic `boostSlugs` (+0.25 inside the caution-filtered pool only — reorder, never widen), wired into `/api/initiate` and `/api/yantra`. Corpus sync enforced both directions (bridge test ↔ `scripts/corpus-audit.ts`); the audit's first run caught 8 never-ingested Aghorī folios — corpus re-baked 279→327 chunks.

17. **✅ Neural embedding swap — contract-ready, provider-gated** — decision record in `src/lib/rag/embed.ts`: OpenRouter probed live (431 models, zero embedding endpoints); adding a vendor key was rejected. Contract rehearsed weekly by `embed-rehearsal.yml` (8 checks incl. provider-free seam); the day a key lands: set `EMBED_API_KEY`, re-bake via `scripts/bake-folio-embeddings.ts`, swap nothing else.

18. **✅ Content Studio → auto re-bake CI** — shipped 2026-09-06: `corpus-rebake.yml` on corpus-touching PRs — snapshot logical fingerprint (SQLite is not byte-stable) → re-ingest (keyword mode, zero secrets) → re-bake → fail on fingerprint or `idf-generated.ts` drift; `scripts/corpus-audit.ts` catches deleted-folio orphans that upsert-only ingest cannot.

19. **✅ i18n + a11y pass** — `hi` wizard locale shipped 2026-09-05 (Vol. 2 #19, non-routing, EN↔HI parity-tested); a11y shipped 2026-09-06: wizard step-transition focus management + polite live region, `role=alert` errors (pulse animation removed per WCAG 2.2.2), locale-switcher `aria-label`s, and a token-level WCAG contrast audit (`src/lib/a11y/contrast.ts` + 18 tests locking every wizard pair ≥ 4.5:1).

20. **✅ Salvage audit of orphaned `6b79bee`** — closed 2026-09-06: `docs/ops/6b79bee-salvage-audit.md`. Git object unrecoverable; build output sealed behind Vercel SSO protection (bypass deliberately not minted). Feature accounting: membership/email/UPI all shipped in main in stronger form — zero unaccounted features, drift file closed for good.

## Suggested order
Week A: 1 → 3 → 5 · Week B: 7 → 8 → 4 → 6 · Week C: 2 → 13 → 11 · then Tier 3/4 by pull.
