// =============================================================
// VOL. 2 #6 — CSV/JSON export utilities
// -------------------------------------------------------------
// Pure functions for serializing admin list rows to CSV and JSON.
// Used by the per-page export buttons (members, consultations, keys,
// testimonials, subscribers, audit).
//
// CSV follows RFC 4180: double-quoted fields, escaped inner quotes,
// CRLF line endings (Excel-friendly). Numbers and dates are emitted
// in their native form. NULL becomes empty string.
// =============================================================

export type ExportRow = Record<string, string | number | boolean | null | undefined | Date>;

export interface CsvOptions {
  /** Column order — if omitted, uses Object.keys of the first row. */
  columns?: string[];
  /** Pretty-print JSON output (default false = compact). */
  prettyJson?: boolean;
}

/**
 * Escape a single CSV field per RFC 4180.
 * - Wrap in double quotes if the value contains a comma, quote, newline, or CR.
 * - Double any inner double quotes.
 */
export function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s: string;
  if (value instanceof Date) {
    s = value.toISOString();
  } else if (typeof value === 'boolean') {
    s = value ? 'true' : 'false';
  } else if (typeof value === 'number') {
    s = String(value);
  } else {
    s = String(value);
  }
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Convert an array of row objects to a CSV string.
 */
export function toCsv(rows: ExportRow[], opts: CsvOptions = {}): string {
  if (rows.length === 0) return '';
  const cols = opts.columns ?? Object.keys(rows[0]);
  const header = cols.map(c => escapeCsvField(c)).join(',');
  const body = rows.map(r => cols.map(c => escapeCsvField(r[c])).join(','));
  return [header, ...body].join('\r\n');
}

/**
 * Convert an array of row objects to a JSON string.
 */
export function toJson(rows: ExportRow[], opts: CsvOptions = {}): string {
  return JSON.stringify(rows, null, opts.prettyJson ? 2 : 0);
}

/**
 * The Content-Disposition header value for a download.
 * Filename is sanitized: alphanumeric + dash + dot only.
 */
export function contentDisposition(filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9.-]/g, '-').replace(/-+/g, '-');
  return `attachment; filename="${safe}"`;
}

/**
 * Build a timestamped filename like "members-2026-09-19.csv".
 */
export function exportFilename(prefix: string, ext: 'csv' | 'json'): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${prefix}-${yyyy}-${mm}-${dd}.${ext}`;
}

// =============================================================
// CSV IMPORT — parse a CSV string into row objects
// =============================================================

export interface ParsedCsvResult {
  rows: ExportRow[];
  errors: string[];
}

/**
 * Parse a CSV string into an array of row objects.
 * Assumes the first row is the header. Tolerates quoted fields, escaped
 * quotes (""), and CRLF or LF line endings. Returns errors[] for malformed
 * rows so the UI can surface them.
 */
export function parseCsv(input: string): ParsedCsvResult {
  const errors: string[] = [];
  const rows: ExportRow[] = [];
  if (!input.trim()) return { rows, errors: ['Empty input'] };

  // State machine: parse field-by-field, honoring quoted values
  const lines: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        cur.push(field);
        field = '';
      } else if (c === '\r') {
        // skip — handled by \n
      } else if (c === '\n') {
        cur.push(field);
        lines.push(cur);
        cur = [];
        field = '';
      } else {
        field += c;
      }
    }
  }
  // Push the last field if non-empty (file may not end with newline)
  if (field || cur.length > 0) {
    cur.push(field);
    lines.push(cur);
  }

  if (lines.length === 0) return { rows, errors: ['No data rows'] };

  const header = lines[0].map(h => h.trim());
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i];
    if (cells.length === 1 && cells[0] === '') continue; // skip blank lines
    if (cells.length !== header.length) {
      errors.push(`Row ${i + 1}: expected ${header.length} columns, got ${cells.length}`);
      continue;
    }
    const row: ExportRow = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cells[j];
    }
    rows.push(row);
  }

  return { rows, errors };
}

/**
 * Validate an email address (basic shape — not RFC-perfect, but enough
 * to catch obvious typos during CSV import).
 */
export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}
