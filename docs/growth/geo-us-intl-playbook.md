# GEO PLAYBOOK — US & International expansion (aug26-launch → navratri-oct26)

**Why now:** the question "what about US/International GEO?" must be answered
before Oct 1, because it decides what we post where, in which language, and
how we tag the funnel. The good news below is structural — most of the
international machinery already exists.

---

## 0 · TL;DR

| Layer | International-ready? | Notes |
|---|---|---|
| Site language | ✅ Yes | Whole site is English — verdicts, evidence grades, GUHYA. This is already Western-SEO-compatible language. |
| Pricing | ✅ Yes | Consultations already dual-priced: `₹1,999 / $29` and `₹3,499 / $49`. Pricing page has an INR/USD toggle. Stripe is live. No product work needed. |
| Attribution | ✅ Yes | `kr_attribution` captures `utm_content` and `utm_term` — we can geo-tag every international link **today, with zero code changes** (§3). |
| YouTube content | ⚠️ Half | Titles + on-screen text are already English; VO is Hinglish. Internationally watchable (read-along), not internationally native. |
| Calendar fit | ❌ Not yet | Navratri means nothing to non-Indian viewers. **Halloween is the international money moment** (§8). |
| Measurement | ❌ Blind spot | No geo field in the pipeline yet. Fix = UTM convention now (§3), optional code later (§11). |

**Bottom line:** don't rebuild anything for the Navratri wave. Add the geo
UTM convention, use the English hook variants (§6), time Reddit/X to US
evening — and treat **guhya-halloween-oct26 as the international flagship**.

---

## 1 · The three audiences (who is actually reachable)

**A — Indian diaspora (US, UK, CA, AU, GCC).** Hinglish works for them.
They celebrate Navratri, they have the strongest purchasing power in the
audience, and they already understand the cultural references. This segment
needs **zero content changes** — it needs *placement* and *timing* (§4, §5).
They are the bridge: they'll share a Navratri short into mixed-nationality
feeds, which is how the next segment discovers you.

**B — Western mysticism/occult seekers.** English only. They arrive via
"shadow work", "Jung", "tantra psychology", "karmic pattern" searches and
via Reddit. They don't know what Navratri is — but they absolutely know
**Kālī**, and the Door titles ("The Version of You That Has to Die") are
already in their language. This segment converts on the evidence-graded
framing: verdicts, case files, "what we cannot verify, we mark" reads as
credibility to them, not as disclaimers.

**C — India (current base).** Existing plan stands. This playbook changes
nothing for Segment C.

**First action (you, 2 minutes):** YT Studio → Analytics → Audience →
*When your viewers are on YouTube* + *Top geographies*. If US+UK+CA+AU is
already ≥15% combined, activate everything in §5–§7 immediately. If <5%,
the diaspora + Halloween path (§8) carries the international effort alone.

---

## 2 · What's already international-ready (zero work)

1. **English platform surface.** Every page, every verdict, every case file.
2. **Dual currency.** Consultations (`₹1,999 / $29`, `₹3,499 / $49`), pricing
   toggle, Stripe. A US buyer checks out without friction.
3. **Attribution layer.** `Touch` already stores `content` and `term`
   (see `src/lib/attribution.ts`) — geo tagging is a URL convention, not a
   feature request.
4. **Reddit/Quora answers (§5, §6 of the launch pack).** Written in English,
   value-first, clean links — international by default.
5. **The Door scripts' on-screen text.** All ten shorts carry English
   overlays (`SOMETHING HAS TO DIE THIS NAVRATRI`, `YOUR REPLY IS THEIR
   OXYGEN`…). A non-Hindi viewer can fully follow the argument. This was
   deliberate — the series travels better than it looks.

---

## 3 · UTM geo convention (no code changes)

Every link placed on an international surface gets a geo dimension in
`utm_content` (or `utm_term` where content is already used):

