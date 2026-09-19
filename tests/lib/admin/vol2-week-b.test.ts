// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';

// =============================================================
// VOL. 2 WEEK B — Tests for the new admin primitives:
//   · CSV export/import utilities (escapeCsvField, toCsv, parseCsv)
//   · Email template helpers (substitutePlaceholders)
//   · Notification bell + activity feed (smoke tests on the pure helpers)
// =============================================================

import {
  escapeCsvField,
  toCsv,
  parseCsv,
  toJson,
  contentDisposition,
  exportFilename,
  isValidEmail,
  type ExportRow,
} from '@/lib/admin/export-import';

// --- CSV escape --------------------------------------------------------------

describe('escapeCsvField', () => {
  it('returns empty string for null/undefined', () => {
    expect(escapeCsvField(null)).toBe('');
    expect(escapeCsvField(undefined)).toBe('');
  });
  it('returns numbers as-is', () => {
    expect(escapeCsvField(42)).toBe('42');
    expect(escapeCsvField(3.14)).toBe('3.14');
  });
  it('returns booleans as true/false', () => {
    expect(escapeCsvField(true)).toBe('true');
    expect(escapeCsvField(false)).toBe('false');
  });
  it('returns simple strings without quotes', () => {
    expect(escapeCsvField('hello')).toBe('hello');
  });
  it('quotes strings containing commas', () => {
    expect(escapeCsvField('a,b')).toBe('"a,b"');
  });
  it('quotes + escapes strings containing quotes', () => {
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
  });
  it('quotes strings with newlines', () => {
    expect(escapeCsvField('line1\nline2')).toBe('"line1\nline2"');
  });
  it('serializes Dates as ISO strings', () => {
    const d = new Date('2026-09-19T12:00:00Z');
    expect(escapeCsvField(d)).toBe(d.toISOString());
  });
});

// --- toCsv ------------------------------------------------------------------

describe('toCsv', () => {
  it('returns empty string for empty input', () => {
    expect(toCsv([])).toBe('');
  });
  it('emits header + rows with CRLF', () => {
    const rows: ExportRow[] = [{ a: 1, b: 'x' }, { a: 2, b: 'y' }];
    const csv = toCsv(rows);
    expect(csv).toBe('a,b\r\n1,x\r\n2,y');
  });
  it('respects columns option for ordering', () => {
    const rows: ExportRow[] = [{ a: 1, b: 'x' }];
    expect(toCsv(rows, { columns: ['b', 'a'] })).toBe('b,a\r\nx,1');
  });
  it('handles null + undefined fields', () => {
    const rows: ExportRow[] = [{ a: null, b: undefined, c: 'keep' }];
    expect(toCsv(rows)).toBe('a,b,c\r\n,,keep');
  });
  it('escapes embedded commas in fields', () => {
    const rows: ExportRow[] = [{ name: 'Ananya, M.' }];
    expect(toCsv(rows)).toBe('name\r\n"Ananya, M."');
  });
});

// --- parseCsv ---------------------------------------------------------------

describe('parseCsv', () => {
  it('parses a simple CSV', () => {
    const input = 'name,email\r\nAnanya,ananya@example.com\r\nRahul,rahul@example.com';
    const { rows, errors } = parseCsv(input);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: 'Ananya', email: 'ananya@example.com' });
    expect(rows[1]).toEqual({ name: 'Rahul', email: 'rahul@example.com' });
  });
  it('handles LF line endings (no CR)', () => {
    const input = 'a,b\n1,2\n3,4';
    const { rows } = parseCsv(input);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ a: '1', b: '2' });
  });
  it('handles quoted fields with commas', () => {
    const input = 'name,note\r\n"Smith, John","has, comma"';
    const { rows } = parseCsv(input);
    expect(rows[0]).toEqual({ name: 'Smith, John', note: 'has, comma' });
  });
  it('handles escaped quotes ("" → ")', () => {
    const input = 'note\r\n"say ""hi"" please"';
    const { rows } = parseCsv(input);
    expect(rows[0]).toEqual({ note: 'say "hi" please' });
  });
  it('skips blank lines', () => {
    const input = 'a,b\r\n1,2\r\n\r\n3,4';
    const { rows } = parseCsv(input);
    expect(rows).toHaveLength(2);
  });
  it('reports errors for mismatched column counts', () => {
    const input = 'a,b,c\r\n1,2\r\n3,4,5';
    const { rows, errors } = parseCsv(input);
    expect(rows).toHaveLength(1);
    expect(errors.length).toBeGreaterThan(0);
  });
  it('returns error for empty input', () => {
    const { rows, errors } = parseCsv('');
    expect(rows).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });
});

