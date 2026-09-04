"use server";

import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { assertBranchScope, requireActiveTutor, requireRole, requireSession } from "@/server/auth/guards";
import {
  conversationsCollection,
  messagesCollection,
  tutorProfilesCollection,
  tutorsCollection,
} from "@/server/domain/collections";
import { generateSequentialUid } from "@/server/domain/ids";
import { writeAuditEvent } from "@/server/domain/audit";
import { createNotification, notifyAdminsForBranch } from "@/server/domain/notifications";
import { fetchPage, type PageResult } from "@/server/domain/pagination";
import type { AuthSession } from "@/server/auth/session";
import type { Conversation, Message } from "@/server/domain/types";

/**
 * M9 Messaging (PRD section 19 / messaging-engineering skill): a simple
 * Admin <-> Tutor conversation + message store. Deliberately NOT
 * realtime — thread pages poll on an interval, which the skill calls
 * out as an acceptable substitute for websockets at this scale.
 *
 * Design choices worth documenting up front:
 *
 * - One conversation per (tutor, tutor's branch) pair, not per admin.
 *   `Conversation.adminUnreadCount` has no per-admin dimension, so
 *   "the admin side" is treated as a single logical participant shared
 *   by every admin in that branch (Super Admin sees/replies to all
 *   branches). This keeps `startOrGetConversation` trivially idempotent
 *   and matches the UX flow doc's flat "Tutor A / Tutor B" list — no
 *   per-admin sub-threads.
 * - `startOrGetConversation` derives the conversation's branch from the
 *   TUTOR's own record, never from a caller-supplied branchId
 *   (role-authorization skill: never trust a client-supplied branch
 *   ID) — a Branch Admin can only start/reuse a conversation with a
 *   tutor in their own branch; Super Admin can message any tutor.
 * - Duplicate-send protection is client-side only (disable the Send
 *   button while the request is in flight, the same pattern already
 *   used by WithdrawApplicationButton) rather than a server-side
 *   idempotency key. The skill allows this ("client-side pending-state
 *   guard is enough"); a stray double-send at worst produces two
 *   identical chat bubbles, which is cheap to tolerate for a simple
 *   admin<->tutor chat and not worth a dedup-key schema change.
 * - Every message send creates a notification for the other side. We
 *   do not suppress this when the recipient's thread happens to be
 *   open (we don't track that), so an actively-open thread can still
 *   receive a redundant notification — documented as a known
 *   simplification, not a bug.
 * - Only conversation creation is audited (`CONVERSATION_STARTED`).
 *   Individual messages are NOT audited: messaging isn't in the TRD's
 *   audit action list, per-message audit rows would be pure noise for
 *   a chat feature, and messaging never itself performs a structured
 *   domain action (moderation section of the skill) — there is no
 *   state transition here worth an audit trail beyond "this
 *   relationship started".
 * - Pagination is "most recent 100 messages, oldest first" computed
 *   in-memory after an equality-only Firestore query, mirroring the
 *   in-memory-sort pattern already used by
 *   `server/queries/my-applications.ts` and `tuition-requests.ts` —
 *   this avoids requiring a new composite Firestore index (equality +
 *   orderBy on a different field needs one; equality-only queries do
 *   not) for a milestone that explicitly doesn't need infinite scroll.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };
export type StartConversationResult = { ok: true; conversationId: string } | { ok: false; error: string };

const MESSAGE_MAX_LENGTH = 4000;
const MESSAGES_PAGE_SIZE = 100;

const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(MESSAGE_MAX_LENGTH, `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`),
});

const startConversationSchema = z.object({
  tutorId: z.string().trim().min(1, "Tutor is required."),
  tuitionId: z.string().trim().min(1).optional(),
});

/**
 * Client-safe (Timestamp-stripped) view types. Firestore Timestamp class
 * instances cannot cross the Server Component -> Client Component or
 * Server Action RPC serialization boundary (see
 * `server/queries/admin-applicants.ts` for the established precedent) —
 * every function here that can be called from/rendered into a "use
 * client" component returns these instead of the raw domain types.
 */
export interface ConversationView {
  id: string;
  conversationUid: string;
  tutorId: string;
  adminUserId: string;
  branchId: string | null;
  tuitionId: string | null;
  lastMessageAt: number | null; // epoch millis
  lastMessagePreview: string;
  tutorUnreadCount: number;
  adminUnreadCount: number;
  createdAt: number | null;
}

export interface MessageView {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderRole: Message["senderRole"];
  body: string;
  sentAt: number | null;
}

export interface ConversationDetailView extends ConversationView {
  tutorUid: string;
  tutorName: string | null;
}

function toConversationView(c: Conversation): ConversationView {
  return {
    id: c.id,
    conversationUid: c.conversationUid,
    tutorId: c.tutorId,
    adminUserId: c.adminUserId,
    branchId: c.branchId,
    tuitionId: c.tuitionId,
    lastMessageAt: c.lastMessageAt?.toMillis() ?? null,
    lastMessagePreview: c.lastMessagePreview,
    tutorUnreadCount: c.tutorUnreadCount,
    adminUnreadCount: c.adminUnreadCount,
    createdAt: c.createdAt?.toMillis() ?? null,
  };
}

