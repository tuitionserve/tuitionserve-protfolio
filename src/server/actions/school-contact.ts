"use server";

import { FieldValue } from "firebase-admin/firestore";
import { schoolContactQueriesCollection } from "@/server/domain/collections";
import { schoolContactQuerySchema } from "@/server/domain/school-contact-schema";
import { generateSequentialUid } from "@/server/domain/ids";
import { writeAuditEvent } from "@/server/domain/audit";
import { notifyAllAdmins } from "@/server/domain/notifications";
import { fieldErrorsFrom } from "@/server/actions/action-utils";

export type ActionResult =
  | { ok: true; queryUid: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Shared by the public form below and the admin-initiated "post a school enquiry manually" action. */
export async function createSchoolContactQueryFromParsedData(
  data: import("zod").infer<typeof schoolContactQuerySchema>,
  actor: { userId: string | null; role: "SYSTEM" | "SUPER_ADMIN" | "BRANCH_ADMIN" },
): Promise<ActionResult> {
  const now = FieldValue.serverTimestamp();
  const ref = schoolContactQueriesCollection().doc();
  await ref.set({
    id: ref.id,
    queryUid: "", // filled in after the transaction-free write below (UID generation is its own transaction)
    institutionName: data.institutionName,
    contactPersonName: data.contactPersonName,
    email: data.email || null,
    phone: data.phone,
    location: data.location,
    message: data.message,
    viewedByAdminAt: null,
    createdAt: now,
  } as never);

  const queryUid = await generateSequentialUid("schoolContactQuery");
  await ref.update({ queryUid });

  await writeAuditEvent({
    action: "SCHOOL_CONTACT_QUERY_SUBMITTED",
    actorUserId: actor.userId,
    actorRole: actor.role,
    targetType: "SchoolContactQuery",
    targetId: ref.id,
    metadata: { queryUid },
  });

  await notifyAllAdmins({
    type: "NEW_SCHOOL_CONTACT_QUERY",
    title: "New school partnership enquiry",
    body: `${data.institutionName} sent a message via For Schools (${queryUid}).`,
    relatedEntityType: "SchoolContactQuery",
    relatedEntityId: ref.id,
  });

  return { ok: true, queryUid };
}

/** Public submission — no authentication, anyone can reach the For Schools contact form. */
export async function submitSchoolContactQuery(formData: FormData): Promise<ActionResult> {
  const parsed = schoolContactQuerySchema.safeParse({
    institutionName: formData.get("institutionName"),
    contactPersonName: formData.get("contactPersonName"),
    email: formData.get("email") || null,
    phone: formData.get("phone"),
    location: formData.get("location"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  return createSchoolContactQueryFromParsedData(parsed.data, { userId: null, role: "SYSTEM" });
}
