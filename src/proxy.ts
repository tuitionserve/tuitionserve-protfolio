import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "ts_session";

/**
 * Lightweight, presence-only redirect for a snappier UX. This is NOT the
 * authorization boundary — the proxy runs on the Edge runtime, which
 * cannot verify Firebase session cookies (firebase-admin needs Node.js).
 * The real role/branch/suspension checks happen server-side in
 * src/app/tutor/layout.tsx and src/app/admin/layout.tsx via
 * requireActiveTutor()/requireRole() (role-authorization skill: never
 * treat client-side/edge route guards as authorization).
 *
 * A cookie-less visitor deliberately hitting an /admin/* URL gets the
 * same /access-denied treatment requireRole() gives a wrong-role
 * session — see its doc comment for why. This is presence-only (no
 * cookie at all), not a role check, so it can't distinguish "never
 * logged in" from "logged out" — both read the same at the edge, and
 * both are exactly the "shouldn't be poking at admin URLs" case this
 * is for.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
  if (!hasSessionCookie) {
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
    const target = new URL(isAdminRoute ? "/access-denied" : "/login", request.url);
    return NextResponse.redirect(target);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/tutor/:path*", "/admin/:path*"],
};
