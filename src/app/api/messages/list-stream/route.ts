import { NextRequest } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { conversationsCollection } from "@/server/domain/collections";
import {
  enrichConversationsForAdmin,
  enrichConversationsForTutor,
  toConversationView,
  type ConversationListItemView,
  type ConversationView,
} from "@/server/domain/messaging-views";
import type { Conversation } from "@/server/domain/types";

export const dynamic = "force-dynamic";

const LIST_STREAM_LIMIT = 50;

/**
 * Server-Sent Events stream of conversation-list changes (new/updated
 * conversations — lastMessageAt, preview, unread counts) so the
 * conversation list pane updates live, WhatsApp-Web-style, without a
 * poll or a page refresh. Same "Admin SDK onSnapshot server-side, not
 * client Firestore SDK" approach as the per-thread stream — see the
 * module doc in server/actions/messaging.ts.
 *
 * Deliberately not paginated: a live top-N feed replaces the list
 * page's old cursor pagination (messaging never needed infinite scroll
 * per the original M9 design, and a "page 2" of a live list doesn't
 * make sense anyway).
 */
export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  let query: FirebaseFirestore.Query<Conversation>;
  let enrich: (conversations: ConversationView[]) => Promise<ConversationListItemView[]>;

  if (session.role === "TUTOR") {
    query = conversationsCollection().where("tutorId", "==", session.uid);
    enrich = enrichConversationsForTutor;
  } else if (session.role === "SUPER_ADMIN" || session.role === "BRANCH_ADMIN") {
    query =
      session.role === "BRANCH_ADMIN"
        ? conversationsCollection().where("branchId", "==", session.branchId)
        : conversationsCollection();
    enrich = enrichConversationsForAdmin;
  } else {
    return new Response("Unauthorized", { status: 401 });
  }

  query = query.orderBy("lastMessageAt", "desc").limit(LIST_STREAM_LIMIT);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const unsubscribe = query.onSnapshot(
        async (snapshot) => {
          if (closed) return;
          const changed = snapshot
            .docChanges()
            .filter((c) => c.type === "added" || c.type === "modified")
            .map((c) => toConversationView(c.doc.data()));
          if (changed.length === 0) return;
          const enriched = await enrich(changed);
          if (closed) return;
          for (const item of enriched) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(item)}\n\n`));
          }
        },
        () => {
          if (closed) return;
          controller.enqueue(encoder.encode(`event: error\ndata: {}\n\n`));
        },
      );

      request.signal.addEventListener("abort", () => {
        closed = true;
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
