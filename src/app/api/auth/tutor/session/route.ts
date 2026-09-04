import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/lib/firebase/admin";
import { createSessionCookieFromIdToken, SESSION_COOKIE_NAME } from "@/server/auth/session";
import { AccountRoleConflictError, ensureTutorAccount } from "@/server/auth/provisioning";

const bodySchema = z.object({ idToken: z.string().min(1) });

/**
 * Tutor sign-in/registration entry point. Verifies the Firebase ID token,
 * provisions a Tutor account on first sign-in (email/password or Google),
 * and mints an httpOnly session cookie. This route can only ever create
 * TUTOR-role accounts — see /api/auth/admin/session for the separate,
 * non-self-service admin path (PRD AUTH-003).
 */
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const { idToken } = parsed.data;

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
  }

  try {
    const session = await ensureTutorAccount({ uid: decoded.uid, email: decoded.email ?? null });
    const { cookieValue, maxAgeMs } = await createSessionCookieFromIdToken(idToken);

    const response = NextResponse.json({
      role: session.role,
      tutorUid: session.tutor?.tutorUid ?? null,
      verificationStatus: session.tutor?.verificationStatus ?? null,
    });
    response.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(maxAgeMs / 1000),
    });
    return response;
  } catch (error) {
    if (error instanceof AccountRoleConflictError) {
      return NextResponse.json({ error: "ROLE_CONFLICT" }, { status: 403 });
    }
    throw error;
  }
}
