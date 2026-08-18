import { NextResponse } from "next/server";
import { safeGetToken } from "@/lib/get-token-safe";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await safeGetToken();
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ id: token.id, email: token.email, name: token.name, role: token.role });
}
