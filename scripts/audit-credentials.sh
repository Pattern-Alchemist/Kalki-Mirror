#!/usr/bin/env bash
# ═════════════════════════════════════════════════════════════
# KALKI — credential audit trigger (Vol. 5 #2)
# -------------------------------------------------------------
# The server-side audit lives at /api/cron/cred-audit (probes
# Turso, OpenRouter, Resend, Cloudinary against their verify
# endpoints using the SERVER env, stores verdicts in OpsState).
# This script triggers it remotely and prints the verdicts.
#
# Usage:
#   BASE_URL=https://www.astrokalki.com CRON_SECRET=... bash scripts/audit-credentials.sh
#   bash scripts/audit-credentials.sh --dry-run   # report, store nothing
# ═════════════════════════════════════════════════════════════
set -euo pipefail

BASE_URL="${BASE_URL:-https://www.astrokalki.com}"
CRON_SECRET="${CRON_SECRET:?CRON_SECRET required — the value from the ops env record}"
EXTRA="${1:-}"

QUERY="key=${CRON_SECRET}"
[ "$EXTRA" = "--dry-run" ] && QUERY="${QUERY}&dryRun=1"

echo "→ auditing credentials at ${BASE_URL}/api/cron/cred-audit ${EXTRA}"
curl -fsS -m 90 "${BASE_URL}/api/cron/cred-audit?${QUERY}" \
  | python3 -c '
import json, sys
d = json.load(sys.stdin)
s = d.get("summary", {})
print(f"summary: {s.get(\"ok\", \"?\")}/{s.get(\"total\", \"?\")} credentials verify · stored={d.get(\"stored\")} · {d.get(\"auditMs\", \"?\")}ms")
for c in d.get("credentials", []):
    mark = "OK  " if c.get("ok") else "FAIL"
    status = f" HTTP {c[\"status\"]}" if c.get("status") else ""
    detail = f" — {c[\"detail\"]}" if c.get("detail") else ""
    print(f"  [{mark}] {c[\"provider\"]:<12} {c[\"reason\"]}{status} {c.get(\"latencyMs\", \"?\")}ms{detail}")
'
