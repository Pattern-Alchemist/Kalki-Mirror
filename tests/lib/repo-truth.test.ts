/**
 * REPO-TRUTH GATE — Vol. 6 #1 (the evaporation gate).
 *
 * The founding incident: five tools the record calls permanent —
 * probe-chain.py, smoke-page-weight.sh, rehearse-turso-failover.sh,
 * production-sweep.py, ping-indexnow.sh — had ZERO git history. They lived
 * sandbox-local, died with the sandbox, and the worklog kept claiming they
 * existed. ping-indexnow.sh was even wired into package.json, so
 * `npm run ping:indexnow` was a live lie.
 *
 * This gate makes the TREE the truth: every `scripts/…` file path cited by
 * the record (worklog, docs, package.json) must exist in the tree — or be
 * EXPLICITLY amnestied with a reason. Amnesty is self-purging: the moment an
 * amnestied path comes to exist, the stale entry FAILS this gate and must be
 * removed. Amnesty can never become a parking lot.
 *
 * Two tiers, one rule:
 *   live-wire  — package.json script fields + docs/ops/** runbooks. These are
 *                STANDING INSTRUCTIONS to the next operator; a ghost here is
 *                a broken command or a broken runbook TODAY.
 *   record     — worklog.md + every other doc. Historical narrative stays
 *                true even when a one-shot script was session-ephemeral; the
 *                amnesty class documents why, per path.
 *
 * Doctrine the gate enforces socially: ops work is committed from birth,
 * never sandbox-local.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = join(__dirname, '..', '..');

/** File-bearing scripts/ citations only — a bare directory mention
 *  (scripts/geo-ops/) is prose, not a file claim, and is out of scope. */
const CITATION_RE = /scripts\/[A-Za-z0-9][A-Za-z0-9_./-]*\.[A-Za-z0-9]+/g;

/** Amnestied citations: path → reason. SELF-PURGING — see gate 3.
 *  Every entry must state why the tree may legitimately lack the file. */
const AMNESTY: Record<string, string> = {
  // ── Evaporation ghosts — Week A re-materializes these (roadmap #2, #4).
  //    Each entry is removed by the item that creates the file; until then
  //    the ghost stays VISIBLE here, by name.
  //    [Week A #2 landed: ping-indexnow.sh, probe-chain.py,
  //     smoke-page-weight.sh, rehearse-turso-failover.sh — entries removed
  //     per the self-purge rule; production-sweep.py still pending #4.]
  'scripts/production-sweep.py':
    'evaporation ghost — Week A #4 re-materializes',

  // ── Planned, not yet built — a roadmap first-move PROMISE. The entry
  //    self-purges the day the file lands (item #12, Week C).
  'scripts/launch-letters.sh':
    'Vol.6 #12 first-move promise — lands in Week C',

  // ── Session-ephemeral one-shots: historical worklog citations whose
  //    OUTPUT landed in commits; the scripts themselves were never meant
  //    to be permanent. Documented here so the record tier can hold.
  'scripts/apply-tier3-schema.ts': 'ephemeral one-shot — output landed in commits',
  'scripts/apply-tier5-schema.ts': 'ephemeral one-shot — output landed in commits',
  'scripts/apply-tier6-schema.ts': 'ephemeral one-shot — output landed in commits',
  'scripts/apply-vol3-schema.ts': 'ephemeral one-shot — output landed in commits',
  'scripts/corpus-audit.ts': 'ephemeral one-shot — output landed in commits',
  'scripts/debug-synthesis.mjs': 'ephemeral one-shot — output landed in commits',
  'scripts/embed-rehearsal.ts': 'ephemeral one-shot — output landed in commits',
  'scripts/gen-openapi-paths.mjs': 'ephemeral one-shot — output landed in commits',
  'scripts/gen-pwa-icons.mjs': 'ephemeral one-shot — output landed in commits',
  'scripts/turso-smoke-cleanup.mjs': 'ephemeral one-shot — output landed in commits',
  'scripts/weekb-local-proof.cjs': 'ephemeral one-shot — output landed in commits',
};

/** Pure core so the gate itself is testable: collect citations per source
 *  file, classify against the tree + amnesty. */
export interface RepoTruthVerdict {
  cited: string[];
  missing: string[];
  staleAmnesty: string[];
  uncitedAmnesty: string[];
}

