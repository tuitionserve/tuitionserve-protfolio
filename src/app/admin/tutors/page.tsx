import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { getTutorReviewQueue } from "@/server/queries/tutor-review";
import { branchesCollection } from "@/server/domain/collections";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { FilterBar, BranchFilterField } from "@/components/shared/FilterBar";

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  RESUBMITTED: "Resubmitted",
  REJECTED: "Changes Required",
};

const STATUS_CLASS: Record<string, string> = {
  SUBMITTED: "bg-tertiary-container/30 text-on-tertiary-container",
  UNDER_REVIEW: "bg-tertiary-container/30 text-on-tertiary-container",
  RESUBMITTED: "bg-tertiary-container/30 text-on-tertiary-container",
  REJECTED: "bg-error-container text-on-error-container",
};

export default async function AdminTutorsQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ cursors?: string; branch?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const params = await searchParams;
  const branchFilter = params.branch || null;
  const cursorStack = parseCursorStack(params.cursors);

  const [page, branches] = await Promise.all([
    getTutorReviewQueue(session, currentCursor(cursorStack), branchFilter),
    isSuperAdmin ? branchesCollection().get().then((s) => s.docs.map((d) => d.data())) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Tutor Reviews</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Every tutor still in the review pipeline — awaiting a decision, or waiting on the tutor to fix and
          resubmit.
        </p>
      </div>

      {isSuperAdmin && (
        <FilterBar action="/admin/tutors" active={Boolean(branchFilter)}>
          <BranchFilterField branches={branches} value={branchFilter} />
        </FilterBar>
      )}

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No tutor profiles are currently in the review pipeline.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map(({ tutor, fullName }) => (
            <Link
              key={tutor.id}
              href={`/admin/tutors/${tutor.id}`}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4 hover:shadow-md transition-all"
            >
              <div>
                <p className="font-label-md text-label-md text-on-surface">{fullName ?? "Unnamed tutor"}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{tutor.tutorUid}</p>
              </div>
              <span className={`font-label-md text-label-md px-3 py-1 rounded-full shrink-0 ${STATUS_CLASS[tutor.verificationStatus] ?? "bg-surface-container text-on-surface-variant"}`}>
                {STATUS_LABEL[tutor.verificationStatus] ?? tutor.verificationStatus}
              </span>
            </Link>
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/admin/tutors"
        cursorParamName="cursors"
        cursorStack={cursorStack}
        nextCursor={page.nextCursor}
        hasNextPage={page.hasNextPage}
        itemsCount={page.items.length}
        totalCount={page.totalCount}
        pageSize={DEFAULT_PAGE_SIZE}
        extraParams={branchFilter ? { branch: branchFilter } : undefined}
      />
    </div>
  );
}
