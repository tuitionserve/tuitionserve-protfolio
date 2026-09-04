import Link from "next/link";
import { requireActiveTutor } from "@/server/auth/guards";
import { getMyApplications } from "@/server/queries/my-applications";
import { catalogLabel, GRADES, SUBJECTS } from "@/lib/catalog";
import { WithdrawApplicationButton } from "@/components/tutor/opportunities/WithdrawApplicationButton";
import type { TutorApplicationStatus } from "@/server/domain/types";

const STATUS_LABEL: Record<TutorApplicationStatus, string> = {
  APPLIED: "Applied",
  WITHDRAWN: "Withdrawn",
  SELECTED: "Selected",
  REJECTED: "Not Selected",
};

const STATUS_COLOR: Record<TutorApplicationStatus, string> = {
  APPLIED: "bg-tertiary-container/30 text-on-tertiary-container",
  WITHDRAWN: "bg-surface-container text-on-surface-variant",
  SELECTED: "bg-primary-container/20 text-primary-container",
  REJECTED: "bg-surface-container text-on-surface-variant",
};

export default async function MyApplicationsPage() {
  const session = await requireActiveTutor();
  const rows = await getMyApplications(session.uid);

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">My Applications</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {rows.length} application{rows.length === 1 ? "" : "s"} total.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            You haven&rsquo;t applied to any tuitions yet —{" "}
            <Link href="/tutor/opportunities" className="text-primary-container font-medium">
              browse available tuitions
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map(({ application, tuition }) => (
            <div
              key={application.id}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-label-md text-label-md text-on-surface">
                  {tuition ? `${catalogLabel(GRADES, tuition.gradeId)} ${catalogLabel(SUBJECTS, tuition.subjectId)}` : "Tuition no longer available"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {tuition?.tuitionUid} {tuition ? `· ${tuition.tutorVisibleLocality}` : ""}
                </p>
                <span
                  className={`inline-block mt-2 font-label-md text-label-md px-3 py-1 rounded-full ${STATUS_COLOR[application.status]}`}
                >
                  {STATUS_LABEL[application.status]}
                </span>
              </div>
              {application.status === "APPLIED" && <WithdrawApplicationButton applicationId={application.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
