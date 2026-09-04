import Link from "next/link";
import { redirect } from "next/navigation";
import { requireActiveTutor } from "@/server/auth/guards";
import { ApprovalBanner } from "@/components/tutor/ApprovalBanner";
import type { TutorVerificationStatus } from "@/server/domain/types";

const STATUS_LABEL: Record<TutorVerificationStatus, string> = {
  PROFILE_INCOMPLETE: "Profile Incomplete",
  SUBMITTED: "Submitted for Review",
  UNDER_REVIEW: "Under Review",
  REJECTED: "Changes Required",
  RESUBMITTED: "Resubmitted",
  APPROVED: "Verified",
  SUSPENDED: "Suspended",
};

const STATUS_COLOR: Record<TutorVerificationStatus, string> = {
  PROFILE_INCOMPLETE: "bg-surface-container text-on-surface-variant",
  SUBMITTED: "bg-tertiary-container/30 text-on-tertiary-container",
  UNDER_REVIEW: "bg-tertiary-container/30 text-on-tertiary-container",
  REJECTED: "bg-error-container text-on-error-container",
  RESUBMITTED: "bg-tertiary-container/30 text-on-tertiary-container",
  APPROVED: "bg-primary-container/20 text-primary-container",
  SUSPENDED: "bg-error-container text-on-error-container",
};

export default async function TutorDashboardPage() {
  // Re-runs the guard rather than trusting the layout ran first: Next.js
  // does not guarantee a parent layout finishes before a child page starts
  // rendering, so a page must not assume a sibling/parent already
  // validated the session.
  const session = await requireActiveTutor();
  if (!session.tutor) redirect("/login");
  const tutor = session.tutor;

  return (
    <div className="flex flex-col gap-lg">
      {tutor.verificationStatus === "APPROVED" && !tutor.approvalBannerSeenAt && <ApprovalBanner />}

      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            {session.email ?? "Welcome"}
          </h1>
          <span
            className={`font-label-md text-label-md px-3 py-1 rounded-full ${STATUS_COLOR[tutor.verificationStatus]}`}
          >
            {STATUS_LABEL[tutor.verificationStatus]}
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Tutor ID: {tutor.tutorUid}
        </p>
      </div>

      {tutor.verificationStatus === "PROFILE_INCOMPLETE" && (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Your profile is incomplete. Complete your personal, education, teaching, and
            document details, then submit for admin review to start applying to tuitions.
          </p>
          <Link
            href="/tutor/onboarding"
            className="shrink-0 bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all text-center"
          >
            Complete Your Profile
          </Link>
        </div>
      )}

      {tutor.verificationStatus === "REJECTED" && (
        <div className="bg-error-container/60 border border-error rounded-xl p-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-label-md text-label-md text-on-error-container mb-1">
              Changes required
            </p>
            <p className="font-body-sm text-body-sm text-on-error-container">
              {tutor.rejectionReason ?? "The admin team requested changes to your profile."}
            </p>
          </div>
          <Link
            href="/tutor/onboarding"
            className="shrink-0 bg-on-error-container text-error-container font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all text-center"
          >
            Improve Profile
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        <SummaryTile label="Available Tuitions" value="—" />
        <SummaryTile label="My Applications" value="—" />
        <SummaryTile label="Assigned Tuition" value="—" />
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Notifications</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">No notifications yet.</p>
      </div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg text-center">
      <p className="font-display-lg text-headline-lg text-on-surface">{value}</p>
      <p className="font-label-md text-label-md text-on-surface-variant mt-1">{label}</p>
    </div>
  );
}