export function auditRepoTruth(
  sources: string[],
  isFile: (p: string) => boolean,
): RepoTruthVerdict {
  const cited = new Set<string>();
  for (const src of sources) {
    const text = readFileSync(join(ROOT, src), 'utf8');
    for (const raw of text.match(CITATION_RE) ?? []) {
      cited.add(raw.replace(/[.,;:)'"`]+$/, ''));
    }
  }
  const missing = [...cited].filter((p) => !isFile(p) && !AMNESTY[p]);
  const staleAmnesty = Object.keys(AMNESTY).filter((p) => isFile(p));
  const uncitedAmnesty = Object.keys(AMNESTY).filter((p) => !cited.has(p));
  return { cited: [...cited].sort(), missing, staleAmnesty, uncitedAmnesty };
}

function walkMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const e of require('node:fs').readdirSync(join(ROOT, dir), { withFileTypes: true }) as Array<{ name: string; isDirectory(): boolean; isFile(): boolean }>) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...walkMarkdown(rel));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(rel);
  }
  return out;
}

/** package.json script fields: the live-wire core. Extracts every
 *  scripts/… path from the COMMANDS (not comments) and asserts existence. */
export function packageJsonLiveWires(): string[] {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
    scripts: Record<string, string>;
  };
  const out = new Set<string>();
  for (const cmd of Object.values(pkg.scripts)) {
    for (const raw of cmd.match(CITATION_RE) ?? []) {
      out.add(raw.replace(/[.,;:)'"`]+$/, ''));
    }
  }
  return [...out];
}

describe('repo-truth gate (Vol.6 #1) — the tree is the truth', () => {
  const isFile = (p: string) => existsSync(join(ROOT, p));
  const docs = walkMarkdown('docs');
  const recordSources = ['worklog.md', ...docs.filter((d) => !d.startsWith('docs/ops/'))];
  const liveWireSources = docs.filter((d) => d.startsWith('docs/ops/'));

  it('gate 1 — every cited scripts/ path exists or is amnestied (record tier)', () => {
    const v = auditRepoTruth(recordSources, isFile);
    expect(
      v.missing,
      `cited-but-missing scripts (extend AMNESTY with a reason, or commit the file):\n  ${v.missing.join('\n  ')}`,
    ).toEqual([]);
  });

  it('gate 2 — every runbook + package.json live-wire exists or is amnestied', () => {
    const v = auditRepoTruth(liveWireSources, isFile);
    expect(v.missing).toEqual([]);
    for (const p of packageJsonLiveWires()) {
      expect(isFile(p) || AMNESTY[p] !== undefined, `package.json wires a ghost: ${p}`).toBe(true);
    }
  });

  it('gate 3 — amnesty is self-purging: an amnestied path must NOT exist', () => {
    const stale = Object.keys(AMNESTY).filter(isFile);
    expect(
      stale,
      `stale amnesty entries — the files exist now, DELETE the entries:\n  ${stale.join('\n  ')}`,
    ).toEqual([]);
  });

  it('gate 4 — amnesty entries are all actually cited somewhere (no speculative entries)', () => {
    const v = auditRepoTruth(['worklog.md', ...docs], isFile);
    expect(
      v.uncitedAmnesty,
      `amnesty entries nothing cites anymore — DELETE them:\n  ${v.uncitedAmnesty.join('\n  ')}`,
    ).toEqual([]);
  });

  it('gate 5 — the five evaporation ghosts are named until re-materialized', () => {
    for (const ghost of [
      'scripts/ping-indexnow.sh',
      'scripts/probe-chain.py',
      'scripts/smoke-page-weight.sh',
      'scripts/rehearse-turso-failover.sh',
      'scripts/production-sweep.py',
    ]) {
      if (!isFile(ghost)) {
        expect(AMNESTY[ghost], `${ghost} is missing and UNNAMED — amnesty must carry it or the file must land`).toBeTruthy();
      }
    }
  });

  it('gate 6 — no cited path may be gitignored (the evaporation trap)', () => {
    // The founding incident's true mechanism: `scripts/*` + whitelist means
    // `git add .` silently skips new scripts, the record claims them, the
    // sandbox reset takes them. A cited path that exists but is ignored is
    // a ghost-in-waiting — fail HERE, in the sandbox where it is born.
    const { spawnSync } = require('node:child_process') as typeof import('node:child_process');
    const git = spawnSync('git', ['--version'], { encoding: 'utf8' });
    if (git.status !== 0) return; // no git — CI clones always have it
    const all = auditRepoTruth(['worklog.md', ...docs], isFile).cited;
    const existing = all.filter(isFile);
    if (existing.length === 0) return;
    const res = spawnSync('git', ['check-ignore', '--', ...existing], {
      cwd: ROOT, encoding: 'utf8',
    });
    const ignored = (res.stdout ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
    expect(
      ignored,
      `cited paths the tree REFUSES to track (add a !scripts/... negation to .gitignore):\n  ${ignored.join('\n  ')}`,
    ).toEqual([]);
  });
});
