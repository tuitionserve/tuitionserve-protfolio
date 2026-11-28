"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOpenTuition } from "@/server/actions/tuition-request-review";

export function CancelOpenTuitionButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCancel() {
    setError(null);
    if (!reason.trim()) {
      setError("A cancellation reason is required.");
      return;
    }
    startTransition(async () => {
      const result = await cancelOpenTuition(requestId, reason);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (!open) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border border-error text-error font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-error-container/20 transition-all"
        >
          Cancel Open Tuition
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-error/40 rounded-xl p-lg flex flex-col gap-3">
      <p className="font-body-sm text-body-sm text-on-surface">
        This closes the open tuition and notifies any pending applicants.
      </p>
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="cancel-open-reason">
          Cancellation reason (required)
        </label>
        <textarea
          id="cancel-open-reason"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Family postponed or no longer needs a tutor"
          className="border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
        />
      </div>
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={pending}
          className="border border-outline-variant text-on-surface-variant font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container transition-all disabled:opacity-60"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={pending}
          className="bg-error text-on-error font-label-md text-label-md px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {pending ? "Cancelling..." : "Confirm Cancel"}
        </button>
      </div>
    </div>
  );
}
