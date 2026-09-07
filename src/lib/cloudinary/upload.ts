import { v2 as cloudinary } from 'cloudinary';
import { parseCloudinaryUrl } from './media';

// Singleton — configured once at module load
let _configured = false;

/**
 * Vol. 3 #5 — the real wiring for this module.
 *
 * Production carries CLOUDINARY_URL (Vercel-style cloudinary://key:secret@cloud),
 * not the three-var split — so getCloudinary() prefers parsing that URL and
 * falls back to the three explicit vars (CLOUDINARY_CLOUD_NAME / API_KEY /
 * API_SECRET) for parity with the upstream SDK docs. Throws only when the
 * caller actually needs credentials and none exist.
 */
function getConfig() {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  if (fromUrl) {
    return {
      cloud_name: fromUrl.cloudName,
      api_key: fromUrl.apiKey,
      api_secret: fromUrl.apiSecret,
    };
  }
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!name || !key || !secret) {
    throw new Error(
      'Cloudinary is not configured — set CLOUDINARY_URL (cloudinary://key:secret@cloud) or the three-var split'
    );
  }
  return { cloud_name: name, api_key: key, api_secret: secret };
}

export function getCloudinary(): typeof cloudinary {
  if (!_configured) {
    cloudinary.config(getConfig());
    _configured = true;
  }
  return cloudinary;
}

/** Safe boolean for UI gating — never throws, never logs values. */
export function cloudinaryConfigured(): boolean {
  try {
    getConfig();
    return true;
  } catch {
    return false;
  }
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload a single file (Buffer or readable stream) to Cloudinary.
 * `folder` controls the Cloudinary media library folder.
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  opts: {
    publicId?: string;
    folder?: string;
    transformation?: Record<string, unknown>[];
    overwrite?: boolean;
  } = {}
): Promise<UploadResult> {
  const cld = getCloudinary();
  // @ts-expect-error cloudinary v2 SDK types are inaccurate for resource_type
  const result = await cld.uploader.upload(file, {
    folder: opts.folder || 'kalki-mirror',
    public_id: opts.publicId,
    overwrite: opts.overwrite ?? true,
    transformation: opts.transformation,
    resource_type: 'image' as const,
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Build a Cloudinary delivery URL with transformations.
 * For client-side use, prefer the CDN URL pattern directly.
 */
export function buildCloudinaryUrl(
  publicId: string,
  opts: { width?: number; quality?: string; format?: string; cloudName?: string } = {}
): string {
  const cloud =
    opts.cloudName ||
    parseCloudinaryUrl(process.env.CLOUDINARY_URL)?.cloudName ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) return '';
  const w = opts.width ? `w_${opts.width},c_limit` : '';
  const q = opts.quality ? `q_${opts.quality}` : 'q_auto:good';
  const f = opts.format ? `f_${opts.format}` : 'f_auto';
  const parts = [f, q, w].filter(Boolean).join(',');
  return `https://res.cloudinary.com/${cloud}/image/upload/${parts}/${publicId}`;
}
