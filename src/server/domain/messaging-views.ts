// Not a "use server" module — messaging.ts (a Server Actions file) can
// only export async functions, so these plain view-mapping helpers and
// their types live here instead, shared by messaging.ts and the SSE
// route handlers under src/app/api/messages/.
import { branchesCollection, tutorProfilesCollection, tutorsCollection } from "@/server/domain/collections";
import type { Conversation, Message } from "@/server/domain/types";

/** Client-safe (Timestamp-stripped) view types — see the messaging.ts module doc for why. */
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

/** A conversation row ready to render in the list pane — enriched with who's on the other end. */
export interface ConversationListItemView extends ConversationView {
  displayName: string;
}

export function toConversationView(c: Conversation): ConversationView {
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

export function toMessageView(m: Message): MessageView {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderUserId: m.senderUserId,
    senderRole: m.senderRole,
    body: m.body,
    sentAt: m.sentAt?.toMillis() ?? null,
  };
}

/** Admin-side display name for a conversation row: the tutor's name and UID. */
export async function enrichConversationsForAdmin(conversations: ConversationView[]): Promise<ConversationListItemView[]> {
  const [tutors, profiles] = await Promise.all([
    Promise.all(conversations.map((c) => tutorsCollection().doc(c.tutorId).get())),
    Promise.all(conversations.map((c) => tutorProfilesCollection().doc(c.tutorId).get())),
  ]);
  return conversations.map((c, i) => ({
    ...c,
    displayName: tutors[i]?.exists
      ? `${profiles[i]?.data()?.fullName ?? "Unnamed tutor"} · ${tutors[i]!.data()!.tutorUid}`
      : "Unknown tutor",
  }));
}

/** Tutor-side display name for a conversation row: "Administrator — <Branch Name>", matching #25's admin-message-view labeling. */
export async function enrichConversationsForTutor(conversations: ConversationView[]): Promise<ConversationListItemView[]> {
  const branches = await Promise.all(
    conversations.map((c) => (c.branchId ? branchesCollection().doc(c.branchId).get() : null)),
  );
  return conversations.map((c, i) => ({
    ...c,
    displayName: branches[i]?.exists ? `Administrator — ${branches[i]!.data()!.name}` : "Administrator",
  }));
}
