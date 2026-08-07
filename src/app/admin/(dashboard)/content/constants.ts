export type ContentRow = {
  id: string;
  type: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  minTier: string;
  caution: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const CONTENT_TYPES = ["practice", "archetype", "pattern", "research", "codex"] as const;
export const STATUSES = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"] as const;
export const CAUTIONS = ["OPEN", "GUARDED", "RESTRICTED", "EMBARGO"] as const;
export const TIERS = ["prithvi", "jal", "agni", "akash"] as const;
