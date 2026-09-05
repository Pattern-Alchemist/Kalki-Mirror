# KALKI Admin OS — The Next 20, Vol. 2 (Upgrade & Development Roadmap)

> Committed 2026-09-06, post-Tier-3. Grounded in the live platform state:
> Tier 1 (revenue loop) ✅ · Tier 2 (ops resilience) ✅ · Tier 3 core (growth
> surfaces) ✅ · Vol. 1 Tier 4 items (#16–20) still open and carried forward
> implicitly. Zero-cost bias throughout (free tiers only). Each item lists
> what / why now / first move.

## Tier 5 — Conversion depth (do first)

1. **Consultation testimonial flywheel** — automated post-session WhatsApp
   template (t+48h) asking for three honest sentences + explicit consent
   toggle; lands as PENDING in the new Testimonials ledger.
   First move: add a `wa.me` deep link generator to the drawer in
   /admin/consultations that pre-fills the ask.

2. **Abandoned-intake recovery** — wizard step-4 partials (name typed but no
   submit) currently evaporate. Save a draft lead on step transitions
   (client-side debounce → lightweight endpoint), surface "resumed intakes"
   in the ops digest.
   First move: `POST /api/initiate/draft` behind the existing rate limiter.

3. **USD price display A/B** — the FAQ claims "$29" and "$49" equivalents;
   instrument `pricing_viewed` with a `currency` property and let the funnel
   show whether explicit USD copy lifts US click-through to the wizard.
   First move: property on track(), variant flag via middleware geo cookie.

4. **Doors → consultation CTA attribution loop** — CTAs on days 1·5·10 exist;
   tag their links with `utm_campaign=doors-day-N` and prove email→wizard
   attribution end-to-end in the funnel.
   First move: course-content.ts link builder + verify in lead attributionJson.

5. **Membership recurring renewal ledger** — Membership has no renewal
   concept; monthly/quarterly renewals are the LTV engine.
   First move: `renewalCycle` + `nextDueAt` columns, digest section listing
   due renewals.

## Tier 6 — Intelligence (the AI layer)

6. **YANTRA synthesis caching** — identical intake patterns re-pay the LLM
   cost; cache by (patterns hash + level bucket) in Turso, TTL 7 days.
   First move: `SynthesisCache` table + lookup before the OpenRouter call.

7. **Pattern-pair affinities from real leads** — 1,000+ wizard submissions
   will reveal which pattern pairs co-occur; publish a "most common
   companions" line on pattern folios (derived, not vibes).
   First move: nightly query over Consultation.patternSlugs → cache table.

8. **Screener voice** — the dossier reads clinical; pass the RAG-grounded
   floor through the LLM with a "Kaustubh voice" style pass (short sentences,
   second person, no promises) as a post-processing step.
   First move: style prompt in yantra-prompt.ts, soft-fail to raw floor.

9. **AI search answer citations** — /api/ai/search results should cite folio
   URLs with anchor terms (term-anchor util exists) so AI surfaces can
   deep-link the archive.
   First move: extend search response with citation array.

10. **Embedding neural swap rehearsal** — dry-run the Jina/OpenAI free-tier
    re-bake in CI (no key in prod): script validates contract shape so the
    day a key lands, the swap is one secret + one workflow run.
    First move: `.github/workflows/embed-rehearsal.yml` with a mocked key.

## Tier 7 — Ops & resilience (post-spike hardening)

11. **Admin session device list** — ActiveSession table exists; show
    "your active sessions" (device, last seen) with a kill button in Settings.
    First move: read model on /admin/settings + revoke action (audit-logged).

12. **2FA required for ADMIN+ (not just SUPERADMIN)** — TOTP exists and is
    opt-in; make it mandatory at role elevation, with a grace window.
    First move: require-role.ts check → redirect to enrollment.

13. **Turso backup restore drill** — the backup workflow uploads dumps; nobody
    has restored one. Quarterly drill: restore to a scratch DB, run the test
    suite against it, record RTO in the runbook.
    First move: `scripts/restore-drill.sh` + workflow_dispatch.

14. **Rate-limit observability** — rateLimitBackend surfaced on /health; add
    429 counts per surface to the analytics snapshot so throttling is visible
    before it costs a lead.
    First move: middleware counter → admin analytics card.

15. **Dependency audit automation** — `npm audit` in CI weekly, fail on HIGH
    in production deps only (the tree is 16 deps — keep it that way).
    First move: `.github/workflows/audit.yml`.

## Tier 8 — Reach (distribution surfaces)

16. **RSS full-text feed** — feed.xml exists but is headlines-only; full-text
    RSS of folios feeds readers + LLM crawlers that prefer complete docs.
    First move: extend feed route with folio body (capped at 5 latest).

17. **llms.txt vol. 2 — course syllabi** — the aghori course's 8 phases +
    54 lessons deserve their own llms.txt section with learning paths.
    First move: extend the existing route builder.

18. **Email-course referral loop** — subscribers get a personal share link
    (HMAC, like unsubscribe) → `?ref=` attribution lands in the subscriber
    table; top referrers surface in the digest.
    First move: share-link util + AttributionCapture-style param capture.

19. **Hi-locale intake (wizard)** — next-intl is installed; ship the wizard's
    5 steps + sliders in Hindi (the seeker's mother tongue lowers friction at
    the emotional moment).
    First move: hi.json wizard strings + LocaleSwitcher on /consultations.

20. **Schema.org Service + Offer graph** — /consultations and /pricing carry
    FAQPage; add Service + Offer (₹1,999/₹3,499, INR) so rich results can
    render price + availability directly.
    First move: JSON-LD block in consultations/page.tsx mirroring faqJsonLd.

## Suggested order

Week A: 1 → 2 → 6 · Week B: 4 → 11 → 20 · Week C: 7 → 18 → 16 ·
then by pull. Items #16–20 from Vol. 1 (RAG behavioral bridge, neural swap,
re-bake CI, i18n+a11y, orphan-drift salvage) stay open in parallel.
