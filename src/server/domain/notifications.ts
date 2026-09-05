import { FieldValue } from "firebase-admin/firestore";
import { notificationsCollection, userAccountsCollection } from "./collections";

export interface CreateNotificationInput {
  recipientUserId: string;
  type: string;
  title: string;
  body: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

/**
 * Creates a durable in-app notification (notification-engineering skill:
 * in-app storage is the source of truth; no external channel yet).
 *
 * Callers should invoke this *after* the underlying business transaction
 * has committed, and treat a failure here as non-fatal to that
 * transaction (log/ignore) unless the caller has a specific reason to
 * surface it — a failed notification must never roll back an approval,
 * assignment, etc.
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  const ref = notificationsCollection().doc();
  await ref.set({
    id: ref.id,
    recipientUserId: input.recipientUserId,
    type: input.type,
    title: input.title,
    body: input.body,
    relatedEntityType: input.relatedEntityType ?? null,
    relatedEntityId: input.relatedEntityId ?? null,
    readAt: null,
    createdAt: FieldValue.serverTimestamp(),
  } as never);
}

/**
 * Fans a notification out to the admins responsible for `branchId` — the
 * assigned Branch Admins, or every Super Admin when `branchId` is null
 * (unrouted, per branch-routing.ts). Shared by any admin-facing event
 * (new tutor submission, new tuition request, ...) so branch-routing
 * fan-out logic lives in exactly one place.
 */
export async function notifyAdminsForBranch(
  branchId: string | null,
  notification: Omit<CreateNotificationInput, "recipientUserId">,
): Promise<void> {
  const query = branchId
    ? userAccountsCollection().where("role", "==", "BRANCH_ADMIN").where("branchId", "==", branchId)
    : userAccountsCollection().where("role", "==", "SUPER_ADMIN");

  const snap = await query.get();
  await Promise.all(
    snap.docs.map((doc) => createNotification({ ...notification, recipientUserId: doc.id })),
  );
}

/**
 * Fans a notification out to every admin, regardless of branch — for
 * events that genuinely aren't branch-specific (a general Contact Us
 * enquiry). Deliberately separate from notifyAdminsForBranch(null,...),
 * which only reaches Super Admins, not Branch Admins.
 */
export async function notifyAllAdmins(notification: Omit<CreateNotificationInput, "recipientUserId">): Promise<void> {
  const snap = await userAccountsCollection().where("role", "in", ["SUPER_ADMIN", "BRANCH_ADMIN"]).get();
  await Promise.all(
    snap.docs.map((doc) => createNotification({ ...notification, recipientUserId: doc.id })),
  );
}
