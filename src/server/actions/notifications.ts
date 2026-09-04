"use server";

import { FieldValue } from "firebase-admin/firestore";
import { requireSession } from "@/server/auth/guards";
import { notificationsCollection } from "@/server/domain/collections";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Marks one notification read — re-verifies the caller owns it (never trust a client-supplied notification id blindly). */
export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  const session = await requireSession();
  const ref = notificationsCollection().doc(notificationId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()!.recipientUserId !== session.uid) {
    return { ok: false, error: "Notification not found." };
  }
  if (snap.data()!.readAt === null) {
    await ref.update({ readAt: FieldValue.serverTimestamp() });
  }
  return { ok: true };
}

/** Marks every unread notification for the caller read — bounded batch (matches other batch-write limits in this codebase). */
export async function markAllNotificationsRead(): Promise<ActionResult> {
  const session = await requireSession();
  const snap = await notificationsCollection()
    .where("recipientUserId", "==", session.uid)
    .where("readAt", "==", null)
    .limit(400)
    .get();

  const batch = notificationsCollection().firestore.batch();
  snap.docs.forEach((d) => batch.update(d.ref, { readAt: FieldValue.serverTimestamp() }));
  await batch.commit();
  return { ok: true };
}
