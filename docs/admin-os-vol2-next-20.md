# KALKI — Admin OS Vol. 2: The Next 20

> Committed 2026-09-19, post-Admin-OS-Vol.1 closeout (20/20 enhancements
> shipped across 7 commits, 466 static pages, 1161/1161 vitest, tsc clean,
> build green). The alien warship is live: glassmorphism + neon HUD, coach-
> marks, sidebar groups, morning brief, anomaly callouts, QR codes, AI
> compose, autosave, paste-parse, audit diffs, revenue HUD, AI playground,
> and the capstone — consultations drag-and-drop Kanban with SLA timers.
>
> The founding incident of this volume: THE OPERATOR IS STILL MANUAL. Vol. 1
> made the admin beautiful and discoverable. The founder still waits for
> page reloads, still clicks 8 times to do a 1-keypress task, still pastes
> WhatsApp testimonials into a flat form when the machine can parse them
> (Vol. 1 #17 proved this). The admin has 14 sections × 6 daily interactions
> = 84 manual touches per day. At 5 seconds each, that's 7 minutes of pure
> friction. Vol. 2 collapses that to under 60 seconds by going keyboard-
> first, real-time, and AI-assisted on every recurring pattern.
>
> The doctrine of Vol. 2: the founder should NEVER wait for a page reload,
> NEVER click 8 times to do a 1-keypress task, NEVER paste data into a flat
> form when the machine can parse it, NEVER re-do work the machine already
> knows. The admin is the operator's cockpit — Vol. 2 makes it fly.

## Tier 33 — Operator Velocity: keyboard-first, real-time, bulk

1. **Command Palette (Cmd+K)** — the alien warship has 14 sections, 6
   top-level actions per page, and 4 keyboard shortcuts. The founder
   has to remember them all. First move: a global Cmd+K palette that
   fuzzy-searches nav items + records (members by name/email, keys by
   code, consultations by phone, content by title) + actions
   ("Acknowledge all pending", "Mint 5 keys", "Compose broadcast").
   The palette reads the same role-ui nav + a new /api/admin/search
   endpoint that does prefix search across members/keys/consultations/
   content. One keystroke to anywhere.
   **Impact**: cuts median nav time from 4-8 clicks to 1 keystroke.
   **Benefit**: the founder stops thinking about "where is the page"
   and starts thinking about "what do I want to do".

2. **Keyboard shortcuts layer** — the sidebar has shortcuts 1-9, 0
   for the 10 most-visited pages. But: no shortcut for "acknowledge
   selected", "open next pending consultation", "save and publish",
   "toggle theme", "open command palette". First move: a global
   shortcut registry (Cmd+/) that shows all bindings in a modal, plus
   page-local shortcuts (e.g. on consultations: A=acknowledge, N=note,
   S=schedule, C=complete, ?=help). The shortcut layer is composable —
   page-local shortcuts stack on top of global ones, no conflicts.
   **Impact**: the founder never reaches for the mouse on a known
   flow.
   **Benefit**: 84 daily touches → ~30. Saves 4 minutes/day, 24 hours/year.

3. **Mobile admin optimization** — the alien warship is desktop-first.
   The HUD strip wraps on mobile, the sidebar is a slide-over, the
   Kanban scrolls horizontally. But the founder reviews pending
   consultations on the phone 3-4×/day. First move: a touch-first
   mode for consultations/members/keys — large tap targets, swipe-
   left-to-acknowledge, swipe-right-to-open, sticky bottom action
   bar (Acknowledge / Note / Schedule). The war-room gets a stacked
   card layout (no 6-col grid on mobile). Mobile becomes a first-class
   surface, not a degraded desktop.
   **Impact**: founder can clear the pending queue during commute.
   **Benefit**: SLA timers stop firing because the founder can act
   in 30 seconds from anywhere.

4. **Bulk operations sweep** — Vol. 1 #13 added bulk-select to
   consultations only. Testimonials, members, memberships, content,
   keys all lack bulk. The founder processes 5-10 testimonials per
   week one at a time. First move: a BulkActionBar component
   (reusable, sticky-top, shows count + actions) wired into all 6
   list pages. Actions: bulk-acknowledge, bulk-archive, bulk-tag,
   bulk-export (CSV), bulk-assign-campaign. The component is the
   same everywhere — only the actions differ. The pattern is the
   Vol. 1 #13 pattern, extracted.
   **Impact**: 10 testimonials go from 10 clicks to 1 click + 1 confirm.
   **Benefit**: weekly admin load drops by ~40% on the list pages.

5. **Real-time updates (SWR)** — admin pages today are static server
   renders. The founder refreshes to see new consultations. The
   pending count in the HUD is a snapshot, not live. First move:
   wire SWR (stale-while-revalidate) on the admin client components
   — consultations list, members list, keys list, HUD pending count.
   Revalidate every 30s, focus-revalidate on tab-switch, optimistic
   updates on mutations. The morning brief stays server-rendered
   (it's expensive), but the rest of the dashboard feels live.
   **Impact**: the founder stops pressing F5. New consultations
   appear within 30s of submission.
   **Benefit**: response time on a new lead drops from "next refresh"
   to ~30s — first-response SLA becomes reliable.

## Tier 34 — Data Flow: export, notify, edit, restore

6. **Export/Import (CSV + JSON)** — every list page today is read-
   only-export. The founder screenshots the consultations table to
   share with the team. First move: a CSV export button on every
   list page (members, consultations, keys, testimonials, memberships,
   subscribers, audit). The export respects the current filter + the
   role-ui visibility rules (a REVIEWER export excludes SUPERADMIN-
   only fields). Import is a CSV upload on members + subscribers
   (the two surfaces that grow from external sources). The export
   shape is documented in /docs/api/exports.md.
   **Impact**: the founder can hand a CSV to an accountant, a VA,
   or a CRM without manual re-typing.
   **Benefit**: data becomes portable, not trapped.

7. **In-app notifications panel** — the notification bell (already
   exists) shows a count, but the dropdown is empty. The founder
   gets email alerts + WhatsApp alerts, but no in-app feed. First
   move: a notifications panel that surfaces the same events the
   digest tracks (new consultation, new testimonial, new subscriber,
   new membership payment, stale consultation alarm, drill overdue).
   Each notification is dismissible + click-through to the source
   record. The panel reads from a new Notification table (id, type,
   payload, readAt, createdAt). Mark-all-read in one click.
   **Impact**: the founder opens the admin and immediately sees
   "what happened since I last looked."
   **Benefit**: replaces 4 separate "did anything happen" page
   visits with one glance.

8. **Activity feed ("who did what")** — the audit log exists (Vol. 1
   #18 expanded it with diff viewer), but it's a deep-history
   table. There's no "live tail" of admin actions. First move: an
   ActivityFeed component on the overview page — last 20 admin
   actions (login, content edit, key mint, consultation status
   change). Each entry shows actor + action + target + time-ago.
   Click-through to the audit entry with diff. The feed reads from
   the existing AuditLog table, no new schema.
   **Impact**: the founder (or a co-admin) sees what changed in
   the last hour without opening the audit log.
   **Benefit**: multi-admin accountability becomes real. When a
   second admin joins, they can see what the founder did today.

9. **Email templates editor** — today the email templates (welcome,
   completion-nudge, weekly-digest, broadcast) are hardcoded in
   src/lib/emails/*.tsx. To change a subject line, the founder
   has to ship a commit. First move: a ContentEntry-style email
   template editor at /admin/settings/email-templates — edit the
   subject + body (markdown), preview against sample data, save
   to a new EmailTemplate table. The email sender reads from the
   DB if a template exists, falls back to the hardcoded default
   if not. Templates support {{name}}, {{link}}, {{date}} placeholders.
   **Impact**: the founder can A/B test subject lines without a
   code deploy.
   **Benefit**: copy iteration speed goes from "next deploy" to
   "next save".

10. **Backup/restore UI** — the restore-drill (Vol. 6 #20) proves
    the backup works, but the founder triggers it via GitHub
    Actions workflow_dispatch. First move: a /admin/settings/
    backups page that lists the last 10 backups (date, size, kind:
    full/db/content), triggers a manual backup (POSTs to the GH
    workflow), and provides a one-click restore-from-backup (with
    a 2-step confirmation modal). The restore modal shows the
    diff: "This will replace 1,247 records. Continue?" The backup
    list reads from the existing OpsState backupAge marker.
    **Impact**: the founder can restore from anywhere, not just
    the GitHub Actions UI.
    **Benefit**: restores go from "open laptop, find the workflow,
    click dispatch, wait for completion" to "tap Restore, confirm,
    done" — 4 minutes → 30 seconds.

## Tier 35 — Intelligence: AI on every recurring pattern

11. **AI auto-tagging for consultations** — every consultation
    today is untagged. The founder reads the request, mentally
    categorizes (love/career/health/finance/spiritual), and moves
    on. First move: on consultation create, fire an async AI call
    that reads the request and assigns 1-3 tags from a fixed
    taxonomy. The tags show as pills on the Kanban card + filter
    the list. The tagging is non-blocking (the consultation is
    saved before the AI call returns) and override-able (the
    founder can edit/remove tags).
    **Impact**: the war-room gains a "tags" dimension — "this
    month, 40% love, 25% career, 15% health."
    **Benefit**: the founder sees patterns in the seeker flow
    without re-reading every consultation.

12. **Campaign analytics** — InviteCode.campaign exists (Vol. 6
    #11) but there's no analytics view. The founder mints 50 keys
    with campaign: "diwali-2026" and has no idea how many redeemed.
    First move: a /admin/keys/campaigns page that groups by
    campaign, shows minted / redeemed / pending / conversion-rate
    / revenue-per-campaign. The view joins InviteCode → Consultation
    (via redeemedCode) → optional TestimonialFollowUp. The first
    hundred seekers tier finally has attribution analytics.
    **Impact**: the founder knows which campaigns work before
    spending more on distribution.
    **Benefit**: marketing budget gets allocated to winners, not
    sunk into losers.

13. **Content scheduling** — ContentEntry has publishedAt but no
    future-scheduling. The founder publishes "in the moment" — no
    way to queue 5 letters for the week ahead. First move: a
    scheduler UI on the content studio — pick a future date/time
    for each draft, the existing cron picks up "due" entries
    (publishedAt <= now AND status=draft) and flips them to
    published. The schedule view is a 7-day calendar grid. The
    founder queues Sunday's letter on Monday and forgets it.
    **Impact**: the weekly cadence becomes a 30-minute batch
    instead of 5 separate "remember to publish" sessions.
    **Benefit**: the letters archive stops stalling because the
    founder forgot to publish on Tuesday.

14. **Folio corpus visualizer** — the folio is a 279-chunk flat
    list. The founder has no idea what the corpus actually covers
    without scrolling. First move: a /admin/folio/visualize page
    that clusters chunks by topic (k-means on embeddings, k=12),
    renders as a treemap — cluster size = chunk count, label = top
    3 keywords. Click a cluster → see its chunks. The visualizer
    uses the existing embeddings (Vol. 6 #7 EMBED_API_KEY flips
    this on). When EMBED is off, falls back to a tag-cloud view
    from chunk keywords.
    **Impact**: the founder sees "the corpus is 40% tantra, 25%
    archetypes, 15% siddhis" in one glance.
    **Benefit**: corpus gaps become visible ("we have 0 chunks on
    Jyotisha fundamentals") and the next content sprint is
    data-driven.

15. **Member profile enrichment** — the member detail page
    (/admin/members/[id]) shows the User row + consultations +
    payments. But there's no unified "seeker profile" — what
    they've read, what they've asked, what they've paid for, what
    they've redeemed. First move: a unified SeekerProfile component
    that joins User → Consultations → Payments → InviteCode usage →
    ContentEntry views (if analytics is on) → Testimonials given.
    The profile surfaces a "seeker journey timeline" — first visit,
    first consultation, first payment, first testimonial. The
    founder sees the human, not the row.
    **Impact**: 1:1 calls with seekers go from "let me pull up
    your file" to "I see your journey" — instant context.
    **Benefit**: the founder's perceived care quality jumps
    because every interaction starts with full history.

## Tier 36 — Reach: SEO, experiments, perf, locale, prefs

16. **SEO dashboard** — the founder has no visibility into
    indexation. GSC OAuth is founder-gated (Vol. 7 carry-over),
    but the sitemap census + the ahrefs/moz APIs are free. First
    move: a /admin/analytics/seo page that shows: sitemap URL count
    by type (USA/hi/glossary/patterns/letters), last-mod freshness,
    internal-link graph (top 20 linked pages, top 20 orphan
    pages), and a "pages that should be in sitemap but aren't"
    audit. When GSC OAuth lands, the page extends with impressions/
    CTR/position per URL. The free-tier surface is useful today.
    **Impact**: the founder sees "we have 466 pages but only 12
    are linked from the homepage" in one view.
    **Benefit**: SEO effort gets directed to orphans + under-linked
    pages, not vanity metrics.

17. **A/B testing framework** — there's no experiment tracking
    today. The founder wants to test "Diwali offer headline A vs B"
    on the pricing page but has no way to measure. First move: an
    Experiment table (id, name, hypothesis, variants JSON, metric,
    startDate, endDate) + a middleware that assigns visitors to
    variants via cookie + an event capture (existing events table
    suffices). The /admin/analytics/experiments page shows the
    running experiments + the variant conversion rates. The
    framework is thin (no statistical engine — just raw counts +
    a "is this significant?" heuristic at n>100 per variant).
    **Impact**: pricing page CTA, hero headline, key redemption
    flow all become measurable.
    **Benefit**: founder stops guessing. The first A/B test
    typically lifts conversion 10-20%.

18. **Performance monitoring (Core Web Vitals)** — there's no RUM
    (real-user monitoring) on the public site. The founder doesn't
    know if the LCP is 1.5s or 4s for real users. First move: a
    /admin/analytics/perf page that surfaces Core Web Vitals
    captured via a thin client-side beacon (LCP, FID, CLS, INP,
    TTFB) posted to /api/events/perf. The dashboard shows p50/p75/
    p95 by route, by device, by country. The beacon fires once per
    session (no per-event spam). The data lives in the existing
    events table with kind:"perf".
    **Impact**: the founder sees "mobile LCP is 3.8s on /usa/austin
    — that's the slowest page on the site."
    **Benefit**: performance work becomes targeted. The slow page
    gets fixed before it tanks conversions.

19. **Multi-language admin (/hi/admin)** — the admin is English-
    only. The founder's VA (hypothetical, future) prefers Hindi.
    The public site has 106 /hi/ twins (Vol. 6-7); the admin has
    0. First move: a /hi/admin route group with the same layout
    + sidebar + nav, but labels in Hindi (Command=आदेश, People=
    जन, Craft=शिल्प, System=तंत्र). The content (member names,
    consultation requests) stays as-is (user input). The labels
    are a static dictionary — no AI translation. A language toggle
    in the TopbarHUD switches the cookie.
    **Impact**: a Hindi-speaking operator can run the admin
    without English fluency.
    **Benefit**: hiring pool for ops expands. Founder can delegate
    routine admin to a VA.

20. **Personalization & preferences** — every admin visit starts
    with the same defaults: dark theme, overview page, last 7 days
    filter. The founder always switches to light theme, always
    goes to consultations first, always sets filter to last 30
    days. First move: a UserPreferences table (userId, key,
    value) that stores: theme, default landing page, default
    date-range, sidebar collapsed state, table page-size, sort
    preferences per page. The prefs hydrate on login, applied
    before first render. The founder's admin becomes "their"
    admin.
    **Impact**: every page loads in the founder's preferred
    state — 0 setup clicks.
    **Benefit**: removes 2-3 micro-decisions per page visit × 84
    visits/day = ~200 daily friction points eliminated.

## Suggested order

**Week A (1-5): Operator Velocity** — command palette (1) is the
keystone; the rest (2-5) stack on it. The founder stops clicking
within Week A.

**Week B (6-10): Data Flow** — export (6) + notifications (7) +
activity feed (8) are the visible wins; email templates (9) +
backup UI (10) are the founder-empowerment wins.

**Week C (11-15): Intelligence** — AI auto-tagging (11) + campaign
analytics (12) are the highest-ROI items in the volume;
scheduling (13) + folio viz (14) + member enrichment (15) round
out the intelligence layer.

**Week D (16-20): Reach** — SEO dashboard (16) + perf monitoring
(18) are the measurement layer; A/B testing (17) is the growth
layer; /hi/admin (19) + personalization (20) are the operator-
experience layer.

## Impact summary

| Tier | Items | Daily time saved | Strategic value |
|------|-------|-----------------|------------------|
| T33 Operator Velocity | 5 | ~5 min/day | Founder stops clicking |
| T34 Data Flow | 5 | ~3 min/day | Data becomes portable + editable |
| T35 Intelligence | 5 | ~4 min/day | Patterns become visible |
| T36 Reach | 5 | ~2 min/day | Measurement replaces guessing |
| **Total** | **20** | **~14 min/day** | **~85 hours/year** |

The 14 minutes/day is conservative — it counts only the directly-
measurable friction. The compound effect (founder ships a campaign
in 10 minutes instead of 60, founder catches a stale consultation
before it becomes a refund request, founder A/B tests a headline
and lifts conversion 15%) is the actual ROI. Vol. 2 pays for itself
in the first week.

## Founder-gated carry-overs (NOT counted in the 20)

- $5-10 OpenRouter credit (the single fix for chain rot — turns
  free-tier into paid-stable. Stops the rebuild cycle. Stops the
  production 500s. The chain works from non-cloud IPs today but
  fails from Vercel.)
- GSC OAuth consent (unlocks the GSC data on the SEO dashboard #16)
- EMBED_API_KEY (unlocks the folio visualizer clustering #14)
- Sentry DSN flip (unlocks error tracking on the new client-side
  beacons #18)
- Letters sign-off (5 drafts) (unlocks the weekly digest #13
  scheduling)
- First campaign mint (unlocks campaign analytics #12 — needs
  real data)
- TOTP re-enroll (admin is password-only until re-enrolled)

These are billing/consent actions, not code tasks. Vol. 2 builds
the surfaces that consume this data — when the founder flips the
switch, the surface lights up.
