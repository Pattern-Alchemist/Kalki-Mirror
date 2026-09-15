#!/usr/bin/env python3
"""Vol. 7 #3 — TOTP break-glass: clear the 2FA fields on the admin row.

The TOTP secret is burned (in chat history). The founder can't log in
to /admin because the 2FA gate requires a code from a secret that's
no longer accessible. This script clears the twoFactor fields directly
via Turso, dropping the admin back to password-only login so the
founder can re-enroll TOTP through the settings page.

USAGE:
  TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... python3 scripts/totp-break-glass.py
"""
import os
import sys

try:
    from libsql_client import create_client
except ImportError:
    try:
        import requests
        # Use raw HTTP if libsql_client isn't available
        print("libsql_client not available, using raw HTTP...")
        USE_HTTP = True
    except ImportError:
        print("FAIL: no HTTP client available", file=sys.stderr)
        sys.exit(1)
else:
    USE_HTTP = False

url = os.environ.get('TURSO_DATABASE_URL') or os.environ.get('DATABASE_URL')
token = os.environ.get('TURSO_AUTH_TOKEN') or os.environ.get('DATABASE_AUTH_TOKEN')

if not url or not token:
    print('FAIL: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set', file=sys.stderr)
    sys.exit(1)

if USE_HTTP:
    # Raw HTTP approach via Turso's REST API
    import json

    def execute(sql, args=None):
        body = json.dumps({"statements": [{"sql": sql, "args": args or []}]})
        # Turso uses the libsql HTTP API
        http_url = url.replace('libsql://', 'https://') if url.startswith('libsql://') else url
        resp = requests.post(
            f"{http_url}/v2/pipeline",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            data=json.dumps({"requests": [{"type": "execute", "stmt": {"sql": sql}}]})
        )
        if resp.status_code not in (200, 201):
            raise Exception(f"HTTP {resp.status_code}: {resp.text[:200]}")
        return resp.json()
else:
    def execute(sql, args=None):
        client = create_client(url, auth_token=token)
        return client.execute(sql, args or [])

# 1. Show the current state
print("Before:")
result = execute(
    'SELECT email, "twoFactorEnabled", "twoFactorSecret" IS NOT NULL as has_secret, "twoFactorBackupCodes" IS NOT NULL as has_backup FROM "User" WHERE email = ?',
    ['archivist@kalki.mirror']
)
if USE_HTTP:
    results = result.get('results', [{}])[0].get('results', {}).get('rows', [])
    for row in results:
        values = [v.get('value', v.get('text', v.get('integer', '?'))) for v in row.get('values', [])]
        print(f"  {values}")
else:
    for row in result.rows:
        print(f"  {row.email}: 2FA enabled={row.twoFactorEnabled}, has_secret={row.has_secret}, has_backup={row.has_backup_codes}")

# 2. Clear the 2FA fields
print("\nClearing 2FA fields...")
execute(
    'UPDATE "User" SET "twoFactorEnabled" = 0, "twoFactorSecret" = NULL, "twoFactorBackupCodes" = NULL WHERE email = ?',
    ['archivist@kalki.mirror']
)

# 3. Verify
print("\nAfter:")
result = execute(
    'SELECT email, "twoFactorEnabled", "twoFactorSecret" IS NOT NULL as has_secret FROM "User" WHERE email = ?',
    ['archivist@kalki.mirror']
)
if USE_HTTP:
    results = result.get('results', [{}])[0].get('results', {}).get('rows', [])
    for row in results:
        values = [v.get('value', v.get('text', v.get('integer', '?'))) for v in row.get('values', [])]
        print(f"  {values}")
else:
    for row in result.rows:
        print(f"  {row.email}: 2FA enabled={row.twoFactorEnabled}, has_secret={row.has_secret}")

print("\n✓ TOTP break-glass complete. The admin can now log in with password-only.")
print("  Re-enroll TOTP immediately at /admin/settings after login.")
