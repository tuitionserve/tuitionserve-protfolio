import { requireRole } from "@/server/auth/guards";
import { getRejectedTuitionsQueue } from "@/server/queries/tuition-requests";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { RequestRow } from "@/components/admin/tuition-requests/RequestRow";

export default async function AdminRejectedRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursors?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const cursorStack = parseCursorStack((await searchParams).cursors);
  const page = await getRejectedTuitionsQueue(session, currentCursor(cursorStack));

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Rejected Requests</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Tuition requests declined, with the reason on file.
        </p>
      </div>

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No rejected requests.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map((row) => (
            <RequestRow key={row.request.id} row={row} badgeLabel="Rejected" badgeClass="bg-error-container text-on-error-container" />
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/admin/tuition-requests/rejected"
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
