import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminStorage } from "@/lib/firebase/admin";
import { tutorDocumentsCollection } from "./collections";
import type { DocumentType } from "./types";

const MIME_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const LIMITS: Record<DocumentType, { mimeTypes: string[]; maxBytes: number }> = {
  CV: { mimeTypes: ["application/pdf"], maxBytes: 5 * 1024 * 1024 },
  PROFILE_PHOTO: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 3 * 1024 * 1024,
  },
};

export class InvalidDocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDocumentError";
  }
}

/**
 * Validates, uploads (private Storage, server-generated path — never a
 * user-controlled filename), and records a TutorDocument. Does not trust
 * the client-reported extension: the stored filename's extension is
 * derived from the validated MIME type (document-file-security skill).
 */
export async function uploadTutorDocument(params: {
  tutorId: string;
  documentType: DocumentType;
  buffer: Buffer;
  mimeType: string;
  originalFileName: string;
}) {
  const { tutorId, documentType, buffer, mimeType, originalFileName } = params;
  const limits = LIMITS[documentType];

  if (!limits.mimeTypes.includes(mimeType)) {
    throw new InvalidDocumentError(
      `${documentType} must be one of: ${limits.mimeTypes.join(", ")}`,
    );
  }
  if (buffer.byteLength === 0) {
    throw new InvalidDocumentError("The uploaded file is empty.");
  }
  if (buffer.byteLength > limits.maxBytes) {
    throw new InvalidDocumentError(
      `File exceeds the ${Math.floor(limits.maxBytes / (1024 * 1024))}MB limit.`,
    );
  }

  const extension = MIME_EXTENSIONS[mimeType];
  const storagePath = `tutors/${tutorId}/${documentType.toLowerCase()}/${Date.now()}-${randomUUID()}.${extension}`;

  await adminStorage.bucket().file(storagePath).save(buffer, {
    metadata: { contentType: mimeType },
  });

  const ref = tutorDocumentsCollection().doc();
  const doc = {
    id: ref.id,
    tutorId,
    documentType,
    storagePath,
    fileName: originalFileName.slice(0, 200),
    mimeType,
    sizeBytes: buffer.byteLength,
    uploadedAt: FieldValue.serverTimestamp(),
  };
  await ref.set(doc as never);

  return { ...doc, uploadedAt: null } as const;
}

/** Short-lived signed URL for an already-authorized document access. */
export async function getSignedDownloadUrl(storagePath: string): Promise<string> {
  const [url] = await adminStorage
    .bucket()
    .file(storagePath)
    .getSignedUrl({ action: "read", expires: Date.now() + 5 * 60 * 1000 });
  return url;
}
