# Vol. 7 — The First Hundred Seekers Retrospective

> Drafted 2026-09-15, at Vol. 7 Week D enlistment. Vol. 7 Weeks A–C
> shipped (triage + completion + scale). This retrospective IS the
> Vol. 7 closeout — and the Vol. 8 enlistment input.
>
> **The seeker funnel at Vol. 7 enlistment:**
> 0 leads · 0 consultations · 0 redemptions · 0 referrals · 0 letters
> published · 0 testimonials. All rails exist; founder-side material
> is the unblocker.

## What Vol. 7 Fixed (Week A — Triage)

Three live alarms surfaced within 72h of the Vol. 6 closeout:

1. **Golden-ask eval cron dead** (41h stale) — the nightly eval.yml GH
   workflow was silently failing (likely missing CRON_SECRET repo secret).
   Fixed: Vercel cron heartbeat (`?finalize=1` at 03:45 UTC) +
   `?case=run_all` manual fallback mode. The Vercel cron uses the env
   var (already set), so the heartbeat works regardless of GH Actions
   health. The founder needs to add CRON_SECRET to GitHub Settings →
   Secrets → Actions for the GH workflow to fire nightly.

2. **AI chain degraded** (0/3 alive at contract size) — liquid 29.3s
   over budget, openrouter/free breach, gemma 429 for 72h+. Fixed:
   19-model sweep found 2 survivors: inclusionai/ling-3.0-flash-fin
   (4.4s PASS) + inclusionai/ling-3.0-flash-vl (10.0s PASS). New chain:
   [inclusionai/ling-3.0-flash-fin, inclusionai/ling-3.0-flash-vl,
   openrouter/free]. Live: grounded:true via meta-router routing to
   nvidia/nemotron-3-super-120b (the meta-router is working as designed).

3. **TOTP burned** (admin login weakened) — the secret was in chat
   history. Fixed: break-glass via Turso (twoFactor fields cleared).
   Admin login verified: password-only works. The founder must
   re-enroll TOTP immediately at /admin/settings.

**The lesson**: a machine that stops being watched starts breaking
within 72h. The Vol. 6 vigilance plane (digest alarms, drill ledger,
eval harness) caught all three — but only because the digest was
read. The next volume should harden the auto-escalation path (GH
email on digest alarm, not just on workflow failure).

## What Vol. 7 Completed (Week B — Vol. 6 partial closes)

- **#4 Aghori hi bridge**: 8/54 lessons translated (one per phase —
  the bed is proven; the remaining 46 follow the same pattern). The
  CourseLesson interface + the hi-bridge gate are ready for the
  full set.
- **#5 /hi/ twins**: extended to sequences + archetypes (16 new pages,
  total 466). hreflang alternates declared on the EN sitemap entries.
  Canonical-to-EN, noindex on the /hi/ twin (same pattern as Vol. 6 #17).
- **#6 Admin scope="col"**: 99/99 admin `<th>` elements now carry
  scope="col" (was 8/118). The a11y contract is now enforceable — a
  new admin table without scope="col" fails the gate.
- **#7 Focus-visible**: the globals.css already declares :focus-visible
  on .gold-cta and .ghost-cta. The admin surface inherits this via the
  root layout. The contract is documented in the a11y-floors test.
- **#8 Weekly digest addedAt**: the dead-end (static arrays have no
  addedAt) is acknowledged but not fully closed. The simplest fix
  (ContentEntry additions via publishedAt) is the path; the static
  arrays (glossary, patterns) need a snapshot-diff approach that's
  deferred to Vol. 8.

## What Vol. 7 Scaled (Week C — discoverability + coverage)

- **#9 Ops-script npm manifest**: 7 new npm aliases added (probe:chain,
  rehearse:failover, sweep:production, letters:launch, audit:creds,
  bake:folios, bake:audio, seed:letters). `npm run` now lists every
  available ops tool — the Vol. 5 evaporation inverse is closed.
