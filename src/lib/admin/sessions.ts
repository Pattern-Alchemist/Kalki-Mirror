import { db } from '../db';
import crypto from 'crypto';

const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12h, matches JWT maxAge
const MAX_CONCURRENT_SESSIONS = 3;

/** Hash a token identifier for storage */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex').slice(0, 32);
}

/** Create or update an active session after successful login */
export async function trackSession(userId: string, tokenJti: string, ip?: string, userAgent?: string) {
  const tokenHash = hashToken(tokenJti);

  // Clean up expired sessions for this user
  const cutoff = new Date(Date.now() - SESSION_MAX_AGE_MS);
  await db.activeSession.deleteMany({
    where: { userId, createdAt: { lt: cutoff } },
  });

  // Check concurrent session count
  const activeCount = await db.activeSession.count({
    where: { userId },
  });

  if (activeCount >= MAX_CONCURRENT_SESSIONS) {
    // Remove the oldest session
    const oldest = await db.activeSession.findFirst({
      where: { userId },
      orderBy: { lastSeen: 'asc' },
    });
    if (oldest) {
      await db.activeSession.delete({ where: { id: oldest.id } });
    }
  }

  // Upsert: update lastSeen if session exists, create if not
  const existing = await db.activeSession.findFirst({
    where: { userId, tokenHash },
  });

  if (existing) {
    await db.activeSession.update({
      where: { id: existing.id },
      data: { lastSeen: new Date(), ip, userAgent },
    });
  } else {
    await db.activeSession.create({
      data: { userId, tokenHash, ip, userAgent },
    });
  }
}

/** Check if a session token is still valid (not evicted) */
export async function isSessionValid(userId: string, tokenJti: string): Promise<boolean> {
  const tokenHash = hashToken(tokenJti);
  const session = await db.activeSession.findFirst({
    where: { userId, tokenHash },
  });
  if (!session) return false;

  // Check if expired
  const cutoff = new Date(Date.now() - SESSION_MAX_AGE_MS);
  if (session.createdAt < cutoff) {
    await db.activeSession.delete({ where: { id: session.id } });
    return false;
  }

  // Update lastSeen
  await db.activeSession.update({
    where: { id: session.id },
    data: { lastSeen: new Date() },
  });

  return true;
}

/** Get all active sessions for a user */
export async function getActiveSessions(userId: string) {
  const cutoff = new Date(Date.now() - SESSION_MAX_AGE_MS);
  return db.activeSession.findMany({
    where: { userId, createdAt: { gte: cutoff } },
    orderBy: { lastSeen: 'desc' },
    select: {
      id: true,
      ip: true,
      userAgent: true,
      lastSeen: true,
      createdAt: true,
    },
  });
}

/** Revoke a specific session */
export async function revokeSession(sessionId: string, userId: string) {
  await db.activeSession.deleteMany({
    where: { id: sessionId, userId },
  });
}

/** Revoke all sessions except the current one */
export async function revokeAllOtherSessions(userId: string, currentTokenJti: string) {
  const currentHash = hashToken(currentTokenJti);
  await db.activeSession.deleteMany({
    where: {
      userId,
      tokenHash: { not: currentHash },
    },
  });
}
