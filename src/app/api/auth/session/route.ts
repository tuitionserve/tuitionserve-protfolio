import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/lib/firebase/admin";
import { tutorsCollection, userAccountsCollection } from "@/server/domain/collections";
import { createSessionCookieFromIdToken, SESSION_COOKIE_NAME } from "@/server/auth/session";
import { ensureTutorAccount } from "@/server/auth/provisioning";

const bodySchema = z.object({ idToken: z.string().min(1), fullName: z.string().trim().min(1).optional() });

/**
 * Single sign-in/registration entry point for every role. The client
 * never asserts "I am a tutor" / "I am an admin" — an existing
 * UserAccount's stored role is the source of truth, and the app
 * redirects based on whatever role comes back. No existing account
 * means this must be a first-time tutor self-signup (email/password or
 * Google): Super Admin / Branch Admin accounts are always provisioned
 * out of band via scripts/provision-admin.ts and therefore always
 * already have a UserAccount (PRD AUTH-003 — no public admin
 * registration) — this route can still never create anything but a
 * TUTOR account.
 */
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }
  const { idToken, fullName } = parsed.data;

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 });
  }

  const accountSnap = await userAccountsCollection().doc(decoded.uid).get();

  let role: string;
  let branchId: string | null = null;
  let tutorUid: string | null = null;
  let verificationStatus: string | null = null;

  if (accountSnap.exists) {
    const account = accountSnap.data()!;
    if (account.accountStatus !== "ACTIVE") {
      return NextResponse.json({ error: "ACCOUNT_DISABLED" }, { status: 403 });
    }
    role = account.role;
    branchId = account.branchId;
    // Keep the Firestore copy of the email in sync — it's the source for
    // session.email (see server/auth/session.ts) but the real record of
    // truth is Firebase Auth, e.g. after a self-service email change.
    if (decoded.email && account.email !== decoded.email) {
      await userAccountsCollection().doc(decoded.uid).update({ email: decoded.email });
    }
    if (role === "TUTOR") {
      const tutorSnap = await tutorsCollection().doc(decoded.uid).get();
      tutorUid = tutorSnap.data()?.tutorUid ?? null;
      verificationStatus = tutorSnap.data()?.verificationStatus ?? null;
    }
  } else {
    const session = await ensureTutorAccount({ uid: decoded.uid, email: decoded.email ?? null, fullName });
    role = session.role;
    tutorUid = session.tutor?.tutorUid ?? null;
    verificationStatus = session.tutor?.verificationStatus ?? null;
  }

  const { cookieValue, maxAgeMs } = await createSessionCookieFromIdToken(idToken);
  const response = NextResponse.json({ role, branchId, tutorUid, verificationStatus });
  response.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  });
  return response;
}