```
utm_content=us   |  uk  |  ca  |  au  |  gcc  |  intl
```

**Examples:**

- Reddit (US-target subs):
  `https://www.astrokalki.com/consultations?utm_source=reddit&utm_medium=post&utm_campaign=aug26-launch&utm_content=us`
- Quora English spaces:
  `https://www.astrokalki.com/patterns?utm_source=quora&utm_medium=answer&utm_campaign=aug26-launch&utm_content=intl`
- YouTube pinned comment (default — leave geo off for the Door series;
  the audience self-selects):
  unchanged, as scripted.

The pipeline then answers "which GEO brought leads?" by sorting the lead
detail's attribution JSON on `content`. The cookie snapshot (~400B) already
carries it end-to-end.

---

## 4 · Timezone & slot matrix

**8:00pm IST posting slot (the Door series) lands at:**

| Market | Local time during Navratri (Oct 11–20, 2026) | Read |
|---|---|---|
| India | 8:00pm | Prime scroll. Unchanged. |
| US East | 10:30am | Morning-scroll slot. Genuinely good. |
| US West | 7:30am | Commute scroll. Decent. |
| UK | 3:30pm | Afternoon dip — acceptable. |
| Australia | ~1:00am | Missed live; algorithm picks it up next evening. Acceptable at current AU share. |

**Decision: keep 8:00pm IST for the whole Navratri wave.** It is
accidentally the US-morning slot, YT distribution is not bound to publish
time beyond the first hour, and the pinned comment is permanent. Do not add
a second daily slot until data demands it.

**Where timing DOES matter — and what to do:**

- **Reddit / X (international surfaces):** post in US evening (6–9pm ET =
  3:30–6:30am IST). Draft at night IST, schedule for the morning slot, or
  just post before bed — Reddit rewards content quality over timing, but
  the first 30 minutes still decide the vote trajectory.
- **Halloween wave (§8):** US evening Oct 31 = early morning IST Nov 1.
  Two-beat plan: diaspora/India beat at 8pm IST, Western beat via Reddit/X
  next IST morning.

---

## 5 · Language strategy per channel

| Channel | Language | Change needed |
|---|---|---|
| YT Shorts (@AstroKalki) | VO Hinglish, overlays/titles English (as scripted) | None for the wave. Add one context line to each description (§7). |
| IG (@unfilteredbuddy_) | English bio + captions already; DM replies can stay Hinglish | None |
| Reddit | English | Add `utm_content=us`/`intl` to the links (§3) |
| Quora | English | Same as Reddit |
| X / LinkedIn founder posts | English already | None |
| WhatsApp broadcast | Hinglish (Segment C) + a one-line English P.S. for diaspora contacts | Optional |

**Rule of thumb:** Hinglish is an India/diaspora asset, not a liability —
it *is* the channel voice. We make content internationally *reachable*
through English overlays, titles, captions, and comments; we do not
deracinate the VO until Segment B is proven large enough to pay for it.

---

## 6 · English hook variants (all 10 doors)

For international cuts, YT community posts, Reddit follows, and any future
English-first short. Same beats as the scripted Hinglish hooks.

| Door | Hinglish (as scripted) | English-first variant |
|---|---|---|
| 1 · Kālī | "Is Navratri kuch marna zaroori hai…" | "Something has to die this Navratri. Not you — a version of you." |
| 2 · Tārā | "Tumhare phone mein sau motivational reels hain…" | "You saved 100 motivational reels. You're still standing in the same spot. Here's why." |
| 3 · Sundarī | "Jo cheez tum sabse zyada chahte ho…" | "Your biggest desire has an installation date. Who installed it?" |
| 4 · Bhuvaneśvarī | "Anxiety tumhara problem nahi hai…" | "Anxiety isn't your problem. Your seat is." |
| 5 · Bhairavī | "'Main gussa nahi karta'…" | "'I never get angry' — the angriest people say this. It's a direction problem." |
| 6 · Chhinnamastā | "Tumne sabko khilaya…" | "You've fed everyone. Who's feeding you?" |
| 7 · Dhūmāvatī | "Sabse darawna phase kaunsa hai?…" | "The scariest phase isn't failure. It's achieving everything and feeling nothing." |
| 8 · Bagalāmukhī | "Har toxic argument ek hi cheez se jeeta jaata hai…" | "You don't win a toxic argument. You freeze it. A 1,000-year-old rule." |
| 9 · Mātaṅgī | "'Log kya kahenge'…" | "'What will people say' has eaten more dreams than failure ever did." |
| 10 · Kamalā | "Free kaam karte ho…" | "You undercharge and call it humility. It's programming." |

