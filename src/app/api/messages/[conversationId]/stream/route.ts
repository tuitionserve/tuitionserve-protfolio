import { NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { loadConversationForParticipant } from "@/server/actions/messaging";
import { messagesCollection } from "@/server/domain/collections";
import { toMessageView } from "@/server/domain/messaging-views";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events stream of new messages in one conversation, for
 * MessageThread — replaces the old 8-second poll. Attaches a Firestore
 * Admin SDK `.onSnapshot()` listener server-side (see the module doc in
 * server/actions/messaging.ts for why this, not the client Firestore
 * SDK) and forwards each newly-added message as it's written.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;

  try {
    await loadConversationForParticipant(conversationId);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const sinceMillis = Number(request.nextUrl.searchParams.get("since") ?? "0") || 0;
  const encoder = new TextEncoder();

  const query = messagesCollection()
    .where("conversationId", "==", conversationId)
    .where("sentAt", ">", Timestamp.fromMillis(sinceMillis))
    .orderBy("sentAt", "asc");

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const unsubscribe = query.onSnapshot(
        (snapshot) => {
          if (closed) return;
          for (const change of snapshot.docChanges()) {
            if (change.type !== "added") continue;
            const view = toMessageView(change.doc.data());
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(view)}\n\n`));
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
