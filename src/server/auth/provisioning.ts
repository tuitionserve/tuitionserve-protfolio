import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { tutorProfilesCollection, tutorsCollection, userAccountsCollection } from "@/server/domain/collections";
import { generateSequentialUid } from "@/server/domain/ids";
import { writeAuditEvent } from "@/server/domain/audit";
import type { AuthSession } from "./session";

export class AccountRoleConflictError extends Error {
  constructor() {
    super("This account is already registered with a different role.");
    this.name = "AccountRoleConflictError";
  }
}

/**
 * Idempotently provisions the UserAccount + Tutor records for a Firebase
 * Auth identity the first time it signs in through the tutor entry point
 * (email/password or Google). Public signup never creates admin accounts
 * (PRD AUTH-003) — Super Admin / Branch Admin accounts are provisioned out
 * of band via scripts/provision-admin.ts.
 */
export async function ensureTutorAccount(params: {
  uid: string;
  email: string | null;
  /** Collected at registration (or from Google's own profile) so the
   * dashboard has a name to show before onboarding creates a full
   * TutorProfile — see the fullName Row in that flow. */
  fullName?: string;
}): Promise<AuthSession> {
  const { uid, email, fullName } = params;
  const accountRef = userAccountsCollection().doc(uid);
  const tutorRef = tutorsCollection().doc(uid);

  const result = await adminFirestore.runTransaction(async (tx) => {
    const [accountSnap, tutorSnap] = await Promise.all([tx.get(accountRef), tx.get(tutorRef)]);

    if (accountSnap.exists) {
      const account = accountSnap.data()!;
      if (account.role !== "TUTOR") {
        throw new AccountRoleConflictError();
      }
      const tutor = tutorSnap.exists ? tutorSnap.data()! : null;
      return { account, tutor, created: false as const };
    }

    // New tutor identity: reserve a stable, immutable Tutor UID and create
    // both records together so a partial failure cannot leave one without
    // the other.
    return { pendingCreate: true as const };
  });

  if (!("pendingCreate" in result)) {
    return {
      uid,
      email: result.account.email,
      role: result.account.role,
      branchId: result.account.branchId,
      accountStatus: result.account.accountStatus,
      tutor: result.tutor,
    };
  }

  const tutorUid = await generateSequentialUid("tutor");
  const now = FieldValue.serverTimestamp();
  const profileRef = tutorProfilesCollection().doc(uid);

  await adminFirestore.runTransaction(async (tx) => {
    const accountSnap = await tx.get(accountRef);
    if (accountSnap.exists) return; // lost a race with another concurrent request; nothing to do.

    if (fullName) {
      // A minimal profile doc so the dashboard shows a real name right
      // away — the onboarding wizard's mergeProfile fills in the rest
      // later without overwriting this.
      tx.set(profileRef, { tutorId: uid, fullName, updatedAt: now } as never, { merge: true });
    }

    tx.set(accountRef, {
      id: uid,
      authProviderUid: uid,
      email,
      role: "TUTOR",
      branchId: null,
      accountStatus: "ACTIVE",
      fullName: null,
      adminUid: null,
      createdAt: now,
      updatedAt: now,
    });

    tx.set(tutorRef, {
      id: uid,
      tutorUid,
      userAccountId: uid,
      branchId: null,
      verificationStatus: "PROFILE_INCOMPLETE",
      rejectionReason: null,
      suspensionReason: null,
      suspendedAt: null,
      reactivatedAt: null,
      approvalBannerSeenAt: null,
      submittedAt: null,
      approvedAt: null,
      reviewedBy: null,
      createdAt: now,
      updatedAt: now,
    });
  });

  await writeAuditEvent({
    action: "TUTOR_ACCOUNT_CREATED",
    actorUserId: uid,
    actorRole: "TUTOR",
    targetType: "Tutor",
    targetId: uid,
    metadata: { tutorUid },
  });

  const [accountSnap, tutorSnap] = await Promise.all([accountRef.get(), tutorRef.get()]);
  const account = accountSnap.data()!;
  const tutor = tutorSnap.data()!;

  return {
    uid,
    email: account.email,
    role: account.role,
    branchId: account.branchId,
    accountStatus: account.accountStatus,
    tutor,
  };
}
