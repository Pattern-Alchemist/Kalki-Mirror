import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/admin/audit";
import { rateLimit } from "@/lib/admin/rate-limit";
import { verifyActionToken, DELETE_ACTION } from "@/lib/privacy";

/* =============================================================
   POST /api/user/delete — DPDP right-to-erasure (Vol.3 #12)
   Triple-gated: (1) authenticated session, (2) signed, expiring,
   user-bound action token minted by issueDeletionToken() ≤15min
   earlier, (3) typed-email confirmation on the client.
   Rate-limited (3/hour/user), audit-logged BEFORE the delete —
   AdminAuditLog.actorId is a plain column (no FK), so the audit
   trail outlives the deleted account.

   Retention policy inside the transaction:
   - DELETED: user row (cascades streaks, resolutions, active
     sessions, notifications), practice sessions, generated
     invite codes, email subscriber + email events.
   - DETACHED (retained ledger): memberships (FK SetNull),
     consultations (business/financial record → userId nulled).
   ============================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user
    ? (session.user as unknown as { id?: string }).id
    : undefined;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const rl = rateLimit(`privacy-delete:${userId}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many deletion attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: { token?: unknown; confirmEmail?: unknown };
  try {
    body = (await req.json()) as { token?: unknown; confirmEmail?: unknown };
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!verifyActionToken(body.token, DELETE_ACTION, userId)) {
    return NextResponse.json(
      { error: "Deletion token is invalid or expired. Start the flow again." },
      { status: 403 }
    );
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const typed =
      typeof body.confirmEmail === "string" ? body.confirmEmail.trim().toLowerCase() : "";
    if (typed !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email confirmation does not match this account." },
        { status: 400 }
      );
    }

    await logAudit({
      action: "profile.account.delete",
      entity: "User",
      entityId: userId,
      after: { email: user.email, reason: "self-service erasure (DPDP)" },
    });

    await db.$transaction([
      // No FK to User on these — handle explicitly.
      db.practiceSession.deleteMany({ where: { userId } }),
      db.inviteCode.deleteMany({ where: { createdBy: userId } }),
      db.consultation.updateMany({ where: { userId }, data: { userId: null } }),
      db.emailEvent.deleteMany({ where: { email: user.email } }),
      db.emailSubscriber.deleteMany({ where: { email: user.email } }),
      // The user row itself: cascades streaks, resolutions,
      // activeSessions, notifications; memberships SetNull.
      db.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Account dissolved. The ledger remembers the work; the record does not remember you.",
    });
  } catch (err) {
    console.error("[KALKI] user/delete error:", err);
    return NextResponse.json(
      { error: "Deletion failed. Please try again." },
      { status: 500 }
    );
  }
}
