import { Timestamp } from "firebase-admin/firestore";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

/**
 * Cursor-based pagination shared by every admin/tutor list page
 * (TRD NFR-008: "Common search and list operations shall be paginated
 * and indexed" — performance-engineering skill). Firestore paginates by
 * cursor (`startAfter`), not numeric offset, so "page N" is represented
 * as a stack of cursor tokens (one per prior page) — encoded in the URL
 * as `?cursors=tok1,tok2,...` so pages stay server-rendered and
 * bookmarkable, with no client JS required for basic navigation.
 *
 * A cursor token is `${sortValueMillis}_${docId}` — both are known from
 * the previous page's last item, so each page fetch needs exactly one
 * query (no extra round trip to "find" a boundary document).
 *
 * `DEFAULT_PAGE_SIZE` itself lives in src/lib/pagination.ts (no Firebase
 * imports) and is re-exported here — some client components need the
 * constant without pulling in this file's `firebase-admin/firestore`
 * import, which breaks the browser build (Node-only APIs).
 */

export { DEFAULT_PAGE_SIZE };

export interface PageResult<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  /** Cursor token for this page's last item — append it to the URL's cursor stack to request the next page. */
  nextCursor: string | null;
}

function encodeCursor(sortValue: FirebaseFirestore.Timestamp, docId: string): string {
  return `${sortValue.toMillis()}_${docId}`;
}

function decodeCursor(token: string): { millis: number; docId: string } | null {
  const [millisRaw, docId] = token.split("_");
  const millis = Number(millisRaw);
  if (!docId || !Number.isFinite(millis)) return null;
  return { millis, docId };
}

/**
 * Runs `baseQuery` for one page, ordered by `sortField` (a Timestamp
 * field) descending, tie-broken by document ID. Fetches `pageSize + 1`
 * rows to detect `hasNextPage` without a second round trip, plus a
 * separate `.count()` aggregation (cheap — does not read documents) for
 * the total shown in "X of Z".
 */
export async function fetchPage<T>(
  baseQuery: FirebaseFirestore.Query<T>,
  sortField: string,
  cursorToken: string | null,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<PageResult<T>> {
  let ordered = baseQuery.orderBy(sortField, "desc").orderBy("__name__", "desc");

  const decoded = cursorToken ? decodeCursor(cursorToken) : null;
  if (decoded) {
    ordered = ordered.startAfter(Timestamp.fromMillis(decoded.millis), decoded.docId);
  }

  const [countSnap, pageSnap] = await Promise.all([baseQuery.count().get(), ordered.limit(pageSize + 1).get()]);

  const docs = pageSnap.docs;
  const hasNextPage = docs.length > pageSize;
  const pageDocs = hasNextPage ? docs.slice(0, pageSize) : docs;
  const lastDoc = pageDocs[pageDocs.length - 1];
  const lastSortValue = lastDoc?.get(sortField) as FirebaseFirestore.Timestamp | undefined;

  return {
    items: pageDocs.map((d) => d.data()),
    totalCount: countSnap.data().count,
    hasNextPage,
    nextCursor: lastDoc && lastSortValue ? encodeCursor(lastSortValue, lastDoc.id) : null,
  };
}

/** Parses the `?cursors=tok1,tok2` URL param into a cursor stack. */
export function parseCursorStack(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(",").filter(Boolean);
}

/** The cursor to pass to fetchPage for the CURRENT page (top of the stack) — null for page 1. */
export function currentCursor(stack: string[]): string | null {
  return stack.length > 0 ? stack[stack.length - 1]! : null;
}