function toMessageView(m: Message): MessageView {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderUserId: m.senderUserId,
    senderRole: m.senderRole,
    body: m.body,
    sentAt: m.sentAt?.toMillis() ?? null,
  };
}

/**
 * Loads a conversation and verifies the current session is an authorized
 * participant: the owning tutor, or an admin in branch scope (Super Admin
 * always passes). Throws on any failure — missing conversation, wrong
 * tutor, wrong branch — and callers deliberately collapse every failure
 * into the same "not found" outcome so an unauthorized caller cannot
 * distinguish "doesn't exist" from "exists but isn't yours"
 * (role-authorization skill: never leak resource existence to a caller
 * who isn't authorized for it).
 */
async function loadConversationForParticipant(conversationId: string): Promise<{
  session: AuthSession;
  ref: FirebaseFirestore.DocumentReference<Conversation>;
  conversation: Conversation;
}> {
  const session = await requireSession();
  const ref = conversationsCollection().doc(conversationId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Conversation not found.");
  const conversation = snap.data()!;

  if (session.role === "TUTOR") {
    if (conversation.tutorId !== session.uid) throw new Error("Conversation not found.");
  } else {
    assertBranchScope(session, conversation.branchId);
  }

  return { session, ref, conversation };
}

/**
 * Admin-initiated. Idempotent: reuses the existing conversation for
 * (tutorId, tutor's branchId) instead of creating a duplicate — see the
 * module doc for why branch (not calling-admin identity) is the dedup
 * key. `tuitionId` is optional context (PRD: "Optional tuition
 * context"); if the existing conversation has none yet and this call
 * supplies one, it is attached (enrichment only — never overwrites an
 * already-recorded tuitionId).
 */
export async function startOrGetConversation(
  tutorId: string,
  tuitionId?: string | null,
): Promise<StartConversationResult> {
  const parsed = startConversationSchema.safeParse({ tutorId, tuitionId: tuitionId ?? undefined });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const tutorSnap = await tutorsCollection().doc(parsed.data.tutorId).get();
  if (!tutorSnap.exists) return { ok: false, error: "Tutor not found." };
  const tutor = tutorSnap.data()!;

  try {
    assertBranchScope(session, tutor.branchId);
  } catch {
    return { ok: false, error: "You cannot message a tutor outside your branch." };
  }

  const existingSnap = await conversationsCollection()
    .where("tutorId", "==", parsed.data.tutorId)
    .where("branchId", "==", tutor.branchId)
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    const existingDoc = existingSnap.docs[0]!;
    const existing = existingDoc.data();
    if (parsed.data.tuitionId && !existing.tuitionId) {
      await existingDoc.ref.update({
        tuitionId: parsed.data.tuitionId,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    return { ok: true, conversationId: existing.id };
  }

  const ref = conversationsCollection().doc();
  const now = FieldValue.serverTimestamp();
  await ref.set({
    id: ref.id,
    conversationUid: "", // filled in below (UID generation is its own transaction)
    tutorId: parsed.data.tutorId,
    adminUserId: session.uid,
    branchId: tutor.branchId,
    tuitionId: parsed.data.tuitionId ?? null,
    lastMessageAt: now,
    lastMessagePreview: "",
    tutorUnreadCount: 0,
    adminUnreadCount: 0,
    createdAt: now,
    updatedAt: now,
  } as never);

  const conversationUid = await generateSequentialUid("conversation");
  await ref.update({ conversationUid });

  await writeAuditEvent({
    action: "CONVERSATION_STARTED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "Conversation",
    targetId: ref.id,
    metadata: { tutorId: parsed.data.tutorId, branchId: tutor.branchId },
  });

  return { ok: true, conversationId: ref.id };
}

/** UI convenience wrapper: resolves a tutor by their public Tutor UID (e.g. TS-T-000127) before starting/reusing a conversation, for the admin "start a new conversation" form. */
export async function startConversationWithTutorUid(
  tutorUid: string,
  tuitionId?: string,
): Promise<StartConversationResult> {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const trimmed = tutorUid.trim();
  if (!trimmed) return { ok: false, error: "Tutor UID is required." };

  const snap = await tutorsCollection().where("tutorUid", "==", trimmed).limit(1).get();
  if (snap.empty) return { ok: false, error: "No tutor found with that UID." };

  return startOrGetConversation(snap.docs[0]!.data().id, tuitionId);
}

/**
 * Sends a message from either authorized participant. Increments the
 * OTHER party's unread count only (sender's own unread state is
 * untouched) and updates the conversation's lastMessageAt/preview in the
 * same transaction as the message write, so a reader never observes a
 * conversation row whose preview is out of sync with its newest message.
 */
export async function sendMessage(conversationId: string, body: string): Promise<ActionResult> {
  const parsed = sendMessageSchema.safeParse({ body });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid message." };
  }

  let session: AuthSession;
  let ref: FirebaseFirestore.DocumentReference<Conversation>;
  let conversation: Conversation;
  try {
    ({ session, ref, conversation } = await loadConversationForParticipant(conversationId));
  } catch {
    return { ok: false, error: "Conversation not found." };
  }

  const senderRole = session.role;
  const messageRef = messagesCollection().doc();
  const now = FieldValue.serverTimestamp();
  const preview = parsed.data.body.slice(0, 200);

  await adminFirestore.runTransaction(async (tx) => {
    tx.set(messageRef, {
      id: messageRef.id,
      conversationId,
      senderUserId: session.uid,
      senderRole,
      body: parsed.data.body,
      sentAt: now,
    } as never);

    const unreadField = senderRole === "TUTOR" ? "adminUnreadCount" : "tutorUnreadCount";
    tx.update(ref, {
      lastMessageAt: now,
      lastMessagePreview: preview,
      [unreadField]: FieldValue.increment(1),
      updatedAt: now,
    });
  });

  // Notify the other side. Known simplification (see module doc): we
  // always notify, even if the recipient's thread is currently open —
  // we don't track "conversation open" state, so a viewer polling an
  // open thread may also get a redundant notification bell.
  if (senderRole === "TUTOR") {
    await notifyAdminsForBranch(conversation.branchId, {
      type: "NEW_TUTOR_MESSAGE",
      title: "New message from a tutor",
      body: preview,
      relatedEntityType: "Conversation",
      relatedEntityId: conversationId,
    });
  } else {
    await createNotification({
      recipientUserId: conversation.tutorId,
      type: "NEW_MESSAGE",
      title: "New message",
      body: preview,
      relatedEntityType: "Conversation",
      relatedEntityId: conversationId,
    });
  }

  return { ok: true };
}

/** Resets the CALLER's own unread count to 0 — a tutor resets tutorUnreadCount, an admin resets the shared adminUnreadCount. */
export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  let session: AuthSession;
  let ref: FirebaseFirestore.DocumentReference<Conversation>;
  try {
    ({ session, ref } = await loadConversationForParticipant(conversationId));
  } catch {
    return { ok: false, error: "Conversation not found." };
  }

  const field = session.role === "TUTOR" ? "tutorUnreadCount" : "adminUnreadCount";
  await ref.update({ [field]: 0, updatedAt: FieldValue.serverTimestamp() });
  return { ok: true };
}

/** The signed-in tutor's own conversations, paginated, sorted by most recent activity. Always session-derived — never trusts a client-supplied tutor id (role-authorization skill). */
export async function getConversationsForTutor(cursor: string | null): Promise<PageResult<ConversationView>> {
  const session = await requireActiveTutor();
  const base = conversationsCollection().where("tutorId", "==", session.uid);
  const page = await fetchPage(base, "lastMessageAt", cursor);
  return { ...page, items: page.items.map(toConversationView) };
}

/** Admin-side conversation list, paginated: branch-scoped for Branch Admin, all conversations for Super Admin. Always session-derived. */
export async function getConversationsForAdmin(cursor: string | null): Promise<PageResult<ConversationView>> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const base =
    session.role === "BRANCH_ADMIN"
      ? conversationsCollection().where("branchId", "==", session.branchId)
      : (conversationsCollection() as FirebaseFirestore.Query<Conversation>);
  const page = await fetchPage(base, "lastMessageAt", cursor);
  return { ...page, items: page.items.map(toConversationView) };
}

