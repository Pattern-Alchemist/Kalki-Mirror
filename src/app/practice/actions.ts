"use server";

import { db } from "@/lib/db";

/* ══════════════════════════════════════════════════════════════
   PRACTICE SESSION ACTIONS — The Practice Floor
   Server actions for logging, retrieving, and computing
   sadhana practice session data.
   ══════════════════════════════════════════════════════════════ */

// ── Type exports for client consumption ────────────────────────

export interface SessionPayload {
  siddhiSlug: string;
  siddhiName: string;
  durationMin: number;
  journal?: string;
  moodBefore?: number;
  moodAfter?: number;
}

export interface SessionRecord {
  id: string;
  siddhiSlug: string;
  siddhiName: string;
  durationMin: number;
  journal: string | null;
  moodBefore: number | null;
  moodAfter: number | null;
  createdAt: Date;
}

export interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  topPractice: string | null;
}

// ── LOG SESSION ───────────────────────────────────────────────

export async function logSession(data: SessionPayload): Promise<{
  success: boolean;
  error?: string;
  session?: SessionRecord;
}> {
  try {
    const session = await db.practiceSession.create({
      data: {
        userId: "anonymous",
        siddhiSlug: data.siddhiSlug,
        siddhiName: data.siddhiName,
        durationMin: data.durationMin,
        journal: data.journal?.trim() || null,
        moodBefore:
          data.moodBefore != null && data.moodBefore >= 1 && data.moodBefore <= 5
            ? data.moodBefore
            : null,
        moodAfter:
          data.moodAfter != null && data.moodAfter >= 1 && data.moodAfter <= 5
            ? data.moodAfter
            : null,
      },
    });

    return {
      success: true,
      session: {
        id: session.id,
        siddhiSlug: session.siddhiSlug,
        siddhiName: session.siddhiName,
        durationMin: session.durationMin,
        journal: session.journal,
        moodBefore: session.moodBefore,
        moodAfter: session.moodAfter,
        createdAt: session.createdAt,
      },
    };
  } catch (err) {
    console.error("[KALKI] logSession error:", err);
    return { success: false, error: "Failed to log session. Please try again." };
  }
}

// ── GET SESSIONS (for heatmap + recent list) ──────────────────

export async function getSessions(days: number = 90): Promise<SessionRecord[]> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sessions = await db.practiceSession.findMany({
      where: {
        userId: "anonymous",
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
    });

    return sessions.map((s) => ({
      id: s.id,
      siddhiSlug: s.siddhiSlug,
      siddhiName: s.siddhiName,
      durationMin: s.durationMin,
      journal: s.journal,
      moodBefore: s.moodBefore,
      moodAfter: s.moodAfter,
      createdAt: s.createdAt,
    }));
  } catch (err) {
    console.error("[KALKI] getSessions error:", err);
    return [];
  }
}

// ── GET SESSION STATS ────────────────────────────────────────

export async function getSessionStats(): Promise<SessionStats> {
  try {
    const allSessions = await db.practiceSession.findMany({
      where: { userId: "anonymous" },
      orderBy: { createdAt: "asc" },
    });

    const totalSessions = allSessions.length;
    const totalMinutes = allSessions.reduce((sum, s) => sum + s.durationMin, 0);

    // ── Streak computation ──
    const uniqueDays = new Set<string>();
    allSessions.forEach((s) => {
      const d = new Date(s.createdAt);
      uniqueDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });

    const sortedDays = Array.from(uniqueDays)
      .map((key) => {
        const [y, m, d] = key.split("-").map(Number);
        return new Date(y, m, d);
      })
      .sort((a, b) => b.getTime() - a.getTime());

    // Current streak: consecutive days ending at today or yesterday
    let currentStreak = 0;
    if (sortedDays.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const mostRecent = new Date(sortedDays[0]);
      mostRecent.setHours(0, 0, 0, 0);

      if (
        mostRecent.getTime() === today.getTime() ||
        mostRecent.getTime() === yesterday.getTime()
      ) {
        currentStreak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
          const prev = new Date(sortedDays[i - 1]);
          const curr = new Date(sortedDays[i]);
          prev.setHours(0, 0, 0, 0);
          curr.setHours(0, 0, 0, 0);
          const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      prev.setHours(0, 0, 0, 0);
      curr.setHours(0, 0, 0, 0);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    if (sortedDays.length === 1) longestStreak = 1;

    // Top practice
    const practiceCount = new Map<string, number>();
    allSessions.forEach((s) => {
      practiceCount.set(
        s.siddhiName,
        (practiceCount.get(s.siddhiName) || 0) + 1
      );
    });
    let topPractice: string | null = null;
    let maxCount = 0;
    practiceCount.forEach((count, name) => {
      if (count > maxCount) {
        maxCount = count;
        topPractice = name;
      }
    });

    return {
      totalSessions,
      totalMinutes,
      currentStreak,
      longestStreak,
      topPractice,
    };
  } catch (err) {
    console.error("[KALKI] getSessionStats error:", err);
    return {
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      topPractice: null,
    };
  }
}
