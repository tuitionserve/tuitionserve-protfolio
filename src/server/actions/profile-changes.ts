"use server";

import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { assertBranchScope, requireRole } from "@/server/auth/guards";
import {
  tutorProfileChangeRequestsCollection,
  tutorProfilesCollection,
  tutorsCollection,
} from "@/server/domain/collections";
import { uploadTutorDocument, InvalidDocumentError } from "@/server/domain/documents";
import { generateSequentialUid } from "@/server/domain/ids";
import { writeAuditEvent } from "@/server/domain/audit";
import { createNotification, notifyAdminsForBranch } from "@/server/domain/notifications";
import { fetchPage, type PageResult } from "@/server/domain/pagination";
import { GRADES, QUALIFICATIONS, SUBJECTS } from "@/lib/catalog";
import type { AuthSession } from "@/server/auth/session";
import type { TutorProfile, TutorProfileChangeRequest } from "@/server/domain/types";
import { resolveBranchScope } from "@/server/domain/branch-scope";

/** Client-safe view — excludes Firestore Timestamp fields. */
export interface ChangeRequestView {
  id: string;
  changeUid: string;
  status: TutorProfileChangeRequest["status"];
  proposedChanges: TutorProfileChangeRequest["proposedChanges"];
  rejectionReason: string | null;
}

function toChangeRequestView(r: TutorProfileChangeRequest): ChangeRequestView {
  return {
    id: r.id,
    changeUid: r.changeUid,
    status: r.status,
    proposedChanges: r.proposedChanges,
    rejectionReason: r.rejectionReason,
  };
}

/** For the tutor's own profile page — do they already have a request awaiting review? */
export async function getMyPendingChangeRequest(): Promise<ChangeRequestView | null> {
  const session = await requireRole(["TUTOR"]);
  const snap = await tutorProfileChangeRequestsCollection()
    .where("tutorId", "==", session.uid)
    .where("status", "==", "PENDING")
    .limit(1)
    .get();
  return snap.empty ? null : toChangeRequestView(snap.docs[0]!.data());
}

/** For the admin tutor-detail page — caller must already have verified branch scope on the tutor. */
export async function getPendingChangeRequestForTutor(tutorId: string): Promise<ChangeRequestView | null> {
  const snap = await tutorProfileChangeRequestsCollection()
    .where("tutorId", "==", tutorId)
    .where("status", "==", "PENDING")
    .limit(1)
    .get();
  return snap.empty ? null : toChangeRequestView(snap.docs[0]!.data());
}

export interface PendingChangeRequestRow {
  request: ChangeRequestView;
  tutorId: string;
  tutorUid: string;
  tutorName: string | null;
}

/**
 * Branch-scoped overview of every pending profile change request — the
 * per-tutor detail page above is where an admin actually acts on one;
 * this is the "anything waiting on me?" list, same role as Tutor
 * Reviews plays for verification.
 */
export async function getAllPendingChangeRequests(
  session: AuthSession,
  cursor: string | null,
  branchFilter: string | null = null,
): Promise<PageResult<PendingChangeRequestRow>> {
  const scope = resolveBranchScope(session, branchFilter);
  const base = scope
    ? tutorProfileChangeRequestsCollection().where("branchId", "==", scope).where("status", "==", "PENDING")
    : tutorProfileChangeRequestsCollection().where("status", "==", "PENDING");
  const page = await fetchPage(base, "requestedAt", cursor);

  const tutorSnaps = await Promise.all(page.items.map((r) => tutorsCollection().doc(r.tutorId).get()));
  const profileSnaps = await Promise.all(page.items.map((r) => tutorProfilesCollection().doc(r.tutorId).get()));
  const items = page.items.map((r, i) => ({
    request: toChangeRequestView(r),
    tutorId: r.tutorId,
    tutorUid: tutorSnaps[i]?.data()?.tutorUid ?? "—",
    tutorName: profileSnaps[i]?.data()?.fullName ?? null,
  }));

  return { ...page, items };
}

