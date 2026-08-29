# Search Console — US Targeting Runbook

> Owner: founder (Kaustubh) · Prep: complete (this document + the verification route +
> the monitor layer shipped in this commit) · Est. founder time: **20 minutes, once**,
> then ~10 minutes weekly.

This closes the last founder-side item of the US-market layer
(`docs/geo/us-market-positioning.md`). Everything a machine could do has been done;
everything below needs **your Google account and your DNS registrar login** — those are
the only two things Super Z cannot hold.

---

## 0. What "US targeting" means now (read once)

Google retired the old *International Targeting* report and the country-setting knob.
In 2026, where Google serves your pages is decided by three signals — and all three
are already in place on astrokalki.com:

| Signal | State on astrokalki.com | Where |
|---|---|---|
| **hreflang** `en-US` + `x-default` on every indexable page | ✅ verified on all 172 sitemap URLs | `src/lib/utils/metadata.ts` → `pageAlternates()` |
| **gTLD, not ccTLD** (`.com` carries no forced country) | ✅ | domain itself |
| **US-authored content** (spelling, examples, query intent: "people pleasing roots", "emotional patterns") | ✅ karma front door, patterns, homepage corpus block | `/karma`, `/patterns`, `/` |

So in Search Console there is **nothing to switch on** for targeting. What remains is
*claiming* the property so Google shows you the data, and *monitoring* US performance.
There is also **nothing to fear from India traffic**: hreflang `en-US` + `x-default`
means the site is eligible everywhere, strongest in the US.

---

## 1. Claim the property (choose ONE path)

### Path A — Domain property via DNS TXT *(recommended)*

Covers `astrokalki.com` + `www.` + every subdomain, both http/https, forever. No code,
no redeploy, survives redesigns.

1. Go to **https://search.google.com/search-console** → sign in with the Google
   account that should own the site (the founder account).
2. Click **Add property** → choose **Domain** (left tile).
3. Enter `astrokalki.com` — exactly this, no `https://`, no `www.` → **Continue**.
4. Google shows a TXT record like
   `google-site-verification=AbC123...` — copy it.
5. Open your DNS registrar (wherever the domain's nameservers point — GoDaddy,
   Namecheap, Cloudflare, etc.) → DNS settings → **Add record**:
   - Type: `TXT`
   - Name/Host: `@` (the root domain)
   - Value: the full `google-site-verification=...` string
   - TTL: default (600 is fine)
6. Save. DNS can take 5 minutes to a few hours. Back in GSC, click **Verify**.
   If it says "not propagated yet", wait and retry — the record is cached as pending,
   nothing is lost.
7. Once verified, also click **DNS verification keeps working** confirmation if shown.

**After verification, do this so the daily monitor goes green (optional but tidy):**
in the GitHub repo → Settings → Secrets and variables → Actions → New repository secret:
- Name: `GSC_VERIFY_METHOD` · Value: `dns`

The geo-monitor's `gsc_verification` check then reports PASS and stops reminding you.

### Path B — URL-prefix property via the built-in verification route (no DNS access)

A `/google<token>.html` route is already deployed and fail-closed:

1. In GSC: **Add property** → **URL prefix** → enter `https://www.astrokalki.com`.
2. Verification methods → **HTML file**. GSC shows a filename like
   `google1a2b3c4d5e.html`. Copy the middle part — the token, e.g. `1a2b3c4d5e`
   (the route also accepts the whole filename pasted as-is).
3. Vercel dashboard → your KALKI project → **Settings → Environment Variables**:
   - Name: `GSC_VERIFICATION_TOKEN` · Value: the token
   - Environment: Production (add Preview too if you like)
4. **Deployments → ⋯ → Redeploy** (env changes need a redeploy to take effect).
5. Sanity check: `https://www.astrokalki.com/google<token>.html` should show
   `google-site-verification: google<token>.html`.
6. Back in GSC → **Verify**.
7. In the GitHub repo secrets (as above) add:
   - `GSC_VERIFICATION_TOKEN` = the token
   The monitor then fetches the file daily and confirms it stays live.

> Path B only claims the exact `https://www.astrokalki.com` prefix. If you ever want
> apex or subdomain coverage in GSC, add the Domain property (Path A) later — both can
> coexist.

---

## 2. Submit the sitemap (2 minutes)

1. In the (now verified) property: left sidebar → **Sitemaps**.
2. Add a new sitemap: enter `sitemap.xml` (GSC prefixes the domain for you).
3. **Submit**. Expected: *Success — 172 URLs found* (the count grows as the corpus grows).
4. The report's "Last update" column now shows honest content dates: the sitemap
   carries a stable `SITE_LASTMOD` (defined in `src/lib/canonical.ts`) instead of
   per-build timestamps. **Rule of thumb: when you publish or materially change
   content, bump `SITE_LASTMOD` in that one file.**

