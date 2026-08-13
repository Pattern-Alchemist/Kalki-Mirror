import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin protection ──
  if (pathname.startsWith("/admin")) {
    // Always set noindex header on admin routes (defense-in-depth with robots.ts + meta)
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
            return NextResponse.redirect(new URL("/admin/forbidden", request.url));
          }

          return NextResponse.next();
        })();

    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }

  // ── Tier injection for gated content pages ──
  // Injects x-user-tier header so server components can read
  // the real tier without an extra DB call.
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
