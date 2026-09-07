import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Vol. 3 #20 — OpenAPI truth.
 *
 * docs/api/openapi.yaml used to document 22 paths while the app shipped 55
 * routes, and its header drift sat beside the corpus-count drift (279 vs 327)
 * this roadmap keeps killing. This test makes the FILESYSTEM the source of
 * truth, with exactly the same normalization scripts/gen-openapi-paths.mjs
 * uses, so the two can never disagree silently again:
 *
 *   · path set equality (fs routes ↔ yaml paths, both directions)
 *   · per-path method equality (an exported handler MUST be documented;
 *     a documented method MUST exist in the route module)
 *   · no stale corpus-count literals ("279") anywhere in the yaml
 */

const API_DIR = path.join(process.cwd(), 'src', 'app', 'api');
const YAML_FILE = path.join(process.cwd(), 'docs', 'api', 'openapi.yaml');

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name === 'route.ts') acc.push(full);
  }
  return acc;
}

function normalizeSegment(seg: string): string {
  if (seg.startsWith('[') && seg.endsWith(']')) {
    return `{${seg.slice(1, -1).replace(/\.{3}/g, '')}}`;
  }
  return seg;
}

const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

function routeMethods(src: string): Set<string> {
  const methods = new Set<string>();
  const re = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) methods.add(m[1]);
  // Alias style — e.g. the NextAuth catch-all:
  //   export { handler as GET, handler as POST };
  // (kept byte-identical to scripts/gen-openapi-paths.mjs — the two must
  // never disagree about what a route exports)
  const braceBlocks = src.match(/export\s*\{[^}]*\}/g) || [];
  for (const block of braceBlocks) {
    const inner = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}'));
    for (const part of inner.split(',')) {
      const alias = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (alias && HTTP_METHODS.has(alias)) methods.add(alias);
    }
  }
  return methods;
}

function fsRoutes(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const file of walk(API_DIR)) {
    const rel = path.relative(API_DIR, file).replace(/\\/g, '/');
    const segments = rel.split('/').slice(0, -1).map(normalizeSegment);
    const apiPath = `/api${segments.length ? '/' + segments.join('/') : ''}`;
    const methods = routeMethods(fs.readFileSync(file, 'utf8'));
    if (methods.size === 0) throw new Error(`route module exports no HTTP handlers: ${rel}`);
    map.set(apiPath, methods);
  }
  return map;
}

/** Minimal indentation-aware parse: 2-space path keys, 4-space method keys. */
function yamlPaths(): Map<string, Set<string>> {
  const lines = fs.readFileSync(YAML_FILE, 'utf8').split('\n');
  const pathsIdx = lines.findIndex((l) => l === 'paths:');
  const componentsIdx = lines.findIndex((l) => l === 'components:');
  expect(pathsIdx, 'openapi.yaml must have a `paths:` block').toBeGreaterThanOrEqual(0);

  const map = new Map<string, Set<string>>();
  let current: string | null = null;
  for (let i = pathsIdx + 1; i < (componentsIdx === -1 ? lines.length : componentsIdx); i++) {
    const pathMatch = lines[i].match(/^  (\/\S+):\s*$/);
    if (pathMatch) {
      current = pathMatch[1];
      map.set(current, new Set());
      continue;
    }
    const methodMatch = lines[i].match(/^    (get|post|put|patch|delete|head|options):\s*$/);
    if (methodMatch && current) map.get(current)!.add(methodMatch[1].toUpperCase());
  }
  return map;
}

describe('openapi truth: the yaml mirrors the filesystem (Vol. 3 #20)', () => {
  const fsMap = fsRoutes();
  const docMap = yamlPaths();

  it('documents at least the pre-existing known routes', () => {
    // Sanity guard so a broken walk() cannot make both sides empty and pass.
    expect(fsMap.size).toBeGreaterThanOrEqual(50);
    for (const known of ['/api/health', '/api/subscribe', '/api/auth/{nextauth}']) {
      expect(fsMap.has(known), `fs should contain ${known}`).toBe(true);
      expect(docMap.has(known), `yaml should contain ${known}`).toBe(true);
    }
  });

  it('documents every filesystem route — no missing paths', () => {
    const missing = [...fsMap.keys()].filter((p) => !docMap.has(p));
    expect(missing, `routes missing from openapi.yaml: ${missing.join(', ')}`).toEqual([]);
  });

  it('documents no stale paths — every yaml path has a route', () => {
    const stale = [...docMap.keys()].filter((p) => !fsMap.has(p));
    expect(stale, `openapi.yaml paths with no route module: ${stale.join(', ')}`).toEqual([]);
  });

  it('per-path methods match the exported handlers exactly', () => {
    const drift: string[] = [];
    for (const [p, fsMethods] of fsMap) {
      const docMethods = docMap.get(p)!;
      for (const m of fsMethods) if (!docMethods.has(m)) drift.push(`${p}: ${m} exported but undocumented`);
      for (const m of docMethods) if (!fsMethods.has(m)) drift.push(`${p}: ${m} documented but not exported`);
    }
    expect(drift, drift.join('\n')).toEqual([]);
  });

  it('carries no stale corpus-count literals (279)', () => {
    const text = fs.readFileSync(YAML_FILE, 'utf8');
    expect(text).not.toContain('279');
  });

  it('declares every tag it references', () => {
    const lines = fs.readFileSync(YAML_FILE, 'utf8').split('\n');
    const declared = new Set(
      lines.flatMap((l) => [...l.matchAll(/^  - name: (.+)$/gm)].map((m) => m[1].trim()))
    );
    const referenced = new Set(
      lines.flatMap((l) => [...l.matchAll(/tags: \[(.+?)\]/g)].flatMap((m) => m[1].split(',').map((t) => t.trim())))
    );
    const undeclared = [...referenced].filter((t) => !declared.has(t));
    expect(undeclared, `tags used but never declared: ${undeclared.join(', ')}`).toEqual([]);
  });
});