---

## 7 · Navratri framing patch for Western viewers (one line, no rebuild)

Add this single line to the YT description footer of each Door short
(merges with the existing footer in `navratri26-shorts-scripts.md`):

```
Navratri is India's ten-night festival of the goddess. This series borrows
its structure — ten nights, ten goddesses, ten doors — as a pattern audit.
No rituals, no prescriptions: psychology through mythology.
```

Why this is enough: Segment B doesn't need the festival explained, it needs
**permission to enter without belonging**. One sentence does that. Kālī
(Door 1) is the recognized Western entry point, and Door 1 is already the
conversion night — the funnel alignment is a coincidence we exploit, not a
coincidence we rely on.

---

## 8 · The international money wave = HALLOWEEN (`guhya-halloween-oct26`)

Navratri is a diaspora wave. **Halloween is the Western wave.** The fit is
structural: GUHYA (paranormal case files, English, verdicts, evidence
grades) is the single most Western-compatible product surface on the site —
and Oct 31 is its biggest organic moment of the year (already in the
campaign kit calendar).

**Positioning:** "Ghost stories are cheap. Verdicts are expensive." — case
files that close with Attested/Debunked, not vibes. This is the anti-creepypasta
angle and it's genuinely differentiated in the Western paranormal niche,
which is saturated with ungraded content.

**Plan of record:**

1. Full halloween kit (shorts scripts in the Door-series format + Reddit/Quora
   answers + IG caption set + money post) — build and push by **Oct 20** so
   wave-2 momentum hands off cleanly.
2. GUHYA landing gets the traffic: `utm_campaign=guhya-halloween-oct26`,
   consultations link carries the funnel for readers who go "who ran this
   investigation?".
3. Reddit is the primary surface (r/Paranormal, r/occult, r/Jung for the
   pattern angle), `utm_content=us`/`intl`.

---

## 9 · International placement list (value-first targets)

**Reddit** (read each sub's self-promo rules before posting; the §5/§6
answer style is the template — answer first, link only if it's genuinely
the resource):

- r/Jung — karmic loops as shadow work; the Mirror Method's depth-psych
  framing belongs here
- r/occult — evidence-graded angle is the differentiator; GUHYA threads
- r/tantra — the Mahāvidyā psychology series; anti-guru-theatre voice fits
- r/Paranormal / r/ParanormalEncounters — GUHYA case discussions
  (halloween wave)
- r/astrology — karmic-loop content; careful, high-volume

**Quora:** English spaces — Spirituality, Hinduism, Astrology, Paranormal.
The §6 fraud-case answer travels as-is.

**Diaspora subreddits** (r/ABCDesis etc.): only value-first participation;
the Navratri series is welcome there as cultural content, not as promo.

---

## 10 · Measurement & decision rules

**Check 1 — Day 3 of the wave (Oct 14):** Admin → Consultation Pipeline;
count leads whose attribution JSON shows `content: us|uk|ca|au|intl`.
Expected near zero — this is a plumbing check, not a verdict.

**Check 2 — Day 7 (Oct 18):** YT Studio → Audience → Top geographies +
pipeline geo-tag count. Decision table:

