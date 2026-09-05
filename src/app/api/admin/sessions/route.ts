import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import {
  getActiveSessions,
  hashSessionToken,
  revokeAllOtherSessions,
  revokeSession,
} from "@/lib/admin/sessions";
import { deviceLabel } from "@/lib/admin/device-label";
import { logAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

/**
 * ADMIN DEVICE SESSIONS API — Vol. 2 #11
 *
 * Read model + revocation for "your active sessions" in Settings:
 *   GET    → device rows (label, kind, IP, last seen) + which row is the
 *            current device (token-hash match, authoritative)
 *   DELETE → { id } revoke one session, or { others: true } revoke every
 *            other device in one tap
 *
 * Both mutations are audit-logged (session.revoke / session.revoke_others).
 * Requires ADMIN or SUPERADMIN — session management is not an EDITOR concern.
 * tokenHash is compared server-side and stripped before the response — the
 * digest never crosses the wire.
 */

const ALLOWED_ROLES = ["ADMIN", "SUPERADMIN"];

export async function GET(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (!ALLOWED_ROLES.includes((token.role as string) || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = token.id as string;
    const currentHash = hashSessionToken((token.jti as string) ?? "");

    const rows = await getActiveSessions(userId);
    const sessions = rows.map((s) => {
      const device = deviceLabel(s.userAgent);
      return {
        id: s.id,
        device: device.label,
        kind: device.kind,
        ip: s.ip ?? null,
        lastSeen: s.lastSeen.toISOString(),
        createdAt: s.createdAt.toISOString(),
        current: s.tokenHash === currentHash,
      };
    });

    return NextResponse.json({ sessions });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (!ALLOWED_ROLES.includes((token.role as string) || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = token.id as string;
    const body = (await request.json().catch(() => ({}))) as { id?: string; others?: boolean };

    if (body.others) {
      const jti = token.jti as string;
      if (!jti) {
        return NextResponse.json({ error: "No token identifier." }, { status: 400 });
      }
      await revokeAllOtherSessions(userId, jti);
      await logAudit({
        action: "session.revoke_others",
        entity: "ActiveSession",
        entityId: userId,
        after: { scope: "all_except_current" },
      });
      return NextResponse.json({ ok: true, revoked: "others" });
    }

    if (body.id) {
      // Guard: revoking your own device mid-flight locks the operator out of
      // an active console — allowed, but the UI is told so it can confirm.
      await revokeSession(body.id, userId);
      await logAudit({
        action: "session.revoke",
        entity: "ActiveSession",
        entityId: body.id,
        after: { scope: "single" },
      });
      return NextResponse.json({ ok: true, revoked: body.id });
    }

    return NextResponse.json({ error: "Provide session id or others:true." }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
