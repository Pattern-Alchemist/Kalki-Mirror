# KALKI — The Next 20, Vol. 6 (Permanence, Proof & the First Hundred Seekers)

> Committed 2026-09-12, post-Vol.5 closeout (Vols. 1–5 = all 100 items shipped
> and verified live; 951 unit tests across 74 files, CI carrying lint · tsc ·
> vitest · build · e2e · lighthouse, 9 crons, 27 models, 70 API routes, 18
> war-room panels, 11 GitHub workflows). Two ops days after closure caught and
> fixed live rot (chain rebuilt on survivors at contract size, the walk gate,
> Cloudinary at the source, audit trigger repaired) and the time-critical
> founder gate closed: TOTP enrolled and proven end-to-end on 2026-09-09,
> three days ahead of grace. Every item below cites what already exists and
> what dead-ends. Zero-cost bias throughout (free tiers only).
>
> The founding incident of this volume: the EVAPORATION. Five tools the record
> calls permanent — probe-chain.py ("saved as a permanent script"),
> smoke-page-weight.sh and rehearse-turso-failover.sh (both committed to
> worklog with live-pass verdicts), production-sweep.py (the 54/54 sweeper)
> and ping-indexnow.sh (wired into package.json) — have ZERO git history.
> They lived sandbox-local, died with the sandbox, and two days of ops
> tooling now exists only as prose. A discipline that lets the record drift
> from the tree is the same silent-rot class Vol. 5 fought on models and
> credentials — this volume makes the TREE the truth, then spends the
> vigilance dividend on whether the machine is not just alive but RIGHT,
> and on the first hundred seekers the rails were built for.
>
> Founder-gated carry-overs (NOT counted in the 20): letters content
> sign-off (one command once signed — item 12 builds the command),
> EMBED_API_KEY neural swap (item 7 builds the bed it lands on), GSC
> OAuth + service account (item 9 wakes same-day when it lands), Turso
> vault token rotation, testimonial first-seed quotes, Sentry DSN flip
> (item 5 makes it one env var).

## Tier 21 — Permanence: the tree is the truth — do first

1. **Repo-truth gate (the evaporation gate)** — five scripts cited by the
   record have zero git history: probe-chain.py, smoke-page-weight.sh,
   rehearse-turso-failover.sh, production-sweep.py, ping-indexnow.sh — the
   last wired into package.json (`npm run ping:indexnow` is broken TODAY).
   A worklog that claims permanence for sandbox-local files is a lie the
   next reset exposes. First move: vitest gate scanning worklog.md, docs/**
   and package.json for `scripts/…` paths and asserting each exists in the
   tree (fail with the missing list); the five ghosts named in the gate
   itself until items 2–4 re-materialize them; ops work is committed from
   birth, never sandbox-local.

2. **The drills come home** — the page-weight DIET survived (six hubs slimmed,
   budgets documented) but its ENFORCEMENT script died; the failover rehearsal
   passed 18/18 and left only its runbook; the contract-size probe that twice
   rebuilt the chain survives as methodology without a tool. First move:
   rebuild all three as committed scripts from their documented specs —
   smoke-page-weight.sh (hub < 250KB / detail < 120KB over the hub + detail
   inventory), rehearse-turso-failover.sh (static surfaces 200 on the baked
   sqlite, dynamic fail honest, nothing hangs), probe-chain.py (real /ask
   contract prompt, real-size chunks, parseAskOutput strictness, 12s budget,
   per-model verdict) — each verified live once, ghost list in #1 to zero.

3. **The drills run themselves** — a drill that needs a human, a sandbox and
   a memory is a ritual, not a guard; restore-drill.yml already proves the
   pattern. First move: a scheduled GitHub workflow running page-weight +
   failover + chain probe weekly with verdicts as artifacts, digest alert
   line when any drill fails or goes stale > 8 days, probe-chain.py exposed
   via workflow_dispatch — the next chain rot is probed with one click, not
   one archaeology.

4. **The sweep goes permanent** — production-sweep.py ran 54/54 twice and
   evaporated; production truth now lives only in worklogs. First move:
   commit the sweeper generalized from its documented checks (core pages
   200, /ask noindexed, sitemap canonical composition, soft-404 noindex,
   robots/feed/llms.txt, cron + admin gates 401, JSON-LD valid, health
   green), weekly scheduled run against production, failure → digest alert;
   the quarterly full sweep becomes a button, not a rebuild.

5. **Error plane: Sentry, wired and waiting** — withSentryConfig and the
   sentry config files are already in the tree and uptime.yml documents the
   posture, but no DSN is set: application errors die in serverless logs
   nobody reads (the #24-class blind spot uptime cannot see). First move:
   release-health wiring + source-map upload in the deploy workflow + digest
   alert line for new-issue spikes, all behind the env gate (no DSN = honest
   no-op); the founder flips one variable and error tracking wakes with zero
   new plumbing — the #12 posture, applied to errors.

## Tier 22 — Proof: from "is it alive" to "is it right"

6. **/ask golden-set eval harness** — every gate pins MECHANICS (walk gate,
   parseAskOutput strictness, silence floors, latency budget) and nothing
   scores whether ANSWERS are right; the live-traffic silence on ops-day2
   was found by a human typing a question. First move:
   content/golden-ask-set.json (~25 questions: expected grounded verdicts,
   expected citation families, honest-silence traps from OUTSIDE the
   corpus), nightly cron firing the real contract at real size, per-question
   verdict + latency into OpsState, war-room "answer quality" panel, digest
   line when any golden answer drifts. The eval set is the contract the
   chain must walk, enforced nightly.

