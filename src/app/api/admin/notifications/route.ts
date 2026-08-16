import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'EDITOR', 'REVIEWER'];

/** GET /api/admin/notifications — Fetch notifications for current user */
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userId = token.id as string;
  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since');

  const where: any = {
    OR: [
      { userId },
      { userId: null }, // broadcasts
    ],
  };

  if (since) {
    where.createdAt = { gt: new Date(since) };
  }

  const notifications = await db.adminNotification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const unreadCount = await db.adminNotification.count({
    where: {
      OR: [{ userId }, { userId: null }],
      read: false,
    },
  });

  return NextResponse.json({ notifications, unreadCount });
}

/** POST /api/admin/notifications — Create a notification */
export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { title, body: notifBody, type, href, broadcast } = body;

  if (!title || !notifBody) {
    return NextResponse.json({ error: 'Missing title or body' }, { status: 400 });
  }

  const notification = await db.adminNotification.create({
    data: {
      title,
      body: notifBody,
      type: type || 'info',
      href: href || null,
      userId: broadcast ? null : (token.id as string),
    },
  });

  return NextResponse.json({ notification }, { status: 201 });
}

/** PATCH /api/admin/notifications — Mark as read */
export async function PATCH(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { id, markAll } = body;

  if (markAll) {
    await db.adminNotification.updateMany({
      where: {
        OR: [{ userId: token.id as string }, { userId: null }],
        read: false,
      },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  }

  if (id) {
    await db.adminNotification.update({
      where: { id },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Missing id or markAll' }, { status: 400 });
}
