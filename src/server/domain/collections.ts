import { adminFirestore } from "@/lib/firebase/admin";
import type {
  AuditEvent,
  Branch,
  Conversation,
  GeographicLocation,
  Message,
  Notification,
  Parent,
  Student,
  Tutor,
  TutorApplication,
  TutorDocument,
  TutorProfile,
  TuitionAssignment,
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
export const tutorApplicationsCollection = () => typedCollection<TutorApplication>("tutorApplications");
export const tuitionAssignmentsCollection = () => typedCollection<TuitionAssignment>("tuitionAssignments");
export const conversationsCollection = () => typedCollection<Conversation>("conversations");
export const messagesCollection = () => typedCollection<Message>("messages");
export const countersCollection = () =>
  typedCollection<{ value: number }>("counters");
