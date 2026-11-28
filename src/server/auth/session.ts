import * as React from "react";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { tutorsCollection, userAccountsCollection } from "@/server/domain/collections";
import type { Role, Tutor, UserAccount } from "@/server/domain/types";

const requestCache: <T extends (...args: never[]) => unknown>(fn: T) => T =
  (React as unknown as { cache?: <T extends (...args: never[]) => unknown>(fn: T) => T }).cache ??
  ((fn) => fn);

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "ts_session";
const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // Firebase session cookie max: 14 days.

/** Verifies a client ID token and mints an httpOnly session cookie value. */
export async function createSessionCookieFromIdToken(idToken: string): Promise<{
  cookieValue: string;
  maxAgeMs: number;
}> {
  // Require a freshly-issued token so a stolen/expired token cannot be used
  // to mint a long-lived session cookie.
  await adminAuth.verifyIdToken(idToken, true);
  const cookieValue = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });
  return { cookieValue, maxAgeMs: SESSION_MAX_AGE_MS };
}

export interface AuthSession {
  uid: string;
  email: string | null;
  /** Admin's display name — always null for TUTOR role (see UserAccount.fullName doc comment). */
  fullName: string | null;
  role: Role;
  branchId: string | null;
  accountStatus: UserAccount["accountStatus"];
  mustChangePassword: boolean;
  tutor: Tutor | null;
}

/**
 * Reads and verifies the session cookie for the current request and loads
 * the corresponding UserAccount (and Tutor record, if applicable) from
 * Firestore. Memoized per-request via React `cache()` so layout + page
 * guards share a single auth verification and Firestore lookup. Returns
 * null when there is no valid session.
 */
export const getCurrentSession = requestCache(async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }

  const accountSnap = await userAccountsCollection().doc(decoded.uid).get();
  if (!accountSnap.exists) return null;
  const account = accountSnap.data()!;

  if (account.accountStatus === "DISABLED") return null;

  let tutor: Tutor | null = null;
  if (account.role === "TUTOR") {
    const tutorSnap = await tutorsCollection().doc(decoded.uid).get();
    tutor = tutorSnap.exists ? tutorSnap.data()! : null;
  }

  return {
    uid: decoded.uid,
    email: account.email,
    fullName: account.fullName,
    role: account.role,
    branchId: account.branchId,
    accountStatus: account.accountStatus,
    mustChangePassword: account.mustChangePassword ?? false,
    tutor,
  };
});
