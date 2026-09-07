import { describe, it, expect, afterEach } from 'vitest';
import {
  parseCloudinaryUrl,
  isCloudinaryConfigured,
  sanitizeMediaName,
  validateImageUpload,
  buildImageMarkdown,
  insertMarkdownAtCursor,
  MAX_UPLOAD_BYTES,
} from '@/lib/cloudinary/media';
import { buildCloudinaryUrl } from '@/lib/cloudinary/upload';

/**
 * Vol. 3 #5 — media library invariants.
 *
 * The uploader module existed orphaned since Vol. 1 because it read three
 * env vars production never had. These tests lock the new contract
 * (CLOUDINARY_URL parsing, honest configured-check, upload validation,
 * markdown insertion) before the studio gets its image path.
 */

const ENV_SNAPSHOT = { ...process.env };
afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ENV_SNAPSHOT)) delete process.env[key];
    else process.env[key] = ENV_SNAPSHOT[key];
  }
});

describe('parseCloudinaryUrl', () => {
  it('parses the Vercel-style URL production carries', () => {
    expect(parseCloudinaryUrl('cloudinary://123456789012345:abc-DEF_secret@my-cloud')).toEqual({
      apiKey: '123456789012345',
      apiSecret: 'abc-DEF_secret',
      cloudName: 'my-cloud',
    });
  });

  it('tolerates a trailing slash and surrounding whitespace', () => {
    expect(parseCloudinaryUrl('  cloudinary://k:s@c/  ')?.cloudName).toBe('c');
  });

  it('rejects malformed URLs and non-values', () => {
    expect(parseCloudinaryUrl(undefined)).toBeNull();
    expect(parseCloudinaryUrl('')).toBeNull();
    expect(parseCloudinaryUrl('https://k:s@c')).toBeNull();
    expect(parseCloudinaryUrl('cloudinary://k@c')).toBeNull(); // missing secret
    expect(parseCloudinaryUrl('cloudinary://:s@c')).toBeNull(); // missing key
    expect(parseCloudinaryUrl('cloudinary://k:s@')).toBeNull(); // missing cloud
  });
});

describe('isCloudinaryConfigured', () => {
  it('is true with CLOUDINARY_URL alone', () => {
    expect(isCloudinaryConfigured({ CLOUDINARY_URL: 'cloudinary://k:s@c' } as NodeJS.ProcessEnv)).toBe(true);
  });

  it('is true with the legacy three-var split', () => {
    expect(
      isCloudinaryConfigured({
        CLOUDINARY_CLOUD_NAME: 'c',
        CLOUDINARY_API_KEY: 'k',
        CLOUDINARY_API_SECRET: 's',
      } as unknown as NodeJS.ProcessEnv)
    ).toBe(true);
  });

  it('is false when nothing (or a partial split) exists', () => {
    expect(isCloudinaryConfigured({} as NodeJS.ProcessEnv)).toBe(false);
    expect(
      isCloudinaryConfigured({ CLOUDINARY_CLOUD_NAME: 'c', CLOUDINARY_API_KEY: 'k' } as unknown as NodeJS.ProcessEnv)
    ).toBe(false);
    expect(isCloudinaryConfigured({ CLOUDINARY_URL: 'garbage' } as NodeJS.ProcessEnv)).toBe(false);
  });
});

describe('sanitizeMediaName', () => {
  it('slugs real filenames', () => {
    expect(sanitizeMediaName('Kālī Yantra FINAL.png')).toBe('kali-yantra-final');
    expect(sanitizeMediaName('Śiva.Cover v2.webp')).toBe('siva-cover-v2');
  });

  it('strips path traversal and caps length', () => {
    expect(sanitizeMediaName('../../etc/passwd.jpg')).toBe('etc-passwd');
    expect(sanitizeMediaName(`${'x'.repeat(200)}.png`)).toHaveLength(60);
    expect(sanitizeMediaName('    ')).toBe('image');
  });
});

describe('validateImageUpload', () => {
  it('accepts supported image types within the cap', () => {
    expect(validateImageUpload({ size: 1024, type: 'image/png' })).toEqual({ ok: true });
    expect(validateImageUpload({ size: MAX_UPLOAD_BYTES, type: 'image/webp' })).toEqual({ ok: true });
  });

  it('rejects missing, oversize, and non-image payloads', () => {
    expect(validateImageUpload(null)).toEqual({ ok: false, reason: 'missing' });
    expect(validateImageUpload({ size: MAX_UPLOAD_BYTES + 1, type: 'image/png' })).toEqual({
      ok: false,
      reason: 'too-large',
    });
    expect(validateImageUpload({ size: 10, type: 'application/pdf' })).toEqual({ ok: false, reason: 'bad-type' });
    expect(validateImageUpload({ size: 0, type: 'image/png' })).toEqual({ ok: false, reason: 'missing' });
  });
});

describe('buildImageMarkdown', () => {
  it('escapes markdown-breaking characters in the alt', () => {
    expect(buildImageMarkdown('Yantra [final] (v2)', 'https://res.example/x.png')).toBe(
      '![Yantra final v2](https://res.example/x.png)'
    );
  });

  it('falls back to a dignified default alt', () => {
    expect(buildImageMarkdown('', 'https://res.example/x.png')).toBe(
      '![illustration](https://res.example/x.png)'
    );
  });
});

describe('insertMarkdownAtCursor', () => {
  const md = '![img](https://res.example/x.png)';

  it('inserts at the cursor with a space when mid-paragraph', () => {
    const result = insertMarkdownAtCursor('hello world', 5, 5, md);
    expect(result.text).toBe(`hello ${md} world`);
    expect(result.caret).toBe(result.text.indexOf(md) + md.length);
  });

  it('appends cleanly at end-of-buffer', () => {
    const result = insertMarkdownAtCursor('body text', 9, 9, md);
    // The separator space is intended: markdown must never glue to the
    // previous word, whether mid-paragraph or at end-of-buffer.
    expect(result.text).toBe(`body text ${md}`);
    expect(result.caret).toBe(result.text.length);
  });

  it('replaces the current selection', () => {
    const result = insertMarkdownAtCursor('keep [placeholder] here', 5, 18, md);
    expect(result.text).toBe(`keep ${md} here`);
  });

  it('never corrupts indices on out-of-range selections', () => {
    const result = insertMarkdownAtCursor('abc', 99, 999, md);
    // Clamped to end-of-buffer; separator space still applies.
    expect(result.text).toBe(`abc ${md}`);
    expect(result.caret).toBe(result.text.length);
  });
});

describe('buildCloudinaryUrl (rewired for CLOUDINARY_URL)', () => {
  it('derives the cloud name from CLOUDINARY_URL', () => {
    process.env.CLOUDINARY_URL = 'cloudinary://k:s@my-cloud';
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    const url = buildCloudinaryUrl('kalki-mirror/content/x', { width: 800 });
    expect(url).toContain('https://res.cloudinary.com/my-cloud/image/upload/');
    expect(url).toContain('w_800,c_limit');
  });

  it('returns empty when no cloud name source exists', () => {
    delete process.env.CLOUDINARY_URL;
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    expect(buildCloudinaryUrl('kalki-mirror/content/x')).toBe('');
  });
});
