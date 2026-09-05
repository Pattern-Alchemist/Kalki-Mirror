# KALKI Admin OS — The Next 20 (Upgrade & Development Roadmap)

> Committed 2026-09-05, post-L4. Grounded in the live platform state:
> L1 UPI rail ACTIVE (VPA `8920862931@ibl`) · L2 email engine live (Doors cron 20:00 IST) ·
> L4 FolioChunk RAG live (279/279 chunks @ 2048-dim) · PRs #3–#7 merged.
> Each item lists: what, why now, first move. Zero-cost bias throughout (free tiers only).

## Tier 1 — Close the revenue loop (do first)

1. **UPI reconciliation board** (admin/consultations extension)
   - What: per-lead payment state (UNPAID → CLAIMED → PAID), UTR/reference field, `markPaid`/`markClaimed` actions, filter chips.
   - Why: `upi_pay_clicked` / `payment_confirm_clicked` now exist; Kaustubh reconciles by hand in WhatsApp — give him a ledger.
   - First move: add `paymentState`/`utrRef` columns (schema migration), extend the kanban card.

2. **Membership path (Akash tiers)** — the missing rail from orphaned `6b79bee`
   - What: membership signup → UPI intent (reuse `buildUpiPayUrl`) → manual grant → `UserRole`/tier elevation. Lineage Introduction is membership-only by design (see `src/lib/utils/upi.ts`).
   - Why: L1 covers per-session payment only; recurring membership is the LTV engine.
   - First move: model `Membership` (plan, status, startedAt) + admin grant/revoke flow.

3. **YANTRA synthesis — connect the LLM**
   - What: `/api/initiate` already builds `yantra_prompt` (RAG-grounded) but returns the pattern-based fallback. Wire the OpenRouter chat call (key exists) with the folio context + soft-fail to the fallback.
   - Why: this is the AI screener's actual brain — RAG built it the memory, now give it the voice.
   - First move: `src/lib/ai/yantra-synthesize.ts` behind `OPENROUTER_API_KEY` runtime check + rate-limit-aware caching.

4. **Funnel analytics view** (admin/analytics)
   - What: stage funnel — visit → intake submit → whatsapp_handoff → upi_pay → payment_confirm → PAID; weekly cohort deltas.
   - Why: "The One Funnel That Matters" (Ch 7.2) shipped events; nobody sees the composite yet.
   - First move: query first-party events table, render funnel on Overview.

5. **Daily ops digest email** (Resend, 08:00 IST cron)
   - What: new leads (with attribution), new subscribers, door-email stats, bell events, payment confirmations — one email.
   - Why: founder reads email before the console; zero new deps (Resend + cron pattern already live).
   - First move: `/api/cron/daily-digest` mirroring the doors cron + CRON_SECRET.

## Tier 2 — Ops resilience (before the next spike) — SHIPPED 2026-09-05

6. **✅ Rate-limit hardening** — Upstash Redis REST backend (zero-dep fetch pipeline) heads the backend chain in `rate-limit.ts`; falls back to legacy Vercel KV, then in-memory. Flip-on = set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` env vars (free tier, no rebuild). Backend surfaces on `/api/health` as `rateLimitBackend`.

7. **✅ Automated Turso backups** — `.github/workflows/db-backup.yml` runs `scripts/backup-db.mjs` daily 21:30 UTC (03:00 IST), gzipped logical dump uploaded as a private artifact, 30-day retention; manual `workflow_dispatch` supported. Secrets: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.

8. **✅ Admin TOTP 2FA** — was already live (A1): enrollment with QR + backup codes at `/admin/settings`, enforced two-step login via `/api/auth/admin-login` → `/api/auth/2fa-verify`; re-verified in Tier 2.

9. **✅ Uptime + error alerting** — `.github/workflows/uptime.yml` pings `/api/health` + homepage every 15 min (2 attempts), emails via Resend ONLY on ok→down / down→ok transitions. Sentry wiring verified dormant: set `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` env vars to activate capture.

10. **✅ Email analytics loop** — Resend webhooks (svix-verified, zero-dep verifier in `src/lib/webhooks/svix.ts`) → `/api/webhooks/resend` → `EmailEvent`; sends logged to `EmailSend` at dispatch. Engagement rollup + Doors 1–5 non-opener segment with one-click re-send on `/admin/subscribers`.

## Tier 3 — Growth surfaces

11. **SEO automation** — sitemap regeneration on deploy + IndexNow ping extended to changed URLs (ping-indexnow cron exists) + GSC API submission.

12. **Testimonials / social proof module** — post-consultation WhatsApp follow-up template → admin-curated proof block on `/consultations` + landing.

13. **Cal.com booking embed** (free tier) — after payment confirm, hand the seeker a real calendar slot instead of manual WhatsApp scheduling.

14. **n8n automation recipes** (free self-host) — consume the existing `consultation.created` webhook → Google Sheets CRM, WhatsApp template follow-ups, stale-lead nudges.

15. **PWA shell** — installable manifest + service worker caching the folio surfaces for returning practitioners (offline practice access).

## Tier 4 — Depth & quality

16. **Behavioral bridge for RAG** — the corpus documents *practices*, not *psychology*; add a pattern→folio mapping table (or pattern tags on chunks) so behavioral queries ground through the pattern layer deterministically.

17. **Neural embedding swap** — contract is ready: when an embedding-capable key (OpenAI/Gemini/Jina free tier) lands, re-bake via `scripts/bake-folio-embeddings.ts` — retrieval code unchanged.

18. **Content Studio → auto re-bake CI** — GitHub Action: corpus-touching PRs run the bake script and fail if `idf-generated.ts`/`custom.db` are stale.

19. **i18n + a11y pass** — `next-intl` is installed; ship `hi` locale for intake + wizard, keyboard/contrast audit on the wizard steps.

20. **Salvage audit of orphaned `6b79bee`** — diff its Vercel build output against current main for any feature beyond the rebuilt email engine + UPI path (membership flow was part of it — covered by item 2); document anything unique, then close the drift file for good.

## Suggested order
Week A: 1 → 3 → 5 · Week B: 7 → 8 → 4 → 6 · Week C: 2 → 13 → 11 · then Tier 3/4 by pull.
