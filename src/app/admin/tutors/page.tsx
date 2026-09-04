import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { getTutorReviewQueue } from "@/server/queries/tutor-review";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  RESUBMITTED: "Resubmitted",
};

export default async function AdminTutorsQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ cursors?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const cursorStack = parseCursorStack((await searchParams).cursors);
  const page = await getTutorReviewQueue(session, currentCursor(cursorStack));

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Tutor Reviews</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Tutors awaiting approval or rejection.
        </p>
      </div>

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No tutor profiles are currently awaiting review.
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
              <span className="font-label-md text-label-md px-3 py-1 rounded-full bg-tertiary-container/30 text-on-tertiary-container shrink-0">
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
      />
    </div>
  );
}
