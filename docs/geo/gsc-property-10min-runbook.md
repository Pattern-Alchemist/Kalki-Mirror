# GSC Property — The 10-Minute Runbook

> **STATUS (2026-08-30): ✅ PROPERTY VERIFIED.**
> `sc-domain:astrokalki.com` — owner **astrokalki.sos@gmail.com** (Verified, via DNS TXT).
>
> Active token (wired into BOTH the meta tag and the file route on Vercel,
> deployed and verified live):
>
> ```
> google-site-verification=_WftyBS7isUB8pb7EWp-k0JVTGdMCXlkocyMmrNNuW4
> ```
>
> DNS zone (Hostinger) also still carries an older, stale token
> (`s6lC7I…9lYrQ`) from an earlier attempt. It is harmless — but any Google
> account holding that token could verify its own property for this domain.
> **Recommended:** delete that one TXT record in Hostinger unless you
> deliberately want that second account as a co-owner.

| Layer | State |
|---|---|
| Domain property `sc-domain:astrokalki.com` | ✅ VERIFIED (astrokalki.sos@gmail.com) |
| DNS TXT (Hostinger) | ✅ live — verified token `_WftyBS7…` |
| Meta tag on every page | ✅ deployed, verified in live HTML (same token) |
| HTML file `/google_WftyBS7….html` | ✅ 200 with exact expected body; wrong tokens 404 |
| IndexNow | ✅ full sitemap (173 URLs) accepted; daily 02:00 UTC cron registered |
| Sitemap submission in GSC | ⬜ human step: Sitemaps → submit `sitemap.xml` |
| Request Indexing | ⬜ human step: inspect `/`, `/consultations`, `/guhya` |

**Remaining human steps (≈3 minutes):**
1. [Sitemaps](https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Aastrokalki.com) → enter `sitemap.xml` → **Submit**.
2. [URL Inspection](https://search.google.com/search-console/inspect?resource_id=sc-domain%3Aastrokalki.com) → inspect and **Request Indexing** for:
   `https://www.astrokalki.com/` · `/consultations` · `/guhya`
3. Performance data starts flowing within 24–48 h; weekly ritual in
   `docs/geo/search-console-us-targeting.md` §4.

---

> One-time setup. Everything machine-side (verification routes, meta tag, sitemap,
> IndexNow cron) is already shipped and live. This runbook is only the two things
> that require **your** Google account: creating the property and proving ownership.
> Full context: `docs/geo/search-console-us-targeting.md`.

**Open:** [search.google.com/search-console](https://search.google.com/search-console) → sign in with the Google account you want to own astrokalki.com data (keep this account long-term; GSC ownership transfers are annoying).

---

## Minutes 0–1 · Create the property

1. Click **Add property** (top-left dropdown).
2. Choose **Domain property** (left option) → enter `astrokalki.com`.
   - Domain covers www + apex + every subdomain and protocol in one property. Recommended.
   - If your registrar login isn't at hand, choose **URL prefix** → `https://www.astrokalki.com/` and use Path B or C below instead.

## Minutes 1–6 · Verify ownership

### Path A — Domain property (DNS TXT record) · recommended

1. Google shows a `google-site-verification=<token>` string. Copy **the whole string**.
2. Open your DNS registrar (where astrokalki.com's nameservers point) → DNS records → add:
   - **Type:** `TXT`
   - **Host/Name:** `@` (apex)
   - **Value:** the full `google-site-verification=…` string
   - **TTL:** default
3. Back in GSC click **Verify**. If it fails once, wait 2 minutes and retry — DNS propagation is usually instant for TXT.

### Path B — URL prefix (verification file, no DNS access needed)

1. GSC → "HTML file" method → note the filename `google<token>.html`.
2. Vercel dashboard → kalki-fix project → Settings → Environment Variables → add:
   - `GSC_VERIFICATION_TOKEN` = `<token>` (the part between `google` and `.html`, **without** the `google` prefix or `.html` suffix)
3. Redeploy (Vercel → Deployments → Redeploy, or any next push). The site then serves
   `https://www.astrokalki.com/google<token>.html` automatically — the route already exists.
4. Click **Verify** in GSC.

### Path C — URL prefix (meta tag, zero files)

1. GSC → "HTML tag" method → copy the `content="…"` token only.
2. Vercel → Environment Variables → add `GOOGLE_SITE_VERIFICATION` = that token → redeploy.
   The meta tag renders on every page automatically.
3. Click **Verify** in GSC.

> Path B and C need one redeploy each; Path A needs none. Paths compose — verifying once is enough.

## Minutes 6–8 · Submit the sitemap

1. GSC sidebar → **Sitemaps**.
2. Enter `sitemap.xml` → **Submit**. (172+ URLs, priorities, stable lastmod — already live.)
3. Status "Success" may take a day to show; that's normal.

## Minutes 8–10 · Prime the pump

1. Sidebar → **URL Inspection** (top search bar) → inspect and **Request indexing** for the three money URLs:
   - `https://www.astrokalki.com/`
   - `https://www.astrokalki.com/consultations`
   - `https://www.astrokalki.com/guhya`
2. Performance data starts flowing within 24–48 h; consult `docs/geo/search-console-us-targeting.md` §4 for the weekly 10-minute ritual.

---

## Already automated (no action, ever)

| Layer | Mechanism |
|---|---|
| Sitemap | `sitemap.xml`, monitor-guarded lastmod |
| Bing / Yandex / Seznam / Naver | IndexNow: daily 02:00 UTC cron pings the full sitemap (`vercel.json` → `/api/indexnow`), plus on-demand `POST /api/indexnow` for targeted pings |
| Verification surface | `/google<token>.html` route + `GOOGLE_SITE_VERIFICATION` meta tag — both env-gated, live |

## Lead-side note

Every consultation lead now carries first/last-touch attribution (utm_*, ad click-ids,
referrer, landing path, sessions) written into the lead row at submit time and rendered
in Admin → Consultation Pipeline. To see campaign names in the board, tag your links:
`https://www.astrokalki.com/consultations?utm_source=instagram&utm_medium=social&utm_campaign=navratri-25`
