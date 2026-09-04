import Link from "next/link";

/**
 * "Showing X-Y of Z" + Previous/Next, Gmail-style. Server-rendered —
 * navigation is plain links carrying the cursor stack in the URL
 * (`?<cursorParamName>=tok1,tok2`), so no client JS is needed and pages
 * stay bookmarkable. `cursorParamName` lets two independent paginated
 * lists coexist on one page (e.g. "New" and "Open" queues).
 */
export function PaginationBar({
  basePath,
  cursorParamName,
  cursorStack,
  nextCursor,
  hasNextPage,
  itemsCount,
  totalCount,
  pageSize,
  extraParams,
}: {
  basePath: string;
  cursorParamName: string;
  cursorStack: string[];
  nextCursor: string | null;
  hasNextPage: boolean;
  itemsCount: number;
  totalCount: number;
  pageSize: number;
  extraParams?: Record<string, string>;
}) {
  if (totalCount === 0) return null;

  const rangeStart = cursorStack.length * pageSize + 1;
  const rangeEnd = cursorStack.length * pageSize + itemsCount;

  function hrefFor(stack: string[]): string {
    const params = new URLSearchParams(extraParams);
    if (stack.length > 0) params.set(cursorParamName, stack.join(","));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const previousHref = cursorStack.length > 0 ? hrefFor(cursorStack.slice(0, -1)) : null;
  const nextHref = hasNextPage && nextCursor ? hrefFor([...cursorStack, nextCursor]) : null;

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Showing {rangeStart}-{rangeEnd} of {totalCount}
      </p>
      <div className="flex gap-2">
        {previousHref ? (
          <Link
            href={previousHref}
            className="font-label-md text-label-md text-secondary border border-secondary px-4 py-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            Previous
          </Link>
        ) : (
          <span className="font-label-md text-label-md text-on-surface-variant/40 border border-surface-variant px-4 py-2 rounded-lg cursor-not-allowed">
            Previous
          </span>
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="font-label-md text-label-md text-secondary border border-secondary px-4 py-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            Next
          </Link>
        ) : (
          <span className="font-label-md text-label-md text-on-surface-variant/40 border border-surface-variant px-4 py-2 rounded-lg cursor-not-allowed">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
