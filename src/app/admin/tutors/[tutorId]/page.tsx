import { notFound } from "next/navigation";
import { assertBranchScope, requireRole } from "@/server/auth/guards";
import { tutorProfilesCollection, tutorsCollection } from "@/server/domain/collections";
import { catalogLabel, DAYS_OF_WEEK, GRADES, QUALIFICATIONS, SUBJECTS } from "@/lib/catalog";
import { TutorReviewActions } from "@/components/admin/tutors/TutorReviewActions";
import { TutorSuspensionActions } from "@/components/admin/tutors/TutorSuspensionActions";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-surface-variant last:border-0">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <span className="font-body-sm text-body-sm text-on-surface text-right">{value || "—"}</span>
    </div>
  );
}

export default async function AdminTutorDetailPage({
  params,
}: {
  params: Promise<{ tutorId: string }>;
}) {
  const { tutorId } = await params;
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const tutorSnap = await tutorsCollection().doc(tutorId).get();
  if (!tutorSnap.exists) notFound();
  const tutor = tutorSnap.data()!;

  try {
    assertBranchScope(session, tutor.branchId);
  } catch {
    notFound();
  }

  const profileSnap = await tutorProfilesCollection().doc(tutorId).get();
  const profile = profileSnap.data() ?? null;

  return (
    <div className="max-w-2xl flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          {profile?.fullName ?? "Unnamed tutor"}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{tutor.tutorUid}</p>
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <Row label="Phone" value={profile?.phone ?? ""} />
        <Row label="Address" value={profile?.address ?? ""} />
        <Row
          label="Qualification"
          value={profile?.highestQualification ? catalogLabel(QUALIFICATIONS, profile.highestQualification) : ""}
        />
        <Row label="Institution" value={profile?.institution ?? ""} />
        <Row label="Subjects" value={(profile?.subjects ?? []).map((s) => catalogLabel(SUBJECTS, s)).join(", ")} />
        <Row label="Grades" value={(profile?.grades ?? []).map((g) => catalogLabel(GRADES, g)).join(", ")} />
        <Row label="Experience" value={profile?.teachingExperienceSummary ?? ""} />
        <Row label="Expected monthly fee" value={profile?.expectedMonthlyFee ? `NPR ${profile.expectedMonthlyFee}` : ""} />
        <Row label="Preferred locality" value={profile?.preferredLocality ?? ""} />
        <Row
          label="Availability"
          value={(profile?.availability ?? [])
            .map((s) => `${catalogLabel(DAYS_OF_WEEK, s.dayOfWeek)} ${s.startTime}-${s.endTime}`)
            .join("; ")}
        />
      </div>

      {["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED"].includes(tutor.verificationStatus) ? (
        <TutorReviewActions tutorId={tutorId} hasCv={Boolean(profile?.cvDocumentId)} />
      ) : (
        <TutorSuspensionActions
          tutorId={tutorId}
          verificationStatus={tutor.verificationStatus}
          suspensionReason={tutor.suspensionReason}
        />
      )}
    </div>
  );
}
