import { v2 as cloudinary } from 'cloudinary';

// Singleton — configured once at module load
let _configured = false;

function getConfig() {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!name || !key || !secret) {
    throw new Error(
      'Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET env vars'
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
  const result = await cld.uploader.upload(file, {
    folder: opts.folder || 'kalki-mirror',
    public_id: opts.publicId,
    overwrite: opts.overwrite ?? true,
    transformation: opts.transformation,
    resource_type: 'image',
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
  opts: { width?: number; quality?: string; format?: string } = {}
): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) return '';
  const w = opts.width ? `w_${opts.width},c_limit` : '';
  const q = opts.quality ? `q_${opts.quality}` : 'q_auto:good';
  const f = opts.format ? `f_${opts.format}` : 'f_auto';
  const parts = [f, q, w].filter(Boolean).join(',');
  return `https://res.cloudinary.com/${cloud}/image/upload/${parts}/${publicId}`;
}
