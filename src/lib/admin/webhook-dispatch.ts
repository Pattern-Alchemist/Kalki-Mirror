import crypto from 'crypto';
import { db } from '../db';

/** Dispatch webhooks for a given event type */
export async function dispatchWebhooks(event: string, payload: Record<string, unknown>) {
  const webhooks = await db.webhook.findMany({
    where: { active: true },
  });

  for (const wh of webhooks) {
    try {
      const events: string[] = JSON.parse(wh.events);
      if (!events.includes(event) && !events.includes('*')) continue;

      const timestamp = new Date().toISOString();
      const body = JSON.stringify({ event, timestamp, data: payload });

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Kalki-Event': event,
        'X-Kalki-Delivery': wh.id,
      };

      if (wh.secret) {
        const sig = crypto
          .createHmac('sha256', wh.secret)
          .update(body)
          .digest('hex');
        headers['X-Kalki-Signature'] = `sha256=${sig}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      const response = await fetch(wh.url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      await db.webhook.update({
        where: { id: wh.id },
        data: {
          lastTriggeredAt: new Date(),
          lastStatus: String(response.status),
        },
      });
    } catch (err) {
      await db.webhook.update({
        where: { id: wh.id },
        data: {
          lastTriggeredAt: new Date(),
          lastStatus: 'ERR',
        },
      });
    }
  }
}
