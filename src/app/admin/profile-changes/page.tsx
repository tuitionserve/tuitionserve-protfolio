import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { getAllPendingChangeRequests } from "@/server/actions/profile-changes";
import { branchesCollection } from "@/server/domain/collections";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { FilterBar, BranchFilterField } from "@/components/shared/FilterBar";

export default async function AdminProfileChangesPage({
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
    getAllPendingChangeRequests(session, currentCursor(cursorStack), branchFilter),
    isSuperAdmin ? branchesCollection().get().then((s) => s.docs.map((d) => d.data())) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Profile Changes</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Approved tutors&rsquo; requests to change locked fields — open a tutor to approve or reject theirs.
        </p>
      </div>

      {isSuperAdmin && (
        <FilterBar action="/admin/profile-changes" active={Boolean(branchFilter)}>
          <BranchFilterField branches={branches} value={branchFilter} />
        </FilterBar>
      )}

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No pending profile changes.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map(({ request, tutorId, tutorUid, tutorName }) => (
            <Link
              key={request.id}
              href={`/admin/tutors/${tutorId}`}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4 hover:shadow-md transition-all"
            >
              <div>
                <p className="font-label-md text-label-md text-on-surface">
                  {tutorName ?? "Unnamed tutor"} — {tutorUid}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {request.changeUid} · {Object.keys(request.proposedChanges).length} field
                  {Object.keys(request.proposedChanges).length === 1 ? "" : "s"} changed
                </p>
              </div>
              <span className="font-label-md text-label-md px-3 py-1 rounded-full bg-tertiary-container/30 text-on-tertiary-container shrink-0">
                Pending
              </span>
            </Link>
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/admin/profile-changes"
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
