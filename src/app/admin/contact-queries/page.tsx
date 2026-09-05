import { requireRole } from "@/server/auth/guards";
import { getContactQueries } from "@/server/queries/contact-queries";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

function mailtoHref(email: string, queryUid: string, originalMessage: string): string {
  const subject = `Re: Your message to Tuition Serve (${queryUid})`;
  const quoted = originalMessage
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const body = `\n\n---\nYou wrote:\n${quoted}`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function AdminContactQueriesPage({
  searchParams,
}: {
  searchParams: Promise<{ cursors?: string }>;
}) {
  // Not branch-scoped — a general enquiry isn't tied to one branch, so
  // every admin sees the same list regardless of role.
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const cursorStack = parseCursorStack((await searchParams).cursors);
  const page = await getContactQueries(currentCursor(cursorStack));

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Contact Queries</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Every message submitted through the public Contact Us form. Reply opens your own email app, addressed
          to the sender.
        </p>
      </div>

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No messages yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map((q) => (
            <div
              key={q.id}
              className={`border rounded-xl p-lg flex items-start justify-between gap-4 ${
                q.isNew ? "border-primary-container bg-primary-container/5" : "border-surface-variant bg-surface-container-lowest"
              }`}
            >
              <div className="min-w-0">
                <p className={`font-label-md text-label-md ${q.isNew ? "text-on-surface font-bold" : "text-on-surface-variant"}`}>
                  {q.fullName} <span className="font-body-sm text-body-sm text-on-surface-variant">· {q.queryUid}</span>
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {q.email}
                  {q.phone ? ` · ${q.phone}` : ""}
                </p>
                <p className="font-body-md text-body-md text-on-surface mt-2 whitespace-pre-wrap break-words max-w-[46rem]">
                  {q.message}
                </p>
              </div>
              <a
                href={mailtoHref(q.email, q.queryUid, q.message)}
                className="shrink-0 inline-flex items-center gap-2 border border-secondary text-secondary font-label-md text-label-md rounded-lg px-4 py-2 hover:bg-surface-container transition-all"
              >
                <MaterialIcon name="reply" className="text-lg" />
                Reply
              </a>
            </div>
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/admin/contact-queries"
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