7. **Hybrid retrieval bed (the neural swap's landing)** — the EMBED_API_KEY
   swap is rehearsed to one command and bake-folio-embeddings.ts +
   swap-readiness.test.ts exist, but retrieval reads no vectors: the swap
   would land on a bed that cannot feel it. First move: hybrid scoring
   behind the embedding gate — vectors present → RRF merge of lexical rank
   and cosine rank; absent → today's lexical path byte-identical; vitest
   pins both modes and the merge order; the founder-gated swap then flips
   retrieval quality with zero new plumbing.

8. **OpenAPI payload truth III** — the documentation census (Vol.5 #19)
   pins presence and prose; the spec declares no request/response SCHEMAS,
   so a handler can drift its payload and every gate stays green. First
   move: declare schemas for the public contract surface first (/api/ai/
   ask, /api/events, /api/subscribe, /api/initiate, /api/keys/redeem,
   /api/health), vitest validating fixture payloads against the compiled
   spec, the admin tail batched after; the census gains a "schema declared"
   column so the gap stays visible.

9. **Search Observatory engine, credential-gated** —
   docs/seo/search-observatory-phase-b.md is an implementation-ready spec
   marked DESIGNED, NOT BUILT (waits on GSC service-account credentials).
   The queue (Vol.5 #12) removed the indexing cliff; the observatory is the
   analytics cliff. First move: build it NOW, gated — SeoSnapshot model,
   ingestion runner (query, impressions, position, CTR per landing page),
   opportunity scoring per the spec's pipeline, war-room panel;
   credentialGate() no-ops until GSC_SERVICE_ACCOUNT_JSON arrives, and the
   "what are Americans searching for" pipeline wakes same-day.

10. **The abuse gate** — /api/keys/redeem and /api/events carry NO limiter
    (this cycle's survey): redeem is a credential oracle (code-guessing
    surface), events is an open write relay that can poison the funnel
    panels; subscribe/initiate limit per-instance only. First move: shared
    public-write limiter rail on the Turso counter store (#3's backend),
    per-route windows (redeem strict, events looser but capped), burst +
    roll-over vitest pins, health self-test extended; Turnstile stays OUT
    (founder-gated) — the rail is the item.

## Tier 23 — The first hundred seekers: rails exist, zero conversions

11. **Campaign key batches** — 3 keys minted, 0 redeemed, each key a separate
    admin action with no campaign attribution; the guhya Halloween gate (Oct
    26) has a war-room panel but nothing it can hand out. First move: batch
    mint (count + tier + expiry + campaign tag) in the keys board, ?key=
    deep-link auto-fill on /redeem, per-campaign redemption rows in the
    funnel; a campaign becomes an instrument, not a hope.

12. **Letters launch: the one-command drill** — five launch letters sit in
    founder-review drafts and docs/letters-launch-checklist.md is a manual
    ritual (flip → verify sitemap/feed/hub → ping → broadcast);
    /letters/[slug] has no opengraph-image.tsx, so the first shares fall
    back to the generic card. First move: scripts/launch-letters.sh —
    publish flip → post-publish verification (sitemap item, feed item, hub
    card within one rebuild) → IndexNow ping → optional subscriber broadcast
    on the EmailSend rail; bespoke OG cards + orphan-guard registration join
    the factory. The founder's sign-off becomes one reviewed command.

13. **The seeker digest (weekly)** — the founder gets a daily ops digest;
    the subscriber list gets the 10 Doors course and transactional mail and
    then silence. First move: weekly digest route reusing the course-send
    rail — the week's new public letters/archive/glossary additions, one
    letter spotlight, UTM-tagged links (the door board already rolls up
    utm_content), DoubleOptIn posture untouched, every send in the EmailSend
    ledger; the list funnel finally gets a weekly beat to measure.

14. **Consultation outcome loop** — consultations: 0. The intake, the AI
    screen, the +14d testimonial follow-up and the wall all exist, but
    nothing nudges a PENDING request that is aging and nothing tells the
    founder one is stuck. First move: digest block for pending/stale
    consultation states with ages, a 48h completion-nudge template on the
    existing email machinery, war-room consultations panel gains an age
    column; the first real consultation cannot fall through the floor.

15. **USA depth II: the local-pack layer** — 10 usa URLs rank for nothing;
    city pages carry FAQPage JSON-LD but no entity-grade local data, and
    the service pages have no grid linking to the cities. First move:
    LocalBusiness JSON-LD (areaServed, priceRange, sameAs) on the four city
    pages, city ↔ service cross-link grid, geo funnel events verified in
    the list-funnel, census floors updated (usa 6 → 10) — the local-intent
    bid goes in before the campaign lands.

## Tier 24 — Reach & never-regress III

16. **hi wall: the completion batch** — 60 glossary terms + 10 pattern folios
    carry hi; the remaining 26 terms, all 54 aghori lessons and the
    sequences/archetypes/usa surfaces are EN-only walls. First move: final
    26 terms plus the lesson-preview bridge (the page-weight diet already
    reduced lessons to previews — bridge those), founder-review sadhu
    register, atomic insertions; parity gates scale as before and the hi
    seeker gets the whole spine in one volume.

17. **hi URLs: the locale path decision** — hi is served on the SAME URLs by
    the lexicon-bridge picker (EN fallback invariant), so Google cannot
    route a hi seeker to hi content: the corpus is invisible to the very
    audience it learned to serve. First move: /hi/ prefixed twins for the
    two deepest families (glossary, patterns), hreflang pairs in the
    sitemap, canonical-to-EN until a hi twin exists, census floors for the
    new class bounded both ways; the picker's EN-fallback invariant keeps
    untranslated slugs honest.

18. **A11y floors II** — lighthouse gates accessibility ≥ 0.85 as ERROR but
    only on 6 URLs; the 18 admin boards' tables and forms have no keyboard
    or focus contract; contrast.test.ts guards one dimension. First move:
    lighthouse URL list extended across every hub family + one letters
    detail + one auth-scoped admin board, keyboard-trap + focus-visible
    vitest on the shared table/form primitives, the a11y budget pinned in
    ci.yml where the other gates live.

19. **Sitemap floor hygiene: census II** — floors are hand-maintained
    constants (usa documents "+4 cities → 10 today" while its floor says 6);
    a floor that lags truth turns the tripwire into a formality. First
    move: floors derived from canonical counts where computable, letters
    floors flip WITH the publish flip (1 → 6 asserted both ways so a
    half-published launch fails loud), stale-floor detector warning in the
    digest when a floor sits > 20% under live count two runs running,
    new-class registration stays mandatory.

20. **Restore drill III + the December cadence** — the quarterly drill falls
    due ~December and now inherits three lineages: the restore path
    (Vol.4 #20), the failover rehearsal (Vol.5 #20, script re-materialized
    by #2), and the corpus fingerprint. First move: one combined quarterly
    command — restore the latest backup, integrity-hash the corpus, run the
    failover rehearsal, spot-check page weights — outcome into OpsState +
    digest, runbook cadence table updated so the drill is dated, owned and
    unskippable; the first scheduled run IS the December proof.

## Suggested order

Week A: 1 → 2 → 3 → 4 → 5 (permanence first — the evaporation incident wrote the spec)
Week B: 6 → 7 → 8 → 9 → 10 (proof: golden set, retrieval bed, payload schemas, observatory, abuse gate)
Week C: 11 → 12 → 14 → 13 (seekers: key batches, letters drill, consultation loop, seeker digest)
Then: 15 → 16 → 17 → 18 → 19 → 20 (USA depth, hi completion + URLs, a11y, census II, the December drill)
