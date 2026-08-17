"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/admin/audit";
import { dispatchWebhooks } from "@/lib/admin/webhook-dispatch";
import { broadcastNotification } from "@/lib/admin/notifications";
import { requireRole } from "@/lib/admin/require-role";
import type { ContentRow } from "./constants";

export async function getContentEntries(type?: string, status?: string, page: number = 1) {
  const userId = await requireRole('any_staff');

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
  const userId = await requireRole('editor_plus');

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

  await dispatchWebhooks('content.create', { id: entry.id, type: data.type, slug: data.slug, title: data.title });

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
  const userId = await requireRole('editor_plus');
  const entry = await db.contentEntry.findUniqueOrThrow({ where: { id } });

  // Status changes to PUBLISHED require ADMIN+
  if (data.status === 'PUBLISHED') {
    await requireRole('admin_plus');
  }

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

  // Fire webhook + notification on publish
  if (data.status === 'PUBLISHED') {
    await dispatchWebhooks('content.published', { id, title: data.title || entry.title, type: entry.type });
    await broadcastNotification({
      title: 'Content Published',
      body: `"${data.title || entry.title}" is now live`,
      type: 'success',
      href: '/admin/content',
    });
  }

  return updated;
}

export async function deleteContentEntry(id: string) {
  await requireRole('admin_plus');
  const entry = await db.contentEntry.findUniqueOrThrow({ where: { id } });

  await db.contentEntry.delete({ where: { id } });

  await logAudit({
    action: "content.delete",
    entity: "ContentEntry",
    entityId: id,
    before: { title: entry.title, slug: entry.slug },
  });

  await dispatchWebhooks('content.delete', { id, title: entry.title, slug: entry.slug });

  revalidatePath('/admin/overview');
  revalidatePath('/admin/content');
  return { success: true };
}
