import { adminFirestore } from "@/lib/firebase/admin";
import type {
  AuditEvent,
  BlogPost,
  Branch,
  ContactQuery,
  SchoolContactQuery,
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
  TutorProfileChangeRequest,
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
export const tutorProfileChangeRequestsCollection = () =>
  typedCollection<TutorProfileChangeRequest>("tutorProfileChangeRequests");
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
export const contactQueriesCollection = () => typedCollection<ContactQuery>("contactQueries");
export const schoolContactQueriesCollection = () => typedCollection<SchoolContactQuery>("schoolContactQueries");
export const blogPostsCollection = () => typedCollection<BlogPost>("blogPosts");
export const countersCollection = () =>
  typedCollection<{ value: number }>("counters");

/**
 * Deduplicates `ids` and fetches existing documents in batches using
 * Firestore `getAll()` rather than N individual `.get()` calls.
 */
export async function fetchDocsByIds<T>(
  collection: FirebaseFirestore.CollectionReference<T>,
  ids: Iterable<string | null | undefined>,
): Promise<Map<string, T>> {
  const uniqueIds = Array.from(new Set(Array.from(ids).filter((id): id is string => Boolean(id))));
  const result = new Map<string, T>();
  if (uniqueIds.length === 0) return result;

  const CHUNK_SIZE = 500;
  for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
    const refs = uniqueIds
      .slice(i, i + CHUNK_SIZE)
      .map((id) => collection.doc(id) as unknown as FirebaseFirestore.DocumentReference);
    const snaps = await adminFirestore.getAll(...refs);
    for (const snap of snaps) {
      if (snap.exists) {
        result.set(snap.id, snap.data() as T);
      }
    }
  }
  return result;
}
