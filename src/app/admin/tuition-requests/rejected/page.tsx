import { requireRole } from "@/server/auth/guards";
import { getRejectedTuitionsQueue } from "@/server/queries/tuition-requests";
import { branchesCollection } from "@/server/domain/collections";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { FilterBar, BranchFilterField } from "@/components/shared/FilterBar";
import { RequestRow } from "@/components/admin/tuition-requests/RequestRow";
import { ClearRejectedButton } from "@/components/admin/tuition-requests/ClearRejectedButton";

export default async function AdminRejectedRequestsPage({
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
    getRejectedTuitionsQueue(session, currentCursor(cursorStack), branchFilter),
    isSuperAdmin ? branchesCollection().get().then((s) => s.docs.map((d) => d.data())) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Rejected Requests</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Tuition requests declined, with the reason on file. Automatically deleted 30 days after rejection —
            use Clear Rejected to remove them sooner.
          </p>
        </div>
        <ClearRejectedButton branchFilter={branchFilter} disabled={page.totalCount === 0} />
      </div>

      {isSuperAdmin && (
        <FilterBar action="/admin/tuition-requests/rejected" active={Boolean(branchFilter)}>
          <BranchFilterField branches={branches} value={branchFilter} />
        </FilterBar>
      )}

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
        extraParams={branchFilter ? { branch: branchFilter } : undefined}
      />
    </div>
  );
}
