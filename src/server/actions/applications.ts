"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { assertBranchScope, requireActiveTutor, requireRole } from "@/server/auth/guards";
import {
  tuitionRequestsCollection,
  tutorApplicationsCollection,
  tutorDocumentsCollection,
  tutorProfilesCollection,
} from "@/server/domain/collections";
import { generateSequentialUid } from "@/server/domain/ids";
import { writeAuditEvent } from "@/server/domain/audit";
import { notifyAdminsForBranch } from "@/server/domain/notifications";
import { getSignedDownloadUrl } from "@/server/domain/documents";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Applies the current tutor to an open tuition. Atomic: re-checks the
 * tuition is still OPEN and no active (APPLIED) application already
 * exists for this tutor+tuition inside the same transaction (PRD
 * APP-001, tuition-workflow skill: "A tutor must not apply twice to the
 * same active opportunity" / "Apply to a closed tuition" adversarial
 * case). Freezes a snapshot of the tutor's current profile + CV
 * reference — later profile/CV changes must never alter this record
 * (domain-data-integrity skill: snapshot principle).
 */
export async function applyToOpportunity(tuitionId: string): Promise<ActionResult> {
  const session = await requireActiveTutor();
  if (!session.tutor) return { ok: false, error: "Tutor record not found." };
  if (session.tutor.verificationStatus !== "APPROVED") {
    return { ok: false, error: "Only verified tutors can apply to tuitions." };
  }

  const profileSnap = await tutorProfilesCollection().doc(session.uid).get();
  const profile = profileSnap.data();
  if (!profile) return { ok: false, error: "Complete your profile before applying." };

  const tuitionRef = tuitionRequestsCollection().doc(tuitionId);
  const applicationRef = tutorApplicationsCollection().doc();
  const now = FieldValue.serverTimestamp();

  const result = await adminFirestore.runTransaction(async (tx) => {
    const [tuitionSnap, existingSnap] = await Promise.all([
      tx.get(tuitionRef),
      tx.get(
        tutorApplicationsCollection()
          .where("tuitionId", "==", tuitionId)
          .where("tutorId", "==", session.uid)
          .where("status", "==", "APPLIED"),
      ),
    ]);

    const tuition = tuitionSnap.data();
    if (!tuition || tuition.status !== "OPEN") {
      return { ok: false as const, error: "This tuition is no longer accepting applications." };
    }
    if (!existingSnap.empty) {
      return { ok: false as const, error: "You have already applied to this tuition." };
    }

    tx.set(applicationRef, {
      id: applicationRef.id,
      applicationUid: "", // filled in after the transaction (UID generation is its own transaction)
      tuitionId,
      tutorId: session.uid,
      branchId: tuition.branchId,
      status: "APPLIED",
      appliedAt: now,
      withdrawnAt: null,
      withdrawalReason: null,
      selectedAt: null,
      cvDocumentId: profile.cvDocumentId,
      viewedByAdminAt: null,
      snapshot: {
        tutorUid: session.tutor!.tutorUid,
        fullName: profile.fullName,
        highestQualification: profile.highestQualification,
        institution: profile.institution,
        majorSubject: profile.majorSubject,
        subjects: profile.subjects,
        grades: profile.grades,
        teachingExperienceSummary: profile.teachingExperienceSummary,
        preferredLocality: profile.preferredLocality,
        availability: profile.availability,
        expectedMonthlyFee: profile.expectedMonthlyFee,
        capturedAt: now,
      },
      createdAt: now,
      updatedAt: now,
    });

    return { ok: true as const, branchId: tuition.branchId };
  });

  if (!result.ok) return result;

  const applicationUid = await generateSequentialUid("application");
  await applicationRef.update({ applicationUid });

  await writeAuditEvent({
    action: "APPLICATION_CREATED",
    actorUserId: session.uid,
    actorRole: "TUTOR",
    targetType: "TutorApplication",
    targetId: applicationRef.id,
    metadata: { tuitionId, applicationUid },
  });

  await notifyAdminsForBranch(result.branchId, {
    type: "NEW_APPLICATION",
    title: "New tutor application",
    body: `${session.tutor.tutorUid} applied to a tuition (${applicationUid}).`,
    relatedEntityType: "TutorApplication",
    relatedEntityId: applicationRef.id,
  });

  return { ok: true };
}

/** Pre-selection withdrawal only — post-assignment withdrawal is a separate M11 flow requiring admin approval. */
export async function withdrawApplication(applicationId: string): Promise<ActionResult> {
  const session = await requireActiveTutor();
  const ref = tutorApplicationsCollection().doc(applicationId);

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const application = snap.data();
    if (!application || application.tutorId !== session.uid) {
      return { ok: false as const, error: "Application not found." };
    }
    if (application.status !== "APPLIED") {
      return { ok: false as const, error: "This application can no longer be withdrawn." };
    }
    tx.update(ref, {
      status: "WITHDRAWN",
      withdrawnAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true as const };
  });

  if (!result.ok) return result;

  await writeAuditEvent({
    action: "APPLICATION_WITHDRAWN",
    actorUserId: session.uid,
    actorRole: "TUTOR",
    targetType: "TutorApplication",
    targetId: applicationId,
    metadata: {},
  });

  return { ok: true };
}

/** Admin-side read of applicants for one tuition, branch-scoped. Selection/assignment is a separate milestone (M10). */
export async function requireAdminForTuition(tuitionId: string) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const tuitionSnap = await tuitionRequestsCollection().doc(tuitionId).get();
  if (!tuitionSnap.exists) throw new Error("Tuition not found.");
  const tuition = tuitionSnap.data()!;
  assertBranchScope(session, tuition.branchId);
  return { session, tuition };
}

/** Re-checks branch scope (via the application's tuition) before minting a short-lived CV download link. */
export async function getApplicationCvUrl(applicationId: string): Promise<{ url: string } | { error: string }> {
  const applicationSnap = await tutorApplicationsCollection().doc(applicationId).get();
  if (!applicationSnap.exists) return { error: "Application not found." };
  const application = applicationSnap.data()!;

  await requireAdminForTuition(application.tuitionId); // throws on missing/out-of-scope tuition.

  if (!application.cvDocumentId) return { error: "No CV on file for this application." };
  const docSnap = await tutorDocumentsCollection().doc(application.cvDocumentId).get();
  if (!docSnap.exists || docSnap.data()?.tutorId !== application.tutorId) {
    return { error: "CV not found." };
  }

  const url = await getSignedDownloadUrl(docSnap.data()!.storagePath);
  return { url };
}
