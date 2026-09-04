"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reopenTuition, reviewAssignmentWithdrawal } from "@/server/actions/withdrawal";
import type { AdminAssignmentView } from "@/server/queries/admin-assignment";

export function AssignmentReviewPanel({
  assignment,
  tuitionId,
}: {
  assignment: AdminAssignmentView;
  tuitionId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirmingReopen, setConfirmingReopen] = useState(false);
  const [pending, startTransition] = useTransition();

  const tutorLabel = assignment.tutorName ? `${assignment.tutorName} (${assignment.tutorUid})` : assignment.tutorUid;

  function handleReview(decision: "APPROVE" | "REJECT") {
    setError(null);
    startTransition(async () => {
      const result = await reviewAssignmentWithdrawal(assignment.id, decision);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleReopen() {
    setError(null);
    startTransition(async () => {
      const result = await reopenTuition(tuitionId);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-4">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">Assignment</h2>

      {assignment.status === "ACTIVE" && !assignment.hasPendingWithdrawal && (
        <p className="font-body-sm text-body-sm text-on-surface">
          Assigned to <span className="font-label-md text-label-md">{tutorLabel}</span>.
        </p>
      )}

      {assignment.status === "ACTIVE" && assignment.hasPendingWithdrawal && (
        <div className="border border-outline-variant rounded-lg p-4 flex flex-col gap-3 bg-surface-container">
          <div>
            <p className="font-label-md text-label-md text-on-surface">Withdrawal request from {tutorLabel}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Reason: {assignment.withdrawalReason || "—"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleReview("REJECT")}
              disabled={pending}
              className="border border-error text-error font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-error-container/20 transition-all disabled:opacity-60"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => handleReview("APPROVE")}
              disabled={pending}
              className="bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
            >
              Approve
            </button>
          </div>
        </div>
      )}

      {assignment.status === "RELEASED" && (
        <div className="border border-outline-variant rounded-lg p-4 flex flex-col gap-3 bg-surface-container">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant">Previous Assignment</p>
            <p className="font-body-sm text-body-sm text-on-surface mt-1">{tutorLabel} — Withdrawn</p>
          </div>

          {confirmingReopen ? (
            <div className="flex flex-col gap-2">
              <p className="font-body-sm text-body-sm text-on-surface">
                This will make the tuition available to new tutor applicants.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmingReopen(false)}
                  disabled={pending}
                  className="border border-outline-variant text-on-surface-variant font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-lowest transition-all disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReopen}
                  disabled={pending}
                  className="bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
                >
                  {pending ? "Reopening..." : "Confirm Reopen"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReopen(true)}
              disabled={pending}
              className="self-start bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
            >
              Reopen Tuition
            </button>
          )}
        </div>
      )}

      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}
