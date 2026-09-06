"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelTuition, reopenTuition, reviewAssignmentWithdrawal } from "@/server/actions/withdrawal";
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
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
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

  function handleCancel() {
    setError(null);
    if (!cancelReason.trim()) {
      setError("A reason is required to cancel.");
      return;
    }
    startTransition(async () => {
      const result = await cancelTuition(tuitionId, cancelReason.trim());
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
                  Back
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
          ) : cancelling ? (
            <div className="flex flex-col gap-2">
              <p className="font-body-sm text-body-sm text-on-surface">
                This closes the tuition out for good — it won&rsquo;t be reachable from Reopen afterward.
              </p>
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="cancelReason">
                Reason
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                className="border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                placeholder="e.g. Family no longer needs a tutor"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCancelling(false);
                    setCancelReason("");
                  }}
                  disabled={pending}
                  className="border border-outline-variant text-on-surface-variant font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-lowest transition-all disabled:opacity-60"
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
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingReopen(true)}
                disabled={pending}
                className="bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
              >
                Reopen Tuition
              </button>
              <button
                type="button"
                onClick={() => setCancelling(true)}
                disabled={pending}
                className="border border-error text-error font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-error-container/20 transition-all disabled:opacity-60"
              >
                Cancel Tuition
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}
