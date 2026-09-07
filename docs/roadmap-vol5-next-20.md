# KALKI — The Next 20, Vol. 5 (Feed, Vigilance & Voice)

> Committed 2026-09-08, post-Vol.4 closeout (Vols. 1–4 = all 80 items shipped
> and verified live; 731 unit tests across 56 files, build green, full
> production sweep 54/54 same-day). Grounded in the sweep that closed Vol. 4:
> 289 sitemap URLs (glossary 87 · aghori-tantra 63 · archive 57 · patterns 21
> · breathwork 13 · archetypes 11 · sequences 7 · library 6 · usa 6), 23
> models, 50+ API routes, 4 crons, 17 admin API surfaces, and the live
> war-room (2 members, 3 keys, 0 redeemed, 0 published letters, ai_ask
> p95 14.7s). Every item cites what already exists and what dead-ends.
> Zero-cost bias throughout (free tiers only).
>
> The founding incident of this volume: the OpenRouter free-tier chain
> rotted SILENTLY — 2 of 3 models 404-delisted within ~72h of enlistment,
> production /ask degraded until a contract-size probe found replacements.
> Same week, the founder's vaulted Turso token turned out stale while
> production ran on Vercel's copy. Both failures were invisible until
> probed. Vol. 5's first tier makes this class of rot self-announcing.
>
> Founder-gated carry-overs (NOT counted in the 20): TOTP enrollment at
> /admin/settings (grace ends ~2026-09-12 — DAYS), EMBED_API_KEY neural
> swap (rehearsed, one command), GSC indexing OAuth (item 12 designs its
> landing), Turso token rotation in the founder vault (item 2 audits it).

## Tier 17 — Vigilance: the machine announces its own rot — do first

1. **AI chain health probe** — the delisting incident: minimax-m2.7:free and
   glm-5.2:free died between the 09-05 and 09-08 probes; production answered
   502-honest for days and nobody was told. resolveModelChain() is the single
   source of truth; OpsState and the daily digest already exist.
   First move: cron route probing every chain model with a real-size JSON
   contract prompt (toy prompts lie — ling-sante passed toys, 400'd real
   bodies), per-model verdict + latency into OpsState, war-room "AI chain"
   panel, digest alert line when any model fails or the whole chain is dead.

2. **Credential rotation audit** — the founder-vault Turso token failed
   auth-byte-exact today (rotated server-side) while production ran happy on
   Vercel's copy; a vault credential is a hope until pinged. Resend,
   OpenRouter, Cloudinary and Turso all have cheap verify endpoints.
   First move: scripts/audit-credentials.sh + cron route hitting each
   provider's verify path with the SERVER env, writing last-verified-at +
   verdict per credential into OpsState; war-room panel; digest line when
   any credential fails or goes >30d unverified.

3. **Distributed rate-limit backend** — /api/health self-reports
   `rateLimitBackend: memory`: counters live per serverless instance, reset
   on every cold start, and never share state — the 5 req/min /ask promise
   is per-instance fiction under load. The interface (aiRateLimit) is
   already route-wide.
   First move: Turso-backed counter store behind the same interface
   (atomic upsert with window expiry), memory fallback on DB failure,
   behavior-pinning vitest (burst, window roll-over, fallback mode),
   health endpoint reports the real backend.

4. **Cron outcome ledger** — 4 crons run daily blind (indexnow, course-send,
   daily-digest, cleanup): no record of duration, items touched, or whether
   they ran at all; Vercel cron shows only HTTP 200s. A silently dead cron
   is discovered by its symptoms.
   First move: CronRun table (name, startedAt, durationMs, items, outcome,
   error), each route appends via a shared wrapper; war-room cron panel with
   last-run age; missed-cron alarm (>26h silence) in the digest.

5. **AI route latency budget** — ai_ask p95 14.7s in war-room: a dying chain
   burns 404→404→429 round-trips before any model answers, and every cold
   start re-copies the corpus to /tmp. The route works; the budget does not.
   First move: per-route latency budget assertion in the smoke script
   (ask < 12s p95 warm, others < 3s), SynthesisCache pre-warm for the top-10
   corpus queries (ask-cache already keyed), chain-walk timeout tightening
   (25s → 12s per model, the budget not the model is the contract).

