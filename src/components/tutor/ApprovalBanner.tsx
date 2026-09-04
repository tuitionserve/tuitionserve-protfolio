"use client";

import { useState, useTransition } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { acknowledgeApprovalBanner } from "@/server/actions/acknowledge-approval-banner";

export function ApprovalBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  return (
    <div className="bg-primary-container/10 border border-primary-container rounded-xl p-4 flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <MaterialIcon name="verified" filled className="text-primary-container" />
        <p className="font-body-sm text-body-sm text-on-surface">
          Your tutor profile has been approved.
        </p>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setDismissed(true);
          startTransition(() => {
            void acknowledgeApprovalBanner();
          });
        }}
        className="font-label-md text-label-md text-primary-container shrink-0"
      >
        Got it
      </button>
    </div>
  );
}
