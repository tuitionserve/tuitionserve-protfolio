import { requireRole } from "@/server/auth/guards";
import { getCancelledTuitionsQueue } from "@/server/queries/tuition-requests";
import { branchesCollection } from "@/server/domain/collections";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { FilterBar, BranchFilterField } from "@/components/shared/FilterBar";
import { RequestRow } from "@/components/admin/tuition-requests/RequestRow";

export default async function AdminCancelledRequestsPage({
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
    getCancelledTuitionsQueue(session, currentCursor(cursorStack), branchFilter),
    isSuperAdmin ? branchesCollection().get().then((s) => s.docs.map((d) => d.data())) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Cancelled Tuitions</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Closed out after a tutor&rsquo;s withdrawal was approved and the family no longer needed a tutor — kept
          on file, not auto-deleted like rejected requests.
        </p>
      </div>

      {isSuperAdmin && (
        <FilterBar action="/admin/tuition-requests/cancelled" active={Boolean(branchFilter)}>
          <BranchFilterField branches={branches} value={branchFilter} />
        </FilterBar>
      )}

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No cancelled tuitions.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map((row) => (
            <RequestRow key={row.request.id} row={row} badgeLabel="Cancelled" badgeClass="bg-error-container text-on-error-container" />
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/admin/tuition-requests/cancelled"
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
