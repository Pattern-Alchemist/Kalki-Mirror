// =============================================================
// KALKI — Cloudinary media helpers (Vol. 3 #5)
// -------------------------------------------------------------
// Pure, dependency-free logic for the media library. Server
// actions (media-actions.ts) and the studio client both import
// from here; everything exportable is unit-tested in
// tests/lib/cloudinary-config.test.ts.
// =============================================================

/** Hard upload cap — images only, 8 MiB is plenty for editorial body art. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export interface ParsedCloudinaryUrl {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Parse a Vercel-style CLOUDINARY_URL ("cloudinary://key:secret@cloud_name").
 * This is the var production actually carries — the three-var split
 * (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET) never existed in the stack,
 * which is exactly why the uploader stayed orphaned until Vol. 3 #5.
 */
export function parseCloudinaryUrl(raw: string | undefined | null): ParsedCloudinaryUrl | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const match = trimmed.match(/^cloudinary:\/\/([^:@]+):([^:@]+)@([^:@/]+)\/?$/);
  if (!match) return null;
  const [, apiKey, apiSecret, cloudName] = match;
  if (!apiKey || !apiSecret || !cloudName) return null;
  return { cloudName, apiKey, apiSecret };
}

/**
 * Whether the media library can run on this deployment. Checks the same
 * env vars getCloudinary() reads — never throws, never logs values.
 */
export function isCloudinaryConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  if (parseCloudinaryUrl(env.CLOUDINARY_URL)) return true;
  return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

/**
 * Derive a Cloudinary public_id stem from an original filename:
 * filesystem-safe, lowercase, length-capped, collision-padded by the caller
 * (actions append a timestamp). "Kālī Yantra FINAL.png" → "kali-yantra-final".
 */
export function sanitizeMediaName(original: string): string {
  const stem = original
    .replace(/\.[a-z0-9]+$/i, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return stem || 'image';
}

export interface UploadCandidate {
  size: number;
  type: string;
}

export type UploadValidation =
  | { ok: true }
  | { ok: false; reason: 'missing' | 'too-large' | 'bad-type' };

const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/gif',
]);

/** Server-side gate for an incoming upload — mirror of the client's accept. */
export function validateImageUpload(candidate: UploadCandidate | null | undefined): UploadValidation {
  if (!candidate || !(candidate instanceof Object)) return { ok: false, reason: 'missing' };
  if (!candidate.type || !ALLOWED_IMAGE_TYPES.has(candidate.type)) return { ok: false, reason: 'bad-type' };
  if (typeof candidate.size !== 'number' || candidate.size <= 0) return { ok: false, reason: 'missing' };
  if (candidate.size > MAX_UPLOAD_BYTES) return { ok: false, reason: 'too-large' };
  return { ok: true };
}

/** Markdown for editorial bodies — alt is escaped against ] ( and newlines. */
export function buildImageMarkdown(alt: string, url: string): string {
  const safeAlt = (alt || 'illustration')
    .replace(/[[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
  return `![${safeAlt}](${url})`;
}

/**
 * Insert markdown into a textarea's value at the current selection,
 * replacing any selected range — cursor lands after the insertion.
 * Pure so the studio tests it without a DOM.
 */
export function insertMarkdownAtCursor(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  markdown: string
): { text: string; caret: number } {
  const len = text.length;
  const start = Math.max(0, Math.min(selectionStart ?? len, len));
  const end = Math.max(start, Math.min(selectionEnd ?? start, len));
  const needsBreakBefore = start > 0 && text[start - 1] !== '\n' && text[start - 1] !== ' ';
  const inserted = `${needsBreakBefore ? ' ' : ''}${markdown}`;
  const next = text.slice(0, start) + inserted + text.slice(end);
  return { text: next, caret: start + inserted.length };
}

export interface MediaAsset {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt?: string;
}
