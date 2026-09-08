# Turso Failover Rehearsal — Runbook (Vol. 5 #20)

> Status: **the outage half of the restore story is now rehearsed.** The
> quarterly restore drill (Vol. 2 #13 / Vol. 4 #20 — Jan/Apr/Jul/Oct,
> 2nd, 04:00 UTC, `.github/workflows/restore-drill.yml`) proves the
> BACKUP path. This runbook covers the OUTAGE path: what the site does
> when Turso is unreachable, and how to recover. The stale-vault-token
> incident of 2026-09-08 was a rehearsal of the symptom; this is the cure.

## The rehearsal (one command)

```bash
npm run build          # the drill rehearses the production binary
bash scripts/rehearse-turso-failover.sh
```

The script starts the production server with `TURSO_DATABASE_URL` pointed
at an unreachable endpoint (`libsql://127.0.0.1:9/…` — connection refused)
and asserts the outage posture:

| Assertion | Expected | Why it matters |
|---|---|---|
| Server boots | yes | client creation is lazy; nothing dials Turso at startup |
| Static-corpus surfaces (12 probed) | 200 | they read the baked `db/custom.db` — the corpus never needed Turso |
| `/api/health` | 503 + `status: critical` + `database.status: error` | the failure is NAMED, not hidden |
| `/redeem`, `/profile` | 200 (honest degraded/signed-out render) | no crash loop, no 500 wall |
| `/api/keys`, `/api/admin/*` | 401 | auth fails honest when the session store is down |
| No surface hangs | all responses < 15s | a hang is worse than an error |

Last run: **18/18 PASS** (2026-09-08, sandbox). Cadence: run alongside the
quarterly restore drill, and before any Turso plan change / token rotation.

## What the site is allowed to lose during a Turso outage

| Surface | Class | Degrades to |
|---|---|---|
| All folio/lexicon/pattern/lesson pages | static corpus | **unaffected** (baked sqlite) |
| `/ask` | hybrid | retrieval works (baked corpus); cache misses fall through to live LLM |
| Letters, studio entries beyond the hub | dynamic | fail-soft to their no-DB state (empty shelf, hub-only sitemap) |
| Member surfaces (keys, redemptions, profile) | dynamic | honest 401/signed-out — no data lies |
| Consultation intake | dynamic | errors honest; leads submitted during the outage must be re-sent |
| Crons | dynamic | ledger records the failure; the 26h silence alarm fires if the outage outlives it |

## The recovery path (production)

1. **Diagnose** — `/api/health` says `database.status: error`. The cred-audit
   panel (Vol. 5 #2) and its cron distinguish "credential rejected" from
   "endpoint unreachable": `scripts/audit-credentials.sh` pings Turso's
   verify path with the server env.
2. **Fix the credential or endpoint** — Vercel dashboard → Settings →
   Environment Variables → `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`
   (rotate in the Turso dashboard if the token was invalidated
   server-side — the 2026-09-08 incident's exact shape). No code changes.
3. **Redeploy** — any push to `main` re-runs the build; or redeploy the
   last READY deployment from the Vercel dashboard (it re-reads env).
4. **Verify** — `/api/health` green (`database.status: ok`), war-room
   cred-audit panel shows Turso verified, one cron cycle confirms the
   ledger records fresh rows (crons self-heal — no manual reset).
5. **Close the loop** — if the outage outlived a cron window, check the
   digest's CRONS line clears within 26h; re-send any consultation leads
   that errored during the outage window.

## Where this sits in the drill family

| Drill | Proves | Cadence |
|---|---|---|
| Restore drill (`scripts/restore-drill.sh`) | the backup restores and the data is true | quarterly (automated) |
| Neural-swap rehearsal (`scripts/rehearse-neural-swap.sh`) | the embedding swap is one command | before the EMBED_API_KEY lands |
| **Turso failover rehearsal** (`scripts/rehearse-turso-failover.sh`) | **the outage fails honest and recovery is env-only** | quarterly, with the restore drill |
| Ask smoke (`scripts/smoke-ask.sh`) | the /ask contract + latency budget | every deploy |
| Page-weight drill (`scripts/smoke-page-weight.sh`) | the HTML budgets hold | every deploy |
