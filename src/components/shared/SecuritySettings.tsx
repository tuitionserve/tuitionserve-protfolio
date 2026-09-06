"use client";

import { useEffect, useState, type FormEvent } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { changeMyEmail, changeMyPassword, describeFirebaseAuthError } from "@/lib/auth/client-actions";
import { PasswordInput } from "@/components/auth/PasswordInput";

const inputClass =
  "border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 w-full";
const labelClass = "font-label-md text-label-md text-on-surface-variant";

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await changeMyPassword(currentPassword, newPassword);
      setDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(describeFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h3 className="font-label-lg text-label-lg text-on-surface">Change Password</h3>
      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="currentPassword">Current password</label>
        <PasswordInput
          id="currentPassword"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="newPassword">New password</label>
        <PasswordInput
          id="newPassword"
          required
          autoComplete="new-password"
          value={newPassword}
          onChange={setNewPassword}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="confirmPassword">Confirm new password</label>
        <PasswordInput
          id="confirmPassword"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          className={inputClass}
        />
      </div>
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
      {done && <p className="font-body-sm text-body-sm text-primary-container">Password updated.</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-5 py-2.5 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {submitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}

function ChangeEmailForm({ currentEmail }: { currentEmail: string | null }) {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    setSubmitting(true);
    try {
      await changeMyEmail(currentPassword, newEmail);
      setDone(true);
      setCurrentPassword("");
      setNewEmail("");
    } catch (err) {
      setError(describeFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h3 className="font-label-lg text-label-lg text-on-surface">Change Email</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Current email: <span className="text-on-surface">{currentEmail ?? "—"}</span>
      </p>
      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="newEmail">New email</label>
        <input
          id="newEmail"
          type="email"
          required
          className={inputClass}
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="currentPasswordForEmail">Current password</label>
        <PasswordInput
          id="currentPasswordForEmail"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
          className={inputClass}
        />
      </div>
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
      {done && <p className="font-body-sm text-body-sm text-primary-container">Email updated.</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-5 py-2.5 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {submitting ? "Updating..." : "Update Email"}
      </button>
    </form>
  );
}

/** Shown on every role's profile page — hidden/adjusted for Google-signed-in accounts, which have no password to reauth with. */
export function SecuritySettings({ email }: { email: string | null }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(firebaseAuth, setUser), []);

  if (user === undefined) {
    return <p className="font-body-sm text-body-sm text-on-surface-variant">Loading...</p>;
  }

  const isPasswordAccount = user?.providerData.some((p) => p.providerId === "password") ?? false;

  if (!isPasswordAccount) {
    return (
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        You sign in with Google — manage your email and password from your Google Account.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ChangePasswordForm />
      <div className="h-px bg-surface-variant" />
      <ChangeEmailForm currentEmail={email} />
    </div>
  );
}
