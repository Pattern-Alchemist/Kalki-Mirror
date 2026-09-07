/**
 * SCHEMA TRUTH GATE — Vol. 4 #19.
 *
 * Closes the Week-A grounding incident: an apparent malformed @@index line
 * that every reader seemed to bless. Forensics (hex-verified blob reads via
 * a fresh network clone + `git log -S` pickaxe over all history) proved the
 * malformation NEVER existed — the "malformed" text was an output-channel
 * artifact (display layer eats the two-byte sequence bracket+m, turning
 * "[minTier" into "inTier"). prisma validate, probed against a genuinely
 * mutated copy, correctly REJECTS that syntax with P1012.
 *
 * What this gate pins forever, so no incident is ever needed again:
 *   1. CANARY — the exact bytes of the ContentEntry index lines (the two
 *      lines at the center of the incident) may not drift silently.
 *   2. SHAPE — every @@index / @@unique / @@id attribute argument is
 *      bracket-well-formed: it opens with "[" and closes with "]".
 *   3. RESOLUTION — every field reference inside those brackets names a
 *      field declared in the same model (catches typos validate also
 *      catches, but fails in milliseconds inside unit CI instead of at
 *      build time).
 *   4. REGRESSION — prisma validate rejects the incident's syntax class
 *      (P1012), proving the gate we trust stays strict.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const REPO = join(__dirname, "..", "..");
const SCHEMA_PATH = join(REPO, "prisma", "schema.prisma");
const schema = readFileSync(SCHEMA_PATH, "utf8");

// ── Minimal model parser ────────────────────────────────────────────────────
interface ModelBlock {
  name: string;
  body: string;
  fields: Set<string>;
}

function parseModels(src: string): ModelBlock[] {
  const models: ModelBlock[] = [];
  const re = /^model\s+(\w+)\s*\{/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const start = m.index + m[0].length;
    let depth = 1;
    let end = start;
    while (end < src.length && depth > 0) {
      if (src[end] === "{") depth++;
      else if (src[end] === "}") depth--;
      end++;
    }
    const body = src.slice(start, end - 1);
    const fields = new Set<string>();
    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("@@")) continue;
      const fieldName = trimmed.split(/\s+/)[0];
      if (fieldName && /^[a-zA-Z_]\w*$/.test(fieldName)) fields.add(fieldName);
    }
    models.push({ name: m[1], body, fields });
  }
  return models;
}

const models = parseModels(schema);

// ── 1. Canary: the incident lines ───────────────────────────────────────────
describe("schema-truth canary", () => {
  it("ContentEntry carries its two canonical index lines, byte-exact", () => {
    const entry = models.find((m) => m.name === "ContentEntry");
    expect(entry).toBeDefined();
    const lines = entry!.body.split("\n").map((l) => l.trim()).filter(Boolean);
    expect(lines).toContain("@@index([type, status])");
    expect(lines).toContain("@@index([minTier, caution])");
  });

  it("the malformed incident spelling appears nowhere in the schema", () => {
    // The artifact spelling (display layer eats bracket+m): "index" + "(" +
    // "inTier" — i.e. no opening bracket before the field name.
    expect(schema.includes("@@index(inTier")).toBe(false);
  });
});

// ── 2+3. Shape + field resolution across every model ────────────────────────
describe("schema-truth attribute audit", () => {
  const ATTRS = ["@@index", "@@unique", "@@id"];

  it("every multi-arg attribute argument is bracket-well-formed", () => {
    const offenders: string[] = [];
    for (const model of models) {
      for (const line of model.body.split("\n")) {
        const trimmed = line.trim();
        const attr = ATTRS.find((a) => trimmed.startsWith(a + "("));
        if (!attr) continue;
        const inner = trimmed.slice(attr.length + 1, trimmed.lastIndexOf(")"));
        if (!inner.trim().startsWith("[")) {
          offenders.push(`${model.name}: ${trimmed} (argument must open with "[")`);
          continue;
        }
        const open = (inner.match(/\[/g) ?? []).length;
        const close = (inner.match(/\]/g) ?? []).length;
        if (open !== 1 || close !== 1) {
          offenders.push(`${model.name}: ${trimmed} (unbalanced brackets)`);
        }
      }
    }
    expect(offenders, `malformed attribute(s):\n${offenders.join("\n")}`).toEqual([]);
  });

  it("every field reference inside an attribute resolves to a declared field", () => {
    const offenders: string[] = [];
    for (const model of models) {
      for (const line of model.body.split("\n")) {
        const trimmed = line.trim();
        const attr = ATTRS.find((a) => trimmed.startsWith(a + "("));
        if (!attr) continue;
        const inner = trimmed.slice(attr.length + 1, trimmed.lastIndexOf(")"));
        const listMatch = inner.match(/\[([^\]]*)\]/);
        if (!listMatch) continue; // scalar form (@@id(fields: [...]) etc.) — shape audit covers
        for (const rawRef of listMatch[1].split(",")) {
          const ref = rawRef.trim();
          if (!ref) continue;
          // Extended form: field(sort: Desc) / field(length: 128) — take the head.
          const fieldName = ref.split(/[(:]/)[0].trim();
          if (!model.fields.has(fieldName)) {
            offenders.push(`${model.name}: ${trimmed} — "${fieldName}" is not a declared field`);
          }
        }
      }
    }
    expect(offenders, `unresolved field reference(s):\n${offenders.join("\n")}`).toEqual([]);
  });
});

// ── 4. Regression: validate stays strict on the incident syntax class ───────
describe("prisma validate strictness regression", () => {
  it("P1012 on a schema whose index argument lost its opening bracket", () => {
    const malformed = schema.replace(
      "@@index([minTier, caution])",
      "@@index(minTier, caution])",
    );
    expect(malformed).not.toEqual(schema); // mutation actually happened

    const cacheDir = join(REPO, "node_modules", ".cache", "schema-truth");
    mkdirSync(cacheDir, { recursive: true });
    const tmp = join(cacheDir, "schema-malformed-probe.prisma");
    writeFileSync(tmp, malformed);

    let output = "";
    let rejected = false;
    try {
      output = execFileSync("npx", ["prisma", "validate", "--schema", tmp], {
        cwd: REPO,
        encoding: "utf8",
        timeout: 60_000,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (err) {
      rejected = true;
      const e = err as { stdout?: string; stderr?: string };
      output = String(e.stdout ?? "") + String(e.stderr ?? "");
    } finally {
      rmSync(tmp, { force: true });
    }

    expect(rejected, "prisma validate accepted a malformed index argument").toBe(true);
    expect(output).toContain("P1012");
  });
});
