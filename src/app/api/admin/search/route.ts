import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"];

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q") || "";
  if (!q.trim() || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const query = q.trim();

  // A8: Rate limit this API endpoint
  const rateLimitKey = `search:${token.id}`;
  // Simple in-memory rate limit (production: use Redis)
  const searchCounts = (globalThis as Record<string, Record<string, number[]>>).__admin_search_counts ||
    ((globalThis as Record<string, Record<string, number[]>>).__admin_search_counts = {});
  const now = Date.now();
  const windowMs = 60_000;
  if (!searchCounts[rateLimitKey]) searchCounts[rateLimitKey] = [];
  searchCounts[rateLimitKey] = searchCounts[rateLimitKey].filter((t: number) => now - t < windowMs);
  if (searchCounts[rateLimitKey].length >= 20) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }
  searchCounts[rateLimitKey].push(now);

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
    select: { id: true, code: true, active: true, usedCount: true },
    take: 5,
  });
  for (const k of keys) {
    results.push({
      type: "key",
      id: k.id,
      title: k.code,
      subtitle: `${k.active ? 'Active' : 'Inactive'} · ${k.usedCount} uses`,
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