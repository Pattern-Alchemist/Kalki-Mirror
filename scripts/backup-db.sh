#!/usr/bin/env bash
# BACKUP WRAPPER — `npm run db:backup` entry point (referenced by package.json).
# Loads .env.local if present (without exporting secrets to child output),
# then hands off to the Node dump engine. Read-only against the source DB.
#
# Usage: npm run db:backup [-- --keep 30]
set -euo pipefail
cd "$(dirname "$0")/.."

# Load .env.local if it exists (do not fail when absent — CI/Vercel may
# provide env vars directly).
if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

exec node scripts/backup-db.mjs "$@"
