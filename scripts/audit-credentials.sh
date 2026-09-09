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
ok = s.get("ok", "?")
total = s.get("total", "?")
stored = d.get("stored")
audit_ms = d.get("auditMs", "?")
print(f"summary: {ok}/{total} credentials verify - stored={stored} - {audit_ms}ms")
for c in d.get("credentials", []):
    mark = "OK  " if c.get("ok") else "FAIL"
    status = " HTTP " + str(c["status"]) if c.get("status") else ""
    detail = " - " + c["detail"] if c.get("detail") else ""
    lat = c.get("latencyMs", "?")
    print("  [" + mark + "] " + c["provider"].ljust(12) + " " + c["reason"] + status + " " + str(lat) + "ms" + detail)
'
