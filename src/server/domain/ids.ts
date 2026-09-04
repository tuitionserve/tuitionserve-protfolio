import { adminFirestore } from "@/lib/firebase/admin";
import { countersCollection } from "./collections";
import { formatUid, type UidKind } from "./uid-format";

export { UID_PREFIXES } from "./uid-format";
export type { UidKind } from "./uid-format";

/**
 * Generates a stable, unique, human-readable UID (e.g. TS-T-000127) using a
 * Firestore transaction over a per-kind counter document, so concurrent
 * requests cannot be assigned the same number (TRD section 13).
 */
export async function generateSequentialUid(kind: UidKind, pad = 6): Promise<string> {
  const counterRef = countersCollection().doc(kind);

  const next = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists ? snap.data()!.value : 0;
    const value = current + 1;
    tx.set(counterRef, { value }, { merge: true });
    return value;
  });

  return formatUid(kind, next, pad);
}
