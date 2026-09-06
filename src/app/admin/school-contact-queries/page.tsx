import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { getSchoolContactQueries } from "@/server/queries/school-contact-queries";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { truncateMessage } from "@/lib/mailto";

export default async function AdminSchoolContactQueriesPage({
  searchParams,
}: {
  searchParams: Promise<{ cursors?: string }>;
}) {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const cursorStack = parseCursorStack((await searchParams).cursors);
  const page = await getSchoolContactQueries(currentCursor(cursorStack));

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">School Contact</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Every partnership enquiry submitted through the public For Schools form. Open one to see the full
          message and reply.
        </p>
      </div>

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No enquiries yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map((q) => (
            <Link
              key={q.id}
              href={`/admin/school-contact-queries/${q.id}`}
              className={`border rounded-xl p-lg flex flex-col gap-1 hover:shadow-md transition-all ${
                q.isNew ? "border-primary-container bg-primary-container/5" : "border-surface-variant bg-surface-container-lowest"
              }`}
            >
              <p className={`font-label-md text-label-md ${q.isNew ? "text-on-surface font-bold" : "text-on-surface-variant"}`}>
                {q.institutionName} <span className="font-body-sm text-body-sm text-on-surface-variant">· {q.queryUid}</span>
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {q.contactPersonName} · {q.phone}
                {q.email ? ` · ${q.email}` : ""} · {q.location}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{truncateMessage(q.message)}</p>
            </Link>
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/admin/school-contact-queries"
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
