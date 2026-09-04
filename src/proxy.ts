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
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/tutor/:path*", "/admin/:path*"],
};
