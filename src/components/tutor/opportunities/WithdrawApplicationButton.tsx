"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { withdrawApplication } from "@/server/actions/applications";

export function WithdrawApplicationButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await withdrawApplication(applicationId);
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
        disabled={pending}
        className="font-label-md text-label-md text-error border border-error px-4 py-2 rounded-lg hover:bg-error-container/20 transition-all disabled:opacity-60"
      >
        {pending ? "Withdrawing..." : "Withdraw"}
      </button>
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}
