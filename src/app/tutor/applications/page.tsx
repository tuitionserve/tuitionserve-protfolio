import Link from "next/link";
import { requireActiveTutor } from "@/server/auth/guards";
import { getMyApplications } from "@/server/queries/my-applications";
import { catalogLabel, GRADES, SUBJECTS } from "@/lib/catalog";
import { WithdrawApplicationButton } from "@/components/tutor/opportunities/WithdrawApplicationButton";
import { RequestWithdrawalButton } from "@/components/tutor/opportunities/RequestWithdrawalButton";
import type { TutorApplicationStatus } from "@/server/domain/types";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";

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

export default async function MyApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursors?: string }>;
}) {
  const session = await requireActiveTutor();
  const cursorStack = parseCursorStack((await searchParams).cursors);
  const page = await getMyApplications(session.uid, currentCursor(cursorStack));
  const rows = page.items;

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">My Applications</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {page.totalCount} application{page.totalCount === 1 ? "" : "s"} total.
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
          {rows.map(({ application, tuition, assignment }) => (
            <div
              key={application.id}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4"
            >
              {tuition ? (
                <Link href={`/tutor/opportunities/${tuition.id}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                  <p className="font-label-md text-label-md text-on-surface">
                    {catalogLabel(GRADES, tuition.gradeId)} {catalogLabel(SUBJECTS, tuition.subjectId)}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {tuition.tuitionUid} · {tuition.tutorVisibleLocality}
                  </p>
                  <span
                    className={`inline-block mt-2 font-label-md text-label-md px-3 py-1 rounded-full ${STATUS_COLOR[application.status]}`}
                  >
                    {STATUS_LABEL[application.status]}
                  </span>
                  {application.status === "SELECTED" && assignment?.status === "ACTIVE" && assignment.hasPendingWithdrawal && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 max-w-[24rem]">
                      Withdrawal requested — pending admin review.
                    </p>
                  )}
                  {application.status === "SELECTED" && assignment?.status === "RELEASED" && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 max-w-[24rem]">
                      Withdrawal approved — this assignment has ended.
                    </p>
                  )}
                  {application.status === "SELECTED" && !assignment && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 max-w-[24rem]">
                      You&rsquo;ve been assigned to this tuition. An admin will contact you with further details.
                    </p>
                  )}
                </Link>
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-label-md text-on-surface">Tuition no longer available</p>
                  <span
                    className={`inline-block mt-2 font-label-md text-label-md px-3 py-1 rounded-full ${STATUS_COLOR[application.status]}`}
                  >
                    {STATUS_LABEL[application.status]}
                  </span>
                </div>
              )}
              {application.status === "APPLIED" && <WithdrawApplicationButton applicationId={application.id} />}
              {application.status === "SELECTED" && assignment?.status === "ACTIVE" && !assignment.hasPendingWithdrawal && (
                <RequestWithdrawalButton assignmentId={assignment.id} />
              )}
            </div>
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/tutor/applications"
        cursorParamName="cursors"
        cursorStack={cursorStack}
        nextCursor={page.nextCursor}
        hasNextPage={page.hasNextPage}
        itemsCount={page.items.length}
        totalCount={page.totalCount}
        pageSize={DEFAULT_PAGE_SIZE}
      />
    </div>
  );
}
