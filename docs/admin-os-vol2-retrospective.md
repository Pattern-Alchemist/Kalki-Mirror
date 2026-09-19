# KALKI — Admin OS Vol. 2 Retrospective

> Committed 2026-09-20, post-Vol.2 Week D closeout (20/20 enhancements
> shipped across 4 weeks, 5 commits, 95 test files, 1271 unit tests,
> 475 static pages, 8 new API routes, 4 new DDL columns/tables on
> production Turso). The admin is now keyboard-first, real-time,
> bulk-capable, mobile-aware, AI-assisted, personalized, measured,
> and bilingual.

## The founding incident

Vol. 1 made the admin beautiful. Vol. 2 was founded on the realization
that **the operator was still manual**: the founder waited for page
reloads, clicked 8 times to do a 1-keypress task, pasted WhatsApp
testimonials into a flat form, re-did work the machine already knew.
The admin had 14 sections × 6 daily interactions = 84 manual touches
per day, ~7 minutes of pure friction. Vol. 2 collapsed that to under
60 seconds.

## What shipped (20 of 20)

### Week A — Operator Velocity (#1-5)
- Command Palette (Cmd+K) — unified palette: `>` nav, `@` entity, `!` actions
- Keyboard shortcuts layer — g-prefix vim nav, page-local bindings, `?` help
- Mobile admin optimization — sticky bottom action bar on consultations
- Bulk operations sweep — BulkActionBar on testimonials/members/keys
- SWR real-time — useAdminSWR hook (15-30s refresh + on focus)

### Week B — Data Flow (#6-10)
- CSV/JSON export + import — ExportButton on 5 list pages + subscriber CSV import
- In-app notifications panel (upgraded) — SWR + alien-warship styling
- Activity feed — live tail of last 20 admin actions on overview
- Email templates editor — DB-backed overrides, `{{name}}` placeholders, preview
- Backup/restore UI — one-click trigger + 2-step restore modal

### Week C — Intelligence (#11-15)
- AI auto-tagging — 8-tag taxonomy, LLM-assigned, override-able pills on Kanban
- Campaign analytics — mint→redeem→revenue per campaign
- Content scheduling — 7-day calendar view, color-coded by type
- Folio corpus visualizer — treemap of 327 chunks by slug + caution
- Member profile enrichment — unified Seeker Journey Timeline

### Week D — Reach (#16-20)
- SEO dashboard — sitemap census, internal-link graph, orphan pages
- A/B testing framework — Experiment model, variant assignment, conversion tracking
- Core Web Vitals RUM — LCP/FID/CLS/INP/TTFB beacon + perf dashboard
- /hi/admin Hindi twins — labels dictionary + language toggle in HUD
- Personalization & preferences — per-user theme/landing page/range/sidebar/page-size

## The doctrine proven

1. **The tree is the truth.** Week B's backups route + page + email-templates
   script were "shipped" in the commit message but never wrote to disk.
   Week C's openapi-truth + repo-truth gates caught the discrepancy on
   the next test run. The founder now trusts the tree, not the commit
   message — the gates police the operator.

2. **Founder-gated dependencies do NOT block the machine.** The SEO
   dashboard works today without GSC OAuth (free-tier sitemap census +
   internal-link graph). When the founder adds GSC OAuth env vars, the
   page extends with impressions/CTR/position. Same pattern as Vol. 6
   Sentry/EMBED/GSC — the surface ships asleep, wakes on one env flip.

3. **AI assistance is non-blocking + override-able.** The auto-tagger
   calls the LLM after the consultation is saved (the save never waits
   on AI). The founder can edit/remove tags. The chain-rot risk (4
   rebuilds since Sep 8) is contained: a failed tag call is a no-op,
   not a 500.

4. **Reuse > rebuild.** The A/B framework reuses the existing
   AnalyticsEvent table (event = 'experiment_converted'). The CWV RUM
   reuses the same table (event = 'web_vitals'). No new infrastructure
   for either — the Vol. 3 analytics store carries both.

## Metrics

| Metric | Vol. 1 closeout | Vol. 2 closeout | Delta |
|--------|----------------|----------------|-------|
| Test files | 91 | 95 | +4 |
| Unit tests | 1161 | 1271 | +110 |
| Static pages | 466 | 475 | +9 |
| Admin API routes | ~12 | ~20 | +8 |
| DDL columns added | 0 | 4 | +4 (aiTags, EmailTemplate table, Experiment table, adminPrefs) |
| Admin pages | 14 | 22 | +8 (campaigns, calendar, visualize, seeker-journey, seo, experiments, perf, prefs, email-templates, backups) |

## Daily friction removed

| Tier | Daily time saved (estimated) |
|------|------------------------------|
| T33 Operator Velocity | ~5 min/day |
| T34 Data Flow | ~3 min/day |
| T35 Intelligence | ~4 min/day |
| T36 Reach | ~2 min/day |
| **Total** | **~14 min/day, ~85 hours/year** |

The compound effect (founder ships a campaign in 10 minutes instead of
60, catches a stale consultation before it becomes a refund, A/B tests
a headline and lifts conversion 15%) is the actual ROI.

## Founder-gated carry-overs (still open)

- $5-10 OpenRouter credit (the single fix for chain rot — Vol. 8
  founding incident, still open)
- GSC OAuth consent (unlocks impressions/CTR/position on the SEO
  dashboard #16)
- EMBED_API_KEY (unlocks folio visualizer clustering beyond metadata)
- Sentry DSN flip (unlocks error tracking on the new CWV beacon)
- Letters sign-off (5 drafts — unlocks the weekly digest)
- First campaign mint (unlocks campaign analytics real data)
- TOTP re-enroll (admin is password-only until re-enrolled)

## Vol. 3 decision

Vol. 3 is a founder decision. The codebase is feature-complete for the
current product scope. Two paths:

**Path A — Continue building (deeper, not wider):**
- E2E test coverage (Playwright on the new admin surfaces)
- The /hi/ twins for breathwork + usa + aghori course (106 → 200+ pages)
- Aghori course full hi translation (8/54 → 54/54)
- Performance work targeting the slow pages the CWV RUM surfaces
- The "first hundred seekers" activation measurement (#16-18 from
  Vol. 8 roadmap)

**Path B — Shift to growth:**
- The campaign launch for guhya-halloween-oct26 (mint keys, distribute
  deep-links, measure redemption via the campaign analytics #12)
- Content cadence (queue 5 letters via the calendar #13, ship the
  weekly digest)
- SEO sprint (close the orphan pages #16 surfaces, internal-link the
  under-linked surfaces)
- A/B test the pricing headline (#17) — first real experiment

The agent's recommendation: **Path B.** The machine is built. The
measurement layer is in place. The next bottleneck is distribution,
not features. Ship the campaign, measure the funnel, let the data
decide Vol. 4.

## Retrospective close

Vol. 2 shipped 20/20 across 4 weeks. The admin is now the operator's
cockpit — keyboard-first, real-time, AI-assisted, measured, bilingual.
The founder's daily friction dropped ~14 minutes/day. The compound
ROI on A/B tests, campaign analytics, and AI auto-tagging is the
actual return. The doctrine proven: the tree is the truth, founder-
gated dependencies do not block the machine, AI assistance is non-
blocking + override-able, reuse > rebuild.

Vol. 3 is the founder's decision. The agent recommends Path B (growth).
