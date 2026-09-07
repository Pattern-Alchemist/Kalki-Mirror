#!/usr/bin/env bash
# ============================================================
# KALKI — E2E RUNNER CONTRACT (Vol. 3 #16)
# ------------------------------------------------------------
# RECONSTRUCTED in Vol. 4 #2: .gitignore's "scripts/*" rule had
# swallowed the original file, so the contract existed only in
# the worklog prose and CI referenced a path that wasn't in the
# repo. The contract, restored verbatim:
#
#   1. Provider secrets are SCRUBBED — the suite must never be
#      able to reach Resend / OpenRouter / Cloudinary.
#   2. Database vars are FORCE-REDIRECTED (not unset — auth.ts
#      throws AUTH_DB_UNCONFIGURED without Turso vars): both
#      DATABASE_URL and TURSO_DATABASE_URL point at the same
#      throwaway SQLite file, token is a dummy. Production is
#      unreachable even if the caller exports real vars.
#   3. Fresh schema every run via prisma db push.
#   4. The local admin is seeded when ADMIN_EMAIL/ADMIN_PASSWORD
#      are provided (CI always provides them).
#   5. Playwright owns the web server (CI: `npm run start` on the
#      production bundle; local: `npm run dev`).
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

# 1. Scrub providers.
unset RESEND_API_KEY OPENROUTER_API_KEY CLOUDINARY_URL RESEND_WEBHOOK_SECRET EMAIL_FROM

# 2. Throwaway database, force-redirected.
E2E_DB="${TMPDIR:-/tmp}/kalki-e2e-$$.db"
export DATABASE_URL="file:$E2E_DB"
export TURSO_DATABASE_URL="file:$E2E_DB"
export TURSO_AUTH_TOKEN="e2e-throwaway-token"

# Local auth defaults (CI overrides with its own).
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-e2e-local-secret-not-production}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}"

# 3. Fresh schema per run.
rm -f "$E2E_DB"
npx prisma db push

# 4. Seed the admin when credentials are supplied.
if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  node scripts/seed-admin.cjs "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
fi

# 5. Hand off to Playwright (it owns the server lifecycle).
npx playwright test "$@"
