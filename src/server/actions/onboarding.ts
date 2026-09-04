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

/** Only the tutor who owns the profile, and only before it's submitted. */
async function requireEditableTutorSession() {
  const session = await requireRole(["TUTOR"]);
  if (!session.tutor) throw new Error("Tutor record missing for an authenticated tutor session.");
  if (session.tutor.verificationStatus !== "PROFILE_INCOMPLETE") {
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
  if (!locationSnap.exists || locationSnap.data()?.level !== "CITY") {
    return { ok: false, error: "Select a valid city.", fieldErrors: { preferredLocationId: "Select a valid city." } };
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

/** Transitions PROFILE_INCOMPLETE -> SUBMITTED once every required field is present. */
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

  if (missing.length > 0) {
    return { ok: false, error: `Complete all sections before submitting: ${missing.join(", ")}.` };
  }

  await tutorsCollection().doc(session.uid).update({
    verificationStatus: "SUBMITTED",
    submittedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditEvent({
    action: "TUTOR_PROFILE_SUBMITTED",
    actorUserId: session.uid,
    actorRole: "TUTOR",
    targetType: "Tutor",
    targetId: session.uid,
    metadata: {},
  });

  return { ok: true };
}
