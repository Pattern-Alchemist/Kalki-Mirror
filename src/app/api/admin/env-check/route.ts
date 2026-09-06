import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";

// Mirrors the settings panel: every name the dashboard may probe for
// presence. Presence-only — values are NEVER returned to the client.
const SAFE_ENVS = [
  // Required (production-critical)
  "NEXTAUTH_SECRET", "NEXTAUTH_URL", "TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN",
  "OPENROUTER_API_KEY", "RESEND_API_KEY",
  // Optional (feature gates)
  "DATABASE_URL", "CLOUDINARY_CLOUD_NAME", "ALLOWED_ADMIN_IPS", "SENTRY_DSN",
  "EMBED_API_KEY",
];

export async function GET(request: NextRequest) {
  const token = await authenticateRequest(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "";
  if (!SAFE_ENVS.includes(name)) return NextResponse.json({ set: false });
  return NextResponse.json({ set: !!process.env[name] });
}
