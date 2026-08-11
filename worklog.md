## Research Page — Cinematic Upgrade

### Date: 2025-01-XX

### Changes Made:
1. **Replaced PageHero** with full-bleed cinematic hero section matching Method/Practice page pattern:
   - CinematicImage with kenBurns=slow, scrim=bottom, vignette, volumetric, dust, priority
   - Same observatory-alt image URL preserved
   - Section label EPISTEMIC RIGOUR, hero-heading style title
   - bg-gradient-to-t from-deep-black via-deep-black/30 to-deep-black/40 overlay
   - Content in relative z-10 container max-w-[1400px]

2. **Added atmospheric bg + stats bar** after hero:
   - atmospheric-bg h-24 -mt-10 relative z-10
   - 3-column stat grid: Siddhis Catalogued, Evidence Sources, Avg Authenticity
   - Uses AnimatedCounter for each stat

3. **Added 3 editorial dividers** with ParallaxText and gold dividers between major sections:
   - After Six Evidence Categories
   - After Traditions Represented
   - After Authenticity Methodology
   - Each with thematic copy and gold divider lines

4. **Added 3 cinematic strips** between sections:
   - Dark temple interior (after Evidence Categories)
   - Sacred geometry manuscript (after Traditions)
   - Ancient temple midnight (after Methodology)

5. **Added closing CTA section** before footer:
   - ScrollParallax disabled bg image with scrim=full, vignette
   - 75% black overlay
   - ParallaxText with section label, hero-heading, editorial copy
   - gold-cta link to /archive, ghost-cta link to /consultations

6. **Added bindu pulse footer**:
   - atmospheric-bg with opacity-20
   - Animated bindu dot with binduPulse keyframe
   - Copper-colored label: RESEARCH & SOURCES — EPISTEMIC FRAMEWORK

7. **Fixed hardcoded 41** → replaced with allSiddhis.length

8. **Changed wrapper** from <div> to <main className="bg-deep-black min-h-screen">

### All existing content preserved:
- Six Evidence Categories (all 6 cards with icons and descriptions)
- Traditions Represented (dynamic from data)
- Authenticity Methodology (3 scoring pillars)
- Source Confidence Tiers (High/Medium/Low)
- Editorial Integrity Statement

### Imports updated:
- Removed: PageHero, staggerContainer, staggerItem (unused)
- Added: ParallaxText (from ScrollParallax), Link (from next/link)

### Build status: SUCCESS (no new errors)

---

## Archetypes Page — Cinematic Upgrade

### Date: 2025-01-XX

### Changes Made:
1. **Replaced border-b header** with full-bleed cinematic hero section:
   - CinematicImage with kenBurns=slow, scrim=bottom, vignette, dust, priority
   - Sri Yantra image URL preserved
   - Section label PATTERN INTELLIGENCE, hero-heading title "The Ten Mahāvidyās"
   - bg-gradient-to-t from-deep-black via-deep-black/30 to-deep-black/40 overlay
   - Content in relative z-10 container max-w-[1400px]
   - 85vh/90vh hero height with bottom-justified content

2. **Added atmospheric bg + stats bar** after hero:
   - atmospheric-bg h-24 -mt-10 relative z-10
   - 4-column stats: 10 Mahāvidyās | 12 Patterns | 56 Siddhis Linked | 4 Access Tiers

3. **Added editorial divider** with ParallaxText between BackButton and ArchetypeQuiz:
   - divider-gold lines flanking ParallaxText with themed archetype copy
   - "Archetypes are not identities. They are gravitational fields…"

4. **Upgraded cinematic strip** between main Mahāvidyā grid and Beyond the Ten:
   - Existing ScrollParallax kept, added cinematic-strip class
   - Temple midnight image with scrim=full, vignette

5. **Added closing CTA section** after supplementary archetypes:
   - ScrollParallax (disabled) with temple-midnight background
   - CinematicImage scrim=full, vignette
   - 75% black overlay (rgba(0,0,0,0.75))
   - ParallaxText with section label "Discover Your Pattern", hero-heading
   - "Every pattern has a name. Every name has a sādhana."
   - WhatsAppCTA variant="inline" + ghost-cta Link to /patterns

6. **Added bindu pulse footer**:
   - atmospheric-bg absolute inset-0 opacity-20
   - Animated bindu dot with binduPulse 2s infinite keyframe
   - Copper-colored label: THE TEN MAHĀVIDYĀS — PATTERN INTELLIGENCE
   - pb-28 md:pb-20 for safe area

7. **Extracted ArchetypeDetail sub-component** to avoid nested conditional JSX inside motion.div (prevents SWC parse errors)

