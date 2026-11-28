"use server";

import { FieldValue } from "firebase-admin/firestore";
import { contactQueriesCollection } from "@/server/domain/collections";
import { contactQuerySchema } from "@/server/domain/contact-schema";
import { generateSequentialUid } from "@/server/domain/ids";
import { writeAuditEvent } from "@/server/domain/audit";
import { notifyAllAdmins } from "@/server/domain/notifications";
import { fieldErrorsFrom } from "@/server/actions/action-utils";
import { checkPublicRateLimit, isHoneypotTriggered } from "@/server/domain/rate-limit";

export type ActionResult =
  | { ok: true; queryUid: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Public submission — no authentication, anyone can reach the Contact Us form. */
export async function submitContactQuery(formData: FormData): Promise<ActionResult> {
  if (isHoneypotTriggered(formData)) {
    return { ok: false, error: "Unable to submit right now. Please try again." };
  }
  const { allowed } = await checkPublicRateLimit("contact-query", 6, 10 * 60 * 1000);
  if (!allowed) {
    return { ok: false, error: "Too many messages sent recently. Please wait a few minutes and try again." };
  }

  const parsed = contactQuerySchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || null,
    location: formData.get("location"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const data = parsed.data;

  const now = FieldValue.serverTimestamp();
  const queryUid = await generateSequentialUid("contactQuery");
  const ref = contactQueriesCollection().doc();
  await ref.set({
    id: ref.id,
    queryUid,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone || null,
    location: data.location,
    message: data.message,
    viewedByAdminAt: null,
    createdAt: now,
  } as never);

  await writeAuditEvent({
    action: "CONTACT_QUERY_SUBMITTED",
    actorUserId: null,
    actorRole: "SYSTEM",
    targetType: "ContactQuery",
    targetId: ref.id,
    metadata: { queryUid },
  });

  await notifyAllAdmins({
    type: "NEW_CONTACT_QUERY",
    title: "New contact enquiry",
    body: `${data.fullName} sent a message via Contact Us (${queryUid}).`,
    relatedEntityType: "ContactQuery",
    relatedEntityId: ref.id,
  });

  return { ok: true, queryUid };
}
