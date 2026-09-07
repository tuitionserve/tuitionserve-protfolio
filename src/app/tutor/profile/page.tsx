import Link from "next/link";
import { redirect } from "next/navigation";
import { requireActiveTutor } from "@/server/auth/guards";
import { tutorProfilesCollection, branchesCollection } from "@/server/domain/collections";
import { catalogLabel, DAYS_OF_WEEK, GRADES, QUALIFICATIONS, SUBJECTS } from "@/lib/catalog";
import { getMyPendingChangeRequest } from "@/server/actions/profile-changes";
import { FreeEditForm } from "@/components/tutor/profile/FreeEditForm";
import { SecuritySettings } from "@/components/shared/SecuritySettings";

const STATUS_LABEL: Record<string, string> = {
  PROFILE_INCOMPLETE: "Profile Incomplete",
  SUBMITTED: "Submitted for Review",
  UNDER_REVIEW: "Under Review",
  REJECTED: "Changes Required",
  RESUBMITTED: "Resubmitted",
  APPROVED: "Verified",
  SUSPENDED: "Suspended",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-surface-variant last:border-0">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <span className="font-body-sm text-body-sm text-on-surface text-right">{value || "—"}</span>
    </div>
  );
}

export default async function TutorProfilePage() {
  const session = await requireActiveTutor();
  if (!session.tutor) redirect("/login");
  const tutor = session.tutor;

  // If the tutor has not completed the onboarding wizard yet, send them to onboarding
  if (tutor.verificationStatus === "PROFILE_INCOMPLETE") {
    redirect("/tutor/onboarding");
  }

  const isApproved = tutor.verificationStatus === "APPROVED";

  const [profileSnap, branchSnap, pendingRequest] = await Promise.all([
    tutorProfilesCollection().doc(session.uid).get(),
    tutor.branchId ? branchesCollection().doc(tutor.branchId).get() : Promise.resolve(null),
    isApproved ? getMyPendingChangeRequest() : Promise.resolve(null),
  ]);
  const profile = profileSnap.exists ? profileSnap.data()! : null;
  const branchName = branchSnap?.exists ? branchSnap.data()!.name : "Unassigned";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-lg">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Your Profile</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{tutor.tutorUid}</p>
        </div>
        {!isApproved && (
          <Link
            href="/tutor/onboarding"
            className="bg-primary-container text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            Edit Profile
          </Link>
        )}
      </div>

      {isApproved && (
        <div className="bg-tertiary-container/20 border border-tertiary-container rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Your profile is approved. You can freely update your photo and teaching experience below — everything
            else (phone, education, subjects, location, CV, etc.) needs a quick admin review after you submit a
            change, since it was already vetted.
          </p>
          {pendingRequest ? (
            <p className="font-label-md text-label-md text-on-surface mt-3">
              You have a change request pending review ({pendingRequest.changeUid}).
            </p>
          ) : (
            <Link
              href="/tutor/profile/advanced-edit"
              className="inline-block mt-3 border border-secondary text-secondary font-label-md text-label-md px-5 py-2.5 rounded-lg hover:bg-surface-container transition-all"
            >
              Advanced Edit
            </Link>
          )}
        </div>
      )}

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Account</h2>
        <Row label="Status" value={STATUS_LABEL[tutor.verificationStatus] ?? tutor.verificationStatus} />
        <Row label="Branch" value={branchName} />
        <Row label="Email" value={session.email ?? ""} />
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Security</h2>
        <SecuritySettings email={session.email} />
      </div>

      {isApproved && (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Quick Edit</h2>
          <FreeEditForm
            initialExperience={profile?.teachingExperienceSummary ?? null}
            hasPhoto={Boolean(profile?.profilePhotoDocumentId)}
          />
        </div>
      )}

      {profile ? (
        <>
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Personal</h2>
            <Row label="Full name" value={profile.fullName ?? ""} />
            <Row label="Phone" value={profile.phone ?? ""} />
            <Row label="Address" value={profile.address ?? ""} />
            <Row label="Profile photo" value={profile.profilePhotoDocumentId ? "Uploaded" : "Not uploaded"} />
          </div>

          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Education</h2>
            <Row
              label="Qualification"
              value={profile.highestQualification ? catalogLabel(QUALIFICATIONS, profile.highestQualification) : ""}
            />
            <Row label="Institution" value={profile.institution ?? ""} />
            <Row label="Graduation year (B.S.)" value={profile.graduationYear ? String(profile.graduationYear) : ""} />
            <Row label="Major / subject" value={profile.majorSubject ?? ""} />
            {(profile.currentProgram || profile.currentYearOrSemester) && (
              <Row
                label="Currently studying"
                value={[profile.currentProgram, profile.currentYearOrSemester].filter(Boolean).join(" · ")}
              />
            )}
          </div>

          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Teaching</h2>
            <Row label="Subjects" value={(profile.subjects ?? []).map((s) => catalogLabel(SUBJECTS, s)).join(", ")} />
            <Row label="Grades" value={(profile.grades ?? []).map((g) => catalogLabel(GRADES, g)).join(", ")} />
            <Row label="Experience" value={profile.teachingExperienceSummary ?? ""} />
            <Row label="Expected monthly fee" value={profile.expectedMonthlyFee ? `NPR ${profile.expectedMonthlyFee}` : ""} />
          </div>

          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Location & Availability</h2>
            <Row label="Preferred locality / area" value={profile.preferredLocality ?? ""} />
            <Row
              label="Availability"
              value={(profile.availability ?? [])
                .filter((s) => s && s.dayOfWeek)
                .map((s) => `${catalogLabel(DAYS_OF_WEEK, s.dayOfWeek)} ${s.startTime || ""}-${s.endTime || ""}`)
                .join("; ")}
            />
            <Row label="CV" value={profile.cvDocumentId ? "Uploaded" : "Not uploaded"} />
          </div>
        </>
      ) : (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            You haven&rsquo;t completed your profile yet.
          </p>
        </div>
      )}
    </div>
  );
}
