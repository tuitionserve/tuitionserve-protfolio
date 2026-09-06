"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  describeFirebaseAuthError,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/auth/client-actions";
import { GoogleLogo } from "@/components/auth/GoogleLogo";
import { PasswordInput } from "@/components/auth/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // The server looks up the account's actual role — we never assert
  // "I'm a tutor" or "I'm an admin" here, we just redirect wherever the
  // response says to.
  function redirectForRole(role: string) {
    router.push(role === "TUTOR" ? "/tutor/dashboard" : "/admin/dashboard");
    router.refresh();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { role } = await signInWithEmail(email, password);
      redirectForRole(role);
    } catch (err) {
      setError(describeFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch (err) {
      setError(describeFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setSubmitting(true);
    try {
      const { role } = await signInWithGoogle();
      redirectForRole(role);
    } catch (err) {
      setError(describeFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="w-full px-margin-mobile md:px-margin-desktop py-4">
        <Link href="/" className="inline-flex items-center">
          <Image src="/images/logo.svg" alt="Tuition Serve" width={128} height={32} className="h-8 w-auto" priority />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-margin-mobile py-xl">
        <div className="w-full max-w-[28rem] bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm p-lg">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-6">
            {resetMode ? "Reset Password" : "Log In"}
          </h1>

          {resetMode ? (
            resetSent ? (
              <div className="flex flex-col gap-4">
                <p className="font-body-sm text-body-sm text-on-surface">
                  If an account exists for <span className="font-medium">{email}</span>, a password reset link has
                  been sent. Check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setResetSent(false);
                    setError(null);
                  }}
                  className="self-start font-label-md text-label-md text-primary"
                >
                  Back to Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Enter your account email and we&rsquo;ll send you a link to reset your password.
                </p>
                <div className="flex flex-col gap-2">
                  <label htmlFor="resetEmail" className="font-label-md text-label-md text-on-surface-variant">
                    Email
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                  />
                </div>

                {error && (
                  <p role="alert" className="font-body-sm text-body-sm text-error">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setError(null);
                  }}
                  className="self-center font-label-md text-label-md text-secondary"
                >
                  Back to Log In
                </button>
              </form>
            )
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-label-md text-label-md text-on-surface-variant">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="font-label-md text-label-md text-on-surface-variant">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetMode(true);
                        setError(null);
                      }}
                      className="font-label-md text-label-md text-primary"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <PasswordInput
                    id="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={setPassword}
                    className="w-full border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                  />
                </div>

                {error && (
                  <p role="alert" className="font-body-sm text-body-sm text-error">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
                >
                  {submitting ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-surface-variant" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">or</span>
                <div className="flex-1 h-px bg-surface-variant" />
              </div>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 border border-secondary text-secondary font-label-md text-label-md rounded-lg py-3 hover:bg-surface-container transition-all disabled:opacity-60"
              >
                <GoogleLogo className="w-[18px] h-[18px] shrink-0" />
                Continue with Google
              </button>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-6 text-center">
                New tutor?{" "}
                <Link href="/register" className="text-primary font-medium">
                  Create an account
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
