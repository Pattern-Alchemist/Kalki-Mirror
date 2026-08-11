/**
 * Upload Mahavidya goddess images to Cloudinary.
 * 
 * Usage:
 *   CLOUDINARY_CLOUD_NAME=b9oo5abp \
 *   CLOUDINARY_API_KEY=<your-key> \
 *   CLOUDINARY_API_SECRET=<your-secret> \
 *   npx tsx scripts/upload-mahavidyas.ts
 * 
 * Or run in Vercel environment where these env vars are set.
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const MAHAVIDYAS = [
  { id: 'kali', file: 'kali.jpeg' },
  { id: 'tara', file: 'tara.jpeg' },
  { id: 'chinnamasta', file: 'chinnamasta.jpeg' },
  { id: 'bhuvaneshvari', file: 'bhuvaneshvari.jpeg' },
  { id: 'shodashi', file: 'shodashi.jpeg' },
  { id: 'bhairavi', file: 'bhairavi.jpeg' },
  { id: 'dhumavati', file: 'dhumavati.jpeg' },
  { id: 'bagalamukhi', file: 'bagalamukhi.jpeg' },
  { id: 'matangi', file: 'matangi.jpeg' },
  { id: 'kamala', file: 'kamala.jpeg' },
] as const;

function configure() {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!name || !key || !secret) {
    throw new Error(
      'Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET env vars'
    );
  }
  cloudinary.config({ cloud_name: name, api_key: key, api_secret: secret });
}

async function main() {
  configure();
  const sourceDir = path.resolve(__dirname, '../public/mahavidyas');
  const results: Record<string, { publicId: string; url: string; width: number; height: number }> = {};

  for (const m of MAHAVIDYAS) {
    const filePath = path.join(sourceDir, m.file);
    if (!fs.existsSync(filePath)) {
      console.error(`  SKIP: ${m.file} not found at ${filePath}`);
      continue;
    }

    const publicId = `kalki-mirror/mahavidyas/${m.id}`;
    console.log(`  Uploading ${m.id} -> ${publicId}...`);

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: true,
        folder: 'kalki-mirror/mahavidyas',
        resource_type: 'image',
      });
      results[m.id] = {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
      };
      console.log(`    OK: ${result.secure_url}`);
    } catch (err) {
      console.error(`    FAIL: ${m.id}`, err);
    }
  }

  console.log('\n=== Upload Summary ===');
  for (const [id, info] of Object.entries(results)) {
    console.log(`  ${id}: ${info.url} (${info.width}x${info.height})`);
  }
  console.log(`\nUploaded: ${Object.keys(results).length}/${MAHAVIDYAS.length}`);
}

main().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