export type ActionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Once a tutor is APPROVED, an admin has already vetted their profile —
 * most fields freeze at that point and can only change via a reviewed
 * TutorProfileChangeRequest (see requireEditableTutorSession in
 * onboarding.ts, which blocks the normal wizard once APPROVED). Photo
 * and teaching-experience summary are the exception: low-stakes,
 * frequently-updated fields that don't need re-vetting.
 */

async function requireApprovedTutorSession() {
  const session = await requireRole(["TUTOR"]);
  if (!session.tutor) throw new Error("Tutor record missing for an authenticated tutor session.");
  if (session.tutor.verificationStatus === "SUSPENDED") {
    throw new Error("Suspended accounts cannot make profile changes.");
  }
  return session;
}

/** Freely editable regardless of verification status (besides SUSPENDED): photo and experience summary. */
export async function updateFreeEditFields(formData: FormData): Promise<ActionResult> {
  const session = await requireApprovedTutorSession();

  const patch: Partial<TutorProfile> = {};

  const experience = formData.get("teachingExperienceSummary");
  if (typeof experience === "string") {
    patch.teachingExperienceSummary = experience.trim() || null;
  }

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      const doc = await uploadTutorDocument({
        tutorId: session.uid,
        documentType: "PROFILE_PHOTO",
        buffer: Buffer.from(await photo.arrayBuffer()),
        mimeType: photo.type,
        originalFileName: photo.name,
      });
      patch.profilePhotoDocumentId = doc.id;
    } catch (error) {
      if (error instanceof InvalidDocumentError) return { ok: false, error: error.message };
      throw error;
    }
  }

  if (Object.keys(patch).length === 0) return { ok: true };

  await tutorProfilesCollection()
    .doc(session.uid)
    .set({ ...patch, updatedAt: FieldValue.serverTimestamp() } as never, { merge: true });

  return { ok: true };
}

const changeRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(20),
  address: z.string().trim().min(3).max(300),
  highestQualification: z.enum(QUALIFICATIONS.map((q) => q.id) as [string, ...string[]]),
  institution: z.string().trim().min(2).max(200),
  majorSubject: z.string().trim().min(2).max(120),
  currentProgram: z.string().trim().max(200).nullable(),
  currentYearOrSemester: z.string().trim().max(50).nullable(),
  subjects: z.array(z.enum(SUBJECTS.map((s) => s.id) as [string, ...string[]])).min(1),
  grades: z.array(z.enum(GRADES.map((g) => g.id) as [string, ...string[]])).min(1),
  expectedMonthlyFee: z.coerce.number().int().positive(),
  preferredLocality: z.string().trim().min(2).max(120),
});

/**
 * An APPROVED tutor's proposed edit to the fields locked behind
 * re-approval. Held as a PENDING request rather than applied
 * immediately — see reviewProfileChangeRequest for the admin side.
 * (graduationYear/preferredLocationId/availability/cvDocumentId are
 * intentionally out of scope for this first version of advanced edit —
 * the highest-churn fields are covered; the rest can follow the same
 * pattern if needed.)
 */
