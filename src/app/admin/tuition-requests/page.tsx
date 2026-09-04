import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { getOpenTuitionsQueue, getTuitionRequestQueue, type TuitionRequestQueueRow } from "@/server/queries/tuition-requests";
import { catalogLabel, SUBJECTS } from "@/lib/catalog";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";

function RequestRow({ row, badgeLabel, badgeClass }: { row: TuitionRequestQueueRow; badgeLabel: string; badgeClass: string }) {
  const { request, parentName, studentName } = row;
  return (
    <Link
      href={`/admin/tuition-requests/${request.id}`}
      className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4 hover:shadow-md transition-all"
    >
      <div>
        <p className="font-label-md text-label-md text-on-surface">
          {studentName ?? "Unnamed student"} — {catalogLabel(SUBJECTS, request.subjectId)}
        </p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {request.tuitionUid} · {parentName ?? "Unknown parent"} · {request.tutorVisibleLocality}
        </p>
      </div>
      <span className={`font-label-md text-label-md px-3 py-1 rounded-full shrink-0 ${badgeClass}`}>
        {badgeLabel}
      </span>
    </Link>
  );
}

export default async function AdminTuitionRequestsQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ newCursors?: string; openCursors?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const params = await searchParams;
  const newCursorStack = parseCursorStack(params.newCursors);
  const openCursorStack = parseCursorStack(params.openCursors);

  const [newPage, openPage] = await Promise.all([
    getTuitionRequestQueue(session, currentCursor(newCursorStack)),
    getOpenTuitionsQueue(session, currentCursor(openCursorStack)),
  ]);

  return (
    <div className="flex flex-col gap-xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Tuition Requests</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          New requests awaiting confirmation, and open tuitions awaiting a tutor.
        </p>
      </div>

      <div className="flex flex-col gap-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">New Requests</h2>
        {newPage.items.length === 0 ? (
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
            <p className="font-body-sm text-body-sm text-on-surface-variant">No new requests awaiting review.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {newPage.items.map((row) => (
              <RequestRow key={row.request.id} row={row} badgeLabel="New" badgeClass="bg-tertiary-container/30 text-on-tertiary-container" />
            ))}
          </div>
        )}
        <PaginationBar
          basePath="/admin/tuition-requests"
          cursorParamName="newCursors"
          cursorStack={newCursorStack}
          nextCursor={newPage.nextCursor}
          hasNextPage={newPage.hasNextPage}
          itemsCount={newPage.items.length}
          totalCount={newPage.totalCount}
          pageSize={DEFAULT_PAGE_SIZE}
          extraParams={openCursorStack.length > 0 ? { openCursors: openCursorStack.join(",") } : undefined}
        />
      </div>

      <div className="flex flex-col gap-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Open Tuitions</h2>
        {openPage.items.length === 0 ? (
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
            <p className="font-body-sm text-body-sm text-on-surface-variant">No open tuitions right now.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {openPage.items.map((row) => (
              <RequestRow key={row.request.id} row={row} badgeLabel="Open" badgeClass="bg-primary-container/20 text-primary-container" />
            ))}
          </div>
        )}
        <PaginationBar
          basePath="/admin/tuition-requests"
          cursorParamName="openCursors"
          cursorStack={openCursorStack}
          nextCursor={openPage.nextCursor}
          hasNextPage={openPage.hasNextPage}
          itemsCount={openPage.items.length}
          totalCount={openPage.totalCount}
          pageSize={DEFAULT_PAGE_SIZE}
          extraParams={newCursorStack.length > 0 ? { newCursors: newCursorStack.join(",") } : undefined}
        />
      </div>
    </div>
  );
}
