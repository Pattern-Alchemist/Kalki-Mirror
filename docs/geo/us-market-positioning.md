# KALKI — US-Market Positioning & GEO Layer

**Status:** v1.0 · 2026-08-29 · Owner: founder + lead engineer
**Companion to:** Dossier No. 03 (The Visibility Engine), V2.0 Master Build Spec §12, Technical Gap Analysis (`docs/technical-gap-analysis/`)

---

## 1. The market decision

KALKI's primary commercial audience is the **international seeker — US-first**. The reasoning, recorded so it guides every later decision:

1. **The pain is the market.** Western seekers searching for authentic Tantric sources are systematically met with two failure modes: content mills that summarize without sources, and "gurus" who monetize fear. KALKI's founding stance — every claim carries its evidence grade — is the precise antidote to both. The crook problem is not a risk of this market; it is the *qualification* of this market.

2. **Willingness to pay for depth.** The US audience for serious contemplative study already pays academic and retreat prices ($200–$2,000) and understands tiered access. The Covenant tiers map naturally onto expectations this audience already holds.

3. **Respect dynamics.** Students at cultural distance tend to treat lineage, teacher time, and methodology with *more* formality, not less. The consultation and station-gating model is calibrated for exactly this posture.

4. **India remains the authenticity anchor, not the commercial focus.** The platform's rootedness in the tradition is the asset being sold; it stays visible in provenance, lineage, and Sanskrit discipline. The market and the moat are different things — the US is the market, the lineage is the moat.

## 2. What this changes technically (shipped in this phase)

| Layer | Change | Where |
|---|---|---|
| Locale declaration | `lang="en-US"` on all public pages; `hreflang` `en-US` + `x-default` | `src/app/layout.tsx`, `src/lib/utils/metadata.ts` |
| Entity identity | One consolidated `@graph` — WebSite + Organization + **Person with sameAs** | `src/components/layout/PublicShell.tsx` |
| Machine surface | `llms.txt` route handler: 110 curated links, 10 sections, canonical-count usage notes | `src/app/llms.txt/route.ts` |
| AI-crawler policy | 14 generative-engine crawlers welcomed by name; private surfaces still disallowed | `src/app/robots.ts` |
| Count integrity | `src/lib/canonical.ts` — every count derived from data, imported everywhere, never typed by hand | all metadata files |
| Schema depth | `DefinedTermSet` with all 86 Lexicon terms | `src/app/glossary/layout.tsx` |
| Sitemap intent | Patterns 0.75, folios 0.7 | `src/app/sitemap.ts` |
| Self-checking | `geo-monitor.py` — 11 checks, daily via GitHub Actions | `scripts/geo-ops/`, `.github/workflows/geo-monitor.yml` |

Runtime remains **zero external API** — the site builds and serves with no AI keys; the citation tracker (Phase 3) is the only optional key and lives in CI, not the app.

## 3. What comes next (in order)

1. **Google Search Console**: set International Targeting → United States (needs console access — founder action). Submit the sitemap; watch AI-referral sessions (chatgpt.com, perplexity.ai) in Analytics.
2. **Phase 1 entity work**: homepage to 300+ words in US voice; founder's public profiles (LinkedIn, X, YouTube) added to Person `sameAs` as they come online; Pantheon canonicalization (`/archetypes` = the Ten Mahāvidyās deep-dive; `/deities` = the 16-force compendium — differentiated, then internally linked).
3. **The Karma cluster** (Dossier No. 03, Part IV): sixteen pages engineered for the widest query territory in the genre — this is the US front door. Karma queries are global-English queries; the cluster launches in US voice with the manual PDF as the lead magnet.
4. **Payments**: Stripe-first checkout in USD (Razorpay can follow for India later); prices displayed USD-first.
5. **Measurement**: monthly citation baseline (Phase 3, `kalki-geo-ops` citation tracker) + the six funnel events. The KPI lattice in Dossier No. 03 §8.1 is the scoreboard.

## 4. Voice rules for US copy (standing)

- US spelling (color, center, recognize, practice as verb where natural).
- Sanskrit terms with IAST diacritics, plain meaning in the same breath, Lexicon link for depth.
- No fear mechanics, no countdowns, no dark patterns — the audience recognizes them instantly, and the platform's stance forbids them.
- Titles as the question the seeker actually types ("What is karma?", "Ten Mahavidyas", "emotional patterns").
