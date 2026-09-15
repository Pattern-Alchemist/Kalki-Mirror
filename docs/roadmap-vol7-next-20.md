# KALKI — The Next 20, Vol. 7 (Triage, Completion & the First Real Seeker)

> Committed 2026-09-15, post-Vol.6 closeout (Vols. 1–6 = all 100 items
> shipped and verified live; 1154 unit tests across 89 files, CI carrying
> lint · tsc · vitest · build · e2e · lighthouse, 11 Vercel crons + 6
> GitHub Actions scheduled workflows, 70 API routes documented in
> openapi.yaml, 450 static pages including 106 /hi/ twins). The doctrine
> proven across six volumes: the tree is the truth, the gates police the
> operator, founder-gated dependencies do NOT block the machine.
>
> The founding incident of this volume: THE SILENT BREAK. Three live
> alarms surfaced the moment the survey ran — the golden-ask eval cron
> is dead (38h stale, no Vercel backup), the AI chain is degraded again
> (gemma-4-31b-it:free dead, 2/3 alive), and TOTP is still burned
> (admin login weakened). Vol. 6 built the machine; Vol. 7 starts by
> fixing what broke the moment Vol. 6 stopped watching, then completes
> the partial closes Vol. 6 left behind, then addresses the
> discoverability debt the volume accumulated, then measures whether
> the seeker rails actually carry seekers.
>
> Founder-gated carry-overs (NOT counted in the 20): TOTP re-enroll
> (CRITICAL — admin login state unclear), admin password rotate,
> $5–10 OpenRouter credit (chain degraded — this is the fix, not an
> item), GSC OAuth consent (wakes #9 permanently), EMBED_API_KEY
> (wakes #7's bed), Sentry DSN flip (wakes #5's sensor), letters
> sign-off (5 drafts in review), first campaign mint + ?key=
> distribution, testimonial first-seed quotes.

## Tier 25 — Triage: the live alarms — do first

1. **Golden-ask eval cron repair** — the nightly eval.yml workflow
   (Vol. 6 #6) is silently dead: `?finalize=1` returns `{done:0,
   total:17}`, the digest reads "GOLDEN ASK: last run 38h ago (> 25h)
   — eval cron may be dead." The single-case probe `?case=g-001`
   works (ok:true, ms:11560) — the chain is alive, the eval workflow
   is the broken link. No Vercel cron backup; no fallback heartbeat.
   First move: add `/api/cron/ask-eval?finalize=1` as a Vercel cron
   (nightly 03:45 UTC, 15min after the GH workflow — if GH fires,
   the Vercel cron finds a complete bucket and no-ops; if GH fails,
   the Vercel cron is the heartbeat that surfaces the silence). The
   digest's 25h threshold stays — the backup cron is the belt, the
   digest is the suspenders.

2. **Chain rebuild on survivors** — the AI chain is degraded (2/3
   alive, dead: gemma-4-31b-it:free). The Vol. 5 incident class
   returned within 72h of Vol. 6 closeout. The probe-chain.py drill
   (re-built Vol. 6 #2) is scheduled weekly Mon 05:00 UTC — it would
   have caught this today, but the rebuild script is operator-manual.
   First move: re-probe all :free models at contract size (the
   scripts/probe-chain.py --all-free path), rebuild the chain on
   survivors, verify live via the /ask smoke. Then make the rebuild
   semi-automatic: a GH workflow that fires probe-chain.py on
   chain-health alarm (the digest "degraded" line triggers a
   workflow_dispatch via a webhook or a scheduled re-check).

3. **TOTP break-glass + re-enroll** — the TOTP secret is still burned
   (Vol. 6 Week C closeout: "TOTP re-enroll (still burned)"). The
   admin login is either locked or falling back to an un-TOTP'd
   path — the worklog is ambiguous. First move: break-glass via
   Turso (clear the twoFactor fields on the admin row), verify the
   admin login works with password-only, then re-enroll TOTP through
   the settings page + store the new secret in a password manager.
   This is a founder action, but the break-glass is an operator
   action — the founder says "break glass" and the agent clears the
   row. The re-enroll is 2 minutes of founder time once the glass
   is broken.

## Tier 26 — Completion: the Vol. 6 partial closes

4. **Aghori course hi bridge (0/54 lessons)** — Vol. 6 #16 added the
   `hi?: { content: string }` field to CourseLesson but left 0/54
   lessons translated. The interface is ready; the content is the
   sadhu-register work the founder reviews. First move: write the
   54 translations in the sadhu register (same atomic insertion
   pattern as the glossary batches), founder-review the register,
   enroll via a script (scripts/add-aghori-hi-vol7.py). The hi-bridge
   gate extends: aghori lesson hi count ≥ 54. The /hi/ twins for
   /aghori-tantra/[phase]/[lesson] are a separate item (#5).

5. **/hi/ twins for the remaining surfaces** — Vol. 6 #17 shipped
   /hi/glossary/[slug] + /hi/patterns/[slug] (106 pages). The
   sequences, archetypes, usa, and breathwork surfaces are EN-only
   walls — no /hi/ twins. First move: /hi/sequences/[slug] +
   /hi/archetypes/[id] (the two deepest families after glossary +
   patterns). hreflang pairs on the EN sitemap entries. Canonical
   to EN, noindex on the /hi/ twin (same pattern as Vol. 6 #17).
   The breathwork + usa surfaces are lower-priority (lower hi search
   volume); defer to Vol. 8.

6. **Admin a11y retrofit: scope="col" on all tables** — Vol. 6 #18
   documented the contract; only 8/118 cells carry scope="col"
   (analytics/page.tsx has 8 of its 10; the other 10 admin pages have
   zero). 110 cells still need retrofit. First move: add scope="col"
   to every <th> in the 11 admin table components, then enable the
   enforcement scan in tests/lib/a11y-floors.test.ts (walk
   src/app/admin/**, assert every <th> has scope="col"). The gate
   polices the operator too — a new table without scope="col" fails
   CI the moment it lands.

7. **Focus-visible CSS contract** — Vol. 6 #18 documented the
   focus-visible contract but no CSS landed. Every interactive
   element should have a :focus-visible style so keyboard users see
   where they are. First move: add a global :focus-visible style to
   the admin globals (gold outline, 2px offset), a vitest pinning the
   style exists in the compiled CSS, and a Playwright keyboard-
   traversal test on one admin board (tab through the table, assert
   focus-visible is applied). The public surface already has focus
   styles via the wizard tokens; this item is admin-only.

8. **Weekly digest addedAt dead-end** — Vol. 6 #13 acknowledged:
   "Static-arrays dead-end (glossary/patterns have no addedAt) —
   weekly digest reports ONLY letters." The glossary, patterns,
   siddhis, sequences, and breathwork arrays have no per-entry
   addedAt timestamp, so the weekly digest can't report new
   additions. First move: add `addedAt?: string` (ISO date, optional)
   to each static array entry, stamp the existing entries with
   SITE_LASTMOD as a baseline, then the weekly digest's gatherWeeklyContent
   extends to report "N new terms/patterns/siddhis this week" by
   diffing addedAt against the week-start. The snapshot-diff approach
   (storing last week's slug list in OpsState) is the alternative —
   choose per-surface based on which is cheaper.

## Tier 27 — Scale: discoverability + coverage

9. **Ops-script npm manifest** — 16+ committed scripts in scripts/,
   only 3 surfaced as npm aliases (ping:indexnow, db:backup, test:e2e).
   The Vol. 5 evaporation taught "cited scripts must exist"; the
   inverse is now true: existing scripts must be findable. First
   move: add npm aliases for every committed ops script —
   probe:chain, rehearse:failover, rehearse:swap, sweep:production,
   letters:launch, audit:creds, bake:folios, bake:audio, seed:letters,
   seed:testimonials. The package.json scripts section becomes the
   operator's manifest — `npm run` lists every available tool.

10. **Eval cron Vercel backup (#1 deepening)** — item #1 adds the
    Vercel cron as a heartbeat; this item hardens the detection: if
    the eval is STILL stale after both the GH workflow + the Vercel
    cron fire, the digest should escalate from "may be dead" to
    "EVAL DEAD — both crons failed." First move: a second OpsState
    key `eval:golden_ask:heartbeat` written by the Vercel cron (not
    the GH workflow), so the digest can distinguish "GH workflow
    failed but Vercel heartbeat OK" (GH Actions hiccup) from "both
    failed" (real dead). The 2-strike rule extends: the digest
    escalates only when both sources are silent.

11. **Sitemap double-count prevention gate** — the survey confirmed
    no double-count exists today, but the tantra hub lives in
    staticPages while the children live in tantraPagesSitemap — a
    future refactor could silently introduce a duplicate. First
    move: a vitest gate that asserts zero URL overlap between
    staticPages and the dynamic arrays (tantraPagesSitemap,
    aghoriPhasePages, aghoriLessonPages). The census already pins
    "no duplicates" but a targeted overlap test names the exact
    regression class before it happens.

12. **E2E coverage for Vol. 6 surfaces** — 3 spec files for 70+ API
    routes + 18 admin boards + 450 static pages. None of the Vol. 6
    new surfaces have e2e coverage (golden-ask, campaign-key batch,
    letters drill, consultation loop, weekly digest, /hi/ twins, USA
    LocalBusiness). First move: extend e2e/public-flows.spec.ts with
    the /hi/ twin URL check (200 + noindex + canonical-to-EN), the
    USA LocalBusiness JSON-LD presence, and the /api/cron/ask-eval
    401 gate. The authed spec extends with the keys batch-mint form
    render + the redeem ?key= autofill. The e2e layer stays thin but
    covers the highest-signal Vol. 6 surfaces.

13. **Worklog count reconciliation** — the Vol. 6 closeout claims
    "88 files" but the live count is 89. The "tree is the truth"
    doctrine means the worklog should match the tree. First move:
    a vitest gate that asserts the test-file count (via fs.readdir)
    matches a constant in the worklog or a CI artifact — so the
    next closeout can't miscount. The gate is self-documenting: it
    names the expected count, and the closeout references the gate's
    constant, not a hand-typed number.

## Tier 28 — Activation: the seeker funnel measurement

14. **Letters launch: the first real publish** — 5 draft letters sit
    in review; scripts/launch-letters.sh (Vol. 6 #12) has never fired
    with real content; the sitemap shows 0 public letters. First
    move: founder signs off on the 5 drafts, the agent runs
    `bash scripts/launch-letters.sh` — publish flip → sitemap/feed/OG
    verification → IndexNow ping. The drill's exit code IS the proof.
    This is the item that unblocks the seeker funnel: the weekly
    digest (#13) has content to send, the letters hub has cards to
    render, the /letters/[slug] OG cards land in the first shares.

15. **Campaign key first mint + distribution** — 0 redeemed; the
    batch-mint UI exists (Vol. 6 #11) but no campaign has been
    minted. First move: founder mints 10 keys with campaign:
    "guhya-halloween-oct26", distributes the ?key= deep-links (e.g.
    /redeem?key=KALKI-XXXX-XXXX) via the chosen channel. The
    redeemedCode stamp on consultations (Vol. 6 #11) is the
    attribution bridge — the war-room can finally measure
    campaign→consultation conversion.

16. **Testimonial first-seed** — the TestimonialWall renders nothing
    while empty; the t+14d follow-up loop (Vol. 5 #14) is wired but
    has 0 COMPLETED consultations to fire on. First move: founder
    enters 2–3 historical consented quotes via /admin/testimonials,
    the wall renders its first social proof, the t+14d loop has a
    template to follow when the first real consultation completes.

17. **Seeker funnel measurement panel** — the war-room has the
    list-funnel cohort (Vol. 4 #3) and the consultation funnel
    (Vol. 2 #7), but no panel measures the end-to-end conversion:
    campaign key minted → key redeemed → consultation submitted →
    consultation completed → testimonial collected. First move:
    a war-room panel that joins InviteCode.campaign → Consultation.redeemedCode
    (Vol. 6 #11 bridge) → Consultation.outcome → TestimonialFollowUp.
    The panel reads existing data; no new schema. The "first hundred
    seekers" tier (Vol. 6 Tier 23) finally has a measurement layer.

18. **The weekly digest's first real send** — Vol. 6 #13's weekly
    digest has never sent to real subscribers (0 letters published =
    no content). Once #14 publishes the letters, the weekly digest
    cron (Monday 17:30 IST) fires with real content for the first
    time. First move: verify the cron fires (check the EmailSend
    ledger for kind:"weekly" rows), verify the 3 active subscribers
    receive it, verify the UTM-tagged links are clickable. This is
    the proof the rail works end-to-end.

19. **Geo funnel events verification** — the list-funnel has no geo
    dimension (Vol. 6 #15 survey confirmed). The USA LocalBusiness
    JSON-LD is live but the geo funnel doesn't track whether hi
    seekers from India or US seekers from Austin actually convert.
    First move: add a `country` field to the list-funnel cohort
    (derived from the existing `kr_country` cookie the middleware
    already sets), so the weekly cohort report shows "N joined from
    US, M joined from IN." The USA layer's ROI becomes measurable.

20. **The first hundred seekers retrospective** — once items 14–19
    land and the funnel carries real seekers, the retrospective:
    what worked, what didn't, what's the next bottleneck. First
    move: a docs/vol7-retrospective.md that reviews the conversion
    data (campaign→consultation→testimonial), the chain stability
    (how many times did gemma die?), the eval reliability (how many
    nights did the eval actually fire?), and the hi corpus ROI (are
    /hi/ pages getting impressions?). The retrospective IS the Vol. 7
    closeout — and the Vol. 8 enlistment input.

## Suggested order

Week A: 1 → 2 → 3 (triage — the live alarms first)
Week B: 4 → 5 → 6 → 7 → 8 (completion — the Vol. 6 partial closes)
Week C: 9 → 10 → 11 → 12 → 13 (scale — discoverability + coverage)
Week D: 14 → 15 → 16 → 17 → 18 → 19 → 20 (activation — the seeker funnel + retrospective)
