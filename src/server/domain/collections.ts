import { adminFirestore } from "@/lib/firebase/admin";
import type {
  AuditEvent,
  Branch,
  GeographicLocation,
  Notification,
  Parent,
  Student,
  Tutor,
  TutorDocument,
  TutorProfile,
  TuitionRequest,
  UserAccount,
} from "./types";

function typedCollection<T>(path: string) {
  return adminFirestore.collection(path) as FirebaseFirestore.CollectionReference<T>;
}

export const userAccountsCollection = () => typedCollection<UserAccount>("userAccounts");
export const tutorsCollection = () => typedCollection<Tutor>("tutors");
export const tutorProfilesCollection = () => typedCollection<TutorProfile>("tutorProfiles");
export const tutorDocumentsCollection = () => typedCollection<TutorDocument>("tutorDocuments");
export const geographicLocationsCollection = () =>
  typedCollection<GeographicLocation>("geographicLocations");
export const branchesCollection = () => typedCollection<Branch>("branches");
export const auditEventsCollection = () => typedCollection<AuditEvent>("auditEvents");
export const notificationsCollection = () => typedCollection<Notification>("notifications");
export const parentsCollection = () => typedCollection<Parent>("parents");
export const studentsCollection = () => typedCollection<Student>("students");
export const tuitionRequestsCollection = () => typedCollection<TuitionRequest>("tuitionRequests");
export const countersCollection = () =>
  typedCollection<{ value: number }>("counters");
