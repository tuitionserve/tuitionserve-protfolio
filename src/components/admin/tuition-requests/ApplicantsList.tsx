"use client";

import { useState } from "react";
import { catalogLabel, DAYS_OF_WEEK, GRADES, QUALIFICATIONS, SUBJECTS } from "@/lib/catalog";
import { getApplicationCvUrl } from "@/server/actions/applications";
import type { TutorApplicationStatus } from "@/server/domain/types";
import type { AdminApplicantView } from "@/server/queries/admin-applicants";

const STATUS_LABEL: Record<TutorApplicationStatus, string> = {
  APPLIED: "Applied",
  WITHDRAWN: "Withdrawn",
  SELECTED: "Selected",
  REJECTED: "Not Selected",
};

export function ApplicantsList({ applicants }: { applicants: AdminApplicantView[] }) {
  const [cvErrors, setCvErrors] = useState<Record<string, string>>({});
  const [cvLoading, setCvLoading] = useState<string | null>(null);

  async function handleViewCv(applicationId: string) {
    setCvErrors((prev) => ({ ...prev, [applicationId]: "" }));
    setCvLoading(applicationId);
    try {
      const result = await getApplicationCvUrl(applicationId);
      if ("url" in result) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        setCvErrors((prev) => ({ ...prev, [applicationId]: result.error }));
      }
    } finally {
      setCvLoading(null);
    }
  }

  if (applicants.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Applicants</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">No applications yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">
        Applicants ({applicants.length})
      </h2>
      <div className="flex flex-col gap-3">
        {applicants.map((application) => (
          <div key={application.id} className="border border-surface-variant rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-label-md text-label-md text-on-surface">
                  {application.snapshot.fullName ?? "Unnamed tutor"} — {application.snapshot.tutorUid}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {application.snapshot.highestQualification
                    ? catalogLabel(QUALIFICATIONS, application.snapshot.highestQualification)
                    : ""}
                  {application.snapshot.institution ? ` · ${application.snapshot.institution}` : ""}
                </p>
              </div>
              <span className="font-label-md text-label-md px-3 py-1 rounded-full bg-tertiary-container/30 text-on-tertiary-container shrink-0">
                {STATUS_LABEL[application.status]}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Subjects: {application.snapshot.subjects.map((s) => catalogLabel(SUBJECTS, s)).join(", ") || "—"}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Grades: {application.snapshot.grades.map((g) => catalogLabel(GRADES, g)).join(", ") || "—"}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Availability:{" "}
              {application.snapshot.availability
                .map((s) => `${catalogLabel(DAYS_OF_WEEK, s.dayOfWeek)} ${s.startTime}-${s.endTime}`)
                .join("; ") || "—"}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Expected fee: {application.snapshot.expectedMonthlyFee ? `NPR ${application.snapshot.expectedMonthlyFee}` : "—"}
            </p>
            <div>
              <button
                type="button"
                onClick={() => handleViewCv(application.id)}
                disabled={cvLoading === application.id}
                className="border border-secondary text-secondary font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container transition-all disabled:opacity-50"
              >
                {cvLoading === application.id ? "Loading CV..." : "View CV"}
              </button>
              {cvErrors[application.id] && (
                <p className="font-body-sm text-body-sm text-error mt-1">{cvErrors[application.id]}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
