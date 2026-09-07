# KALKI — The Next 20, Vol. 4 (Revenue, Ritual & Reach)

> Committed 2026-09-07, post-Vol.3 closeout (Vols. 1–3 = all 60 items shipped
> and verified live; the E2E suite runs in CI, the OpenAPI spec is pinned to
> the filesystem, 494 unit + 27 e2e tests green). Grounded in a fresh survey
> of the live surface: 324 pages, 55 API routes, 22 models, 4 crons, 15 admin
> boards, and every parked thread in the three worklogs. Every item cites
> what already exists and what dead-ends. Zero-cost bias throughout (free
> tiers only; the one cash-adjacent item rides the existing UPI rail and
> payment links — no processor integration).
>
> Founder-gated carry-overs (NOT counted in the 20): TOTP enrollment at
> /admin/settings (grace ends ~2026-09-12), EMBED_API_KEY neural swap
> (item 16 rehearses it so the key means ONE command), GSC indexing OAuth.
>
> PROGRESS — Week A: 19·2·18·1·20 — with grounding corrections (below):
> #1's rail was found PRE-SHIPPED (WhatsApp handoff + UPI intent button +
> PENDING ledger + admin grant, Tier-1 ②); Week A closed its one true gap
> (seeker confirmation email). #16's rehearsal turns out to be Vol-2 #10
> (embed-rehearsal.yml) — refocus pending. #19's incident resolved as a
> display artifact (the malformation was NEVER in git; validate correctly
> rejects the syntax with P1012 — probed) — the truth gate ships anyway as
> CI enforcement + canary + lint. #20's workflow existed (Vol-2 #13) but
> its SCRIPT never did — now shipped and PASSED live against production.

## Tier 13 — Close the revenue loop (the price list is public, nothing sells) — do first

