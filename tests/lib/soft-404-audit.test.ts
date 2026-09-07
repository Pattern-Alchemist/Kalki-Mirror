/**
 * SOFT-404 AUDIT — Vol. 4 #18. Closes the thread parked twice in Vol. 3.
 *
 * Next.js streaming shells can ship HTTP 200 for a dynamic miss (the status
 * is committed before the page body learns the entity does not exist). The
 * body correctly renders the 404 boundary — but the METADATA shipped with
 * that 200 used to be index-able, which is the soft-404 class Google
 * penalizes. Every public dynamic renderer must therefore return
 * robots noindex on its miss path.
 *
 * This test pins two things:
 *   1. The canonical list of public dynamic routes — a NEW dynamic route
 *      must be ADDED HERE (the audit is mandatory, not optional).
 *   2. Each route: notFound() fires on miss AND generateMetadata's
 *      miss-return carries robots index:false.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, it, expect } from "vitest";

const REPO = join(__dirname, "..", "..");

/** Public dynamic renderers — keep exhaustive. Admin routes are session-gated. */
const DYNAMIC_ROUTES: { route: string; page: string }[] = [
  { route: "/aghori-tantra/[phase]/[lesson]", page: "src/app/aghori-tantra/[phase]/[lesson]/page.tsx" },
  { route: "/aghori-tantra/[phase]", page: "src/app/aghori-tantra/[phase]/page.tsx" },
  { route: "/archetypes/[id]", page: "src/app/archetypes/[id]/page.tsx" },
  { route: "/archive/[slug]", page: "src/app/archive/[slug]/page.tsx" },
  { route: "/breathwork/[slug]", page: "src/app/breathwork/[slug]/page.tsx" },
  { route: "/glossary/[slug]", page: "src/app/glossary/[slug]/page.tsx" },
  { route: "/library/[type]/[slug]", page: "src/app/library/[type]/[slug]/page.tsx" },
  { route: "/patterns/[slug]", page: "src/app/patterns/[slug]/page.tsx" },
  { route: "/sequences/[slug]", page: "src/app/sequences/[slug]/page.tsx" },
];

describe("soft-404 audit", () => {
  it("the audited route list is exhaustive (no unlisted dynamic pages exist)", () => {
    const found: string[] = [];
    const appRoot = join(REPO, "src", "app");
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        if (name === "api" || name === "admin" || name === "generated") continue;
        const abs = join(dir, name);
        if (statSync(abs).isDirectory()) walk(abs);
        else if (name === "page.tsx" && /\[[^\]]+\]/.test(dir)) {
          const rel = dir.slice(appRoot.length + 1).split(sep).join("/");
          found.push("/" + rel);
        }
      }
    };
    walk(appRoot);
    const audited = DYNAMIC_ROUTES.map((r) => r.route).sort();
    expect(found.sort()).toEqual(audited);
  });

  for (const { route, page } of DYNAMIC_ROUTES) {
    it(`${route}: notFound() fires and the miss metadata is noindex`, () => {
      const src = readFileSync(join(REPO, page), "utf8");
      expect(src, `${route}: page must call notFound() on the miss path`).toContain("notFound(");
      expect(src, `${route}: generateMetadata miss-return must carry robots index:false`).toContain(
        "robots: { index: false, follow: true }",
      );
    });
  }
});
