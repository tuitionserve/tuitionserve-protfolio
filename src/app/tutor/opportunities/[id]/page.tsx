import { notFound } from "next/navigation";
import { requireActiveTutor } from "@/server/auth/guards";
import { getOpenOpportunityById } from "@/server/queries/opportunities";
import { catalogLabel, DAYS_OF_WEEK, GRADES, SUBJECTS } from "@/lib/catalog";
import { ApplyButton } from "@/components/tutor/opportunities/ApplyButton";
import { tutorApplicationsCollection } from "@/server/domain/collections";

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

  const opportunity = await getOpenOpportunityById(id);
  if (!opportunity) notFound();

  const existingApplicationSnap = await tutorApplicationsCollection()
    .where("tuitionId", "==", id)
    .where("tutorId", "==", session.uid)
    .where("status", "==", "APPLIED")
    .limit(1)
    .get();
  const existingApplication = existingApplicationSnap.empty ? null : existingApplicationSnap.docs[0]!.data();

  return (
    <div className="max-w-2xl flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          {catalogLabel(GRADES, opportunity.gradeId)} {catalogLabel(SUBJECTS, opportunity.subjectId)}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{opportunity.tuitionUid}</p>
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <Row label="Location" value={opportunity.tutorVisibleLocality} />
        <Row label="Mode" value="Home Tuition" />
        <Row
          label="Availability"
          value={opportunity.availability
            .map((s) => `${catalogLabel(DAYS_OF_WEEK, s.dayOfWeek)} ${s.startTime}-${s.endTime}`)
            .join("; ")}
        />
        <Row label="Requirements" value={opportunity.notes ?? ""} />
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant -mt-4">
        Exact address is shared by the admin team only after you&rsquo;re selected.
      </p>

      <ApplyButton
        tuitionId={id}
        tutorStatus={session.tutor?.verificationStatus ?? null}
        alreadyApplied={Boolean(existingApplication)}
      />
    </div>
  );
}
