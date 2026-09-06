"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearRejectedTuitions } from "@/server/actions/rejected-cleanup";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function ClearRejectedButton({ branchFilter, disabled }: { branchFilter: string | null; disabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Permanently delete every rejected request currently shown? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await clearRejectedTuitions(branchFilter);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || pending}
        className="inline-flex items-center gap-2 border border-error text-error font-label-md text-label-md rounded-lg px-4 py-2 hover:bg-error-container/20 transition-all disabled:opacity-50"
      >
        <MaterialIcon name="delete_sweep" className="text-lg" />
        {pending ? "Clearing..." : "Clear Rejected"}
      </button>
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}
