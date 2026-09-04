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
 * Nepal administrative hierarchy: Province -> District -> Local
 * Government -> Ward. Sourced from the Government of Nepal General Post
 * Office's 2025 postal code table (authoritative for name, type, ward
 * count, and postal code) cross-referenced against an open dataset for
 * English names where a clean match exists. See
 * `data/locations/SOURCES.md` for full provenance, licensing, and the
 * exact normalization/matching methodology (implementation plan M6).
 *
 * "CITY" is the M3-era provisional level (~20 hand-picked cities,
 * `src/server/domain/location-seed-data.ts`) — kept until every
 * consumer has migrated to LOCAL_GOVERNMENT and the provisional docs
 * are removed; do not write new "CITY" records.
 *
 * `name` is always the authoritative Nepali name (100% complete).
 * `nameEnglish` is a cross-referenced convenience value — present for
 * provinces/districts (100%) and 445/753 local governments (59%); the
 * UI must fall back to `name` when null, never fabricate one.
 */
export interface GeographicLocation {
  id: string;
  level: "PROVINCE" | "CITY" | "DISTRICT" | "LOCAL_GOVERNMENT" | "WARD";
  name: string;
  nameEnglish: string | null;
  parentLocationId: string | null; // WARD -> LOCAL_GOVERNMENT -> DISTRICT -> PROVINCE -> null.

  // LOCAL_GOVERNMENT only:
  localGovernmentType:
    | "METROPOLITAN_CITY"
    | "SUB_METROPOLITAN_CITY"
    | "MUNICIPALITY"
    | "RURAL_MUNICIPALITY"
    | null;
  wardCount: number | null;

  // WARD only:
  wardNumber: number | null;
  // Official 2025 GPO postal code for this ward
  // ({localGovernmentCode}{wardNumber, 2 digits}). Null at every other
  // level, and never populated by guessing (location-privacy /
  // location-data-engineering skills) — GPO's table is the only postal
  // code source used.
  postalCode: string | null;
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
 * private street address (admin-only — every tutor-facing query/type
 * must omit this field, never just hide it in the UI);
 * `locationId` is the structured ward-level reference used for branch
 * routing; `tutorVisibleLocality` is the free-text area name a tutor
 * sees. Keep these three separate — do not collapse them.
 *
 * `districtId`/`localGovernmentId` are denormalized from `locationId`'s
 * ancestry at submission time (see server/domain/branch-routing.ts's
 * getLocationAncestry) purely so the M7 opportunity browser can filter
 * "Janakpur-wide" without an ancestry walk per candidate tuition
 * (performance-engineering skill) — they are a query-efficiency
 * convenience, not a second source of truth; `locationId` stays
 * authoritative.
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
  locationId: string; // -> geographicLocations (ward-level)
  districtId: string | null; // denormalized ancestor of locationId, for filtering
  localGovernmentId: string | null; // denormalized ancestor of locationId, for filtering
  tutorVisibleLocality: string; // free-text area, e.g. "Devichowk"
  availability: AvailabilitySlot[];
  notes: string | null;
  rejectionReason: string | null;
  confirmedAt: FirebaseFirestore.Timestamp | null;
  rejectedAt: FirebaseFirestore.Timestamp | null;
  reviewedBy: string | null;
  assignedApplicationId: string | null; // -> TutorApplication, set once ASSIGNED (M10)
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export type TutorApplicationStatus = "APPLIED" | "WITHDRAWN" | "SELECTED" | "REJECTED";

/**
 * A tutor's application to one open tuition (PRD section 16, domain
 * model section 13). `snapshot` freezes the tutor-facing profile facts
 * an admin evaluated at application time — later profile edits (direct
 * or advanced-edit-approved) must NEVER retroactively change what an
 * already-submitted application shows (domain-data-integrity /
 * tutor-lifecycle skills: "snapshot principle").
 */
export interface TutorApplication {
  id: string;
  applicationUid: string; // TS-APP-######
  tuitionId: string;
  tutorId: string;
  status: TutorApplicationStatus;
  appliedAt: FirebaseFirestore.Timestamp;
  withdrawnAt: FirebaseFirestore.Timestamp | null;
  withdrawalReason: string | null;
  selectedAt: FirebaseFirestore.Timestamp | null;
  cvDocumentId: string | null; // the CV on file *at application time* — never repointed by a later re-upload.
  snapshot: TutorApplicationSnapshot;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface TutorApplicationSnapshot {
  tutorUid: string;
  fullName: string | null;
  highestQualification: HighestQualification | null;
  institution: string | null;
  majorSubject: string | null;
  subjects: string[];
  grades: string[];
  teachingExperienceSummary: string | null;
  preferredLocality: string | null;
  availability: AvailabilitySlot[];
  expectedMonthlyFee: number | null;
  capturedAt: FirebaseFirestore.Timestamp;
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
