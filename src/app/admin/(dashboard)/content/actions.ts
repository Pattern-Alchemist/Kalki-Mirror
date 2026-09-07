"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/admin/audit";
import { dispatchWebhooks } from "@/lib/admin/webhook-dispatch";
import { broadcastNotification } from "@/lib/admin/notifications";
import { requireRole } from "@/lib/admin/require-role";
import { scheduleAuditPayload } from "@/lib/admin/scheduled-publish";
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
  publishAt?: string; // Vol. 4 #8 — ISO datetime; pre-sets the schedule stamp
}) {
  const userId = await requireRole('editor_plus');

  // A schedule on create is harmless while the row is DRAFT (the public
  // gate needs status PUBLISHED too) — the stamp simply rides along and
  // turns the first publish into a scheduled one.
  const { publishAt, ...entryData } = data;
  const scheduledAt = parsePublishAt(publishAt);

  const entry = await db.contentEntry.create({
    data: {
      ...entryData,
      ...(scheduledAt ? { publishedAt: scheduledAt } : {}),
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

  if (scheduledAt) {
    await logAudit({
      action: "content.schedule",
      entity: "ContentEntry",
      entityId: entry.id,
      after: scheduleAuditPayload(scheduledAt),
    });
  }

  await dispatchWebhooks('content.create', { id: entry.id, type: data.type, slug: data.slug, title: data.title });

  return entry;
}

/** Vol. 4 #8 — parse a studio schedule value; '' / absent / garbage = no-op. */
function parsePublishAt(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Fire the publish side effects once, at the moment a due date arrives. */
async function firePublishSideEffects(id: string, title: string, type: string) {
  try {
    await dispatchWebhooks('content.published', { id, title, type });
  } catch {
    // webhook outage never blocks publishing
  }
  try {
    await broadcastNotification({
      title: 'Content Published',
      body: `"${title}" is now live`,
      type: 'success',
      href: '/admin/content',
    });
  } catch {
    // notification failure never blocks publishing
  }
  revalidatePath('/sitemap.xml');
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
    publishAt?: string; // Vol. 4 #8 — ISO datetime; '' = leave the stamp untouched
  }
) {
  const userId = await requireRole('editor_plus');
  const entry = await db.contentEntry.findUniqueOrThrow({ where: { id } });

  // Status changes to PUBLISHED require ADMIN+
  if (data.status === 'PUBLISHED') {
    await requireRole('admin_plus');
  }

  // Vol. 4 #8 — scheduling IS a publish decision: ADMIN+ only, and only
  // when the value actually CHANGES (re-saving an unchanged stamp must
  // never re-arm the flip pass — audit-pair idempotence would re-fire).
  const scheduledAt = parsePublishAt(data.publishAt);
  const scheduleChanged =
    scheduledAt !== undefined &&
    scheduledAt.getTime() !== (entry.publishedAt?.getTime() ?? -1);
  if (scheduleChanged) {
    await requireRole('admin_plus');
  }

  const { publishAt: _publishAt, ...rest } = data;
  const updated = await db.contentEntry.update({
    where: { id },
    data: {
      ...rest,
      // Stamp first-publish time (Vol. 3 #2); a CHANGED schedule wins
      // (Vol. 4 #8) — that is the SCHEDULED semantics: PUBLISHED + a
      // future publishedAt stays hidden until due.
      publishedAt: scheduleChanged
        ? scheduledAt
        : data.status === 'PUBLISHED' && !entry.publishedAt
          ? new Date()
          : undefined,
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

  if (scheduleChanged && scheduledAt) {
    await logAudit({
      action: "content.schedule",
      entity: "ContentEntry",
      entityId: id,
      after: scheduleAuditPayload(scheduledAt),
    });
    if (scheduledAt.getTime() <= Date.now()) {
      // Past-due schedule = immediate publish — fire side effects now and
      // settle the flip audit synchronously so the cron never re-fires.
      await logAudit({
        action: "content.publish_flip",
        entity: "ContentEntry",
        entityId: id,
        after: scheduleAuditPayload(scheduledAt),
      });
      await firePublishSideEffects(id, data.title || entry.title, entry.type);
    } else {
      await broadcastNotification({
        title: 'Content Scheduled',
        body: `"${data.title || entry.title}" goes live ${scheduledAt.toISOString()}`,
        type: 'info',
        href: '/admin/content',
      }).catch(() => {});
    }
  }

  // Fire webhook + notification on publish — but NEVER when this same
  // save already ran the schedule path (it fired or deferred its own
  // side effects above; running both would double the webhook).
  if (data.status === 'PUBLISHED' && !scheduleChanged) {
    // A due-or-null stamp means the entry is live right now; a future
    // stamp means it is SCHEDULED — side effects come from the cron's
    // flip pass when the date arrives, never from this branch.
    const effectiveStamp = updated.publishedAt ?? entry.publishedAt;
    const liveNow = !effectiveStamp || effectiveStamp.getTime() <= Date.now();
    if (liveNow) {
      await firePublishSideEffects(id, data.title || entry.title, entry.type);
    } else {
      await broadcastNotification({
        title: 'Content Scheduled',
        body: `"${data.title || entry.title}" will publish at ${effectiveStamp.toISOString()}`,
        type: 'info',
        href: '/admin/content',
      }).catch(() => {});
    }
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
