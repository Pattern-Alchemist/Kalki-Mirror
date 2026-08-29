# KALKI — Technical Gap Analysis (TGA)

**Companion document to the V2.0 Master Build Specification.**
Status: v1.0 · 2026-08-29 · Audience: the build engineer (solo-dev) · Review cycle: standing document, revisit at each phase gate.

---

## What this document is

The V2.0 spec defines **what** KALKI is. The TGA defines **how to build it**: it converts every
narrative commitment in the spec into an engineering contract — data model, API shapes, error
states, gating logic, content-ops workflow, and a phased roadmap with acceptance tests.

It is written to be read **alongside** the spec, not instead of it. Every finding cites the spec
section it translates (e.g. `§4.2`), and every prescription is build-ready unless explicitly
marked `OPEN DECISION`.

## How to use it

| If you are… | Start at |
|---|---|
| Starting Phase 0 (foundations) | §15 Phased Roadmap → §6 Canonical Data Model |
| Building the YANTRA engine | §5 YANTRA Engineering Sub-Specification |
| Building the Spine/Doors experience | §7 SeekerState Contract + §8 Station Gate |
| Writing the register UI | §9 Register Integrity + §10 Error States |
| Running content ops | §11 Content Operations |
| Instrumenting analytics | §12 Event Dictionary |
| Onboarding a new contributor | §1 Executive Summary + §2 Conventions |

## Document map

- **§1–§4** — Gap register (13 findings), strengths→obligations, conventions, severity ladder
- **§5** — YANTRA: deterministic scoring core + LLM narrative layer, input/output JSON schemas,
  confidence bands, fallback ladder, golden-set tests
- **§6** — Canonical data model: 19 tables, Prisma SDL (contract) mapped to Drizzle/Turso (runtime)
- **§7–§8** — SeekerState contract (Spine base + Door overlay tracks, Echo Rule) and the hybrid
  21-in-30 rolling station gate with grace tokens
- **§9–§10** — Register integrity (PRATIBIMBA framing, 3-state tag lifecycle) and the failure catalogue
- **§11–§13** — Content ops, 15-event analytics dictionary, credential hygiene (§13 includes the
  P0 rotation runbook)
- **§14–§16** — Deferred scope, P0–P4 roadmap with acceptance tests, register of open decisions

## Assets

- `KALKI_Technical_Gap_Analysis.pdf` — the full document (vector, clickable TOC)
- `assets/diagram_yantra.png` — YANTRA engine dataflow (5 layers: capture → scoring → resonance →
  narrative → delivery), reusable in issues/PRs
- `assets/diagram_er.png` — Entity-relationship domain map (15 core entities across 5 domains),
  reusable in issues/PRs

## Standing rule

The TGA is a **living register**, not a one-time report. When an open decision (D-01 … D-06) is
resolved, or a gap prescription changes during implementation, update this document in the same
commit as the code that resolved it.
