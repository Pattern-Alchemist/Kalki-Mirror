"use server";

import { db } from "@/lib/db";
import { logAudit } from "@/lib/admin/audit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

export async function getContentEntries(type?: string, status?: string, page: number = 1) {
  const where: Record<string, unknown> = {};
  if (type && type !== "ALL") where.type = type;
  if (status && status !== "ALL") where.status = status;

  const take = 20;
  const skip = (page - 1) * take;

  const [entries, total] = await Promise.all([
    db.contentEntry.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take,
      skip,
    }),
    db.contentEntry.count({ where }),
  ]);

  return { entries: entries as ContentRow[], total, pages: Math.ceil(total / take) };
}

export async function createContentEntry(data: {
  type: string;
  slug: string;
  title: string;
  excerpt?: string;
  body?: string;
  minTier?: string;
  caution?: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as unknown as { id: string })?.id || "unknown";

  const entry = await db.contentEntry.create({
    data: {
      ...data,
      createdById: userId,
    },
  });

  await logAudit({
    action: "content.create",
    entity: "ContentEntry",
    entityId: entry.id,
    after: { type: data.type, slug: data.slug, title: data.title },
  });

  return entry;
}

export async function updateContentEntry(
  id: string,
  data: {
    title?: string;
    excerpt?: string;
    body?: string;
    status?: string;
    minTier?: string;
    caution?: string;
  }
) {
  const entry = await db.contentEntry.findUniqueOrThrow({ where: { id } });

  const updated = await db.contentEntry.update({
    where: { id },
    data,
  });

  await logAudit({
    action: "content.update",
    entity: "ContentEntry",
    entityId: id,
    before: { title: entry.title, status: entry.status },
    after: data,
  });

  return updated;
}

export async function deleteContentEntry(id: string) {
  const entry = await db.contentEntry.findUniqueOrThrow({ where: { id } });

  await db.contentEntry.delete({ where: { id } });

  await logAudit({
    action: "content.delete",
    entity: "ContentEntry",
    entityId: id,
    before: { title: entry.title, slug: entry.slug },
  });

  return { success: true };
}
