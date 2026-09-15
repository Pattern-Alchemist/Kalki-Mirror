# KALKI — The Next 20, Vol. 8 (Self-Healing, Stability & the Measurement Layer)

> Committed 2026-09-15, post-Vol.7 closeout (Vols. 1–7 = all 140 items
> shipped and verified live; 1161 unit tests across 91 files, 466 static
> pages, 12 Vercel crons + 16 GitHub Actions workflows, 70 API routes,
> 106 /hi/ locale twins). The doctrine proven across seven volumes:
> the tree is the truth, the gates police the operator, founder-gated
> dependencies do NOT block the machine.
>
> The founding incident of this volume: THE RECURRING BREAK. Vol. 7
> started by fixing three live alarms — but the chain degraded again
> within hours of the Vol. 7 closeout (the 4th rebuild since Sep 8),
> the eval is STILL dead (46h stale — the GH workflow keeps failing),
> and the TOTP is cleared but not re-enrolled. The pattern is clear:
> free-tier chains rot every ~72h, the GH Actions eval workflow is
> unreliable, and the founder's $5-10 OpenRouter credit is the single
> fix that stops the rot cycle. But while waiting for the founder,
> the machine must self-heal. Vol. 8 builds the self-healing layer,
> completes the remaining content tasks, and adds the measurement
> layer that proves the seeker rails actually carry seekers.
>
> Founder-gated carry-overs (NOT counted in the 20): $5–10 OpenRouter
> credit (the single fix for chain rot — turns free-tier into paid-
> stable), GSC OAuth consent, EMBED_API_KEY, Sentry DSN flip, letters
> sign-off (5 drafts), first campaign mint, testimonial first-seed,
> TOTP re-enroll (currently cleared — admin is password-only).

## Tier 29 — Self-healing: the machine that fixes itself

