"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAdminAccountStatus } from "@/server/actions/admin-users";

export function AdminAccountStatusToggle({ userId, accountStatus }: { userId: string; accountStatus: "ACTIVE" | "DISABLED" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    const next = accountStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    startTransition(async () => {
      const result = await setAdminAccountStatus(userId, next);
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
        className={`font-label-md text-label-md px-4 py-2 rounded-lg transition-all disabled:opacity-50 ${
          accountStatus === "ACTIVE"
            ? "border border-error text-error hover:bg-error-container/30"
            : "bg-primary-container text-on-primary shadow-sm hover:shadow-md"
        }`}
      >
        {pending ? "Working..." : accountStatus === "ACTIVE" ? "Disable" : "Enable"}
      </button>
      {error && <p className="font-body-sm text-body-sm text-error text-right max-w-[16rem]">{error}</p>}
    </div>
  );
}
