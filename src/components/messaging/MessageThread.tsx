"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { markConversationRead, sendMessage } from "@/server/actions/messaging";
import type { MessageView } from "@/server/domain/messaging-views";

function formatTime(millis: number | null): string {
  if (!millis) return "";
  return new Date(millis).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Shared thread view for both /tutor/messages/[id] and
 * /admin/messages/[id]. Realtime via Server-Sent Events — see
 * src/app/api/messages/[conversationId]/stream/route.ts and the module
 * doc in server/actions/messaging.ts for why SSE rather than polling or
 * a client Firestore listener. `sendMessage` doesn't need to locally
 * append its own result: the stream is already listening and delivers
 * the just-sent message back down like any other new message.
 */
export function MessageThread({
  conversationId,
  initialMessages,
  viewerUid,
}: {
  conversationId: string;
  initialMessages: MessageView[];
  viewerUid: string;
}) {
  const [messages, setMessages] = useState<MessageView[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string>>(new Set(initialMessages.map((m) => m.id)));

  useEffect(() => {
    markConversationRead(conversationId);

    const since = initialMessages.length > 0 ? (initialMessages[initialMessages.length - 1]!.sentAt ?? 0) : 0;
    const es = new EventSource(`/api/messages/${conversationId}/stream?since=${since}`);
    es.onmessage = (event) => {
      const message: MessageView = JSON.parse(event.data);
      if (seenIdsRef.current.has(message.id)) return;
      seenIdsRef.current.add(message.id);
      setMessages((prev) => [...prev, message]);
      markConversationRead(conversationId);
    };

    return () => es.close();
    // Deliberately re-subscribes only when the conversation changes, not
    // on every render — `initialMessages` is a mount-time snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function handleSend() {
    const body = draft.trim();
    if (!body || pending) return; // client-side guard against double-click/double-fire sends
    setError(null);
    startTransition(async () => {
      const result = await sendMessage(conversationId, body);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraft("");
      // No local append here — the SSE stream (already subscribed) delivers
      // this same message back down within one round trip.
    });
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-lg flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No messages yet — say hello.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderUserId === viewerUid;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-3 ${
                    mine
                      ? "bg-primary-container text-on-primary"
                      : "bg-surface-container text-on-surface"
                  }`}
                >
                  <p className="font-body-sm text-body-sm whitespace-pre-wrap break-words">{m.body}</p>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant mt-1">
                  {formatTime(m.sentAt)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-surface-variant p-lg flex flex-col gap-2 shrink-0">
        <div className="flex gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            rows={2}
            maxLength={4000}
            disabled={pending}
            className="flex-1 border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={pending || !draft.trim()}
            className="self-end bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
          >
            {pending ? "Sending..." : "Send"}
          </button>
        </div>
        {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
      </div>
    </div>
  );
}
