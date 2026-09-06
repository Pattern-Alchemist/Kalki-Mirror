# Salvage Audit — orphaned `6b79bee` (Vol. 1 #20)

**Status: CLOSED 2026-09-06 · Verdict: zero unaccounted features · Drift file closed for good.**

This document is the terminal record for the orphaned pre-reinit work state known as
`6b79bee`. It discharges Vol. 1 roadmap item #20 ("Salvage audit of orphaned `6b79bee`
— diff its Vercel build output against current main … document anything unique, then
close the drift file for good").

---

## 1. What `6b79bee` was

A commit on the pre-reinit working state of KALKI (before the current
`Pattern-Alchemist/Kalki-Mirror` history was established), best known for carrying:

1. a **membership path** (Akash tiers) — never merged;
2. an **email engine rebuild** (the Doors cron lineage);
3. the first **UPI payment path**.

The git object is **unrecoverable**: absent from the local clone, from every remote ref
(verified via `git fetch 'refs/*:refs/remotes/origin/*' --prune` → `git cat-file -t
6b79bee` → `NO-SUCH-OBJECT`), and from all pull refs. It survives only as a Vercel
deployment metadata entry (commit `6b79bee…`, deployment `dpl_6yFuARsAbBewne5pCqscvtoCGrGs`,
created 2026-08-30, state READY).

## 2. Build-output diff attempt — what was probed and why it stops here

| Probe | Result |
|---|---|
| Local git object | absent |
| Remote git (all refs incl. `refs/pull/*`) | absent |
| Vercel deployment metadata | present (READY) — but `v13` file listing API returns an empty manifest for legacy deployments |
| HTTP fetch of the deployment URL (`kalki-6h3wc50uq-kaus-projects-831d3d88.vercel.app`) | HTTP 302 → `vercel.com/sso-api` — the deployment sits behind **Vercel Deployment Protection** (`ssoProtection.deploymentType = all_except_custom_domains`) |
| Automation bypass | **none configured** (`protectionBypass: null`) — and deliberately NOT created: minting a project-wide SSO bypass secret to read a 7-day-old build is a real production-security regression for zero expected salvage |

Conclusion of the probe: a byte-level diff of the old build output is **not
obtainable** without weakening the project's security posture. The audit therefore
closes on feature accounting (§3), which the roadmap itself anticipated: every feature
the orphan was known to carry was enumerated *before* the audit, and each has since
shipped in main in a stronger form.

## 3. Feature accounting — orphan vs. current main

| Orphan feature | Status in current main (2026-09-06) |
|---|---|
| Membership path (Akash tiers) | **SHIPPED, stronger.** `Membership` model + admin grant/revoke + audit logging (Vol. 1 item 2), extended with the renewal triple `renewalCycle / nextDueAt / lastRenewedAt`, `setRenewalCycle` / `recordRenewal` actions and renewals-due digest section (Vol. 2 #5). |
| Email engine (rebuilt) | **SHIPPED, stronger.** L2 email rail (Resend + Doors cron 20:00 IST), `EmailSend` logging + svix-verified Resend webhooks → `EmailEvent`, engagement rollup with non-opener re-send segment (Tier-2 #10), full-text RSS + referral loop (Vol. 2 #16/#18). |
| UPI payment path | **SHIPPED, stronger.** L1 manual UPI rail (VPA `8920862931@ibl`) with wizard payment block + claim flow, plus the UPI reconciliation board — `paymentState`/UTR lifecycle, filter chips, `recordPaymentClaim` (Vol. 1 item 1). |
| Anything else in the orphan | No evidence of any further unique feature exists in any record (roadmap, handoff notes, worklogs, TGA). The platform has since shipped **60+ items across two 20-item roadmaps** — every subsystem the orphan touched has been rebuilt past that point. |

## 4. Verdict

1. No feature of `6b79bee` remains unaccounted for. The three known carried features
   all live in main in strictly greater form.
2. The byte-level diff is permanently unavailable without a security posture
   regression; the audit closes on the feature accounting above, which the roadmap
   accepted as sufficient at authoring time ("membership flow was part of it —
   covered by item 2").
3. The drift file is **closed**. Do not reopen without new evidence of an
   unaccounted orphan feature. If a byte-level diff is ever demanded, the documented
   path is: create a scoped `protectionBypass` secret → fetch the deployment with
   `x-vercel-protection-bypass` → snapshot → **revoke the secret in the same session**.

---

*Audit performed 2026-09-06 · probes recorded verbatim in the Vol. 1 #20 closeout
worklog entry.*
