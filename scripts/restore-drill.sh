#!/usr/bin/env bash
# ============================================================
# KALKI — RESTORE DRILL (Vol. 2 #13 workflow, Vol. 4 #20 script)
# ------------------------------------------------------------
# A backup that has never been restored is a hope, not a backup.
# This drill makes the restore path REAL: dump production →
# restore into a throwaway SQLite file → assert integrity,
# schema truth, and row fidelity → report.
#
# Contract (matches .github/workflows/restore-drill.yml):
#   TURSO_DATABASE_URL / TURSO_AUTH_TOKEN  (aliases: DATABASE_URL,
#       DATABASE_AUTH_TOKEN) — production libSQL credentials.
#   SCRATCH_DB_URL — where to restore, default file:/tmp/kalki-drill.db
#
# Modes:
#   default              — fresh dump via scripts/backup-db.mjs, then restore it
#   SCRATCH_SOURCE_DUMP  — drill a specific existing dump (.sql.gz or .sql)
#                          instead of dumping
#
# Quarterly cadence runs automatically (Jan/Apr/Jul/Oct, 2nd, 04:00 UTC).
# Any assertion failure exits non-zero — the workflow emails the founder.
#
# NOTE: the restore + assertion engine lives in scripts/restore-drill.mjs
# (pure node, no sqlite3 CLI dependency — CI runners and dev sandboxes
# alike).
# ============================================================
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

DB_URL="${TURSO_DATABASE_URL:-${DATABASE_URL:-}}"
if [ -z "$DB_URL" ]; then
  echo "✗ No database URL — set TURSO_DATABASE_URL (or DATABASE_URL)." >&2
  exit 1
fi

SCRATCH_DB_URL="${SCRATCH_DB_URL:-file:/tmp/kalki-drill.db}"

echo "• Restore drill — target: ${SCRATCH_DB_URL#file:}"

# ── 1. Obtain the dump ───────────────────────────────────────────────────────
if [ -n "${SCRATCH_SOURCE_DUMP:-}" ]; then
  DUMP="$SCRATCH_SOURCE_DUMP"
  echo "• Drilling pre-existing dump: $DUMP"
else
  echo "• Dumping production (scripts/backup-db.mjs)…"
  TURSO_DATABASE_URL="$DB_URL" \
  TURSO_AUTH_TOKEN="${TURSO_AUTH_TOKEN:-${DATABASE_AUTH_TOKEN:-}}" \
    node scripts/backup-db.mjs
  DUMP="$(ls -t backups/*-kalki-dump.sql.gz | head -1)"
  echo "• Newest dump: $DUMP"
fi

# ── 2+3+4. Restore, assert, verify fidelity (node engine) ───────────────────
export TURSO_DATABASE_URL="$DB_URL"
export TURSO_AUTH_TOKEN="${TURSO_AUTH_TOKEN:-${DATABASE_AUTH_TOKEN:-}}"
node scripts/restore-drill.mjs --dump "$DUMP" --scratch "$SCRATCH_DB_URL"
