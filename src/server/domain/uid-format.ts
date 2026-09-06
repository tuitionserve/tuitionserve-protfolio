/**
 * Product-facing identifier prefixes (domain model doc, section 22).
 * These are separate from Firestore document IDs and from the Firebase
 * Auth provider UID — never expose the provider UID as a public identifier.
 * Pure/no dependencies so it can be unit tested without Firebase.
 */
export const UID_PREFIXES = {
  tutor: "TS-T-",
  admin: "TS-A-",
  branch: "TS-B-",
  tuition: "TS-TU-",
  application: "TS-APP-",
  assignment: "TS-ASG-",
  profileChange: "TS-PC-",
  conversation: "TS-CONV-",
  parent: "TS-P-",
  contactQuery: "TS-CQ-",
  schoolContactQuery: "TS-SC-",
} as const;

export type UidKind = keyof typeof UID_PREFIXES;

export function formatUid(kind: UidKind, sequence: number, pad = 6): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error(`UID sequence must be a positive integer, got ${sequence}`);
  }
  return `${UID_PREFIXES[kind]}${String(sequence).padStart(pad, "0")}`;
}
