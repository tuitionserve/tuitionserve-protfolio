"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestAssignmentWithdrawal } from "@/server/actions/withdrawal";

export function RequestWithdrawalButton({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (!reason.trim()) {
      setError("A reason is required.");
      return;
    }
    startTransition(async () => {
      const result = await requestAssignmentWithdrawal(assignmentId, reason);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (!showForm) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="font-label-md text-label-md text-error border border-error px-4 py-2 rounded-lg hover:bg-error-container/20 transition-all"
        >
          Request Withdrawal
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 border border-outline-variant rounded-lg p-3 bg-surface-container max-w-sm">
      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor={`withdrawal-reason-${assignmentId}`}>
        Reason (required)
      </label>
      <textarea
        id={`withdrawal-reason-${assignmentId}`}
        className="border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setError(null);
          }}
          disabled={pending}
          className="border border-outline-variant text-on-surface-variant font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-lowest transition-all disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="bg-error text-on-error font-label-md text-label-md px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {pending ? "Submitting..." : "Submit Request"}
        </button>
      </div>
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}
