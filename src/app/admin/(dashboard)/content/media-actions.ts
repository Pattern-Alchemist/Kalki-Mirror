"use server";

// =============================================================
// KALKI — Media library server actions (Vol. 3 #5)
// -------------------------------------------------------------
// The uploader module existed since Vol. 1 with ZERO callers —
// the studio had no image path at all. These actions give it one:
//   · listMedia    — Cloudinary resources under kalki-mirror/
//   · uploadMedia  — validated, audited upload into that folder
// Both gate on the admin role and degrade honestly when the
// deployment carries no Cloudinary credentials (a legitimate
// steady state, same posture as the settings env panel).
// =============================================================

import { requireRole } from "@/lib/admin/require-role";
import { logAudit } from "@/lib/admin/audit";
import {
  cloudinaryConfigured,
  getCloudinary,
  uploadToCloudinary,
} from "@/lib/cloudinary/upload";
import {
  sanitizeMediaName,
  validateImageUpload,
  type MediaAsset,
} from "@/lib/cloudinary/media";

const FOLDER = "kalki-mirror";

export type MediaResult =
  | { ok: true; assets: MediaAsset[] }
  | { ok: false; reason: "not-configured" | "error"; message: string };

export async function listMedia(): Promise<MediaResult> {
  await requireRole("any_staff");

  if (!cloudinaryConfigured()) {
    return {
      ok: false,
      reason: "not-configured",
      message:
        "Media library is dormant on this deployment — set CLOUDINARY_URL (cloudinary://key:secret@cloud) to wake it.",
    };
  }

  try {
    const cld = getCloudinary();
    const result = await cld.api.resources({
      type: "upload",
      prefix: `${FOLDER}/`,
      resource_type: "image",
      max_results: 60,
    });
    const assets: MediaAsset[] = (result.resources ?? []).map((r) => ({
      publicId: r.public_id,
      secureUrl: r.secure_url,
      width: r.width ?? 0,
      height: r.height ?? 0,
      format: r.format ?? "",
      bytes: r.bytes ?? 0,
      createdAt: r.created_at,
    }));
    return { ok: true, assets };
  } catch (err) {
    console.error("[media] list failed", err);
    return { ok: false, reason: "error", message: "Cloudinary listing failed — try again shortly." };
  }
}

export type UploadResultAction =
  | { ok: true; asset: MediaAsset }
  | { ok: false; message: string };

export async function uploadMedia(formData: FormData): Promise<UploadResultAction> {
  await requireRole("editor_plus");

  if (!cloudinaryConfigured()) {
    return {
      ok: false,
      message:
        "Upload refused — CLOUDINARY_URL is not set on this deployment. The media library stays read-only until it is.",
    };
  }

  const file = formData.get("file");
  const candidate =
    file instanceof File
      ? { size: file.size, type: file.type }
      : null;
  const verdict = validateImageUpload(candidate);
  if (!verdict.ok) {
    const messages: Record<string, string> = {
      missing: "No file received.",
      "bad-type": "Images only — png, jpeg, webp, avif, or gif.",
      "too-large": "Image exceeds the 8 MiB cap — compress it first.",
    };
    return { ok: false, message: messages[verdict.reason] };
  }

  const original = file instanceof File ? file.name : "image";
  const publicId = `${FOLDER}/content/${sanitizeMediaName(original)}-${Date.now().toString(36)}`;

  try {
    const buffer = Buffer.from(await (file as File).arrayBuffer());
    const uploaded = await uploadToCloudinary(buffer, { publicId, folder: FOLDER });

    await logAudit({
      action: "media.upload",
      entity: "CloudinaryAsset",
      entityId: uploaded.publicId,
      after: {
        bytes: uploaded.bytes,
        format: uploaded.format,
        originalName: original,
      },
    });

    return {
      ok: true,
      asset: {
        publicId: uploaded.publicId,
        secureUrl: uploaded.secureUrl,
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
      },
    };
  } catch (err) {
    console.error("[media] upload failed", err);
    return { ok: false, message: "Cloudinary upload failed — try again shortly." };
  }
}