1. **Membership buy flow** — /pricing renders four tiers (pricing.ts:
   ₹0/499/1,499/4,999 with priceUSD alongside); `Membership` rows are written
   by exactly one surface — admin actions (memberships/actions.ts); /redeem
   vault redeems InviteCodes (keys/route.ts `tierGranted`). A seeker with a
   card in hand has no path that does anything.
   First move: checkout-intent route + UPI pay-URL (reuse src/lib/utils/upi.ts,
   test-locked in Vol.3 #17) for INR, static payment-link + admin mark-paid for
   USD; provisioning into PENDING state + welcome email + audit.

2. **Orphan guard + Content Studio consolidation** — the richer studio client
   (content-client.tsx, with the in-editor media picker) has ZERO importers;
   the live /admin/content is the simple page fetching /api/admin/content.
   Third occurrence of the same trap (consultations-client, Vol.3 #1;
   content-client, Vol.3 #5 correction). Meta-fix this class to death.
   First move: wire the rich editor onto the live route or delete it; add a
   CI orphan-guard test — any component under src/app/** or src/components/**
   with zero importers fails the build.

3. **Funnel report** — the raw material all exists: events ledger with 22
   known EVENT_NAMES (analytics-shared.ts), EmailEvent rollups, DraftLead for
   abandoned wizard intakes — and war-room renders streams, never the funnel.
   Nobody can say what converts.
   First move: funnel panel on war-room (weekly cohort: subscribe → Door-3
   open → any click → /consultations visit → wizard submit), SQL over
   existing tables, own fail-soft block + digest line.

4. **Win-back for the silently cold** — EmailEvent captures opens/clicks per
   subscriber; unsubscribed re-activation exists (#7 Vol.3); the never-unsub-
   but-never-open segment just decays with no re-engagement path and no guard
   against pestering.
   First move: cold-segment query (active, zero opens 21d) + win-back
   broadcast template + suppression (≤1 win-back per subscriber per 30d,
   enforced in the send path).

5. **Seeker testimonial intake** — Testimonial is admin-entered only
   (submittedBy archivist, consent boolean, PENDING→APPROVED flow on the
   admin board); the moment of highest testimony — a milestone reached or a
   resolution logged — generates zero capture.
   First move: /profile testimonial form (session-gated) → PENDING row with
   explicit consent checkbox + audit; the existing approve flow finishes it.

## Tier 14 — Content velocity & distribution (surfaces from data that already exists)

6. **/library/[type] index pages** — the public renderer (#2 Vol.3) lives at
   /library/[type]/[slug]; the [type] segment has NO page.tsx, so
   /library/practice et al. are 404s and the hub is the only entry.
   First move: per-type index pages (generateStaticParams over the five
   types) + ItemList JSON-LD + hub cross-links; every published entry
   becomes two hops from /library.

7. **Public letters archive** — every broadcast lands in the EmailSend
   ledger (kind "ops"); nothing public shows past letters. An archive is
   free proof-of-life for the course and a content-marketing surface.
   First move: /letters index + per-letter renderer from ledger content
   (marketing sends only), RFC 8058 unsub footer preserved, robots decision
   documented in the route header.

8. **Scheduled publishing** — ContentEntry.publishedAt exists and is
   decorative: publishing is a manual status flip, the renderer gates on
   status PUBLISHED only.
   First move: SCHEDULED semantics — PUBLISHED + future publishedAt is
   hidden until due (renderer adds publishedAt <= now to its WHERE), the
   cleanup cron gains the flip pass, studio gets a schedule field.

9. **Glossary internal-link graph** — 86 term pages carry DefinedTerm +
   BreadcrumbList (#4 Vol.3) and zero cross-links; term bodies mention other
   terms as plain text. The crawl graph is a star, not a web.
   First move: pure auto-linker (first mention per body over glossary.ts
   slugs) + Related-terms block on term pages → crawl depth across 86 URLs,
   tested like every pure lib.

10. **Structured-data completion sweep** — FAQPage renders on /consultations
    and /archetypes only; /pricing ships faq-data.ts WITHOUT a FAQPage
    graph; sadhana sequences carry no HowTo; course graph exists only on
    /aghori-tantra (#10 Vol.3).
    First move: FAQPage on /pricing, HowTo on sequence pages, then a vitest
    suite pinning ld+json shape per route — the openapi-truth pattern
    (#20 Vol.3) applied to structured data.

11. **OG image factory** — 324 pages share one static card; the richest
    surfaces (7 patterns, 86 terms, 54 lessons) have no bespoke preview.
    First move: next/og ImageResponse routes — opengraph-image.tsx on
    /glossary/[slug], /patterns, /library/[type] — brand palette, dark serif,
    edge runtime, revalidate; zero marginal cost.

12. **Breathwork audio pilot (bake-time TTS)** — /breathwork renders
    breath-patterns.ts with timers; Doors are text-only email; the Cloudinary
    uploader is finally wired (CLOUDINARY_URL, #5 Vol.3) and idle.
    First move: bake-time TTS script (zero-cost, run locally, no runtime
    dependency) → narrations for the four breath patterns + one Door sample →
    upload via the existing uploader; <audio> on /breathwork, optional
    listen-link in Doors emails. Scale to all 10 Doors after the pilot.

13. **hi locale corpus bridge** — the full shell is parity-gated (#14 Vol.3);
    glossary, patterns and lesson corpora are EN-only, so a hi seeker hits a
    language wall the moment they leave the chrome.
    First move: optional hi fields with EN fallback in the data types +
    top-20 glossary terms translated + renderer chrome under the existing
    parity gate. Scale stays founder-review (sadhu register).

## Tier 15 — The AI layer, grounded (deterministic, cited, cheap)

14. **Public grounded Q&A** — /api/ai/search + RAG over the canonical
    327-chunk corpus serve internal surfaces; public AI is wizard-only. The
    corpus can answer lexicon questions with citations today.
    First move: /ask (noindexed) + rate-limited route reusing retrieval +
    pattern-bridge + SynthesisCache; strict corpus-or-silence contract;
    every answer cites folio slugs; ai-events for observability (#17).

15. **MCP Lexicon server** — the corpus lives in code + DB; AI-assisted
    authoring re-pastes context by hand. mini-services/ is an established
    pattern in this repo.
    First move: local stdio MCP server exposing search_lexicon, get_term,
    get_pattern, corpus_stats over the same data modules the site reads —
    zero runtime exposure, authoring-side only, documented in readme/.

16. **Neural-swap rehearsal** — EMBED_API_KEY stays founder-gated; the swap
    is documented but unrehearsed, and a gated key should mean ONE command,
    not a research project.
    First move: scripts/rehearse-neural-swap.sh — validates every step up to
    the API call WITHOUT the key (bake tooling present, fingerprint diff vs
    idf-generated.ts, rollback path), prints the cost estimate from the
    canonical chunk count (327).

17. **AI route observability** — nine /api/ai/* routes were rescued from the
    phantom-key gate (379ba90); the war-room still cannot say which route
    fails or latency-drifts.
    First move: ai.* event names (initiate/explain/search/…, latency +
    outcome props) added deliberately to EVENT_NAMES (the #18 Vol.3 enum
    gate makes this the sanctioned way in) + per-route panel in war-room.

## Tier 16 — Never-regress (truth gates and drills)

18. **Soft-404 streaming audit** — parked twice in Vol.3 worklogs. Dynamic
    renderers return HTTP 200 with 404 bodies on misses (streaming-shell
    behavior, verified on /library/[type]/[slug]); correct noindex metadata
    is the mitigation, but no test pins it and route coverage is informal.
    First move: audit every dynamic renderer (library, glossary, lessons) —
    noindex-on-miss asserted in vitest, per-route decision documented,
    thread closed permanently.

19. **Schema truth gate** — CORRECTED AFTER FORENSICS: the malformed
    @@index reported in this survey never existed in git (hex-verified blob
    reads + `git log -S` pickaxe over all history); it was an output-channel
    display artifact (the text layer eats the two-char sequence bracket+m,
    turning bracket+minTier into inTier). `prisma validate` probed against a
    genuinely mutated copy REJECTS that syntax with P1012 — the gate we
    trust was never blind. What the incident DID expose: unit tests and
    schema checks ran only on dev machines, and ci.yml's typecheck
    soft-passed with a swallowed exit code.
    First move: vitest schema-truth test (byte canary on the incident lines,
    bracket-shape + field-resolution lint over every @@index/@@unique/@@id,
    P1012 strictness regression) + a CI unit job (validate + format --check
    + vitest) + a real typecheck gate.

20. **Restore drill** — db:backup runs with an age clock in digest + health
    (#19 Vol.3); no restore has ever been rehearsed. A backup that has never
    been restored is a hope, not a backup.
    First move: scripts/restore-drill.sh — latest backup → throwaway SQLite
    → row-count + sqlite_master assertions → report; documented quarterly
    cadence in the ops runbook.

## Suggested order

Week A: 19 → 2 → 18 → 1 → 20 (truth gates first, then the buy flow)
Week B: 6 → 7 → 9 → 10 (distribution from existing data)
Week C: 3 → 4 → 5 (list intelligence + social proof)
Then: 8 → 11 → 12 → 13 (content velocity) · 14 → 15 → 16 → 17 (the AI layer).
