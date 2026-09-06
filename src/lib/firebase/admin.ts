import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (useEmulators) {
  // The Admin SDK talks to the emulator suite when these host:port env
  // vars are present — no service account credentials are needed locally.
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= "127.0.0.1:9199";
  // Without real credentials, google-auth-library still tries to probe the
  // GCE metadata server to detect the runtime environment, which times out
  // and logs a noisy MetadataLookupWarning on every request. NO_GCE_CHECK
  // is google-auth-library's documented flag for skipping that probe.
  process.env.NO_GCE_CHECK ??= "true";
}

function createAdminApp(): App {
  if (getApps().length) {
    return getApps()[0]!;
  }

  if (useEmulators) {
    return initializeApp({
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials are missing. Set FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY, or set " +
        "NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true for local development.",
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminApp = createAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
