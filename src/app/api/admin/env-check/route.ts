import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";

const SAFE_ENVS = ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "DATABASE_URL", "TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "CLOUDINARY_CLOUD_NAME", "ALLOWED_ADMIN_IPS", "SENTRY_DSN"];

export async function GET(request: NextRequest) {
  const token = await authenticateRequest(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "";
  if (!SAFE_ENVS.includes(name)) return NextResponse.json({ set: false });
  return NextResponse.json({ set: !!process.env[name] });
}