1. **Eval self-healing cron** — the GH eval.yml workflow keeps dying
   (46h stale, the CRON_SECRET repo secret is likely missing on GitHub).
   The Vercel cron heartbeat (Vol. 7 #1) checks the bucket at 03:45
   UTC but can't run cases within the 60s hobby limit. First move:
   a Vercel cron that calls `?case=run_all` at 04:00 UTC (15 min after
   the heartbeat's finalize check). On hobby, run_all runs ~4 cases
   before the 60s timeout — the bucket is idempotent (cases overwrite
   by id), so 5 cron invocations at 5-minute intervals complete all
   17 cases across ~25 minutes. Add 5 Vercel crons: 04:00, 04:05,
   04:10, 04:15, 04:20 — each runs 3-4 cases, the 6th at 04:25 calls
   finalize. The eval is now self-healing: even if the GH workflow
   never fires, the Vercel crons complete the eval every night.

2. **Chain auto-rebuild trigger** — the chain has been rebuilt 4 times
   since Sep 8 (liquid→openrouter→gemma, inclusionai, poolside→
   inclusionai). Each time, the chain-health cron (Vol. 5 #1) detects
   degradation but the rebuild is operator-manual. First move: a GH
   workflow that fires when the chain-health OpsState marker shows
   `chainOk: false` — the workflow runs probe-chain.py --all-free,
   selects the 3 fastest survivors within budget, and opens a PR with
   the updated DEFAULT_MODELS. The founder merges the PR (or the agent
   does). The chain-health cron becomes the trigger, not just the alarm.

3. **Chain-health cron re-probe on deploy** — the chain-health OpsState
   marker (Vol. 5 #1) is stale after each chain rebuild — the cron
   probes the OLD chain, not the new one. The digest shows "dead:
   gemma-4-31b-it:free" even though gemma was dropped in Vol. 7. First
   move: the chain-health cron re-probes `resolveModelChain()` (reads
   from source code, not OpsState), so the probe always tests the
   CURRENT chain. The cron fires daily at 02:15 UTC — after the probe,
   the OpsState marker reflects the actual chain, not a stale snapshot.

4. **Digest alarm escalation** — the digest reports "GOLDEN ASK: eval
   cron may be dead" but there's no escalation beyond the morning email.
   First move: the digest gains a second alarm tier — if the eval is
   > 50h stale (2 consecutive nights), the digest line changes from
   SOFT to ALERT (same 2-strike rule as the eval itself). If > 72h,
   the digest body includes a "FOUNDER ACTION NEEDED" line. The alarm
   is honest: it names the fix (add CRON_SECRET to GitHub repo secrets)
   in the digest body so the founder can act without reading the worklog.

5. **The ops dashboard** — the war-room has 18 panels but no single
   view that answers "is the machine healthy right now?" The daily
   digest is the morning email; the war-room is the deep dive. First
   move: a `/admin/ops` dashboard that surfaces the top-line metrics
   in one screen: health status, chain alive count, eval last-run age,
   backup age, drill staleness, observatory status, 429 count. The
   dashboard reads the same OpsState keys the digest reads — zero new
   schema, just a different rendering. The founder opens one URL and
   sees the machine's state.

## Tier 30 — Stability: the remaining content + measurement

6. **Aghori hi translations: the full 54** — Vol. 7 #4 proved the bed
   (8/54, one per phase). The remaining 46 follow the same pattern.
   First move: write the 46 translations in the sadhu register (the
   content task), enroll via the committed script, extend the hi-bridge
   gate to assert ≥ 54. The /hi/ twins for /aghori-tantra/ are a
   separate item (#7).

7. **/hi/ twins for aghori-tantra** — Vol. 7 #5 extended /hi/ twins
   to sequences + archetypes. The aghori-tantra course (8 phases + 54
   lessons = 62 URLs) is the deepest content surface and has no /hi/
   twins. First move: /hi/aghori-tantra/[phase] + /hi/aghori-tantra/
   [phase]/[lesson] routes, hreflang on the EN sitemap entries.
   Canonical to EN, noindex on the /hi/ twin. 62 new static pages.

8. **Geo funnel dimension** — Vol. 7 #19 deferred. The middleware
   already sets a `kr_country` cookie (7-day TTL). The list-funnel
   cohort has no country field. First move: add `country` to the
   FunnelSubscriber interface + the list-funnel-db gather, so the
   weekly cohort report shows "N joined from US, M joined from IN."
   The USA layer's ROI becomes measurable.

9. **Seeker funnel measurement panel** — Vol. 7 #17 deferred. The
   war-room has the list-funnel + the consultation funnel, but no
   panel measures the end-to-end conversion: campaign key minted →
   key redeemed → consultation submitted → consultation completed →
   testimonial collected. First move: a war-room panel that joins
   InviteCode.campaign → Consultation.redeemedCode (Vol. 6 #11 bridge)
   → Consultation.outcome → TestimonialFollowUp. The panel reads
   existing data; no new schema. The "first hundred seekers" tier
   finally has a measurement layer.

10. **Weekly digest addedAt: the ContentEntry path** — Vol. 7 #8
    acknowledged the dead-end (static arrays have no addedAt). The
    ContentEntry table DOES have `publishedAt` — the weekly digest
    can report new ContentEntry publications this week. First move:
    extend gatherWeeklyContent to query ContentEntry where
    publishedAt >= weekAgo, report the count + slugs in the digest.
    The static-array dead-end (glossary/patterns) stays open — the
    ContentEntry path covers the studio surface, which is the one
    that actually publishes new content.

## Tier 31 — Coverage: the e2e + gate layer

11. **E2E coverage: the public Vol. 6 surfaces** — Vol. 7 #12 deferred.
    3 spec files for 70+ API routes + 466 static pages. First move:
    extend e2e/public-flows.spec.ts with: /hi/glossary/<slug> 200 +
    noindex check, /hi/sequences/<slug> 200, /hi/archetypes/<id> 200,
    /usa/austin LocalBusiness JSON-LD presence, /api/cron/ask-eval
    401 gate. The e2e layer stays thin but covers the highest-signal
    new surfaces.

12. **Admin scope="col" enforcement gate** — Vol. 7 #6 retrofitted
    99/99 cells. The contract test (Vol. 6 #18) is a placeholder.
    First move: enable the enforcement scan in tests/lib/a11y-floors.
    test.ts — walk src/app/admin/**, assert every <th> has
    scope="col". A new admin table without scope="col" fails CI the
    moment it lands. The gate polices the operator.

13. **The npm run manifest gate** — Vol. 7 #9 added 7 npm aliases. But
    there's no gate asserting that every committed script in scripts/*
    has a corresponding npm alias. First move: a vitest gate that walks
    scripts/*.sh, scripts/*.py, scripts/*.mjs, scripts/*.ts (excluding
    the schema appliers which are npx tsx only) and asserts each has
    a matching npm script. The Vol. 5 evaporation inverse is now
    enforced: the operator can find every tool via `npm run`.

14. **OpenAPI census: the Vol. 7 routes** — Vol. 7 added new routes
    (run_all mode on ask-eval, the /hi/ twins). The OpenAPI census
    gate (Vol. 5 #19) catches missing routes — verify all Vol. 7
    routes are documented. First move: run the census, add any missing
    entries. The gate is self-enforcing but needs a pass after each
    volume.

15. **The restore-drill manual fire** — Vol. 7 #20 wired the restore-
    drill to the drill ledger, but the first scheduled fire is Oct 2.
    The digest says "never reported." First move: trigger the restore-
    drill workflow manually via workflow_dispatch, verify the verdict
    POSTs to /api/cron/drill-status, verify the drill ledger row
    appears. The "never reported" alarm clears. The December cadence
    (Vol. 6 #20 schedule) is proven.

## Tier 32 — The seeker funnel: activation measurement + Vol. 9 input

16. **Letters launch readiness check** — the 5 draft letters need the
    founder's sign-off. First move: a readiness check that verifies
    the drill path is unblocked — scripts/launch-letters.sh runs
    against staging with 0 letters published (proves the sitemap/
    feed/OG verification works on an empty archive), then the founder
    signs off and the drill runs for real. The drill's exit code IS
    the proof.

17. **Campaign key first-mint measurement** — 0 redeemed. The batch-
    mint UI exists (Vol. 6 #11). First move: verify the campaign
    attribution path end-to-end — mint 3 test keys with campaign:
    "smoke-test", redeem 1 via /redeem?key=, verify the consultation
    stamp, verify the war-room shows the campaign in the keys table.
    The bridge is proven before the founder distributes real keys.

18. **The weekly digest first-send verification** — depends on #16
    (letters published). First move: once letters are live, verify
    the weekly digest cron fires (check EmailSend ledger for
    kind:"weekly" rows), verify the 3 active subscribers receive it,
    verify the UTM-tagged links are clickable. This is the proof the
    rail works end-to-end.

19. **The first hundred seekers retrospective** — once #16-18 land and
    the funnel carries real seekers, the retrospective reviews: what
    worked, what didn't, what's the next bottleneck. First move:
    docs/vol8-retrospective.md that reviews the conversion data,
    the chain stability record (how many rebuilds this volume?), the
    eval reliability (did the self-healing crons work?), and the
    Vol. 9 enlistment input. The retrospective IS the Vol. 8 closeout.

20. **Vol. 9 enlistment: the founder decision** — after 8 volumes
    (160 items), the codebase is feature-complete for the current
    product scope. Vol. 9 is a founder decision: continue building
    new features (the /hi/ twins for breathwork + usa, the aghori
    course full hi, the e2e depth), OR shift to growth (SEO, content
    marketing, the campaign launch for guhya-halloween-oct26). First
    move: present the decision in the retrospective with the data
    (conversion rates, chain stability, eval reliability) so the
    founder can choose. The agent's recommendation is documented but
    the decision is the founder's.

## Suggested order

Week A: 1 → 2 → 3 → 4 → 5 (self-healing — the machine that fixes itself)
Week B: 6 → 7 → 8 → 9 → 10 (stability — content + measurement)
Week C: 11 → 12 → 13 → 14 → 15 (coverage — e2e + gates)
Week D: 16 → 17 → 18 → 19 → 20 (activation + retrospective + Vol. 9 input)