8. **Changed wrapper** from `<div>` to `<main className="bg-deep-black min-h-screen">`

### All existing content/functionality preserved:
- selected state + hash-based auto-expand (useEffect with window.location.hash)
- Mahāvidyā grid with expand/collapse (AnimatePresence pattern intact)
- Supplementary archetype grid (filter number > 10)
- ArchetypeQuiz dynamic import
- CautionBadge on all archetype cards
- GatedContent import retained
- Links to archive folios and patterns (getSiddhiBySlug, relatedPatternSlugs)
- TIER_LABELS display
- All state variables: selected, maha, supplementary
- All motion tokens: fadeInUp, staggerContainer, staggerItem

### Imports updated:
- Added: ParallaxText (from ScrollParallax), WhatsAppCTA, Link
- All original imports retained

### Build status: SUCCESS (no new errors)

---

## Pricing Page — Cinematic Upgrade

### Date: 2025-01-XX

### Changes Made:
1. **Replaced PageHero** with full-bleed cinematic hero section:
   - CinematicImage with kenBurns=slow, scrim=bottom, vignette, volumetric, dust, priority
   - Same hero-labyrinth-alt image URL preserved
   - Section label SACRED OFFERINGS, hero-heading title "The Covenant"
   - bg-gradient-to-t from-deep-black via-deep-black/30 to-deep-black/40 overlay
   - Content in relative z-10 container max-w-[1400px]

2. **Added atmospheric bg + stats bar** after hero:
   - atmospheric-bg h-24 -mt-10 relative z-10
   - 4-column stats grid: 4 Tiers | 3-Day Free Trial | Cancel Anytime (∞) | 56 Siddhis
   - Uses AnimatedCounter for numeric stats

3. **Added editorial divider** with ParallaxText between currency selector and tier cards:
   - divider-gold lines flanking ParallaxText with themed copy about four elements/gates
   - "Prithvi grounds. Jal flows. Agni transforms. Akash dissolves…"

4. **Replaced existing parallax interlude** with proper cinematic-strip:
   - cinematic-strip class div with CinematicImage (ritual-chamber-alt)
   - cinematic-strip-overlay for depth
   - Positioned between tier cards and trust signals

5. **Removed second parallax interlude** (before guarantee) — consolidated into cinematic strip

6. **Extracted TierCard sub-component** to avoid nested conditional JSX inside motion.div

7. **Added closing CTA section** after FAQ:
   - ScrollParallax (disabled) with Sri Yantra sky background image
   - CinematicImage scrim=full, vignette
   - 75% black overlay (rgba(0,0,0,0.75))
   - ParallaxText with section label "Begin Your Ascent", hero-heading
   - WhatsAppCTA variant="inline" + ghost-cta Link to /aghoiri-tantra

8. **Added bindu pulse footer**:
   - atmospheric-bg absolute inset-0 opacity-20
   - Animated bindu dot with binduPulse 2s infinite keyframe
   - Copper-colored label: THE COVENANT — SACRED OFFERINGS
   - pb-28 md:pb-20 for safe area

9. **Changed wrapper** from `<div>` to `<main className="bg-deep-black min-h-screen">`

### All existing content/functionality preserved:
- Billing cycle toggle (monthly/yearly) with 17% save badge
- Currency toggle (INR/USD) via TierProvider
- 4 tier cards with features, gated features, price display, AnimatedCounter
- WhatsApp CTA handlers (buildWhatsAppLink, handleCTA)
- FAQ accordion with AnimatePresence expand/collapse
- PricingQuiz AI recommendation component
- Trust signals (4 items with ShieldCheckIcon)
- Sacred Guarantee glass-panel
- All state variables: billing, openFAQ, currentTier, currency
- All callbacks: handleFAQToggle, handleCTA

### Imports updated:
- Removed: PageHero (no longer used)
- Added: ParallaxText (from ScrollParallax), Link (from next/link), WhatsAppCTA

### Build status: SUCCESS (no new errors)

---

## Consultations Page — Cinematic Upgrade

### Date: 2025-01-XX

### Changes Made:
1. **Replaced PageHero** with full-bleed cinematic hero section:
   - CinematicImage with kenBurns=slow, scrim=bottom, vignette, volumetric, dust, priority
   - Same hero-ritual-chamber-alt image URL preserved
   - Section label "WITH KAUSTUBH", title "Consult the Archivist" in hero-heading style
   - bg-gradient-to-t from-deep-black via-deep-black/30 to-deep-black/40 overlay
   - Content in relative z-10 container max-w-5xl