| Signal | Action |
|---|---|
| US+UK+CA+AU ≥ 15% of new viewers AND ≥3 geo-tagged leads | Green-light §11 code (geo capture + geo-aware currency default) + plan 1 English-native long-form per week from November |
| ≥ 8% viewers, <3 leads | Keep placement effort, raise Reddit/X cadence, no code yet |
| < 5% | Stay India-first through 2026; let Halloween data be the second reading; zero further spend on international |

**Check 3 — Nov 5 (post-Halloween):** the decisive read for whether 2027
opens with a two-geo strategy or a single-geo one.

---

## 11 · Optional code phase (needs your go-ahead — not built yet)

**STATUS UPDATE (Aug 31, 2026): BUILT AND SHIPPED.** Phase C went live:

1. **Server-side geo capture** — `src/middleware.ts` mirrors Vercel's
   `x-vercel-ip-country` into a first-party `kr_country` cookie (7d, Lax) on
   every dynamic route; `src/lib/attribution.ts` stamps `country` into each
   attribution touch; the consultation server action writes it to the new
   `Consultation.country` column, with the edge header as fallback at submit
   (blocked cookies still get a country). Admin pipeline shows `· US`-style
   geo suffixes on source chips + a Country row in the attribution drill-down.
2. **Geo-aware currency default** — `detectCurrency()` now reads `kr_country`
   first: `IN` → INR, any other known country → USD; the old locale heuristic
   remains the fallback when the cookie hasn't been minted yet.

Both are fail-silent: local dev / non-Vercel / blocked cookies degrade to the
exact pre-Phase-C behavior.

---

## Appendix C — First data read (Aug 31, 2026, YT Studio 28-day window)

**The numbers:** 386 views (−72% WoW), 5.96 watch-hours (−74%). Shorts = 83%
of views (322). Top video: "I AM KALKI 🔱 The Avatar Has Arrived" = 174 views
(45% of the entire channel). CTR 3.89% (↑ from 3.5%) on impressions that fell
53%. Traffic: Channels 31.3% / Search 31.1% / Browse 24.1%. Geography:
Southern Asia (India) ≈ 24.9%; **US/UK/CA/AU not in top list → Tier-1 well
below the 5% threshold.**

**Decision per §10:** **India-first confirmed through 2026.** Zero further
international spend. Halloween (§8) remains the second reading — one wave,
one experiment, real thresholds.

**What the numbers actually say (beyond the geo ruling):**

1. **The packaging works; the distribution stopped.** CTR rising while
   impressions collapse −53% is the signature of a cadence problem, not a
   creative problem. When you post less, YT stops testing you. The Door
   series IS the fix: 10 consecutive daily posts for 10 days is the strongest
   distribution signal the channel can send.
2. **Identity content is the channel's gravity well.** "I AM KALKI" at 45%
   of channel views — 4× the #2 video — says the avatar/founder-identity
   frame pulls harder than breakup/motivation frames. The KALKI brand and
   the site name are the same word for a reason. Feed it.
3. **Search = 31% is quietly the best number here.** It means English
   searchable titles are already landing. The Door titles are search-bait
   ("The Version of You That Has to Die This Navratri") — keep titles
   exactly as scripted, don't improvise.
4. **Bridge Shorts → long-form (the Studio AI's suggestion is sound and
   free):** use Related Video on every Door short — Door 1 links to the
   "I AM KALKI" video (identity hand-off), Door N links to Door N−1 (binge
   chain). Scripted into `navratri26-shorts-scripts.md` §0.

**Next geo check: Nov 5 (post-Halloween)** — same thresholds. If GUHYA's
English case files pull Tier-1 traffic ≥15% + 3 geo-tagged leads (the
Phase C `country` column now measures this automatically, even for
untagged organic traffic), 2027 opens two-geo. Otherwise: single-geo,
decision closed, no re-litigating until Feb 2027.
