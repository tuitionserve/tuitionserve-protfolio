"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { catalogLabel, DAYS_OF_WEEK, GRADES, QUALIFICATIONS, SUBJECTS } from "@/lib/catalog";
import { getApplicationCvUrl } from "@/server/actions/applications";
import { assignTutor } from "@/server/actions/assignment";
import { startConversationWithTutorUid } from "@/server/actions/messaging";
import type { TutorApplicationStatus } from "@/server/domain/types";
import type { AdminApplicantView } from "@/server/queries/admin-applicants";

const STATUS_LABEL: Record<TutorApplicationStatus, string> = {
  APPLIED: "Applied",
  WITHDRAWN: "Withdrawn",
  SELECTED: "Selected",
  REJECTED: "Not Selected",
};

export function ApplicantsList({
  applicants,
  tuitionId,
  tuitionUid,
  canAssign,
}: {
  applicants: AdminApplicantView[];
  tuitionId: string;
  tuitionUid: string;
  /** Only OPEN tuitions can still be assigned — the caller passes `request.status === "OPEN"`. */
  canAssign: boolean;
}) {
  const router = useRouter();
  const [cvErrors, setCvErrors] = useState<Record<string, string>>({});
  const [cvLoading, setCvLoading] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignPending, startAssignTransition] = useTransition();
  const [messageErrors, setMessageErrors] = useState<Record<string, string>>({});
  const [messageLoading, setMessageLoading] = useState<string | null>(null);

  async function handleMessage(applicationId: string, tutorUid: string) {
    setMessageErrors((prev) => ({ ...prev, [applicationId]: "" }));
    setMessageLoading(applicationId);
    try {
      const result = await startConversationWithTutorUid(tutorUid, tuitionId);
      if (result.ok) {
        router.push(`/admin/messages/${result.conversationId}`);
      } else {
        setMessageErrors((prev) => ({ ...prev, [applicationId]: result.error }));
        setMessageLoading(null);
      }
    } catch {
      setMessageErrors((prev) => ({ ...prev, [applicationId]: "Could not start conversation." }));
      setMessageLoading(null);
    }
  }

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

  function handleAssign(applicationId: string) {
    setAssignError(null);
    startAssignTransition(async () => {
      const result = await assignTutor(tuitionId, applicationId);
      if (result.ok) {
        setConfirmingId(null);
        router.refresh();
      } else {
        setAssignError(result.error);
      }
    });
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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleViewCv(application.id)}
                  disabled={cvLoading === application.id}
                  className="border border-secondary text-secondary font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container transition-all disabled:opacity-50"
                >
                  {cvLoading === application.id ? "Loading CV..." : "View CV"}
                </button>
                <button
                  type="button"
                  onClick={() => handleMessage(application.id, application.snapshot.tutorUid)}
                  disabled={messageLoading === application.id}
                  className="border border-secondary text-secondary font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container transition-all disabled:opacity-50"
                >
                  {messageLoading === application.id ? "Opening..." : "Message"}
                </button>
                {cvErrors[application.id] && (
                  <p className="font-body-sm text-body-sm text-error mt-1 w-full">{cvErrors[application.id]}</p>
                )}
                {messageErrors[application.id] && (
                  <p className="font-body-sm text-body-sm text-error mt-1 w-full">{messageErrors[application.id]}</p>
                )}
              </div>

              {canAssign && application.status === "APPLIED" && (
                <div className="flex flex-col items-end gap-1">
                  {confirmingId === application.id ? (
                    <div className="flex flex-col items-end gap-2 border border-outline-variant rounded-lg p-3 bg-surface-container max-w-[20rem]">
                      <p className="font-body-sm text-body-sm text-on-surface text-right">
                        Assign {application.snapshot.tutorUid} to {tuitionUid}? This closes the opportunity to new
                        applications.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          disabled={assignPending}
                          className="border border-outline-variant text-on-surface-variant font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-lowest transition-all disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssign(application.id)}
                          disabled={assignPending}
                          className="bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
                        >
                          {assignPending ? "Assigning..." : "Assign"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAssignError(null);
                        setConfirmingId(application.id);
                      }}
                      className="bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      Assign
                    </button>
                  )}
                  {assignError && confirmingId === application.id && (
                    <p className="font-body-sm text-body-sm text-error text-right">{assignError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
