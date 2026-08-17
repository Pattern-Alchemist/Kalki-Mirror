"use server";

import { safeGetToken } from "@/lib/get-token-safe";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/admin/require-role";
import { logAudit } from "@/lib/admin/audit";
import { dispatchWebhooks } from "@/lib/admin/webhook-dispatch";
import crypto from "crypto";

export async function getWebhooks() {
  await requireRole("superadmin_only");
  return db.webhook.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function createWebhook(data: { url: string; events: string[]; secret?: string }) {
  await requireRole("superadmin_only");
  const session = await safeGetToken();
  const userId = session?.id;

  const webhook = await db.webhook.create({
    data: {
      url: data.url,
      events: JSON.stringify(data.events),
      secret: data.secret || crypto.randomBytes(24).toString('hex'),
      createdBy: userId!,
    },
  });

  await logAudit({
    action: 'webhook.create',
    entity: 'Webhook',
    entityId: webhook.id,
    after: { url: data.url, events: data.events },
  });
  dispatchWebhooks('webhook.create', { webhookId: webhook.id, url: data.url, events: data.events });

  return webhook;
}

export async function toggleWebhook(id: string, active: boolean) {
  await requireRole("superadmin_only");
  const webhook = await db.webhook.update({
    where: { id },
    data: { active },
  });

  await logAudit({
    action: active ? 'webhook.enable' : 'webhook.disable',
    entity: 'Webhook',
    entityId: id,
  });
  dispatchWebhooks(active ? 'webhook.enable' : 'webhook.disable', { webhookId: id, active });

  return webhook;
}

export async function deleteWebhook(id: string) {
  await requireRole("superadmin_only");
  await db.webhook.delete({ where: { id } });

  await logAudit({
    action: 'webhook.delete',
    entity: 'Webhook',
    entityId: id,
  });
  dispatchWebhooks('webhook.delete', { webhookId: id });
}

export async function testWebhook(id: string) {
  await requireRole("superadmin_only");
  const webhook = await db.webhook.findUnique({ where: { id } });
  if (!webhook) throw new Error('Webhook not found');

  const timestamp = new Date().toISOString();
  const body = JSON.stringify({
    event: 'test',
    timestamp,
    data: { message: 'Test webhook from Kalki Mirror' },
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Kalki-Event': 'test',
    'X-Kalki-Delivery': id,
  };

  if (webhook.secret) {
    const sig = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');
    headers['X-Kalki-Signature'] = `sha256=${sig}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    await db.webhook.update({
      where: { id },
      data: { lastTriggeredAt: new Date(), lastStatus: String(response.status) },
    });

    await logAudit({ action: 'webhook.test', entity: 'Webhook', entityId: id, after: { status: response.status } });
    dispatchWebhooks('webhook.test', { webhookId: id, status: response.status });
    return { status: response.status, ok: response.ok };
  } catch (err) {
    clearTimeout(timeout);
    await db.webhook.update({
      where: { id },
      data: { lastTriggeredAt: new Date(), lastStatus: 'ERR' },
    });
    await logAudit({ action: 'webhook.test.fail', entity: 'Webhook', entityId: id, after: { error: String(err) } });
    throw new Error('Webhook delivery failed');
  }
}