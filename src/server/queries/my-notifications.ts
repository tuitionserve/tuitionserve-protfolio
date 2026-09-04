import { notificationsCollection } from "@/server/domain/collections";
import { fetchPage, type PageResult } from "@/server/domain/pagination";

/** Client-safe notification view — no Firestore Timestamp fields (same reasoning as other *View types this session). */
export interface NotificationView {
  id: string;
  type: string;
  title: string;
  body: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  read: boolean;
}

export async function getNotifications(userId: string, cursor: string | null): Promise<PageResult<NotificationView>> {
  const base = notificationsCollection().where("recipientUserId", "==", userId);
  const page = await fetchPage(base, "createdAt", cursor);
  return {
    ...page,
    items: page.items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      relatedEntityType: n.relatedEntityType,
      relatedEntityId: n.relatedEntityId,
      read: n.readAt !== null,
    })),
  };
}

/** Cheap count-only version for header badges/dashboard tiles. */
export async function countUnreadNotifications(userId: string): Promise<number> {
  const snap = await notificationsCollection()
    .where("recipientUserId", "==", userId)
    .where("readAt", "==", null)
    .count()
    .get();
  return snap.data().count;
}
