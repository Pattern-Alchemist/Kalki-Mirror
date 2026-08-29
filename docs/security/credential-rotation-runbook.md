# Credential Rotation Runbook — G-10 (P0)

**Status:** DUE NOW. All systems are live and verified (CI green, deploy green,
GEO monitor 11/11). Rotation was deliberately deferred until after the live
deployment — that condition is met.

**Why:** Production credentials for all six systems were shared in plaintext
PDF form during the build. Treat every credential listed in that document as
compromised and rotate it. Nothing below requires code changes except where
noted — the application already reads environment variables first.

---

## Rotation order (do them in this sequence)

### 1. GitHub (PAT)

1. GitHub → Settings → Developer settings → Fine-grained personal access tokens.
2. Revoke the existing `Kalki` token.
3. Create a new fine-grained token scoped to **only** `Pattern-Alchemist/Kalki-Mirror`
   with **Contents: Read and write** + **Actions: Read** + **Metadata: Read** (mandatory).
4. Update the local helper scripts that use it (they read the token from a
   `.gh_token` file — never commit it; `.gitignore` already excludes it).

### 2. Vercel

1. Vercel dashboard → Settings → Tokens → delete the old token.
2. Create a new token (scope: the `kalki-fix` project that owns astrokalki.com).
3. Update the GitHub Actions `Deploy to Vercel` secret (`VERCEL_TOKEN` in repo
   Secrets and variables → Actions) with the new value.

### 3. Turso (database)

1. Turso dashboard → the `kalki-mirror` database → Settings → Tokens.
2. Revoke the old token; create a new one.
3. Set it in **Vercel** → Project → Settings → Environment Variables:
   - `TURSO_DATABASE_URL` = `libsql://kalki-mirror-pattern-alchemist.aws-ap-south-1.turso.io`
   - `TURSO_AUTH_TOKEN` = <new token>
4. Redeploy (any push to main triggers it).
5. **Then remove the hardcoded fallbacks** (see "Code changes" below) — the env
   vars must exist in Vercel BEFORE the fallback removal ships.

### 4. Cloudinary

1. Cloudinary console → Settings → API Keys.
2. Disable the old key; generate a new one.
3. Update Vercel env vars (`CLOUDINARY_*`) if the app references them; the
   delivery URLs (images) are unsigned and unaffected.

### 5. OpenRouter

1. OpenRouter dashboard → Keys → delete the old key; create a new one.
2. Update Vercel env vars (`OPENROUTER_API_KEY` and any model config).

### 6. Admin password (Archivist Console)

1. Log in with the current admin credentials.
2. Change the password (or rotate via the seed script `scripts/seed-admin.cjs`
   against Turso if the UI path is unavailable).
3. Also rotate `NEXTAUTH_SECRET` (Vercel env var) — this invalidates all
   existing admin sessions, which is desirable during rotation.

---

## Code changes bundled with rotation (one PR, after env vars are set)

The following hardcoded fallbacks exist ONLY because the Vercel environment
variables were not provisioned during the build. Once the env vars above are
live, remove the fallbacks so a leaked constant can never authenticate:

| File | Constant | Action |
|---|---|---|
| `src/lib/db.ts` | `TURSO_URL_FALLBACK`, `TURSO_TOKEN_FALLBACK` | Delete constants; require env vars |
| `src/lib/auth.ts` | NextAuth secret fallback | Delete; require `NEXTAUTH_SECRET` |
| `src/lib/analytics-db.ts` | Turso URL/token fallbacks (mirrors db.ts) | Delete; require env vars |

After removal: `npx next build` locally with the env vars set, deploy, and
verify `/api/health` returns `database: ok`.

## Verification checklist (after everything rotates)

- [ ] `git push` to main works with the new PAT
- [ ] CI run is green on the next push
- [ ] Vercel deploy succeeds and astrokalki.com serves `/api/health` → `status: ok`
- [ ] `/api/subscribe` returns `success` with `status: created` (Turso write path)
- [ ] Admin console login works with the new password
- [ ] The old PDF containing credentials is deleted from every machine that held it

---

## Deferred integrations (post-rotation backlog)

1. **Stripe USD-first checkout** — pricing currently converts via WhatsApp.
   When ready: add `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` env vars,
   install `stripe`, create `/api/stripe/checkout` (Checkout Session per tier,
   USD-first with INR fallback), and replace the WhatsApp CTA for non-IN
   visitors only (keep the human channel for India).
2. **Search Console US targeting** — founder action: add the property,
   verify via DNS, submit the sitemap (`/sitemap.xml`, 172 URLs), and set
   targeting to the United States in International Targeting.
3. **Person `sameAs` expansion** — when the founder provides real
   LinkedIn/X/YouTube URLs, extend the `sameAs` array in the Person node
   (`src/components/layout/PublicShell.tsx`) and the About page.
