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
  message: string;
  /** True the first time this query appears in an admin's list — same "flip after this render" pattern as the Applications list. */
  isNew: boolean;
}

function toView(q: ContactQuery): ContactQueryView {
  return {
    id: q.id,
    queryUid: q.queryUid,
    fullName: q.fullName,
    email: q.email,
    phone: q.phone,
    message: q.message,
    isNew: q.viewedByAdminAt === null,
  };
}

/**
 * Every Contact Us submission, newest first — not branch-scoped (a
 * general enquiry isn't tied to one branch), so every admin sees the
 * same list regardless of role. Marks whichever queries land on this
 * page as viewed, so they render bold/new once here, then dim after.
 */
export async function getContactQueries(cursor: string | null): Promise<PageResult<ContactQueryView>> {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const page = await fetchPage(contactQueriesCollection(), "createdAt", cursor);
  const items = page.items.map(toView);

  const unviewedIds = page.items.filter((q) => q.viewedByAdminAt === null).map((q) => q.id);
  if (unviewedIds.length > 0) {
    const batch = contactQueriesCollection().firestore.batch();
    const now = FieldValue.serverTimestamp();
    for (const id of unviewedIds) {
      batch.update(contactQueriesCollection().doc(id), { viewedByAdminAt: now });
    }
    await batch.commit();
  }

  return { ...page, items };
}

/** Cheap aggregation (no document reads) for the sidebar badge. */
export async function countUnreadContactQueries(): Promise<number> {
  const snap = await contactQueriesCollection().where("viewedByAdminAt", "==", null).count().get();
  return snap.data().count;
}
