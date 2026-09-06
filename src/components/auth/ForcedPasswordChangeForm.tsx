"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { changeMyPassword, describeFirebaseAuthError } from "@/lib/auth/client-actions";
import { clearMustChangePasswordFlag } from "@/server/actions/admin-users";
import { PasswordInput } from "@/components/auth/PasswordInput";

const inputClass =
  "border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 w-full";
const labelClass = "font-label-md text-label-md text-on-surface-variant";

/** The forced first-login flow: an admin created with a system-generated temp password must set their own before doing anything else. */
export function ForcedPasswordChangeForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
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
      await clearMustChangePasswordFlag();
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(describeFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="currentPassword">Temporary password</label>
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
      <button
        type="submit"
        disabled={submitting}
        className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {submitting ? "Setting password..." : "Set Password & Continue"}
      </button>
    </form>
  );
}