2. **Added atmospheric bg** after hero (no stats bar — Kaustubh bio serves that purpose):
   - atmospheric-bg h-24 -mt-10 relative z-10

3. **Added editorial divider** with ParallaxText between Kaustubh bio section and parallax interlude:
   - divider-gold lines flanking ParallaxText
   - "Not fortune-telling. Pattern intelligence." in engraved-heading style

4. **Upgraded parallax interlude** to use cinematic-strip class

5. **Added closing CTA section** after consultation form:
   - ScrollParallax (disabled) with ancient-codex-scroll background
   - CinematicImage scrim=full, vignette
   - 75% black overlay (rgba(0,0,0,0.75))
   - ParallaxText with section label "The Archive is Open", hero-heading
   - WhatsAppCTA variant="inline" + ghost-cta Link to /patterns

6. **Added bindu pulse footer**:
   - atmospheric-bg absolute inset-0 opacity-20
   - Animated bindu dot with binduPulse 2s infinite keyframe
   - Copper-colored label: CONSULTATIONS — THE ARCHIVIST
   - pb-28 md:pb-20 for safe area

7. **Extracted ConsultationFormSection sub-component** to avoid nested conditional JSX inside motion.div (prevents SWC parse errors)

8. **Changed wrapper** from `<div>` to `<main className="bg-deep-black min-h-screen">`

### All existing content/functionality preserved:
- Form state: name, whatsapp, message, photoBase64
- Photo upload with FileReader + preview
- submitConsultation server action with submit success/error handling
- consultationServices list with per-service WhatsAppCTA prefill
- ConsultationScreener dynamic import (AI pre-screening when name + message >= 10 chars)
- Kaustubh portrait with gold corner accents and neon-glow-white frame
- Full Kaustubh bio text (3 paragraphs with highlighted spans)
- submitted/success state display ("The Archive acknowledges you.")
- Form validation (name + whatsapp required, disabled submit)
- formError display
- BackButton to /home
- All motion tokens: fadeInUp, staggerContainer, staggerItem

### Imports updated:
- Removed: PageHero (no longer used)
- Added: ParallaxText (from ScrollParallax), Link (from next/link)
- All original imports retained

### Build status: SUCCESS (no new errors)

---

## Archive [slug] & Patterns [slug] — Cinematic Closing Sections

### Date: 2025-01-XX

### Changes Made:
1. **archive/[slug]/page.tsx** — Added cinematic closing sections:
   - Added `ParallaxText` to existing `ScrollParallax` import
   - Cinematic strip with meditation-platform-overlooking image, kenBurns, cinematic-strip-overlay
   - Closing CTA section with ancient-codex-scroll background, 75% black overlay, ParallaxText wrapper
   - "The pattern is mapped. The sādhana awaits." hero heading
   - WhatsAppCTA + ghost-cta Pattern Atlas link
   - Bindu pulse footer with AKASHIC ARCHIVE — PATTERN INTELLIGENCE label
   - Inserted before the final `</div>` of the outermost wrapper
   - No new imports needed (Link, WhatsAppCTA, BackButton, CinematicImage, ScrollParallax already present)

2. **patterns/[slug]/page.tsx** — Added cinematic closing sections:
   - Added `ParallaxText` to existing `ScrollParallax` import
   - Identical cinematic strip + closing CTA + footer block
   - Inserted before the final `</div>` of the outermost wrapper (after WhatsAppCTA div)
   - No new imports needed (Link, WhatsAppCTA, BackButton, CinematicImage, ScrollParallax already present)

### Build status: SUCCESS (no new errors)

---

## Cinematic Footer Additions — 4 Pages

### Pages Modified:
1. **Codex** (`/codex/page.tsx`) — Added stats bar (3-column grid: 5 Codex Parts, 3 Cinematic Breaks, 1 Living System) after atmospheric-bg div, before the Five Parts section. No new imports needed.
2. **Redeem** (`/redeem/page.tsx`) — Added minimal bindu-pulse footer with "KALKI — KEY REDEMPTION" label. BackButton was already present.
3. **Practice Japa** (`/practice/japa/page.tsx`) — Added minimal bindu-pulse footer with "JAPA MĀLĀ — MANTRA COUNTER" label.
4. **Practice Timer** (`/practice/timer/page.tsx`) — Added minimal bindu-pulse footer with "SILENT SITTING — MEDITATION TIMER" label.

### Approach:
- Used targeted Edit tool insertions only — no full file rewrites.
- All footers use the bindu pulse animation (`binduPulse 2s ease-in-out infinite`) consistent with existing site patterns.
- Footer containers use `border-t border-gold/5` for subtle top separator.

### Build status: SUCCESS (no new errors)
