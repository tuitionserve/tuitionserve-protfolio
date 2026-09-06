"use client";

import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { firebaseAuth, googleAuthProvider } from "@/lib/firebase/client";

export class AuthActionError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "AuthActionError";
  }
}

async function postSession(idToken: string, fullName?: string) {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, fullName }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "UNKNOWN" }));
    throw new AuthActionError(body.error ?? "UNKNOWN", describeSessionError(body.error));
  }
  return res.json();
}

function describeSessionError(code: string | undefined): string {
  switch (code) {
    case "ACCOUNT_DISABLED":
      return "This account has been disabled. Contact an administrator.";
    case "ROLE_CONFLICT":
      return "This account is already registered with a different role.";
    case "INVALID_TOKEN":
      return "Your sign-in session could not be verified. Please try again.";
    default:
      return "Something went wrong while signing in. Please try again.";
  }
}

// signUpTutorWithEmail is for the /register page (always a brand-new
// Firebase Auth identity, so the unified endpoint always resolves it to
// a first-time Tutor signup). signInWithEmail/signInWithGoogle are the
// single entry points for /login — the caller never asserts a role;
// the response's `role` field says where to redirect.
export async function signUpTutorWithEmail(email: string, password: string, fullName: string) {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  const idToken = await credential.user.getIdToken();
  return postSession(idToken, fullName);
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const idToken = await credential.user.getIdToken();
  return postSession(idToken);
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);
  const idToken = await credential.user.getIdToken();
  // Google already knows the user's real name — pass it through so a
  // first-time Google sign-in gets the same pre-filled name as email
  // registration, instead of showing their email until they onboard.
  return postSession(idToken, credential.user.displayName ?? undefined);
}

export async function signOutCurrentUser() {
  await fetch("/api/auth/logout", { method: "POST" });
  await firebaseAuth.signOut();
}

export async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(firebaseAuth, email);
}

async function reauthenticateCurrentUser(currentPassword: string) {
  const user = firebaseAuth.currentUser;
  if (!user || !user.email) {
    throw new AuthActionError("NO_USER", "You must be signed in to do this.");
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return user;
}

// Changing a password revokes the account's existing refresh tokens on
// Firebase's side — our own session cookie is verified with
// checkRevoked: true (server/auth/session.ts), so without re-minting it
// here the very next server request after this call would bounce the
// user straight to /login, right after they just changed their own
// password. Same fix as changeMyEmail below, same reason.
export async function changeMyPassword(currentPassword: string, newPassword: string) {
  const user = await reauthenticateCurrentUser(currentPassword);
  await updatePassword(user, newPassword);
  const idToken = await user.getIdToken(true);
  await postSession(idToken);
}

// Firebase Auth requires a fresh credential for security-sensitive changes,
// so we reuse the same reauth as changeMyPassword. Our own UserAccount
// Firestore doc keeps a copy of the email for display/lookup — postSession
// (also called on every login) is what keeps that copy in sync, so we
// call it again here right after the Auth-side email actually changes.
export async function changeMyEmail(currentPassword: string, newEmail: string) {
  const user = await reauthenticateCurrentUser(currentPassword);
  await updateEmail(user, newEmail);
  const idToken = await user.getIdToken(true);
  await postSession(idToken);
}

/** Maps common Firebase Auth error codes to user-facing messages. */
export function describeFirebaseAuthError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/requires-recent-login":
      return "For security, please sign out and sign in again before retrying this.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "NO_USER":
      return "You must be signed in to do this.";
    default:
      return error instanceof Error ? error.message : "Something went wrong. Please try again.";
  }
}