## Tier 18 — Feed: content velocity without the founder bottleneck

6. **Broadcast letters pipeline** — the full machinery exists (Letter model,
   studio editor, sitemap live-query with isPublic filter, /letters hub,
   RSS) and the shelf is EMPTY: zero published letters, hub-only sitemap.
   The archive proves the corpus can speak; the broadcast never starts.
   First move: five launch letters drafted FROM existing corpus folios
   (founder-review register), publish checklist, E2E pin: publish one →
   sitemap /letters/[slug] + feed.xml item + hub card within one rebuild.

7. **Corpus bake one-command path** — a new folio currently requires the
   manual bake ritual (bake → fingerprint diff → CORPUS_SIZE update →
   re-deploy) documented across three worklogs; the neural-swap rehearsal
   (Vol.4 #16) proved the tooling exists but the WRITE path is still
   archaeology.
   First move: scripts/bake-corpus.sh — validate folio JSON → bake →
   fingerprint diff vs idf-generated.ts → CORPUS_SIZE assertion → vitest
   corpus gates → done banner; studio "bake pending" indicator from
   ContentEntry-vs-FolioChunk count diff.

8. **hi corpus bridge scale-out** — the top-20 glossary terms carry hi
   definitions with the parity gate holding; 66 terms, all 56 folios and
   every lesson remain EN-only walls for hi seekers.
   First move: next 40 glossary terms + the 10 OPEN-caution pattern folios
   (founder-review sadhu register, atomic insertions), lexicon-bridge
   fallback already proven; parity test count assertions updated per batch.

9. **Breathwork audio: the long tail** — 4 entry patterns + Door 1 are
   voiced (~4.9MB committed); 6 doors and 16 patterns stay silent while the
   <audio> bands render for every folio the registry knows.
   First move: bake the remaining Door narrations first (the email listen
   line already ships for Door 1), then pattern folios in caution order
   (OPEN first); registry↔files↔data truth tests scale automatically.

10. **OG factory: the long tail** — 111 bespoke cards render for glossary/
    patterns/library; archive folios (57), sequences (7), archetypes (11)
    and usa (6) still fall back to the generic card in social shares.
    First move: extend the og-factory registry to the four families (the
    factory is data-derived; Satori-safe font subset committed), orphan
    guard learns the new routes, fs-exhaustive test scales.

## Tier 19 — Voice: distribution that compounds while the founder sleeps

11. **Ask-surface entry points** — /ask is noindexed by design, so its only
    discovery path is typing the URL; the corpus answers with citations that
    link to /archive/[slug], but nothing invites the question.
    First move: "Ask the archive" CTA blocks on /library, /patterns and
    /codex (prefilled query params, noindex stays on /ask itself), ai_ask
    referral source added to the #17 events so the funnel sees which
    surface asks come from.

12. **GSC indexing queue (OAuth-ready)** — GSC OAuth is founder-gated
    carry-over; the moment it lands, "which URLs need indexing attention"
    must be a panel, not a research project. Sitemap diffs are already
    computable (git log + sitemap output).
    First move: IndexingRequest queue table + war-room panel (new/changed
    URLs since last run, submitted/failed states), stubbed runner that
    no-ops without credentials and lights up when OAuth arrives; the
    carry-over keeps its founder-gated status, this item removes the
    post-OAuth cliff.

13. **JSON Feed + email cross-links** — feed.xml (RSS 2.0) serves the
    archive; JSON Feed costs one serializer and modern readers prefer it;
    Door emails never link the letters hub, and /letters has no capture.
    First move: /feed.json (JSON Feed 1.1, same source data, truth test
    parity with the RSS gate), letters-hub subscribe form reusing the
    existing subscribe route + DoubleOptIn posture, Door 3+ footer link
    to /letters.

14. **Testimonial flywheel** — the wall renders APPROVED+consent rows on
    /consultations and the intake route exists (Vol.4 #5), but the shelf is
    empty and no seeker is ever ASKED: nothing connects the post-consultation
    follow-up email to the intake form to the war-room approval queue.
    First move: follow-up email template (+14d after COMPLETED consultation)
    with the intake deep-link, one admin nudge button on the pending queue,
    first-seed: founder enters 2–3 historical consented quotes through the
    existing intake so the wall ships with texture.

15. **USA layer depth** — 6 pages exist from the geo/phase0 branch and rank
    for nothing yet; local-intent queries need city surfaces and
    LocalBusiness-grade structure to compete.
    First move: 4 city landing pages (Austin, NYC, SF Bay, London) from a
    shared template with localized FAQ blocks + FAQPage JSON-LD + hreflang
    hygiene, noindex-duplicate guard, per-city funnel events into the
    existing list-funnel.

## Tier 20 — Never-regress II: pins on everything Vol. 4–5 built

16. **/ask contract truth gate** — the route's contract (retrieval pool →
    buildAskMessages shape → parseAskOutput strictness → ask-cache
    store/lookup → silence outcomes) is enforced by production behavior but
    only partially pinned; the contract-size probe script exists outside CI.
    First move: vitest matrix over parseAskOutput (bad JSON, grounded=false,
    empty answer, unknown slug, dedupe, trailing punctuation), message-shape
    pin, cache round-trip pin, plus scripts/smoke-ask.sh promoted to the
    standard post-deploy drill.

17. **Sitemap truth gate II** — the sweep proved the sitemap is exactly
    canonical (289 URLs, per-class composition verified, /ask correctly
    absent) — and nothing pins it; the next renderer bug silently reshapes
    the map.
    First move: vitest sitemap census asserting per-class floors (glossary
    ≥87, archive ≥57, patterns ≥21, breathwork ≥13, archetypes ≥11,
    sequences ≥7, library ≥6, usa ≥6, letters hub present, ask ABSENT);
    new page classes must register a floor or the gate fails loud.

18. **Page-weight budget** — sweep measured HTML payloads: glossary 369KB,
    aghori-tantra 316KB, patterns/archive/search ~300KB each; every KB is
    mobile TTFB in the target geography (IN traffic dominates).
    First move: per-route-class HTML ceiling in the smoke script (hub pages
    < 250KB, detail pages < 120KB), then the two worst offenders dieted
    (inline-data trimming, below-fold lazy render); budgets fail CI, not
    vibes.

19. **OpenAPI truth II: full census** — /api/ai/ask joined the spec in Week
    E, but 50+ routes have never been census-audited against openapi.json;
    the truth gate (Vol.3 #20) pins the FILE, not the COVERAGE.
    First move: vitest census — every route file under src/app/api must
    appear in the spec (method+path) or fail with the missing list; spec
    updated for the uncovered tail; gate is CI-enforced from then on.

20. **Restore drill II + Turso failover rehearsal** — the drill exists and
    passed (Vol.4 #20); the quarterly cadence next falls due ~December, and
    the untested half is the OUTAGE: what does the site DO when Turso is
    unreachable (the stale-vault-token incident was a rehearsal for the
    symptom, not the cure).
    First move: failover rehearsal script — block Turso locally, assert
    static-corpus surfaces stay 200 (they read /tmp/kalki-corpus.db),
    dynamic member surfaces fail honest (not 500-loop), recovery path
    documented in the ops runbook next to the quarterly drill entry.

## Suggested order

Week A: 1 → 2 → 16 → 3 → 4 (vigilance first — this week's incidents wrote the spec)
Week B: 6 → 7 → 8 → 9 (feed: letters launch, bake path, hi scale, audio tail)
Week C: 10 → 11 → 14 → 13 (voice: OG tail, ask entries, testimonial loop, JSON feed)
Then: 5 → 12 → 15 → 17 → 18 → 19 → 20 (latency budget, GSC-ready queue, USA depth, the remaining pins)
