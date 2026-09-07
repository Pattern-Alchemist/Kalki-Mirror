# Soft-404 streaming audit — Vol. 4 #18

Closed the thread parked twice during Vol. 3. Next.js streaming shells can
ship HTTP 200 for a dynamic miss (the status is committed before the body
learns the entity is absent). The body renders the 404 boundary correctly,
but the metadata that ships with that 200 used to be index-able — the
soft-404 class Google penalizes.

## Decision (per route)

Every public dynamic renderer fires `notFound()` on miss AND its
`generateMetadata` returns `robots: { index: false, follow: true }` on the
miss path:

| Route | Miss behavior |
| --- | --- |
| /aghori-tantra/[phase]/[lesson] | notFound() + noindex metadata |
| /aghori-tantra/[phase] | notFound() + noindex metadata |
| /archetypes/[id] | notFound() + noindex metadata |
| /archive/[slug] | notFound() + noindex metadata |
| /breathwork/[slug] | notFound() + noindex metadata |
| /glossary/[slug] | notFound() + noindex metadata |
| /library/[type]/[slug] | notFound() + noindex metadata |
| /patterns/[slug] | notFound() + noindex metadata |
| /sequences/[slug] | notFound() + noindex metadata |

Admin routes (/admin/**) are session-gated and excluded from crawling.

## Enforcement

`tests/lib/soft-404-audit.test.ts` pins (1) the exhaustive route list — a
NEW dynamic route must be added there or CI fails, and (2) each route's
notFound() + noindex-on-miss contract at source level.
