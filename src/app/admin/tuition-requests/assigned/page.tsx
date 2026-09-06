import { requireRole } from "@/server/auth/guards";
import { getAssignedTuitionsQueue } from "@/server/queries/tuition-requests";
import { branchesCollection } from "@/server/domain/collections";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { FilterBar, BranchFilterField } from "@/components/shared/FilterBar";
import { RequestRow } from "@/components/admin/tuition-requests/RequestRow";

export default async function AdminAssignedTuitionsPage({
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
    getAssignedTuitionsQueue(session, currentCursor(cursorStack), branchFilter),
    isSuperAdmin ? branchesCollection().get().then((s) => s.docs.map((d) => d.data())) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Assigned Tuitions</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Tuitions with a tutor selected and active.
        </p>
      </div>

      {isSuperAdmin && (
        <FilterBar action="/admin/tuition-requests/assigned" active={Boolean(branchFilter)}>
          <BranchFilterField branches={branches} value={branchFilter} />
        </FilterBar>
      )}

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No assigned tuitions yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map((row) => (
            <RequestRow key={row.request.id} row={row} badgeLabel="Assigned" badgeClass="bg-primary-container/20 text-primary-container" />
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/admin/tuition-requests/assigned"
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
