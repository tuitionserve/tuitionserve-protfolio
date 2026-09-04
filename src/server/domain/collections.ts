import { adminFirestore } from "@/lib/firebase/admin";
import type { AuditEvent, Branch, Tutor, UserAccount } from "./types";

function typedCollection<T>(path: string) {
  return adminFirestore.collection(path) as FirebaseFirestore.CollectionReference<T>;
}

export const userAccountsCollection = () => typedCollection<UserAccount>("userAccounts");
export const tutorsCollection = () => typedCollection<Tutor>("tutors");
export const branchesCollection = () => typedCollection<Branch>("branches");
export const auditEventsCollection = () => typedCollection<AuditEvent>("auditEvents");
export const countersCollection = () =>
  typedCollection<{ value: number }>("counters");
