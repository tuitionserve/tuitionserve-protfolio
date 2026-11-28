import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebase/admin";

const SAFE_FILE_RE = /^[0-9]+-[0-9a-f-]+\.(jpg|png|webp)$/;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Serves uploaded blog cover images through the server Admin SDK so
 * `storage.rules` can stay locked down (`allow read, write: if false`).
 * Strictly restricted to `blog-covers/<timestamp>-<uuid>.(jpg|png|webp)`.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!SAFE_FILE_RE.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = file.split(".").pop()!;
  const storageFile = adminStorage.bucket().file(`blog-covers/${file}`);
  const [exists] = await storageFile.exists();
  if (!exists) {
    return new Response("Not found", { status: 404 });
  }

  const [buffer] = await storageFile.download();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
