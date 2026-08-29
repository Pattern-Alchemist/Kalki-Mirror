import { getToken } from "next-auth/jwt";
import { tryGetAuthSecret } from "./auth-secret";
import { NextRequest, NextResponse } from "next/server";

/**
 * Verifies the request has a valid JWT.
 * Returns the token payload or null.
 */
export async function authenticateRequest(
  request: NextRequest
) {
  try {
    const token = await getToken({
      req: request,
      secret: tryGetAuthSecret(),
    });
    return token;
  } catch {
    return null;
  }
}

/**
 * Requires authentication. Returns 401 if not logged in.
 */
export async function requireAuth(request: NextRequest) {
  const token = await authenticateRequest(request);
  if (!token) {
    return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }), token: null };
  }
  return { error: null, token };
}

/**
 * Optional auth — returns token or null, never blocks.
 */
export { authenticateRequest as optionalAuth };

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}
