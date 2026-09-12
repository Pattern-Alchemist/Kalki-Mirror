#!/usr/bin/env bash
# =============================================================
# KALKI — Turso failover rehearsal (re-materialized, Vol. 6 #2)
# -------------------------------------------------------------
# The OUTAGE half of the restore story, per docs/ops/failover-rehearsal.md:
# start the PRODUCTION binary with TURSO_DATABASE_URL pointed at an
# unreachable endpoint (libsql://127.0.0.1:9/… — connection refused)
# and assert the outage posture — 18 assertions:
#
#   1–12  static-corpus surfaces          → 200  (they read the baked
#         db/custom.db; the corpus never needed Turso)
#   13    /api/health                     → 503  (failure is NAMED)
#   14    /api/health body                → status critical + database.status error
#   15    /redeem                         → 200 honest (signed-out render)
#   16    /profile                        → 200 honest
#   17    /api/keys                       → 401  (auth fails honest)
#   18    /api/admin/stats                → 401
#
# Every probe carries a 15s ceiling — a hang is worse than an error.
# Requires a production build first (npm run build) — the drill rehearses
# the real binary, not dev mode.
# =============================================================
set -uo pipefail
PORT=3457
BASE="http://127.0.0.1:$PORT"
LOG=$(mktemp)
PASS=0; FAIL=0

cleanup() { [ -n "${SRV_PID:-}" ] && kill "$SRV_PID" 2>/dev/null; rm -f "$LOG"; }
trap cleanup EXIT

if [ ! -f .next/BUILD_ID ]; then
  echo "FAIL: no production build (.next/BUILD_ID missing) — run: npm run build" >&2
  exit 1
fi

echo "failover rehearsal: booting production binary with Turso BLOCKED (port $PORT)"

TURSO_DATABASE_URL='libsql://127.0.0.1:9/kalki-failover-drill' \
TURSO_AUTH_TOKEN='drill-token-dead-on-arrival' \
DATABASE_URL='file:./db/custom.db' \
SITE_URL="$BASE" \
NEXTAUTH_URL="$BASE" \
NEXTAUTH_SECRET='drill-secret-not-a-real-secret' \
PORT=$PORT \
npx next start -p $PORT >"$LOG" 2>&1 &
SRV_PID=$!

# Boot wait: the first static surface must answer within 30s
# (client creation is lazy — nothing dials Turso at startup).
BOOTED=0
for _ in $(seq 1 30); do
  if curl -fsS -m 15 -o /dev/null "$BASE/" 2>/dev/null; then BOOTED=1; break; fi
  sleep 1
done
if [ "$BOOTED" != "1" ]; then
  echo "FAIL: server never booted with Turso blocked — lazy-client invariant broken."; tail -20 "$LOG"; exit 1
fi
echo "boot: OK (Turso unreachable, server up)"

check() { # $1=n  $2=name  $3=expected  $4=actual
  if [ "$3" = "$4" ]; then
    PASS=$((PASS+1)); printf '  [%2d/18] PASS  %-28s %s\n' "$1" "$2" "$4"
  else
    FAIL=$((FAIL+1)); printf '  [%2d/18] FAIL  %-28s expected %s, got %s\n' "$1" "$2" "$3" "$4"
  fi
}

code() { curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$1" 2>/dev/null; }

# 1–12: the static-corpus twelve
SURFACES=(/ /primer /glossary /patterns /archive /library /sequences /archetypes /breathwork /aghori-tantra /method /search)
i=1
for p in "${SURFACES[@]}"; do
  check "$i" "static $p" 200 "$(code "$BASE$p")"
  i=$((i+1))
done

# 13–14: health names the failure
H_CODE=$(code "$BASE/api/health")
check 13 "/api/health" 503 "$H_CODE"
H_BODY=$(curl -s --max-time 15 "$BASE/api/health" 2>/dev/null)
H_STATUS=$(printf '%s' "$H_BODY" | python3 -c "import json,sys
try: print(json.load(sys.stdin).get('status','?'))
except Exception: print('unparseable')" 2>/dev/null)
H_DB=$(printf '%s' "$H_BODY" | python3 -c "import json,sys
try: print(json.load(sys.stdin).get('database',{}).get('status','?'))
except Exception: print('unparseable')" 2>/dev/null)
if [ "$H_STATUS" = "critical" ] && [ "$H_DB" = "error" ]; then HV="critical+error"; else HV="$H_STATUS/$H_DB"; fi
check 14 "health names the outage" "critical+error" "$HV"

# 15–16: honest degraded renders
check 15 "/redeem honest render" 200 "$(code "$BASE/redeem")"
check 16 "/profile honest render" 200 "$(code "$BASE/profile")"

# 17–18: auth fails honest
check 17 "/api/keys" 401 "$(code "$BASE/api/keys")"
check 18 "/api/admin/stats" 401 "$(code "$BASE/api/admin/stats")"

echo
echo "failover rehearsal: $PASS/18 PASS, $FAIL FAIL"
[ "$FAIL" -eq 0 ]