---

## 3. Prime indexing for the 8 priority URLs (5 minutes, once)

For each of these, use **URL Inspection** (top search bar in GSC) → paste the URL →
**Request indexing**:

1. `https://www.astrokalki.com/` — homepage (entity + corpus block)
2. `https://www.astrokalki.com/karma` — the US front door (highest US intent)
3. `https://www.astrokalki.com/patterns` — Pattern Atlas hub
4. `https://www.astrokalki.com/archive` — Akashic Archive hub (56 folios)
5. `https://www.astrokalki.com/archetypes` — pantheon hub
6. `https://www.astrokalki.com/aghori-tantra` — course hub (62 pages beneath)
7. `https://www.astrokalki.com/about` — founder entity (Person → sameAs GitHub)
8. `https://www.astrokalki.com/glossary` — the 86-term Lexicon (DefinedTermSet)

Queue quota is ~10–12 requests/day; 8 fits comfortably. The remaining ~160 URLs will
be discovered from these hubs + the sitemap within days.

---

## 4. The weekly 10-minute ritual (US performance)

In GSC → **Performance** → **Search results**:

1. **Filter: Country = United States** (below the chart, *+ New* → *Country* →
   *United States*). Save this view — it's your primary dashboard.
2. Watch four numbers, 4-week window:
   - **Impressions (US)** — discovery is the leading indicator for a new domain;
     growth here means the karma/patterns cluster is entering American queries.
   - **CTR on /karma and /patterns pages** — titles/meta doing their job (expect
     2–6% while unknown; improving titles moves it).
   - **Average position for "karma", "what is karma", "people pleasing",
     "siddhi", "tantra meaning"** class queries — position 20→10 is the first
     real climb; page 1 for long-tail (e.g. "saṃskāra vs vāsanā") is the near win.
   - **Queries gaining impressions week-over-week** — these name the next content
     move (GEO compounding loop from Dossier No. 03, Part III).
3. **Pages report**: confirm the karma cluster + Aghorī lesson routes are appearing.
   If lesson routes stay absent for 2+ weeks, re-run step 3 for the hub + 2–3 lessons.
4. **Core Web Vitals + Mobile Usability** reports: both derive from field data once
   US traffic starts; the Lighthouse CI budget workflow already guards the lab side.

Expectation-setting for a ~3-week-old domain: near-zero impressions for the first
2–4 weeks is normal (sandbox + discovery lag). The meaningful read on US targeting
is at the **30/60/90-day** marks: impressions compounding, karma cluster as the
top entry pages, US share of total impressions rising above 40%.

---

## 5. What NOT to do

- **Don't set any legacy "geographic target" to India** — it doesn't exist anymore,
  but older SEO guides still suggest it. There is no country knob to turn; hreflang
  already does the work.
- **Don't remove or "simplify" the hreflang pair** — `en-US` + `x-default` on every
  page is the targeting mechanism. The `hreflang_us` monitor check guards this daily.
- **Don't submit the sitemap via ping URLs or re-submit on every deploy** — one
  submission is enough; Google re-reads it. Re-submit only after a big URL-space
  change (like the /deities → /archetypes move).
- **Don't chase every "Page is not indexed" entry** — for a young site, Google
  legitimately crawls a sample first. Act only on *Duplicate* or *Redirect* reasons
  (there should be none — canonicals are self-referencing sitewide).

---

## 6. Division of labor & current state

| Item | Owner | State |
|---|---|---|
| hreflang en-US + x-default, sitewide, self-referencing | Super Z | ✅ live, monitor-guarded (`hreflang_us`) |
| Sitemap: 172 URLs, priorities, stable `SITE_LASTMOD` | Super Z | ✅ live, monitor-guarded (`sitemap_lastmod`) |
| robots.txt `Sitemap:` directive, AI-crawler policy | Super Z | ✅ live, monitor-guarded (`robots_ai_policy`) |
| HTML-file verification route (`/google<token>.html`) | Super Z | ✅ live, fail-closed until token set |
| GSC monitor checks + optional repo secrets wiring | Super Z | ✅ shipped (`gsc_verification`) |
| **Create + verify the GSC property (Path A or B)** | **Founder** | ⏳ this runbook, §1 |
| **Submit sitemap.xml** | **Founder** | ⏳ §2 |
| **Request indexing ×8 priority URLs** | **Founder** | ⏳ §3 |
| **Weekly US performance read** | **Founder** | ⏳ §4 |
| Bump `SITE_LASTMOD` on meaningful content changes | Founder | rule in §2 |
| Person `sameAs` expansion (LinkedIn/X/YouTube URLs) | Founder | awaiting real profile URLs |

Once you complete §1, the daily GEO Monitor action's `gsc_verification` check flips
from WARN (unclaimed) to PASS — that's the machine confirming your claim, hands-free
from then on.
