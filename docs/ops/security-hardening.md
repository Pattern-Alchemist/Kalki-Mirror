# Security Hardening Runbook — astrokalki.com

> Context: credentials were shared across chat sessions during launch work.
> This runbook closes that window. Total time: ~20 minutes. Do these in order.

## 1. Enable 2FA on the admin console (2 min)

1. Log in: https://www.astrokalki.com/admin (archivist@kalki.mirror)
2. Settings → Two-Factor Authentication → enable (TOTP app: Google Authenticator / Aegis)
3. Scan QR → verify once → **store backup codes offline** (password manager, not chat)

## 2. Rotate the GitHub PAT (3 min)

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained
2. Revoke the token shared in chat (name: whatever it is; created for pushes)
3. Generate new: repo `Pattern-Alchemist/Kalki-Mirror`, scope **Contents: Read & write** only
4. Update the remote on any machine that pushes:
   `git remote set-url origin https://<NEW_PAT>@github.com/Pattern-Alchemist/Kalki-Mirror.git`

## 3. Rotate the Turso auth token (5 min)

1. `turso db tokens invalidate kalki-mirror-pattern-alchemist` (or Turso dashboard → database → tokens)
2. Create replacement token → update `TURSO_AUTH_TOKEN` in **Vercel → Project → Settings → Environment Variables** (Production + Preview)
3. Redeploy (any empty commit, or Vercel dashboard → Deployments → Redeploy latest)
4. Smoke test: home 200, /admin login works, /api/health 200

## 4. Rotate remaining shared secrets (5 min)

| Secret | Where to rotate | Where to update |
|---|---|---|
| Cloudinary API secret | Cloudinary console → Settings → Access Keys | `CLOUDINARY_URL` in Vercel env |
| OpenRouter key | openrouter.ai → Keys → create new, revoke old | `OPENROUTER_API_KEY` in Vercel env |
| Google account password | myaccount.google.com → Security (enable 2FA too) | nowhere — just memorize |
| Vercel token | vercel.com → Settings → Tokens | only used transiently for API deploys |

## 5. Already-closed items (no action)

- SUPERADMIN password rotated out of the seeded default (bcrypt-verified, old dead —
  tested live 2026-09-02)
- Admin routes: IP allowlist + login rate-limit + noindex + session validation active
- Public APIs guarded (401 unauth), honeypot + rate-limit on public capture endpoints

## 6. Posture going forward

- Credentials move by password manager share links that expire — never chat paste.
- PATs are fine-grained, single-repo, rotated every 90 days.
- The chat history that held these is now presumed public: rotation above is the fix,
  deletion requests to platforms are not reliable protection.