export async function submitProfileChangeRequest(formData: FormData): Promise<ActionResult> {
  const session = await requireApprovedTutorSession();
  if (session.tutor!.verificationStatus !== "APPROVED") {
    return { ok: false, error: "Advanced edit is only for already-approved profiles." };
  }

  const existingPending = await tutorProfileChangeRequestsCollection()
    .where("tutorId", "==", session.uid)
    .where("status", "==", "PENDING")
    .limit(1)
    .get();
  if (!existingPending.empty) {
    return { ok: false, error: "You already have a pending change request awaiting review." };
  }

  const parsed = changeRequestSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    highestQualification: formData.get("highestQualification"),
    institution: formData.get("institution"),
    majorSubject: formData.get("majorSubject"),
    currentProgram: formData.get("currentProgram") || null,
    currentYearOrSemester: formData.get("currentYearOrSemester") || null,
    subjects: formData.getAll("subjects"),
    grades: formData.getAll("grades"),
    expectedMonthlyFee: formData.get("expectedMonthlyFee"),
    preferredLocality: formData.get("preferredLocality"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const ref = tutorProfileChangeRequestsCollection().doc();
  const now = FieldValue.serverTimestamp();
  await ref.set({
    id: ref.id,
    changeUid: "",
    tutorId: session.uid,
    branchId: session.tutor!.branchId,
    status: "PENDING",
    proposedChanges: parsed.data,
    rejectionReason: null,
    requestedAt: now,
    reviewedAt: null,
    reviewedBy: null,
  } as never);

  const changeUid = await generateSequentialUid("profileChange");
  await ref.update({ changeUid });

  await writeAuditEvent({
    action: "PROFILE_CHANGE_REQUESTED",
    actorUserId: session.uid,
    actorRole: "TUTOR",
    targetType: "Tutor",
    targetId: session.uid,
    metadata: { changeRequestId: ref.id, changeUid },
  });

  await notifyAdminsForBranch(session.tutor!.branchId, {
    type: "PROFILE_CHANGE_REQUESTED",
    title: "Tutor requested a profile change",
    body: `${session.tutor!.tutorUid} requested changes to their approved profile (${changeUid}).`,
    relatedEntityType: "Tutor",
    relatedEntityId: session.uid,
  });

  return { ok: true };
}

/** Admin decides a pending profile change request — approving merges the proposed fields into the live TutorProfile. */
export async function reviewProfileChangeRequest(
  requestId: string,
  decision: "APPROVE" | "REJECT",
  reason?: string,
): Promise<ActionResult> {
  if (decision !== "APPROVE" && decision !== "REJECT") {
    return { ok: false, error: "Invalid decision." };
  }
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const requestRef = tutorProfileChangeRequestsCollection().doc(requestId);
  const requestSnap = await requestRef.get();
  if (!requestSnap.exists) return { ok: false, error: "Change request not found." };
  const request = requestSnap.data()!;

  const tutorSnap = await tutorsCollection().doc(request.tutorId).get();
  if (!tutorSnap.exists) return { ok: false, error: "Tutor not found." };
  try {
    assertBranchScope(session, tutorSnap.data()!.branchId);
  } catch {
    return { ok: false, error: "You are not authorized to review this request." };
  }

  const now = FieldValue.serverTimestamp();
  const result = await adminFirestore.runTransaction(async (tx) => {
    const freshSnap = await tx.get(requestRef);
    const fresh = freshSnap.data();
    if (!fresh || fresh.status !== "PENDING") {
      return { ok: false as const, error: "This request has already been reviewed." };
    }

    tx.update(requestRef, {
      status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
      rejectionReason: decision === "REJECT" ? (reason ?? null) : null,
      reviewedAt: now,
      reviewedBy: session.uid,
    });

    if (decision === "APPROVE") {
      const profileRef = tutorProfilesCollection().doc(fresh.tutorId);
      tx.set(profileRef, { ...fresh.proposedChanges, updatedAt: now } as never, { merge: true });
    }

    return { ok: true as const };
  });
  if (!result.ok) return result;

  await writeAuditEvent({
    action: decision === "APPROVE" ? "PROFILE_CHANGE_APPROVED" : "PROFILE_CHANGE_REJECTED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "Tutor",
    targetId: request.tutorId,
    metadata: { changeRequestId: requestId, changeUid: request.changeUid },
  });

  await createNotification({
    recipientUserId: request.tutorId,
    type: decision === "APPROVE" ? "PROFILE_CHANGE_APPROVED" : "PROFILE_CHANGE_REJECTED",
    title: decision === "APPROVE" ? "Your profile change was approved" : "Your profile change was declined",
    body:
      decision === "APPROVE"
        ? `Your requested changes (${request.changeUid}) are now live on your profile.`
        : `Your requested changes (${request.changeUid}) were declined.${reason ? ` Reason: ${reason}` : ""}`,
    relatedEntityType: "Tutor",
    relatedEntityId: request.tutorId,
  });

  return { ok: true };
}
