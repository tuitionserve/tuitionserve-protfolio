"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { catalogLabel, DAYS_OF_WEEK, GRADES, QUALIFICATIONS, SUBJECTS } from "@/lib/catalog";
import { submitTutorProfileForReview } from "@/server/actions/onboarding";
import { getMissingRequirements } from "../completeness";
import { errorTextClass } from "../formStyles";
import type { WizardProfileState } from "../types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-surface-variant last:border-0">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <span className="font-body-sm text-body-sm text-on-surface text-right">{value || "—"}</span>
    </div>
  );
}

export function ReviewStep({
  profile,
  onBack,
  onJumpToStep,
}: {
  profile: WizardProfileState;
  onBack: () => void;
  onJumpToStep: (index: number) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const missing = getMissingRequirements(profile);
  const isComplete = missing.length === 0;

  function handleSubmit() {
    if (!isComplete) return; // extra guard — the button is already disabled in this state
    setError(null);
    startTransition(async () => {
      const result = await submitTutorProfileForReview();
      if (result.ok) {
        router.push("/tutor/dashboard");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-headline-md text-headline-md text-on-surface">Review & Submit</h2>

      {!isComplete && (
        <div className="bg-error-container/60 border border-error rounded-xl p-lg">
          <p className="font-label-md text-label-md text-on-error-container mb-2">
            Complete these before you can submit:
          </p>
          <ul className="flex flex-col gap-1">
            {missing.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => onJumpToStep(item.stepIndex)}
                  className="font-body-sm text-body-sm text-on-error-container underline hover:opacity-80"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <Row label="Full name" value={profile.fullName ?? ""} />
        <Row label="Phone" value={profile.phone ?? ""} />
        <Row label="Address" value={profile.address ?? ""} />
        <Row label="Profile photo" value={profile.hasPhoto ? "Uploaded" : "Not uploaded"} />
        <Row
          label="Qualification"
          value={profile.highestQualification ? catalogLabel(QUALIFICATIONS, profile.highestQualification) : ""}
        />
        <Row label="Institution" value={profile.institution ?? ""} />
        <Row label="Graduation year (B.S.)" value={profile.graduationYear ? String(profile.graduationYear) : ""} />
        <Row label="Major / subject" value={profile.majorSubject ?? ""} />
        <Row label="Subjects" value={profile.subjects.map((s) => catalogLabel(SUBJECTS, s)).join(", ")} />
        <Row label="Grades" value={profile.grades.map((g) => catalogLabel(GRADES, g)).join(", ")} />
        <Row label="Expected monthly fee" value={profile.expectedMonthlyFee ? `NPR ${profile.expectedMonthlyFee}` : ""} />
        <Row
          label="Preferred location"
          value={[profile.preferredLocationLabel, profile.preferredLocality].filter(Boolean).join(", ")}
        />
        <Row
          label="Availability"
          value={profile.availability
            .map((s) => `${catalogLabel(DAYS_OF_WEEK, s.dayOfWeek)} ${s.startTime}-${s.endTime}`)
            .join("; ")}
        />
        <Row label="CV" value={profile.hasCv ? "Uploaded" : "Not uploaded"} />
      </div>

      {error && <p className={errorTextClass}>{error}</p>}

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="font-label-md text-label-md text-secondary px-6 py-3">
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending || !isComplete}
          title={isComplete ? undefined : "Complete the items listed above first"}
          className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {pending ? "Submitting..." : "Submit for Review"}
        </button>
      </div>
    </div>
  );
}
