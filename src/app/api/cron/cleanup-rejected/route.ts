import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { tuitionRequestsCollection } from "@/server/domain/collections";
import { writeAuditEvent } from "@/server/domain/audit";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Scheduled via vercel.json's `crons` — deletes REJECTED tuition
 * requests older than 30 days, across every branch. Not user-facing, so
 * it's gated by a shared secret (CRON_SECRET) rather than a session —
 * Vercel Cron calls this with `Authorization: Bearer <CRON_SECRET>`.
 * Deletes in batches of 500 (Firestore's own batch limit), looping
 * until nothing old is left, so this stays correct even if a backlog
 * ever exceeds one batch.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = Timestamp.fromMillis(Date.now() - THIRTY_DAYS_MS);
  let totalDeleted = 0;

  while (true) {
    const snap = await tuitionRequestsCollection()
      .where("status", "==", "REJECTED")
      .where("rejectedAt", "<", cutoff)
      .limit(500)
      .get();
    if (snap.empty) break;

    const batch = adminFirestore.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    totalDeleted += snap.size;

    if (snap.size < 500) break;
  }

  if (totalDeleted > 0) {
    await writeAuditEvent({
      action: "REJECTED_TUITIONS_AUTO_DELETED",
      actorUserId: null,
      actorRole: "SYSTEM",
      targetType: "TuitionRequest",
      targetId: "all-branches",
      metadata: { deletedCount: totalDeleted, olderThanDays: 30 },
    });
  }

  return NextResponse.json({ ok: true, deletedCount: totalDeleted });
}
