import { FieldValue } from "firebase-admin/firestore";
import { requireRole } from "@/server/auth/guards";
import { schoolContactQueriesCollection } from "@/server/domain/collections";
import { fetchPage, type PageResult } from "@/server/domain/pagination";
import type { SchoolContactQuery } from "@/server/domain/types";

/** Client-safe view — excludes the Firestore Timestamp field. */
export interface SchoolContactQueryView {
  id: string;
  queryUid: string;
  institutionName: string;
  contactPersonName: string;
  email: string | null;
  phone: string;
  location: string;
  message: string;
  isNew: boolean;
}

function toView(q: SchoolContactQuery): SchoolContactQueryView {
  return {
    id: q.id,
    queryUid: q.queryUid,
    institutionName: q.institutionName,
    contactPersonName: q.contactPersonName,
    email: q.email,
    phone: q.phone,
    location: q.location,
    message: q.message,
    isNew: q.viewedByAdminAt === null,
  };
}

/** Every For Schools submission, newest first — not branch-scoped, same reasoning as the general Contact Queries. */
export async function getSchoolContactQueries(cursor: string | null): Promise<PageResult<SchoolContactQueryView>> {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const page = await fetchPage(schoolContactQueriesCollection(), "createdAt", cursor);
  return { ...page, items: page.items.map(toView) };
}

/** Single query's full detail — marks it viewed on open. */
export async function getSchoolContactQueryDetail(id: string): Promise<SchoolContactQueryView | null> {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const ref = schoolContactQueriesCollection().doc(id);
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
export async function countUnreadSchoolContactQueries(): Promise<number> {
  const snap = await schoolContactQueriesCollection().where("viewedByAdminAt", "==", null).count().get();
  return snap.data().count;
}
