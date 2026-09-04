"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveTutor, getTutorCvUrl, rejectTutor } from "@/server/actions/tutor-review";

export function TutorReviewActions({ tutorId, hasCv }: { tutorId: string; hasCv: boolean }) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [cvLoading, setCvLoading] = useState(false);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveTutor(tutorId);
      if (result.ok) {
        router.push("/admin/tutors");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleReject() {
    setError(null);
    if (!reason.trim()) {
      setError("A rejection reason is required.");
      return;
    }
    startTransition(async () => {
      const result = await rejectTutor(tutorId, reason);
      if (result.ok) {
        router.push("/admin/tutors");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  async function handleViewCv() {
    setError(null);
    setCvLoading(true);
    try {
      const result = await getTutorCvUrl(tutorId);
      if ("url" in result) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        setError(result.error);
      }
    } finally {
      setCvLoading(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleViewCv}
          disabled={!hasCv || cvLoading}
          className="border border-secondary text-secondary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface-container transition-all disabled:opacity-50"
        >
          {hasCv ? (cvLoading ? "Loading CV..." : "View CV") : "No CV on file"}
        </button>

        <button
          type="button"
          onClick={handleApprove}
          disabled={pending}
          className="bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          Approve
        </button>

        <button
          type="button"
          onClick={() => setShowReject((v) => !v)}
          disabled={pending}
          className="border border-error text-error font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-error-container/20 transition-all disabled:opacity-60"
        >
          Reject
        </button>
      </div>

      {showReject && (
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="reason">
            Rejection reason (required)
          </label>
          <textarea
            id="reason"
            className="border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            type="button"
            onClick={handleReject}
            disabled={pending}
            className="self-end bg-error text-on-error font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
          >
            {pending ? "Submitting..." : "Confirm Rejection"}
          </button>
        </div>
      )}

      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}
