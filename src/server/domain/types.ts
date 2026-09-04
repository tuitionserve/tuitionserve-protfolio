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
