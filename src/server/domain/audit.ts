import { FieldValue } from "firebase-admin/firestore";
import { auditEventsCollection } from "./collections";
import type { Role } from "./types";

export interface WriteAuditEventInput {
  action: string;
  actorUserId: string | null;
  actorRole: Role | "SYSTEM";
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}

/** Records a material domain action (PRD section 27, TRD section 27). */
export async function writeAuditEvent(input: WriteAuditEventInput): Promise<void> {
  const ref = auditEventsCollection().doc();
  await ref.set({
    id: ref.id,
    action: input.action,
    actorUserId: input.actorUserId,
    actorRole: input.actorRole,
    targetType: input.targetType,
    targetId: input.targetId,
    metadata: input.metadata ?? {},
    createdAt: FieldValue.serverTimestamp(),
  } as never);
}