/** Most recent MESSAGES_PAGE_SIZE messages, oldest first (ready to render top-to-bottom). Re-verifies participant access. */
export async function getMessagesForConversation(conversationId: string): Promise<MessageView[]> {
  const { conversation } = await loadConversationForParticipant(conversationId);
  const snap = await messagesCollection().where("conversationId", "==", conversation.id).get();
  const sorted = snap.docs
    .map((d) => d.data())
    .sort((a, b) => (a.sentAt?.toMillis() ?? 0) - (b.sentAt?.toMillis() ?? 0));
  const page = sorted.length > MESSAGES_PAGE_SIZE ? sorted.slice(sorted.length - MESSAGES_PAGE_SIZE) : sorted;
  return page.map(toMessageView);
}

/** Conversation header info (tutor UID/name) for the thread view. Returns null on any not-found/unauthorized outcome so pages can 404. */
export async function getConversationDetail(conversationId: string): Promise<ConversationDetailView | null> {
  let conversation: Conversation;
  try {
    ({ conversation } = await loadConversationForParticipant(conversationId));
  } catch {
    return null;
  }

  const [tutorSnap, profileSnap] = await Promise.all([
    tutorsCollection().doc(conversation.tutorId).get(),
    tutorProfilesCollection().doc(conversation.tutorId).get(),
  ]);

  return {
    ...toConversationView(conversation),
    tutorUid: tutorSnap.data()?.tutorUid ?? "—",
    tutorName: profileSnap.data()?.fullName ?? null,
  };
}
