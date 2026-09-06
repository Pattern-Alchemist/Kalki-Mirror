# KALKI — The Next 20, Vol. 3 (Upgrades & Enhancements)

> Committed 2026-09-06, post-Vol.1/Vol.2 closeout (all 40 items shipped and
> verified live). Grounded in a full codebase gap survey — every item cites
> what already exists and what is dead-ended. Zero-cost bias throughout
> (free tiers only). Founder-gated carry-overs (NOT counted in the 20):
> EMBED_API_KEY neural swap (one key + one bake, rehearsed weekly),
> GSC indexing OAuth (~1h documented build, needs GSC_INDEXING_CREDENTIALS),
> TOTP enrollment (user action, grace ends ~2026-09-12).
>
> PROGRESS — Week A: 1·3·17·18·19 (+health bug) · Week B: 4·2·10 ·
> Week C: 6·7·8·9 (+ the Seven Patterns primer lead-magnet as an
> interlude) · Week D: 11·12·13·14·15 (+ hi.json NUL-corruption fix,
> full-shell parity enforced) → 18 of 20 shipped. Remaining: 16·20 · 5.

## Tier 9 — Close the loops (data modeled but dead-ended) — do first

1. **Consultation outcome writer** — Consultation carries
   `patternDiagnosis / prescribedSequence / prescribedSiddhis / outcome /
   followUpDate / completedAt` (schema.prisma:308–314); member-facing
   /dossier reads them — but NO admin surface writes them. The dossier's
   promise ("pattern diagnosis, prescribed path, outcome tracking") is
   unfulfillable today.
   First move: outcome editor in /admin/consultations + audit-logged action.

2. **Content Studio goes public** — `ContentEntry` (DRAFT→IN_REVIEW→
   PUBLISHED→ARCHIVED, publish-gated, audit+webhook wired) is rendered by
   zero public routes; the studio publishes into a void.
   First move: `/library/[type]/[slug]` renderer + sitemap + JSON-LD Article.

3. **Follow-up queue** — `followUpDate` column exists and is paid for; no
   "due for follow-up" surface anywhere.
   First move: due-today section on consultations board + digest section.

4. **Glossary programmatic pages** — 86 lexicon terms live on one
   /glossary page with #anchors; sitemap lists only the hub.
   First move: `/glossary/[slug]` (generateStaticParams off glossary.ts)
   → 86 indexable URLs from existing data. Best SEO ROI in the repo.

5. **Media library** — `src/lib/cloudinary/upload.ts` is orphaned (zero
   imports); content editor has no image path.
   First move: admin upload action + /library media tab + insert-markdown.

## Tier 10 — List & reach (email + SEO distribution)

6. **Broadcast compose + send** — the Doors list is warm but mute; the only
   admin list tool is export CSV. Compose → preview → rate-limited send →
   EmailSend ledger, audit-logged.
   First move: /admin/broadcast with dry-run mode default.

7. **Unify the two subscriber stores** — /api/subscribe writes raw libSQL
   `Subscriber` (analytics-db.ts); the course writes Prisma `EmailSubscriber`.
   Two lists, one brain.
   First move: /api/subscribe upserts EmailSubscriber (analytics row kept).

8. **Per-URL email CTR report** — `EmailEvent.url` is captured by the Resend
   webhook but never rendered.
   First move: engagement panel CTR table + digest line.

9. **Missed-Door backfill** — a skipped cron day permanently skips a Door
   for the whole list (documented tradeoff, course-send.ts:14–16).
   First move: catch-up mode keyed on lastSentDay with batch cap.

10. **Course JSON-LD** — 54 aghori lesson pages carry generic ld+json; no
    Course/LearningResource graph, no ItemList on the index.
    First move: Course + hasCourseInstance on /aghori-tantra; ItemList on
    phase indexes; Lesson schema on lesson pages.

## Tier 11 — Seeker self-service (privacy + personalization)

11. **Member profile page** — User carries birth data (birthDate/
    birthPlace/natalMoonLng/lat/lon/timezone) that feeds transits + Brahma
    Muhūrta; no member UI views or edits it.
    First move: /profile (noindexed) with scoped server actions + audit.

12. **Data export + deletion** — zero privacy endpoints for PracticeSession/
    PatternResolution/dossier data (DPDP posture gap).
    First move: /api/user/export (JSON, HMAC-verified request) +
    /api/user/delete with confirm token; both rate-limited.

13. **Site-wide /search page** — search exists only inside /archive;
    patterns/glossary/sequences/lessons are unreachable by query without
    paying the LLM bar.
    First move: /search reusing the archive facet client over all corpora.

14. **hi.json shell parity** — hi locale covers the wizard (172 keys) but
    the public shell carries 285 en keys; nav/footer/CTAs stay English-only.
    First move: parity test widened to the full shell namespace set.

15. **Streak milestones** — PracticeSession streaks are computed and stored
    but never surfaced shareably; no milestone view.
    First move: milestone card on /practice (7/21/41/99-day thresholds).

## Tier 12 — Hardening & hygiene (never-regress work)

16. **Public-flow E2E + wire the orphaned suite** — tests/e2e/** is run by
    NEITHER runner (vitest excludes it; playwright testDir=./e2e); zero
    public-flow coverage exists.
    First move: move specs into e2e/, add wizard→submit + subscribe→
    unsubscribe flows.

17. **Tests for revenue + token paths** — src/lib/utils/upi.ts (pay-URL
    builder) and src/lib/emails/course-unsubscribe.ts (HMAC sign/verify)
    have zero tests.
    First move: unit suites locking VPA format, amount rounding, token
    round-trip + tamper rejection.

18. **Event-name enum check** — /api/events accepts any string; only 22
    EVENT_NAMES are known to the dashboards. Pollution lands verbatim in
    war-room.
    First move: reject unknown names (422) + test.

19. **Cleanup cron + backup-age check** — SynthesisCache.expiresAt,
    ActiveSession, EmailEvent raw payloads (~8KB/row), DISMISSED DraftLead
    accumulate forever; db:backup exists but nothing schedules or checks it.
    First move: /api/cron/cleanup (TTL prunes + counters) + backup-age
    assertion into daily digest and /health.

20. **OpenAPI truth + schema drift fix** — docs/api/openapi.yaml documents
    22 paths vs 52 routes; schema header still says "279 chunks" vs the
    canonical 327 (violates the canonical-number iron rule).
    First move: regenerate path list; fix comments; add a test pinning
    openapi path count to the route count.

## Suggested order

Week A: 18 → 19 → 17 → 1 → 3 (hygiene first, then the dossier loop)
Week B: 4 → 2 → 10 (SEO distribution from existing data)
Week C: 6 → 7 → 8 → 9 (the list wakes up)
Then: 11 → 12 → 13 → 14 → 15 (self-service) · 16 → 20 (never-regress) · 5.
