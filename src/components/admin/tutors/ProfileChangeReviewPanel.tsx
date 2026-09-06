"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { catalogLabel, GRADES, QUALIFICATIONS, SUBJECTS } from "@/lib/catalog";
import { reviewProfileChangeRequest } from "@/server/actions/profile-changes";
import type { ChangeRequestView } from "@/server/actions/profile-changes";

const FIELD_LABELS: Record<string, string> = {
  fullName: "Full name",
  phone: "Phone",
  address: "Address",
  highestQualification: "Highest qualification",
  institution: "Institution",
  majorSubject: "Major / subject",
  currentProgram: "Current course / program",
  currentYearOrSemester: "Current year / semester",
  subjects: "Subjects",
  grades: "Grades",
  expectedMonthlyFee: "Expected monthly fee",
  preferredLocality: "Preferred locality",
};

function formatValue(field: string, value: unknown): string {
  if (field === "subjects" && Array.isArray(value)) return value.map((s) => catalogLabel(SUBJECTS, s)).join(", ");
  if (field === "grades" && Array.isArray(value)) return value.map((g) => catalogLabel(GRADES, g)).join(", ");
  if (field === "highestQualification" && typeof value === "string") return catalogLabel(QUALIFICATIONS, value);
  if (field === "expectedMonthlyFee") return `NPR ${value}`;
  return String(value);
}

export function ProfileChangeReviewPanel({ request }: { request: ChangeRequestView }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function handleDecision(decision: "APPROVE" | "REJECT") {
    if (decision === "REJECT" && !rejecting) {
      setRejecting(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await reviewProfileChangeRequest(request.id, decision, reason || undefined);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="bg-tertiary-container/20 border border-tertiary-container rounded-xl p-lg">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
        Pending Profile Change ({request.changeUid})
      </h2>
      <div className="flex flex-col gap-1 mb-4">
        {Object.entries(request.proposedChanges)
          .filter(([, value]) => value !== null && value !== "")
          .map(([field, value]) => (
          <div key={field} className="flex justify-between gap-4 py-1 border-b border-surface-variant last:border-0">
            <span className="font-label-md text-label-md text-on-surface-variant">{FIELD_LABELS[field] ?? field}</span>
            <span className="font-body-sm text-body-sm text-on-surface text-right">{formatValue(field, value)}</span>
          </div>
        ))}
      </div>

      {rejecting && (
        <div className="flex flex-col gap-2 mb-3">
          <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="rejectReason">
            Reason (optional)
          </label>
          <input
            id="rejectReason"
            className="border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      )}

      {error && <p className="font-body-sm text-body-sm text-error mb-2">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleDecision("APPROVE")}
          disabled={pending || rejecting}
          className="bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => handleDecision("REJECT")}
          disabled={pending}
          className="border border-error text-error font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-error-container/30 transition-all disabled:opacity-50"
        >
          {rejecting ? (pending ? "Rejecting..." : "Confirm Reject") : "Reject"}
        </button>
      </div>
    </div>
  );
}
