"use server";

import { FieldValue } from "firebase-admin/firestore";
import { requireRole } from "@/server/auth/guards";
import {
  geographicLocationsCollection,
  tutorProfilesCollection,
  tutorsCollection,
} from "@/server/domain/collections";
import { uploadTutorDocument, InvalidDocumentError } from "@/server/domain/documents";
import { writeAuditEvent } from "@/server/domain/audit";
import { resolveBranchIdForLocation } from "@/server/domain/branch-routing";
import { notifyAdminsForBranch } from "@/server/domain/notifications";
import {
  availabilityStepSchema,
  educationStepSchema,
  locationStepSchema,
  personalStepSchema,
  teachingStepSchema,
} from "@/server/domain/onboarding-schema";
import type { TutorProfile } from "@/server/domain/types";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fieldErrorsFrom(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Only the tutor who owns the profile, and only while it's still editable:
 * before first submission (PROFILE_INCOMPLETE), or after a rejection
 * (REJECTED — PRD: "Rejected tutors can improve and resubmit").
 */
async function requireEditableTutorSession() {
  const session = await requireRole(["TUTOR"]);
  if (!session.tutor) throw new Error("Tutor record missing for an authenticated tutor session.");
  const status = session.tutor.verificationStatus;
  if (status !== "PROFILE_INCOMPLETE" && status !== "REJECTED") {
    return { session, editable: false as const };
  }
  return { session, editable: true as const };
}

async function mergeProfile(tutorId: string, patch: Partial<TutorProfile>) {
  await tutorProfilesCollection()
    .doc(tutorId)
    .set({ ...patch, tutorId, updatedAt: FieldValue.serverTimestamp() } as never, { merge: true });
}

export async function saveTutorPersonalStep(formData: FormData): Promise<ActionResult> {
  const { session, editable } = await requireEditableTutorSession();
  if (!editable) return { ok: false, error: "This profile can no longer be edited." };

  const parsed = personalStepSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    gender: formData.get("gender"),
    dateOfBirth: formData.get("dateOfBirth"),
    address: formData.get("address"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const photo = formData.get("photo");
  let profilePhotoDocumentId: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    try {
      const doc = await uploadTutorDocument({
        tutorId: session.uid,
        documentType: "PROFILE_PHOTO",
        buffer: Buffer.from(await photo.arrayBuffer()),
        mimeType: photo.type,
        originalFileName: photo.name,
      });
      profilePhotoDocumentId = doc.id;
    } catch (error) {
      if (error instanceof InvalidDocumentError) return { ok: false, error: error.message };
      throw error;
    }
  }

  await mergeProfile(session.uid, {
    ...parsed.data,
    ...(profilePhotoDocumentId ? { profilePhotoDocumentId } : {}),
  });
  return { ok: true };
}

export async function saveTutorEducationStep(formData: FormData): Promise<ActionResult> {
  const { session, editable } = await requireEditableTutorSession();
  if (!editable) return { ok: false, error: "This profile can no longer be edited." };

  const parsed = educationStepSchema.safeParse({
    highestQualification: formData.get("highestQualification"),
    institution: formData.get("institution"),
    graduationYear: formData.get("graduationYear"),
    majorSubject: formData.get("majorSubject"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  await mergeProfile(session.uid, parsed.data);
  return { ok: true };
}

export async function saveTutorTeachingStep(formData: FormData): Promise<ActionResult> {
  const { session, editable } = await requireEditableTutorSession();
  if (!editable) return { ok: false, error: "This profile can no longer be edited." };

  const parsed = teachingStepSchema.safeParse({
    subjects: formData.getAll("subjects"),
    grades: formData.getAll("grades"),
    teachingExperienceSummary: formData.get("teachingExperienceSummary") || null,
    expectedMonthlyFee: formData.get("expectedMonthlyFee"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  await mergeProfile(session.uid, parsed.data);
  return { ok: true };
}

export async function saveTutorLocationStep(formData: FormData): Promise<ActionResult> {
  const { session, editable } = await requireEditableTutorSession();
  if (!editable) return { ok: false, error: "This profile can no longer be edited." };

  const parsed = locationStepSchema.safeParse({
    preferredLocationId: formData.get("preferredLocationId"),
    preferredLocality: formData.get("preferredLocality"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const locationSnap = await geographicLocationsCollection().doc(parsed.data.preferredLocationId).get();
  if (!locationSnap.exists || locationSnap.data()?.level !== "WARD") {
    return { ok: false, error: "Select your full location down to ward.", fieldErrors: { preferredLocationId: "Select your full location down to ward." } };
  }

  await mergeProfile(session.uid, parsed.data);
  return { ok: true };
}

export async function saveTutorAvailabilityStep(formData: FormData): Promise<ActionResult> {
  const { session, editable } = await requireEditableTutorSession();
  if (!editable) return { ok: false, error: "This profile can no longer be edited." };

  let slots: unknown;
  try {
    slots = JSON.parse(String(formData.get("slotsJson") ?? "[]"));
  } catch {
    return { ok: false, error: "Invalid availability data." };
  }

  const parsed = availabilityStepSchema.safeParse({ slots });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid availability." };
  }

  await mergeProfile(session.uid, { availability: parsed.data.slots });
  return { ok: true };
}

export async function uploadTutorCv(formData: FormData): Promise<ActionResult> {
  const { session, editable } = await requireEditableTutorSession();
  if (!editable) return { ok: false, error: "This profile can no longer be edited." };

  const cv = formData.get("cv");
  if (!(cv instanceof File) || cv.size === 0) {
    return { ok: false, error: "Choose a CV file to upload." };
  }

  try {
    const doc = await uploadTutorDocument({
      tutorId: session.uid,
      documentType: "CV",
      buffer: Buffer.from(await cv.arrayBuffer()),
      mimeType: cv.type,
      originalFileName: cv.name,
    });
    await mergeProfile(session.uid, { cvDocumentId: doc.id });
    return { ok: true };
  } catch (error) {
    if (error instanceof InvalidDocumentError) return { ok: false, error: error.message };
    throw error;
  }
}

const REQUIRED_PROFILE_FIELDS: (keyof TutorProfile)[] = [
  "fullName",
  "phone",
  "gender",
  "dateOfBirth",
  "address",
  "highestQualification",
  "institution",
  "graduationYear",
  "majorSubject",
  "expectedMonthlyFee",
  "preferredLocationId",
  "preferredLocality",
  "cvDocumentId",
];

/**
 * Transitions PROFILE_INCOMPLETE -> SUBMITTED, or REJECTED -> RESUBMITTED,
 * once every required field is present (tutor-lifecycle skill: rejection
 * and resubmission are distinct statuses from a first-time submission).
 */
export async function submitTutorProfileForReview(): Promise<ActionResult> {
  const { session, editable } = await requireEditableTutorSession();
  if (!editable) return { ok: false, error: "This profile has already been submitted." };

  const profileSnap = await tutorProfilesCollection().doc(session.uid).get();
  const profile = profileSnap.data();

  const missing = REQUIRED_PROFILE_FIELDS.filter((field) => {
    const value = profile?.[field];
    return value === null || value === undefined || value === "";
  });
  if (!profile || profile.subjects.length === 0) missing.push("subjects");
  if (!profile || profile.grades.length === 0) missing.push("grades");
  if (!profile || profile.availability.length === 0) missing.push("availability");

  if (missing.length > 0 || !profile) {
    return { ok: false, error: `Complete all sections before submitting: ${missing.join(", ")}.` };
  }

  const wasRejected = session.tutor!.verificationStatus === "REJECTED";
  const nextStatus = wasRejected ? "RESUBMITTED" : "SUBMITTED";

  // Route to the Branch Admin covering the tutor's preferred city, so
  // branch-scoped review (M4) can find them. See branch-routing.ts —
  // null (unrouted) falls back to Super Admin visibility, not an error.
  // Re-resolved on every (re)submission in case the tutor changed their
  // preferred location while editing.
  const branchId = await resolveBranchIdForLocation(profile.preferredLocationId!);

  await tutorsCollection().doc(session.uid).update({
    verificationStatus: nextStatus,
    branchId,
    rejectionReason: null,
    submittedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditEvent({
    action: wasRejected ? "TUTOR_PROFILE_RESUBMITTED" : "TUTOR_PROFILE_SUBMITTED",
    actorUserId: session.uid,
    actorRole: "TUTOR",
    targetType: "Tutor",
    targetId: session.uid,
    metadata: { branchId },
  });

  await notifyAdminsForBranch(branchId, {
    type: wasRejected ? "TUTOR_RESUBMITTED" : "TUTOR_SUBMITTED",
    title: wasRejected ? "Tutor resubmitted their profile" : "New tutor profile submitted",
    body: `${profile.fullName ?? "A tutor"} (${session.tutor!.tutorUid}) ${wasRejected ? "resubmitted" : "submitted"} their profile for review.`,
    relatedEntityType: "Tutor",
    relatedEntityId: session.uid,
  });

  return { ok: true };
}
