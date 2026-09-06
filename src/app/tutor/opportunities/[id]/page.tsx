import { notFound } from "next/navigation";
import { requireActiveTutor } from "@/server/auth/guards";
import { getOpportunityForTutor } from "@/server/queries/opportunities";
import { catalogLabel, DAYS_OF_WEEK, GRADES, SUBJECTS } from "@/lib/catalog";
import { ApplyButton } from "@/components/tutor/opportunities/ApplyButton";
import { tutorApplicationsCollection } from "@/server/domain/collections";
import { BackButton } from "@/components/shared/BackButton";

const GENDER_PREFERENCE_LABEL: Record<string, string> = {
  MALE: "Male tutor",
  FEMALE: "Female tutor",
  ANY: "No preference",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-surface-variant last:border-0">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <span className="font-body-sm text-body-sm text-on-surface text-right">{value || "—"}</span>
    </div>
  );
}

export default async function TutorOpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireActiveTutor();

  const opportunity = await getOpportunityForTutor(id, session.uid);
  if (!opportunity) notFound();
  const isOpen = opportunity.status === "OPEN";

  const existingApplicationSnap = await tutorApplicationsCollection()
    .where("tuitionId", "==", id)
    .where("tutorId", "==", session.uid)
    .where("status", "==", "APPLIED")
    .limit(1)
    .get();
  const existingApplication = existingApplicationSnap.empty ? null : existingApplicationSnap.docs[0]!.data();
  const isAssignedToMe = opportunity.status === "ASSIGNED" && opportunity.exactAddress !== null;

  const isSchool = opportunity.postingType === "SCHOOL";

  return (
    <div className="max-w-2xl flex flex-col gap-lg">
      <BackButton />
      <div>
        <span
          className={`inline-block font-label-md text-[11px] px-2 py-0.5 rounded-full mb-2 ${
            isSchool ? "bg-tertiary-container/40 text-on-tertiary-container" : "bg-secondary-container/50 text-on-secondary-container"
          }`}
        >
          {isSchool ? "School" : "Home Tuition"}
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          {catalogLabel(GRADES, opportunity.gradeId)}{" "}
          {opportunity.subjectIds.map((s) => catalogLabel(SUBJECTS, s)).join(", ")}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{opportunity.tuitionUid}</p>
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        {isSchool && <Row label="School" value={opportunity.institutionName ?? ""} />}
        <Row
          label="Location"
          value={opportunity.branchCity ? `${opportunity.tutorVisibleLocality}, ${opportunity.branchCity}` : opportunity.tutorVisibleLocality}
        />
        <Row label="Mode" value={isSchool ? "School Vacancy" : "Home Tuition"} />
        {(opportunity.currentProgram || opportunity.currentYearOrSemester) && (
          <Row
            label="Currently studying"
            value={[opportunity.currentProgram, opportunity.currentYearOrSemester].filter(Boolean).join(" · ")}
          />
        )}
        <Row label="Tutor preference" value={GENDER_PREFERENCE_LABEL[opportunity.tutorGenderPreference] ?? ""} />
        <Row
          label="Availability"
          value={opportunity.availability
            .map((s) => `${catalogLabel(DAYS_OF_WEEK, s.dayOfWeek)} ${s.startTime}-${s.endTime}`)
            .join("; ")}
        />
        <Row label="Requirements" value={opportunity.notes ?? ""} />
      </div>

      {isAssignedToMe ? (
        <div className="bg-primary-container/10 border border-primary-container rounded-xl p-lg">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
            You&rsquo;re assigned — full details
          </h2>
          <Row label={isSchool ? "Contact name" : "Parent name"} value={opportunity.parentName ?? ""} />
          <Row label={isSchool ? "Contact phone" : "Parent phone"} value={opportunity.parentPhone ?? ""} />
          <Row label={isSchool ? "Contact email" : "Parent email"} value={opportunity.parentEmail ?? ""} />
          {!isSchool && (
            <>
              <Row label="Student name" value={opportunity.studentName ?? ""} />
              <Row label="School" value={opportunity.schoolName ?? ""} />
            </>
          )}
          <Row label="Exact address" value={opportunity.exactAddress ?? ""} />
        </div>
      ) : (
        <p className="font-body-sm text-body-sm text-on-surface-variant -mt-4">
          Exact address and contact details are shared only after you&rsquo;re selected for this tuition.
        </p>
      )}

      {isOpen ? (
        <ApplyButton
          tuitionId={id}
          tutorStatus={session.tutor?.verificationStatus ?? null}
          alreadyApplied={Boolean(existingApplication)}
        />
      ) : (
        <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container rounded-lg p-3">
          This tuition is no longer open — it&rsquo;s currently{" "}
          {opportunity.status === "ASSIGNED" ? "assigned to a tutor" : opportunity.status.toLowerCase()}. You&rsquo;re
          seeing it here because you applied to it; check My Applications for the outcome.
        </p>
      )}
    </div>
  );
}
