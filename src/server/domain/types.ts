/**
 * Firestore document shapes for the Tuition Serve domain, derived from
 * `docs/05_Tuition_Serve_Domain_Model_and_Database_Schema.md`. Firestore is
 * the database of record (see decision in project memory), accessed only
 * from trusted server code via the Admin SDK.
 */

export type Role = "SUPER_ADMIN" | "BRANCH_ADMIN" | "TUTOR";

export type TutorVerificationStatus =
  | "PROFILE_INCOMPLETE"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "REJECTED"
  | "RESUBMITTED"
  | "APPROVED"
  | "SUSPENDED";

export interface UserAccount {
  id: string; // Firebase Auth UID (provider UID) — document ID.
  authProviderUid: string;
  email: string | null;
  role: Role;
  branchId: string | null; // required for BRANCH_ADMIN, null otherwise.
  accountStatus: "ACTIVE" | "DISABLED";
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Branch {
  id: string;
  branchUid: string; // e.g. TS-B-000001
  name: string;
  city: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Tutor {
  id: string; // same as UserAccount.id (1:1).
  tutorUid: string; // e.g. TS-T-000127 — immutable, public identifier.
  userAccountId: string;
  branchId: string | null;
  verificationStatus: TutorVerificationStatus;
  rejectionReason: string | null;
  suspensionReason: string | null;
  suspendedAt: FirebaseFirestore.Timestamp | null;
  reactivatedAt: FirebaseFirestore.Timestamp | null;
  approvalBannerSeenAt: FirebaseFirestore.Timestamp | null;
  submittedAt: FirebaseFirestore.Timestamp | null;
  approvedAt: FirebaseFirestore.Timestamp | null;
  reviewedBy: string | null;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type HighestQualification =
  | "SEE_SLC"
  | "PLUS_TWO"
  | "BACHELORS"
  | "MASTERS"
  | "MPHIL_PHD"
  | "OTHER";

export interface AvailabilitySlot {
  dayOfWeek: "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
  startTime: string; // "HH:mm", 24h
  endTime: string; // "HH:mm", 24h
}

/**
 * The tutor's current profile data. Kept separate from `Tutor` (identity +
 * lifecycle status) so a future "advanced edit" pending-change record can
 * stage proposed values here without touching the approved copy (PRD
 * section 13 / tutor-lifecycle skill).
 */
export interface TutorProfile {
  tutorId: string; // == Tutor.id, document ID.
  fullName: string | null;
  phone: string | null;
  gender: Gender | null;
  dateOfBirth: string | null; // "YYYY-MM-DD"
  address: string | null;
  profilePhotoDocumentId: string | null;

  highestQualification: HighestQualification | null;
  institution: string | null;
  graduationYear: number | null;
  majorSubject: string | null;

  subjects: string[]; // catalog ids, see domain/catalog.ts
  grades: string[]; // catalog ids
  teachingExperienceSummary: string | null;
  expectedMonthlyFee: number | null;

  preferredLocationId: string | null; // -> geographicLocations
  preferredLocality: string | null; // free-text area/locality within the city

  availability: AvailabilitySlot[];

  cvDocumentId: string | null;

  updatedAt: FirebaseFirestore.Timestamp;
}

export type DocumentType = "CV" | "PROFILE_PHOTO";

export interface TutorDocument {
  id: string;
  tutorId: string;
  documentType: DocumentType;
  storagePath: string; // private Firebase Storage object path.
  fileName: string; // original filename, display-only.
  mimeType: string;
  sizeBytes: number;
  uploadedAt: FirebaseFirestore.Timestamp;
}

/**
 * Provisional/starter geographic reference data (province + major city
 * level only). This is NOT the authoritative Nepal location dataset —
 * that is a dedicated data-engineering milestone (implementation plan M6)
 * sourced from reliable external geographic data. Do not add
 * ward/postal-code/coordinate precision here without real sourcing
 * (location-data-engineering skill).
 */
export interface GeographicLocation {
  id: string;
  level: "PROVINCE" | "CITY";
  name: string;
  parentLocationId: string | null; // CITY -> PROVINCE id; PROVINCE -> null.
}

/**
 * Parents never have accounts (PRD: public form only). `phone` is the
 * matching key used to reuse an existing Parent record across multiple
 * submissions rather than creating a duplicate every time.
 */
export interface Parent {
  id: string;
  parentUid: string; // TS-P-###### — internal reference only, never shown as a login identity.
  fullName: string;
  phone: string;
  email: string | null;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Student {
  id: string;
  parentId: string;
  fullName: string;
  gradeId: string; // catalog id, src/lib/catalog.ts GRADES
  schoolName: string | null;
  createdAt: FirebaseFirestore.Timestamp;
}

export type TuitionRequestStatus =
  | "NEW"
  | "UNDER_REVIEW"
  | "REJECTED"
  | "CONFIRMED"
  | "OPEN"
  | "ASSIGNED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";
// Only NEW/CONFIRMED/REJECTED are reachable in this milestone (M5). OPEN
// onward belong to future milestones (opportunities/assignment) — the
// full union is declared now so the schema doesn't need to change later.

/**
 * A parent's home-tuition request. Location privacy (location-privacy
 * skill) is structural, not just a UI concern: `exactAddress` is the
 * private street address (admin-only — no tutor-facing surface reads this
 * collection yet, but when one exists it must never select this field);
 * `locationId` is the structured city-level reference used for branch
 * routing; `tutorVisibleLocality` is the free-text area name a tutor
 * would eventually see. Keep these three separate — do not collapse them.
 */
export interface TuitionRequest {
  id: string;
  tuitionUid: string; // TS-TU-#####
  branchId: string | null; // resolved via resolveBranchIdForLocation; null = unrouted
  parentId: string;
  studentId: string;
  status: TuitionRequestStatus;
  subjectId: string; // catalog id
  gradeId: string; // catalog id, snapshot of Student.gradeId at request time
  exactAddress: string; // PRIVATE — admin-only, never for a tutor-facing response
  locationId: string; // -> geographicLocations (city-level)
  tutorVisibleLocality: string; // free-text area, e.g. "Devichowk"
  availability: AvailabilitySlot[];
  notes: string | null;
  rejectionReason: string | null;
  confirmedAt: FirebaseFirestore.Timestamp | null;
  rejectedAt: FirebaseFirestore.Timestamp | null;
  reviewedBy: string | null;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface AuditEvent {
  id: string;
  action: string;
  actorUserId: string | null;
  actorRole: Role | "SYSTEM";
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: FirebaseFirestore.Timestamp;
}

/**
 * Durable in-app notification (PRD section 20 / TRD section 21). This is
 * the baseline store only — no external channel adapters yet (M12).
 * `type` is a stable event-name string (e.g. "TUTOR_APPROVED",
 * "TUTOR_REJECTED", "NEW_TUITION_REQUEST") so the UI can map it to an
 * icon/deep-link without parsing free text.
 */
export interface Notification {
  id: string;
  recipientUserId: string;
  type: string;
  title: string;
  body: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  readAt: FirebaseFirestore.Timestamp | null;
  createdAt: FirebaseFirestore.Timestamp;
}
