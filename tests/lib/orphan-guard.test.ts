/**
 * ORPHAN GUARD — Vol. 4 #2.
 *
 * Institutionalizes the house lesson learned three times the hard way:
 * consultations-client (Vol. 3 #1), content-client (Vol. 3 #5 correction),
 * and the media panel port (Vol. 3 Week E). A component edited in good
 * faith but imported by NOBODY ships zero value — and the bug reports
 * "fixed" against it are phantom-fixed. From now on, a .tsx component
 * under src/app or src/components that no other module imports FAILS CI.
 *
 * Framework entry points (page/layout/error/loading/not-found/template/
 * route/forbidden) are consumed by Next.js conventions, not importers,
 * and are exempt. Everything else must earn its place in the tree.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, it, expect } from "vitest";

const REPO = join(__dirname, "..", "..");
const ROOTS = [join(REPO, "src", "app"), join(REPO, "src", "components")];

/** Files consumed by Next.js file conventions — no importer is expected. */
const ENTRY_BASENAMES = new Set([
  "page",
  "layout",
  "error",
  "loading",
  "not-found",
  "template",
  "route",
  "globals",
  "favicon",
]);

interface SourceFile {
  /** Repo-relative path with forward slashes. */
  rel: string;
  /** Absolute path. */
  abs: string;
  /** basename without extension. */
  base: string;
  contents: string;
}

function walk(dir: string, out: SourceFile[]): void {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) {
      // Generated client + node-adjacent trees are not hand-written surface.
      if (name === "generated" || name === "node_modules") continue;
      walk(abs, out);
    } else if (/\.(tsx|ts)$/.test(name)) {
      const rel = relative(REPO, abs).split(sep).join("/");
      out.push({
        rel,
        abs,
        base: name.replace(/\.(tsx|ts)$/, ""),
        contents: readFileSync(abs, "utf8"),
      });
    }
  }
}

const all: SourceFile[] = [];
for (const root of ROOTS) walk(root, all);

const allSource: SourceFile[] = [...all];
walk(join(REPO, "src", "lib"), allSource);

/** Candidates: component-ish tsx files (not convention entries, not under api/). */
const candidates = all.filter((f) => {
  if (!f.rel.endsWith(".tsx")) return false;
  if (f.rel.includes(`${sep}api${sep}`) || f.rel.includes("/api/")) return false;
  if (ENTRY_BASENAMES.has(f.base)) return false;
  return true;
});

/** Every import specifier string appearing anywhere in the collected sources. */
const importSpecifiers: string[] = [];
const importRegex = /(?:from\s+|import\s*\(\s*|require\s*\(\s*)(["'])([^"']+)\1/g;
for (const f of allSource) {
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(f.contents)) !== null) importSpecifiers.push(m[2]);
}

function isImported(candidate: SourceFile): boolean {
  // Match the candidate on: the @/ alias path, or the imported module's tail
  // segment (covers ./relative, ../relative and bare @/ aliases alike — a
  // static, dynamic (import()) or require coupling all count).
  const aliasPath = "@/".concat(candidate.rel.replace(/^src\//, "").replace(/\.tsx$/, ""));
  return importSpecifiers.some((spec) => {
    if (spec === aliasPath) return true;
    const tail = spec.replace(/^.*\//, "").replace(/\.(tsx|ts)$/, "");
    return tail === candidate.base;
  });
}

describe("orphan guard", () => {
  it("scanned a meaningful component population", () => {
    expect(candidates.length).toBeGreaterThan(20);
    expect(allSource.length).toBeGreaterThan(200);
  });

  it("every component under src/app and src/components has at least one importer", () => {
    const orphans = candidates.filter((f) => !isImported(f)).map((f) => f.rel);
    expect(
      orphans,
      `ORPHANED component(s) — zero importers. Wire them into a live surface ` +
        `or delete them (git history keeps the corpse). Editing an orphan ` +
        `is how phantom-fixes happen:\n${orphans.join("\n")}`,
    ).toEqual([]);
  });
});
