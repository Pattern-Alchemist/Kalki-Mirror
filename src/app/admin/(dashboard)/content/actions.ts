"use server";

import { db } from "@/lib/db";
import { logAudit } from "@/lib/admin/audit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { ContentRow } from "./constants";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const role = (session.user as unknown as { role: string }).role;
  if (!["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"].includes(role)) {
    throw new Error("Forbidden");
  }
  return (session.user as unknown as { id: string }).id;
}

export async function getContentEntries(type?: string, status?: string, page: number = 1) {
  await requireAdmin();

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
  const userId = await requireAdmin();

  const entry = await db.contentEntry.create({
    data: {
      ...data,
      createdById: userId,
      updatedById: userId,
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
  const userId = await requireAdmin();
  const entry = await db.contentEntry.findUniqueOrThrow({ where: { id } });

  const updated = await db.contentEntry.update({
    where: { id },
    data: {
      ...data,
      updatedById: userId,
    },
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
  await requireAdmin();
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
