"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyToOpportunity } from "@/server/actions/applications";
import type { TutorVerificationStatus } from "@/server/domain/types";

export function ApplyButton({
  tuitionId,
  tutorStatus,
  alreadyApplied,
}: {
  tuitionId: string;
  tutorStatus: TutorVerificationStatus | null;
  alreadyApplied: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(alreadyApplied);
  const [pending, startTransition] = useTransition();

  if (applied) {
    return (
      <div className="bg-primary-container/10 border border-primary-container rounded-xl p-lg">
        <p className="font-label-md text-label-md text-primary-container">
          You&rsquo;ve applied to this tuition. View it under My Applications.
        </p>
      </div>
    );
  }

  if (tutorStatus !== "APPROVED") {
    return (
      <div className="bg-surface-container border border-surface-variant rounded-xl p-lg">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Only verified tutors can apply. Complete and submit your profile for review to unlock
          applications.
        </p>
      </div>
    );
  }

  function handleApply() {
    setError(null);
    startTransition(async () => {
      const result = await applyToOpportunity(tuitionId);
      if (result.ok) {
        setApplied(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 items-start">
      <button
        type="button"
        onClick={handleApply}
        disabled={pending}
        className="bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {pending ? "Applying..." : "Apply for Tuition"}
      </button>
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}
