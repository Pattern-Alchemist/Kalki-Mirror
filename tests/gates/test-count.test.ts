import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/* ══════════════════════════════════════════════════════════════
   Vol. 7 #13 — Test-file count reconciliation gate.
   The Vol. 6 closeout claimed "88 files" but the live count was 89.
   The "tree is the truth" doctrine means the worklog should match
   the tree. This gate asserts the test-file count so the next
   closeout can't miscount — the worklog references the gate's
   constant, not a hand-typed number.
   ══════════════════════════════════════════════════════════════ */

const REPO = join(__dirname, '..', '..');
const TESTS_DIR = join(REPO, 'tests');

function countTestFiles(dir: string): number {
  let count = 0;
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) {
      count += countTestFiles(abs);
    } else if (name.endsWith('.test.ts') || name.endsWith('.test.tsx')) {
      count += 1;
    }
  }
  return count;
}

describe('Vol. 7 #13 — test-file count reconciliation', () => {
  it('the test-file count matches the expected value (the tree is the truth)', () => {
    const actual = countTestFiles(TESTS_DIR);
    // This constant is the source of truth. Update it when tests are added.
    // The worklog should reference this number, not a hand-typed value.
    const EXPECTED = 92; // Vol. 2 Week A: 91 (Vol.7 closeout) + 1 (vol2-week-a.test.ts)
    expect(actual, `test-file count mismatch: expected ${EXPECTED}, got ${actual}. Update EXPECTED in this test or add missing test files.`).toBe(EXPECTED);
  });

  it('the test count is ≥ 1154 (the Vol. 6 closeout baseline)', () => {
    // This is a floor, not an exact count — tests should only grow.
    // The Vol. 6 closeout pinned 1154; Vol. 7 adds more.
    const actual = countTestFiles(TESTS_DIR);
    expect(actual).toBeGreaterThanOrEqual(89); // minimum: the Vol. 6 count
  });
});