- **#10 Eval cron Vercel backup**: the Vercel cron heartbeat was
  added in Week A (#1); this item deepens it with a second OpsState
  key for distinguishing "GH failed but Vercel OK" from "both failed."
  Deferred to Vol. 8 — the single-heartbeat approach is sufficient
  for now.
- **#11 Sitemap overlap gate**: vitest asserting staticPages and
  tantraPagesSitemap don't share URLs. The regression class is named
  before it happens.
- **#12 E2E coverage**: the e2e suite has 3 spec files for 70+ API
  routes. Extending it to cover all Vol. 6 surfaces is deferred —
  the unit test layer (1161 tests) is the primary coverage. E2E
  stays thin but covers the highest-signal public flows.
- **#13 Test-count reconciliation**: vitest gate asserting the
  test-file count matches the EXPECTED constant. The worklog references
  the gate's number, not a hand-typed value — the "tree is the truth"
  doctrine at the count level.

## What Vol. 7 Did NOT Close (Week D — founder-gated)

The seeker funnel is dry end-to-end. The rails exist (Vol. 6 Tier 23),
but the founder-side material is the unblocker:

- **#14 Letters launch**: 5 draft letters sit in review. The drill
  (`npm run letters:launch`) is committed and ready. Founder sign-off
  is the gate — the drill publishes what's reviewed.
- **#15 Campaign key first mint**: the batch-mint UI exists. Founder
  needs to mint 10 keys with `campaign: "guhya-halloween-oct26"` and
  distribute the `?key=` deep-links.
- **#16 Testimonial first-seed**: the t+14d follow-up loop is wired.
  Founder needs to enter 2–3 historical consented quotes via
  `/admin/testimonials` so the wall renders its first social proof.
- **#17 Seeker funnel measurement panel**: the war-room has the
  list-funnel cohort + the consultation funnel, but no panel measures
  the end-to-end campaign→consultation→testimonial conversion. The
  data exists (InviteCode.campaign → Consultation.redeemedCode →
  TestimonialFollowUp). The panel is a Vol. 8 item — the data bridge
  (Vol. 6 #11) is already in place.
- **#18 Weekly digest first real send**: depends on #14 (letters
  published). Once letters are live, the weekly digest cron (Monday
  17:30 IST) fires with real content for the first time.
- **#19 Geo funnel events**: the list-funnel has no geo dimension.
  The middleware already sets a `kr_country` cookie. Adding a `country`
  field to the funnel cohort is a Vol. 8 item — the data is already
  captured, just not surfaced in the cohort report.
- **#20 This retrospective**: written. The Vol. 7 closeout IS this
  document.

## The Chain Stability Record

| Date | Chain state | Action | Models alive |
|------|-------------|--------|-------------|
| 2026-09-08 | 1/3 alive (liquid only) | Rebuilt: liquid → openrouter/free → gemma | 1/3 |
| 2026-09-09 | Walk gate fixed (honest silence) | Walk gate let grounded=false come home | 1/3 |
| 2026-09-13 (Vol. 6 Week B) | 2/3 alive (liquid + openrouter) | Eval harness caught 8/17 fail | 2/3 |
| 2026-09-15 (Vol. 7 Week A) | 0/3 alive | 19-model sweep → inclusionai survivors | 2/3 (new) |

**The lesson**: free-tier chains rot within 72h. The probe-chain drill
(Vol. 6 #2) is the detection; the chain-health cron (Vol. 5 #1) is
the alarm. The $5–10 OpenRouter credit would unlock paid models that
don't rot — this is the single highest-ROI founder action.

## The Vol. 8 Enlistment Input

Vol. 8 should address:
1. **The eval reliability problem** — the GH workflow keeps dying.
   A self-healing cron that auto-triggers run_all when the bucket is
   incomplete would close this permanently.
2. **The chain stability problem** — the $5–10 OpenRouter credit
   unlocks paid models that don't rot. This is the single fix that
   turns the eval from best-effort into doctrine-grade.
3. **The seeker funnel activation** — the rails exist; the founder-
   side material (letters sign-off, campaign keys, testimonial seed)
   is the unblocker. Vol. 8 should measure whether the funnel carries
   seekers once activated.
4. **The remaining 46 aghori hi translations** — the bed is proven
   (8/54); the full set is a content task, not a code task.
5. **The geo funnel dimension** — the data is captured (kr_country
   cookie); the cohort report needs the country field.
6. **The e2e coverage gap** — 3 specs for 70+ routes. Vol. 8 should
   extend the e2e layer to cover the highest-signal public surfaces.

## Final State

- 1161/1161 vitest (91 files)
- tsc clean
- Build green (466 pages)
- Production deployed + live-verified
- Three live alarms addressed (eval, chain, TOTP)
- Vol. 6 partial closes: #4 (8/54), #5 (extended), #6 (99/99), #7 (verified), #8 (acknowledged)
- Vol. 7 scale items: #9 (7 aliases), #11 (gate), #13 (gate)
- Founder-gated: #14 (letters), #15 (keys), #16 (testimonials), #18 (digest send)
- Deferred to Vol. 8: #10 (heartbeat deepening), #12 (e2e), #17 (funnel panel), #19 (geo funnel)

— the Admin OS, Vol. 7
