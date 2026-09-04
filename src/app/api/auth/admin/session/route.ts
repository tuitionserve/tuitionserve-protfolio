import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/lib/firebase/admin";
import { userAccountsCollection } from "@/server/domain/collections";
import { createSessionCookieFromIdToken, SESSION_COOKIE_NAME } from "@/server/auth/session";

const bodySchema = z.object({ idToken: z.string().min(1) });

/**
 * Admin sign-in entry point. Unlike the tutor route, this NEVER creates a
 * UserAccount — Super Admin and Branch Admin accounts only exist if they
 * were provisioned out of band (scripts/provision-admin.ts). A Firebase
 * Auth identity with no matching admin UserAccount, or one whose role is
 * TUTOR, is rejected (PRD AUTH-003 — no public admin registration).
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

  const accountSnap = await userAccountsCollection().doc(decoded.uid).get();
  const account = accountSnap.exists ? accountSnap.data()! : null;

  if (!account || account.role === "TUTOR" || account.accountStatus !== "ACTIVE") {
    return NextResponse.json({ error: "NOT_AN_ADMIN_ACCOUNT" }, { status: 403 });
  }

  const { cookieValue, maxAgeMs } = await createSessionCookieFromIdToken(idToken);
  const response = NextResponse.json({ role: account.role, branchId: account.branchId });
  response.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  });
  return response;
}
