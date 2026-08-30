import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { tryGetAuthSecret } from "@/lib/auth-secret";

// Same resolution as every session-minting route (env var, Vercel fallback
// until G-10 rotation). A missing secret must mean "unauthenticated", never
// a 500 — hence the try-variant.
const AUTH_SECRET = tryGetAuthSecret();

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"];

// A4: Login rate limiting config
const LOGIN_RATE_LIMIT = 10; // per minute
const loginAttempts = new Map<string, { timestamps: number[] }>();

// A3: Session validation cache — avoid calling the validate endpoint on every request
// Cache key: "jti" -> { validUntil: timestamp }
const sessionCache = new Map<string, { validUntil: number }>();
const SESSION_CACHE_TTL_MS = 30_000; // 30 seconds

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

// ── Phase C: geo capture ──────────────────────────────────────────────────
// Vercel's edge injects `x-vercel-ip-country` (ISO-3166 alpha-2) on every
// request. Mirror it into a first-party cookie so (a) the client-side
// attribution layer can stamp `country` into its snapshot and (b) the
// pricing UI can default USD/INR by geography, not locale guesswork.
// Fail-silent by design: no header (local dev, non-Vercel) → no cookie →
// every downstream consumer degrades exactly as before Phase C.
const GEO_COOKIE = 'kr_country';
const GEO_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days — geo can change

function withGeoCookie(request: NextRequest, response: NextResponse): NextResponse {
  if (request.cookies.get(GEO_COOKIE)?.value) return response;
  const country = request.headers.get('x-vercel-ip-country');
  if (!country || !/^[A-Za-z]{2}$/.test(country)) return response;
  response.cookies.set(GEO_COOKIE, country.toUpperCase(), {
    maxAge: GEO_COOKIE_MAX_AGE_S,
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // attribution + pricing read it from document.cookie
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clean up expired session cache entries periodically
  if (Math.random() < 0.01) { // ~1% of requests trigger cleanup
    const now = Date.now();
    for (const [key, val] of sessionCache) {
      if (val.validUntil < now) sessionCache.delete(key);
    }
  }

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
            secret: AUTH_SECRET,
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

          // A3: Validate active session (check not evicted by concurrent limit)
          const jti = token.jti as string | undefined;
          if (jti) {
            const cached = sessionCache.get(jti);
            if (!cached || cached.validUntil < Date.now()) {
              try {
                const clientIP = getClientIP(request);
                const userAgent = request.headers.get('user-agent') || undefined;
                const validateUrl = new URL('/api/auth/session-validate', request.url);
                const validateHeaders: Record<string, string> = {
                  'X-Kalki-JTI': jti,
                  'X-Kalki-User-Id': token.id as string,
                };
                if (userAgent) validateHeaders['X-Kalki-User-Agent'] = userAgent;
                if (clientIP !== 'unknown') validateHeaders['X-Kalki-IP'] = clientIP;

                // CRITICAL: forward the session cookie. The validate route
                // decodes the JWT itself via getToken(), which reads the
                // cookie from the request — fetch() does NOT attach cookies
                // automatically, so without this header every validation
                // returned 401 (no_token) and every admin page redirected
                // to login as "session_evicted".
                const cookieHeader = request.headers.get('cookie');
                if (cookieHeader) validateHeaders['Cookie'] = cookieHeader;

                const validateRes = await fetch(validateUrl.toString(), {
                  headers: validateHeaders,
                });

                if (validateRes.status === 401) {
                  // Session was evicted — redirect to login
                  const loginUrl = new URL('/admin/login', request.url);
                  loginUrl.searchParams.set('callbackUrl', pathname);
                  loginUrl.searchParams.set('error', 'session_evicted');
                  const redirect = NextResponse.redirect(loginUrl);
                  // Clear BOTH cookie spellings — the browser may hold either
                  // depending on which route minted it historically.
                  redirect.cookies.delete('next-auth.session-token');
                  redirect.cookies.delete('__Secure-next-auth.session-token');
                  return redirect;
                }

                // Cache the valid session
                sessionCache.set(jti, { validUntil: Date.now() + SESSION_CACHE_TTL_MS });
              } catch {
                // Fail-open: if the validate endpoint is unreachable, allow the request
              }
            }
          }

          return NextResponse.next();
        })();

    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Referrer-Policy", "no-referrer");
    return withGeoCookie(request, response);
  }

  // ── Tier injection for gated content pages ──
  if (
    pathname.startsWith("/archive/") ||
    pathname.startsWith("/archetypes")
  ) {
    const token = await getToken({
      req: request,
      secret: AUTH_SECRET,
    });

    const userTier = (token?.tier as string) || "prithvi";
    const response = NextResponse.next();
    response.headers.set("x-user-tier", userTier);
    return withGeoCookie(request, response);
  }

  return withGeoCookie(request, NextResponse.next());
}

export const config = {
  // Phase C: matched every dynamic route so the geo cookie lands on the
  // marketing surface (home, consultations, pricing, patterns…), not just
  // admin/gated pages. Static assets, health, auth internals and middleware's
  // own session-validate fetch are excluded — no recursive or wasted work.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/health|api/monitoring-tunnel|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|xml|txt|json|css|js|woff2?)).*)",
  ],
};
