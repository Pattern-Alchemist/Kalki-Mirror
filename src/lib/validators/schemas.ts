import { z } from "zod";

// ── Consultation ──
export const consultationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(200, "Name too long."),
  whatsapp: z.string().min(7, "A valid WhatsApp number is required.").max(30, "Number too long."),
  message: z.string().min(10, "Please describe your pattern (at least 10 characters).").max(5000, "Message too long."),
});

// ── API: /api/keys/redeem ──
export const redeemKeySchema = z.object({
  code: z.string().min(1, "Code required.").max(30, "Code too long."),
});

// ── API: /api/keys (POST generate) ──
export const generateKeySchema = z.object({
  tierGranted: z.enum(["prithvi", "jal", "agni", "akash"]).default("jal"),
});

// ── API: /api/initiate ──
export const initiateSchema = z.object({
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthPlace: z.string().max(200).optional(),
  natalMoonDeg: z.number().min(0).max(360).optional(),
  behavioralQuery: z.string().max(2000).optional(),
}).refine(
  (data) => data.natalMoonDeg || data.behavioralQuery || data.birthDate,
  { message: "Provide birth coordinates, natal Moon degrees, or a behavioral description." }
);

// ── API: /api/yantra ──
export const yantraSchema = z.object({
  query: z.string().min(10, "Describe the behavioral pattern in detail.").max(2000, "Input exceeds maximum length."),
  context: z.object({
    dominantPatterns: z.array(z.string()).optional(),
    currentTransit: z.string().optional(),
    sadhanaStreaks: z.array(z.object({
      practice: z.string(),
      days: z.number(),
    })).optional(),
    tier: z.string().optional(),
  }).optional(),
});

// ── API: /api/transits ──
export const transitsSchema = z.object({
  natalMoon: z.coerce.number().min(0).max(360).optional(),
});

// ── Admin: Content Entry ──
export const contentEntrySchema = z.object({
  type: z.enum(["practice", "archetype", "pattern", "research", "codex"]),
  slug: z.string().min(1, "Slug is required.").max(100, "Slug too long.").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens."),
  title: z.string().min(1, "Title is required.").max(300),
  excerpt: z.string().max(500).optional(),
  body: z.string().max(50000).optional(),
  minTier: z.enum(["prithvi", "jal", "agni", "akash"]).default("prithvi"),
  caution: z.enum(["OPEN", "MODERATE", "HIGH", "SEALED"]).default("OPEN"),
});

// ── Admin: Member tier/role update ──
export const updateTierSchema = z.object({
  userId: z.string().min(1),
  newTier: z.enum(["prithvi", "jal", "agni", "akash"]),
  reason: z.string().min(1, "Reason is required.").max(500),
});

export const updateRoleSchema = z.object({
  userId: z.string().min(1),
  newRole: z.enum(["USER", "EDITOR", "REVIEWER", "ADMIN", "SUPERADMIN"]),
  reason: z.string().min(1, "Reason is required.").max(500),
});
