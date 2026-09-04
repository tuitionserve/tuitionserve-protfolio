"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reactivateTutor, suspendTutor } from "@/server/actions/suspension";
import type { TutorVerificationStatus } from "@/server/domain/types";

export function TutorSuspensionActions({
  tutorId,
  verificationStatus,
  suspensionReason,
}: {
  tutorId: string;
  verificationStatus: TutorVerificationStatus;
  suspensionReason: string | null;
}) {
  const router = useRouter();
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSuspend() {
    setError(null);
    if (!reason.trim()) {
      setError("A suspension reason is required.");
      return;
    }
    startTransition(async () => {
      const result = await suspendTutor(tutorId, reason);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleReactivate() {
    setError(null);
    startTransition(async () => {
      const result = await reactivateTutor(tutorId);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (verificationStatus === "SUSPENDED") {
    return (
      <div className="bg-error-container/60 border border-error rounded-xl p-lg flex flex-col gap-4">
        <div>
          <p className="font-label-md text-label-md text-on-error-container mb-1">Account suspended</p>
          {suspensionReason && <p className="font-body-sm text-body-sm text-on-error-container">{suspensionReason}</p>}
        </div>
        <button
          type="button"
          onClick={handleReactivate}
          disabled={pending}
          className="self-start bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {pending ? "Reactivating..." : "Reactivate Tutor"}
        </button>
        {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
      </div>
    );
  }

  if (verificationStatus !== "APPROVED") return null; // Only a verified tutor can be suspended.

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-4">
      {!showSuspendForm ? (
        <button
          type="button"
          onClick={() => setShowSuspendForm(true)}
          className="self-start border border-error text-error font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-error-container/20 transition-all"
        >
          Suspend Tutor
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="suspend-reason">
            Suspension reason (required)
          </label>
          <textarea
            id="suspend-reason"
            className="border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2 self-end">
            <button
              type="button"
              onClick={() => setShowSuspendForm(false)}
              disabled={pending}
              className="border border-outline-variant text-on-surface-variant font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container transition-all disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSuspend}
              disabled={pending}
              className="bg-error text-on-error font-label-md text-label-md px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
            >
              {pending ? "Suspending..." : "Confirm Suspension"}
            </button>
          </div>
        </div>
      )}
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}
