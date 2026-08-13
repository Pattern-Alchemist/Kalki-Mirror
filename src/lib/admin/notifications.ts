import { db } from '../db';

/** Push a notification to the DB (call from server actions after events) */
export async function pushNotification(params: {
  title: string;
  body: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  href?: string;
  userId?: string | null; // null = broadcast
}) {
  await db.adminNotification.create({
    data: {
      title: params.title,
      body: params.body,
      type: params.type || 'info',
      href: params.href || null,
      userId: params.userId ?? null,
    },
  });
}

/** Push a broadcast notification to all admins */
export async function broadcastNotification(params: {
  title: string;
  body: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  href?: string;
}) {
  await db.adminNotification.create({
    data: {
      title: params.title,
      body: params.body,
      type: params.type || 'info',
      href: params.href || null,
      userId: null, // null = broadcast
    },
  });
}
