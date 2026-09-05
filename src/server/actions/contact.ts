"use server";

import { FieldValue } from "firebase-admin/firestore";
import { contactQueriesCollection } from "@/server/domain/collections";
import { contactQuerySchema } from "@/server/domain/contact-schema";
import { generateSequentialUid } from "@/server/domain/ids";
import { writeAuditEvent } from "@/server/domain/audit";
import { notifyAllAdmins } from "@/server/domain/notifications";

export type ActionResult =
  | { ok: true; queryUid: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fieldErrorsFrom(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Public submission — no authentication, anyone can reach the Contact Us form. */
export async function submitContactQuery(formData: FormData): Promise<ActionResult> {
  const parsed = contactQuerySchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || null,
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const data = parsed.data;

  const now = FieldValue.serverTimestamp();
  const ref = contactQueriesCollection().doc();
  await ref.set({
    id: ref.id,
    queryUid: "", // filled in after the transaction-free write below (UID generation is its own transaction)
    fullName: data.fullName,
    email: data.email,
    phone: data.phone || null,
    message: data.message,
    viewedByAdminAt: null,
    createdAt: now,
  } as never);

  const queryUid = await generateSequentialUid("contactQuery");
  await ref.update({ queryUid });

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
