import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { getUsersOverview } from "@/server/actions/admin-users";
import { branchesCollection } from "@/server/domain/collections";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { AdminAccountStatusToggle } from "@/components/admin/users/AdminAccountStatusToggle";

export default async function AdminAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; cursors?: string }>;
}) {
  await requireRole(["SUPER_ADMIN"]);
  const params = await searchParams;
  const branchFilter = params.branch || null;
  const cursorStack = parseCursorStack(params.cursors);

  const [branchesSnap, page] = await Promise.all([
    branchesCollection().get(),
    getUsersOverview(branchFilter, currentCursor(cursorStack)),
  ]);
  const branches = branchesSnap.docs.map((d) => d.data());

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Admins</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Every Super Admin and Branch Admin account. Assign a new admin to a branch without touching the
            database.
          </p>
        </div>
        <Link
          href="/admin/admins/new"
          className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-5 py-2.5 shadow-sm hover:shadow-md transition-all shrink-0"
        >
          + Add Admin
        </Link>
      </div>

      <form action="/admin/admins" method="get" className="flex items-center gap-2 w-fit">
        <label htmlFor="branch" className="font-label-md text-label-md text-on-surface-variant">
          Location
        </label>
        <select
          id="branch"
          name="branch"
          defaultValue={branchFilter ?? ""}
          className="border border-outline-variant rounded-lg p-2 font-body-sm text-body-sm outline-none focus:border-primary-container"
        >
          <option value="">All branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <button type="submit" className="font-label-md text-label-md text-primary-container px-2">
          Apply
        </button>
      </form>

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No admin accounts found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map((admin) => (
            <div
              key={admin.id}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-label-md text-label-md text-on-surface">{admin.fullName ?? "Unnamed admin"}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {admin.adminUid ?? "—"} · {admin.email}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Branch Admin"}
                  {admin.branchName ? ` · ${admin.branchName}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`font-label-md text-label-md px-3 py-1 rounded-full shrink-0 ${
                    admin.accountStatus === "ACTIVE"
                      ? "bg-primary-container/20 text-primary-container"
                      : "bg-error-container text-on-error-container"
                  }`}
                >
                  {admin.accountStatus === "ACTIVE" ? "Active" : "Disabled"}
                </span>
                <AdminAccountStatusToggle userId={admin.id} accountStatus={admin.accountStatus} />
              </div>
            </div>
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/admin/admins"
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
