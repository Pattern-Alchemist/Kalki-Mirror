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

// ── API: /api/ai/search (semantic siddhi search) ──
export const aiSearchSchema = z.object({
  query: z.string().min(3, "Query must be at least 3 characters.").max(500, "Query too long."),
  limit: z.number().min(1).max(20).default(5),
});

// ── API: /api/ai/explain (codex explainer) ──
export const aiExplainSchema = z.object({
  content: z.string().min(20, "Content must be at least 20 characters.").max(10000, "Content exceeds maximum length."),
  style: z.enum(['beginner', 'technical']).default('beginner'),
});

// ── API: /api/ai/pattern-explain (pattern plain-English) ──
export const aiPatternExplainSchema = z.object({
  patternSlug: z.string().min(1, "Pattern slug is required."),
  context: z.string().max(500).optional(),
});

// ── API: /api/ai/transit-interpretation ──
export const transitInterpretationSchema = z.object({
  positions: z.array(
    z.object({
      planet: z.string().min(1, "Planet is required."),
      sign: z.string().min(1, "Sign is required."),
      degree: z.number().min(0).max(360),
    })
  ).min(1, "At least one planetary position is required."),
});

// ── API: /api/ai/consultation-screen ──
export const consultationScreenSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(200, "Name too long."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(5000, "Message too long."),
});

// ── API: /api/ai/draft ──
export const aiDraftSchema = z.object({
  type: z.enum(['practice', 'archetype', 'pattern', 'research', 'codex']),
  title: z.string().min(3, "Title must be at least 3 characters.").max(300, "Title too long."),
  context: z.string().max(2000, "Context too long.").optional(),
});

// ── API: /api/ai/archetype-quiz ──
export const archetypeQuizSchema = z.object({
  answers: z.array(z.string().min(5, "Each answer must be at least 5 characters.")).min(5, "At least 5 answers are required.").max(10, "At most 10 answers are allowed."),
});

// ── API: /api/ai/japa-guide ──
export const japaGuideSchema = z.object({
  mantra: z.string().min(2, "Mantra must be at least 2 characters."),
  count: z.number().min(1, "Count must be at least 1.").default(108),
  experience: z.string().max(1000, "Experience context too long.").optional(),
});

// ── API: /api/ai/breathwork ──
export const breathworkSchema = z.object({
  type: z.enum(['calming', 'energizing', 'focus', 'nadi-shuddhi', 'bhramari', 'custom'], {
    errorMap: () => ({ message: 'Invalid breathwork type.' }),
  }),
  duration: z.number().min(3, "Duration must be at least 3 minutes.").max(60, "Duration must be at most 60 minutes.").default(15),
});

// ── API: /api/ai/recommend-tier ──
export const recommendTierSchema = z.object({
  answers: z.array(z.string().min(5, "Each answer must be at least 5 characters.")).min(3, "At least 3 answers are required.").max(5, "At most 5 answers are allowed."),
});
