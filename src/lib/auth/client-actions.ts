"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { firebaseAuth, googleAuthProvider } from "@/lib/firebase/client";

export class AuthActionError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "AuthActionError";
  }
}

async function postSession(endpoint: "/api/auth/tutor/session" | "/api/auth/admin/session", idToken: string) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "UNKNOWN" }));
    throw new AuthActionError(body.error ?? "UNKNOWN", describeSessionError(body.error));
  }
  return res.json();
}

function describeSessionError(code: string | undefined): string {
  switch (code) {
    case "NOT_AN_ADMIN_ACCOUNT":
      return "This account is not registered as an administrator.";
    case "ROLE_CONFLICT":
      return "This account is already registered with a different role.";
    case "INVALID_TOKEN":
      return "Your sign-in session could not be verified. Please try again.";
    default:
      return "Something went wrong while signing in. Please try again.";
  }
}

export async function signUpTutorWithEmail(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  const idToken = await credential.user.getIdToken();
  return postSession("/api/auth/tutor/session", idToken);
}

export async function signInTutorWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const idToken = await credential.user.getIdToken();
  return postSession("/api/auth/tutor/session", idToken);
}

export async function signInTutorWithGoogle() {
  const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);
  const idToken = await credential.user.getIdToken();
  return postSession("/api/auth/tutor/session", idToken);
}

export async function signInAdminWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const idToken = await credential.user.getIdToken();
  return postSession("/api/auth/admin/session", idToken);
}

export async function signOutCurrentUser() {
  await fetch("/api/auth/logout", { method: "POST" });
  await firebaseAuth.signOut();
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
    default:
      return error instanceof Error ? error.message : "Something went wrong. Please try again.";
  }
}
