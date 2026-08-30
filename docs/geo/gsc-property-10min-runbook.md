# GSC Property — The 10-Minute Runbook

> **STATUS (2026-08-30): DNS TXT record is LIVE and all three verification
> surfaces are armed.** The record visible in public DNS at the apex:
>
> ```
> astrokalki.com.  TXT  "google-site-verification=s6lC7I_1OZI6LHndjBGWwxP2dvsrX0NBVh39YN9lYrQ"
> ```
>
| Surface | State |
|---|---|
| DNS TXT (Hostinger, ns1/ns2.dns-parking.com) | ✅ live in the zone |
| Meta tag on every page (`GOOGLE_SITE_VERIFICATION`) | ✅ deployed, verified in live HTML |
| HTML file `/googles6lC…9lYrQ.html` (`GSC_VERIFICATION_TOKEN`) | ✅ 200 with exact expected body; wrong tokens 404 |
| IndexNow | ✅ key file live, targeted ping accepted (HTTP 200), daily 02:00 UTC cron registered |

**The only remaining human step:** open
[search.google.com/search-console](https://search.google.com/search-console) →
create the property (Domain → `astrokalki.com`) → if the token GSC shows matches
the one above, click **Verify** — it will pass instantly. Then submit
`sitemap.xml` and Request Indexing for the three money URLs (Minutes 6–10 below).

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
