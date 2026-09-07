// =============================================================
// KALKI — OG IMAGE FACTORY tests (Vol. 4 #11)
// -------------------------------------------------------------
// The structured-data-truth pattern applied to og:image: an
// fs-exhaustive registry (every opengraph-image.tsx under src/app
// must be registered here — a new card ships silently → CI fails),
// plus pure pins on the card builder (clamping, size steps, brand
// constants) and the retired-static-card regression.
// =============================================================
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildOgCard,
  clampOgText,
  ogTitleSize,
  OG_LIBRARY_TYPE_COPY,
  OG_SIZE,
  loadOgFont,
} from "@/lib/seo/og-factory";
import { allPatterns } from "@/lib/data/patterns";
import { glossaryEntries } from "@/lib/data/glossary";
import { termAnchor } from "@/lib/utils/term-anchor";
import { CONTENT_TYPES } from "@/lib/seo/content-seo";

// ── registry: walk src/app for opengraph-image files ──────────────

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (name.startsWith("opengraph-image")) acc.push(p);
  }
  return acc;
}

const REGISTERED_ROUTES = [
  "src/app/glossary/[slug]/opengraph-image.tsx",
  "src/app/patterns/opengraph-image.tsx",
  "src/app/patterns/[slug]/opengraph-image.tsx",
  "src/app/library/[type]/opengraph-image.tsx",
];

describe("og-image registry (fs-exhaustive)", () => {
  it("every opengraph-image file in src/app is registered", () => {
    const found = walk("src/app").map((p) => p.replace(/\\/g, "/"));
    expect(found.sort()).toEqual([...REGISTERED_ROUTES].sort());
  });

  it("every registered route file exists", () => {
    for (const route of REGISTERED_ROUTES) {
      expect(statSync(route).isFile(), `${route} missing`).toBe(true);
    }
  });

  it("each card route targets the surface the roadmap pinned", () => {
    const src = REGISTERED_ROUTES.map((r) => readFileSync(r, "utf8")).join("\n");
    expect(src).toContain("next/og");
    expect(src).toContain("ogImageResponseOptions");
  });
});

describe("card builder (pure Satori tree)", () => {
  it("builds a div tree carrying the brand palette", () => {
    const el = buildOgCard({ label: "KALKI · THE LEXICON", title: "Oṃ", footer: "KALKI" });
    expect(el.type).toBe("div");
    const style = (el.props as { style: Record<string, string> }).style;
    expect(style.backgroundColor).toBe("#050505");
    expect(JSON.stringify(el)).toContain("#D4AF37");
    expect(JSON.stringify(el)).toContain("#F5F5F0");
  });

  it("carries the label, title and subtitle text", () => {
    const json = JSON.stringify(
      buildOgCard({ label: "L", title: "T", subtitle: "S", footer: "F" })
    );
    expect(json).toContain('"children":"T"');
    expect(json).toContain('"children":"S"');
    expect(json).toContain('"children":"F"');
  });
});

describe("text safety (Satori rejects overflow)", () => {
  it("clampOgText clips word-safe with an ellipsis", () => {
    const long = "word ".repeat(40).trim();
    const clamped = clampOgText(long, 50);
    expect(clamped.length).toBeLessThanOrEqual(51);
    expect(clamped.endsWith("…")).toBe(true);
    expect(clamped.endsWith("word…")).toBe(true); // never mid-word
  });

  it("clampOgText leaves short text verbatim", () => {
    expect(clampOgText("Oṃ", 50)).toBe("Oṃ");
  });

  it("title size steps down as titles grow", () => {
    expect(ogTitleSize("Oṃ")).toBe(128);
    expect(ogTitleSize("The Rescuer")).toBe(104); // 11 chars
    expect(ogTitleSize("Kapālabhāti — Advanced")).toBe(84); // 22 chars
    expect(ogTitleSize("a".repeat(60))).toBe(64);
    expect(ogTitleSize("Oṃ") > ogTitleSize("The Rescuer")).toBe(true);
  });
});

describe("the factory covers the real corpus", () => {
  it("every glossary term slug resolves a card (86 bespoke cards)", () => {
    const terms = glossaryEntries.map((e) => termAnchor(e.term));
    expect(terms.length).toBeGreaterThan(80);
    // the lookup in the OG route: every slug must be findable
    for (const slug of terms) {
      const entry = glossaryEntries.find((e) => termAnchor(e.term) === slug);
      expect(entry).toBeDefined();
    }
  });

  it("every pattern folio slug resolves a card (20 bespoke cards)", () => {
    for (const p of allPatterns) {
      expect(allPatterns.find((x) => x.slug === p.slug)).toBeDefined();
    }
    expect(allPatterns.length).toBeGreaterThan(15);
  });

  it("every studio type has brand copy for its shelf card", () => {
    for (const t of CONTENT_TYPES) {
      expect(OG_LIBRARY_TYPE_COPY[t]?.title).toBeTruthy();
    }
    expect(Object.keys(OG_LIBRARY_TYPE_COPY)).toHaveLength(CONTENT_TYPES.length);
  });
});

describe("font asset", () => {
  it("the committed Cinzel subset is a real TTF (OpenType 1.0 magic)", () => {
    const font = loadOgFont();
    expect(font).toHaveLength(1);
    expect(font[0].name).toBe("Cinzel");
    // TTF sfnt version 1.0 — @vercel/og rejects woff/woff2 signatures
    expect(font[0].data.subarray(0, 4).toString("hex")).toBe("00010000");
    expect(font[0].data.length).toBeGreaterThan(1000);
    expect(font[0].data.length).toBeLessThan(128 * 1024); // subset, not the full face
  });
});

describe("retired static card (regression pin)", () => {
  it("glossary [slug] page no longer hardcodes the Cloudinary OG hero", () => {
    const src = readFileSync("src/app/glossary/[slug]/page.tsx", "utf8");
    expect(src).not.toContain("res.cloudinary.com");
  });

  it("patterns layout no longer hardcodes the Cloudinary OG hero", () => {
    const src = readFileSync("src/app/patterns/layout.tsx", "utf8");
    expect(src).not.toContain("res.cloudinary.com");
  });

  it("card size is the OG standard 1200×630", () => {
    expect(OG_SIZE.width).toBe(1200);
    expect(OG_SIZE.height).toBe(630);
  });
});
