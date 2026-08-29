import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { tryGetAuthSecret } from "@/lib/auth-secret";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"];

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: tryGetAuthSecret(),
  });

  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q") || "";
  if (!q.trim() || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const query = q.trim();

  // Rate limit: 20 req/min per admin user
  const { limited } = await rateLimit({ key: `admin:search:${token.id}`, max: 20, window: 60, prefix: 'admin' });
  if (limited) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const results: { type: string; id: string; title: string; subtitle: string; href: string }[] = [];

  // Search members (limit 5)
  const members = await db.user.findMany({
    where: {
      OR: [
        { email: { contains: query } },
        { name: { contains: query } },
        { id: { contains: query } },
      ],
    },
    select: { id: true, email: true, name: true, tier: true, role: true },
    take: 5,
  });
  for (const m of members) {
    results.push({
      type: "member",
      id: m.id,
      title: m.name || m.email,
      subtitle: `${m.email} · ${m.role} · ${m.tier}`,
      href: `/admin/members/${m.id}`,
    });
  }

  // Search keys (limit 5)
  const keys = await db.inviteCode.findMany({
    where: {
      OR: [
        { code: { contains: query } },
        { createdBy: { contains: query } },
      ],
    },
    select: { id: true, code: true, active: true, usesUsed: true },
    take: 5,
  });
  for (const k of keys) {
    results.push({
      type: "key",
      id: k.id,
      title: k.code,
      subtitle: `${k.active ? 'Active' : 'Inactive'} · ${k.usesUsed} uses`,
      href: `/admin/keys`,
    });
  }

  // Search consultations (limit 5)
  const consultations = await db.consultation.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
        { id: { contains: query } },
      ],
    },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
    take: 5,
  });
  for (const c of consultations) {
    results.push({
      type: "consultation",
      id: c.id,
      title: c.name || c.email,
      subtitle: `${c.status} · ${c.createdAt.toLocaleDateString()}`,
      href: `/admin/consultations`,
    });
  }

  return NextResponse.json({ results });
}