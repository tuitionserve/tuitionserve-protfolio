import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { getAllApplications } from "@/server/queries/admin-applicants";
import { catalogLabel, SUBJECTS } from "@/lib/catalog";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";

const STATUS_LABEL: Record<string, string> = {
  APPLIED: "Applied",
  WITHDRAWN: "Withdrawn",
  SELECTED: "Selected",
  REJECTED: "Not Selected",
};

const STATUS_CLASS: Record<string, string> = {
  APPLIED: "bg-tertiary-container/30 text-on-tertiary-container",
  WITHDRAWN: "bg-surface-container text-on-surface-variant",
  SELECTED: "bg-primary-container/20 text-primary-container",
  REJECTED: "bg-error-container text-on-error-container",
};

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursors?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const cursorStack = parseCursorStack((await searchParams).cursors);
  const page = await getAllApplications(session, currentCursor(cursorStack));

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Applications</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Every tutor application, across all tuitions — to act on one (view CV, assign, message), open its
          tuition from here.
        </p>
      </div>

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No applications yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map(({ application, tuitionUid, tuitionId }) => (
            <Link
              key={application.id}
              href={`/admin/tuition-requests/${tuitionId}`}
              className={`border rounded-xl p-lg flex items-center justify-between gap-4 hover:shadow-md transition-all ${
                application.isNew ? "border-primary-container bg-primary-container/5" : "border-surface-variant bg-surface-container-lowest"
              }`}
            >
              <div>
                <p className={`font-label-md text-label-md ${application.isNew ? "text-on-surface font-bold" : "text-on-surface-variant"}`}>
                  {application.snapshot.fullName ?? "Unnamed tutor"} — {application.snapshot.tutorUid}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Applied to {tuitionUid} ·{" "}
                  {application.snapshot.subjects.map((s) => catalogLabel(SUBJECTS, s)).join(", ")}
                </p>
              </div>
              <span className={`font-label-md text-label-md px-3 py-1 rounded-full shrink-0 ${STATUS_CLASS[application.status]}`}>
                {STATUS_LABEL[application.status]}
              </span>
            </Link>
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/admin/applications"
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
