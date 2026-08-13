import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"];

// A4: Login rate limiting config
const LOGIN_RATE_LIMIT = 10; // per minute
const loginAttempts = new Map<string, { timestamps: number[] }>();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  let entry = loginAttempts.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    loginAttempts.set(ip, entry);
  }
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);
  if (entry.timestamps.length >= LOGIN_RATE_LIMIT) return false;
  entry.timestamps.push(now);
  return true;
}

// A2: IP allowlist (inline to avoid module-level side effects in edge runtime)
function isIPAllowed(ip: string): boolean {
  const raw = process.env.ALLOWED_ADMIN_IPS;
  if (!raw || raw.trim() === '') return true;
  const allowed = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.length === 0) return true;
  if (allowed.includes(ip)) return true;
  // Basic CIDR /32 (exact) and /24 matching
  for (const pattern of allowed) {
    if (pattern === ip) return true;
    if (pattern.includes('/')) {
      const [range, bits] = pattern.split('/');
      const mask = parseInt(bits, 10);
      if (mask === 0) return true;
      if (mask === 32 && range === ip) return true;
      if (mask === 24) {
        const prefix = range.split('.').slice(0, 3).join('.');
        if (ip.startsWith(prefix + '.')) return true;
      }
    }
  }
  return false;
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin protection ──
  if (pathname.startsWith("/admin")) {
    const clientIP = getClientIP(request);

    // A2: IP allowlist check (skip for login page to avoid lockout)
    if (!pathname.startsWith("/admin/login") && !isIPAllowed(clientIP)) {
      return new NextResponse('Access denied: IP not authorized', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          'X-Robots-Tag': 'noindex, nofollow',
          'Referrer-Policy': 'no-referrer',
        },
      });
    }

    // A4: Rate limit login attempts by IP at middleware level
    if (pathname === "/admin/login" && request.method === "POST") {
      if (!checkLoginRateLimit(clientIP)) {
        const retryAfter = 60;
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Content-Type': 'text/plain',
            'Retry-After': String(retryAfter),
            'X-Robots-Tag': 'noindex, nofollow',
            'Referrer-Policy': 'no-referrer',
          },
        });
      }
    }

    // Always set noindex header on admin routes (defense-in-depth)
    const response = pathname.startsWith("/admin/login")
      ? NextResponse.next()
      : await (async () => {
          const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
          });

          if (!token) {
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
          }

          if (!ADMIN_ROLES.includes(token.role as string)) {
            // A4 fix: 403 via rewrite instead of 307 redirect
            const forbiddenUrl = new URL(request.url);
            forbiddenUrl.pathname = "/admin/forbidden";
            return NextResponse.rewrite(forbiddenUrl, {
              status: 403,
              headers: {
                "X-Robots-Tag": "noindex, nofollow",
                "Referrer-Policy": "no-referrer",
              },
            });
          }

          return NextResponse.next();
        })();

    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }

  // ── Tier injection for gated content pages ──
  if (
    pathname.startsWith("/archive/") ||
    pathname.startsWith("/archetypes")
  ) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const userTier = (token?.tier as string) || "prithvi";
    const response = NextResponse.next();
    response.headers.set("x-user-tier", userTier);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/archive/:path*",
    "/archetypes",
  ],
};