// --- toJson -----------------------------------------------------------------

describe('toJson', () => {
  it('serializes to compact JSON by default', () => {
    const rows: ExportRow[] = [{ a: 1, b: 'x' }];
    expect(toJson(rows)).toBe(JSON.stringify(rows));
  });
  it('pretty-prints when prettyJson=true', () => {
    const rows: ExportRow[] = [{ a: 1 }];
    const out = toJson(rows, { prettyJson: true });
    expect(out).toContain('\n');
  });
});

// --- contentDisposition + exportFilename -----------------------------------

describe('contentDisposition', () => {
  it('returns attachment disposition', () => {
    expect(contentDisposition('members.csv')).toBe('attachment; filename="members.csv"');
  });
  it('sanitizes dangerous characters', () => {
    expect(contentDisposition('../../etc/passwd')).toBe('attachment; filename="..-..-etc-passwd"');
  });
});

describe('exportFilename', () => {
  it('builds a timestamped filename', () => {
    const name = exportFilename('members', 'csv');
    expect(name).toMatch(/^members-\d{4}-\d{2}-\d{2}\.csv$/);
  });
  it('supports json extension', () => {
    const name = exportFilename('keys', 'json');
    expect(name).toMatch(/^keys-\d{4}-\d{2}-\d{2}\.json$/);
  });
});

// --- isValidEmail -----------------------------------------------------------

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('ananya@example.com')).toBe(true);
    expect(isValidEmail('rahul.kapur+test@sub.example.org')).toBe(true);
  });
  it('rejects emails without @', () => {
    expect(isValidEmail('notanemail')).toBe(false);
  });
  it('rejects emails without domain', () => {
    expect(isValidEmail('ananya@')).toBe(false);
  });
  it('rejects emails without TLD', () => {
    expect(isValidEmail('ananya@example')).toBe(false);
  });
  it('rejects empty strings', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
  });
});

// --- Email template placeholder substitution --------------------------------

import { substitutePlaceholders, KNOWN_TEMPLATE_KEYS } from '@/lib/admin/email-templates';

describe('substitutePlaceholders', () => {
  it('substitutes known placeholders', () => {
    const result = substitutePlaceholders('Hi {{name}}, visit {{link}}', {
      name: 'Ananya',
      link: 'https://www.astrokalki.com',
    });
    expect(result).toBe('Hi Ananya, visit https://www.astrokalki.com');
  });
  it('leaves unknown placeholders as-is', () => {
    const result = substitutePlaceholders('Hi {{name}}, your code is {{code}}', {
      name: 'Ananya',
    });
    expect(result).toBe('Hi Ananya, your code is {{code}}');
  });
  it('handles missing vars (undefined)', () => {
    const result = substitutePlaceholders('Hi {{name}}', { name: undefined });
    expect(result).toBe('Hi {{name}}');
  });
  it('handles multiple occurrences of same placeholder', () => {
    const result = substitutePlaceholders('{{name}} {{name}} {{name}}', { name: 'Kaustubh' });
    expect(result).toBe('Kaustubh Kaustubh Kaustubh');
  });
});

describe('KNOWN_TEMPLATE_KEYS', () => {
  it('includes completion-nudge', () => {
    expect(KNOWN_TEMPLATE_KEYS.some(k => k.key === 'completion-nudge')).toBe(true);
  });
  it('includes weekly-digest', () => {
    expect(KNOWN_TEMPLATE_KEYS.some(k => k.key === 'weekly-digest')).toBe(true);
  });
  it('each entry has key + label + description', () => {
    for (const k of KNOWN_TEMPLATE_KEYS) {
      expect(k.key.length).toBeGreaterThan(0);
      expect(k.label.length).toBeGreaterThan(0);
      expect(k.description.length).toBeGreaterThan(0);
    }
  });
});
