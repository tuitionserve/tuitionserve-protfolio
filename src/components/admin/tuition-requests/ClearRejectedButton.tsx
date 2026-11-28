"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearRejectedTuitions } from "@/server/actions/rejected-cleanup";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function ClearRejectedButton({ branchFilter, disabled }: { branchFilter: string | null; disabled: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirmClear() {
    setError(null);
    startTransition(async () => {
      const result = await clearRejectedTuitions(branchFilter);
      if (result.ok) {
        setConfirming(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2 border border-error/40 rounded-lg px-3 py-2 bg-error-container/20">
          <span className="font-body-sm text-body-sm text-on-error-container">
            Permanently delete these rejected requests?
          </span>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="border border-outline-variant text-on-surface-variant font-label-md text-label-md rounded-lg px-3 py-1.5 hover:bg-surface-container-lowest transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClear}
            disabled={pending}
            className="bg-error text-on-error font-label-md text-label-md rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {pending ? "Clearing..." : "Confirm Delete"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          disabled={disabled || pending}
          className="inline-flex items-center gap-2 border border-error text-error font-label-md text-label-md rounded-lg px-4 py-2 hover:bg-error-container/20 transition-all disabled:opacity-50"
        >
          <MaterialIcon name="delete_sweep" className="text-lg" />
          Clear Rejected
        </button>
      )}
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}
