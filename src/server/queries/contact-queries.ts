import { FieldValue } from "firebase-admin/firestore";
import { requireRole } from "@/server/auth/guards";
import { contactQueriesCollection } from "@/server/domain/collections";
import { fetchPage, type PageResult } from "@/server/domain/pagination";
import type { ContactQuery } from "@/server/domain/types";

/** Client-safe view — excludes the Firestore Timestamp field. */
export interface ContactQueryView {
  id: string;
  queryUid: string;
  fullName: string;
  email: string;
  phone: string | null;
  location: string;
  message: string;
  /** True until the detail page is opened — same read/unread idea as an inbox, but the flip happens on open now that the list only shows a preview. */
  isNew: boolean;
}

function toView(q: ContactQuery): ContactQueryView {
  return {
    id: q.id,
    queryUid: q.queryUid,
    fullName: q.fullName,
    email: q.email,
    phone: q.phone,
    location: q.location,
    message: q.message,
    isNew: q.viewedByAdminAt === null,
  };
}

/**
 * Every Contact Us submission, newest first — not branch-scoped (a
 * general enquiry isn't tied to one branch), so every admin sees the
 * same list regardless of role. Read state now flips when the detail
 * page is opened (getContactQueryDetail), not just by appearing here,
 * since the list only shows a truncated preview.
 */
export async function getContactQueries(cursor: string | null): Promise<PageResult<ContactQueryView>> {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const page = await fetchPage(contactQueriesCollection(), "createdAt", cursor);
  return { ...page, items: page.items.map(toView) };
}

/** Single query's full detail — marks it viewed on open (mail-client style). */
export async function getContactQueryDetail(id: string): Promise<ContactQueryView | null> {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const ref = contactQueriesCollection().doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  const wasUnread = data.viewedByAdminAt === null;
  if (wasUnread) {
    await ref.update({ viewedByAdminAt: FieldValue.serverTimestamp() });
  }
  return { ...toView(data), isNew: wasUnread };
}

/** Cheap aggregation (no document reads) for the sidebar badge. */
export async function countUnreadContactQueries(): Promise<number> {
  const snap = await contactQueriesCollection().where("viewedByAdminAt", "==", null).count().get();
  return snap.data().count;
}
