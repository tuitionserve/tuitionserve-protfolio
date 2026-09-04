"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  getMessagesForConversation,
  markConversationRead,
  sendMessage,
  type MessageView,
} from "@/server/actions/messaging";

const POLL_INTERVAL_MS = 8000;

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
 * /admin/messages/[id]. Polling (not websockets) per the
 * messaging-engineering skill — a modest interval is enough for a
 * task-oriented admin<->tutor chat, and keeps this a plain client
 * component with no realtime infrastructure.
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

  // Mark read on open, and refresh on a modest interval while the thread
  // stays mounted — re-marking read on every poll keeps the unread badge
  // at 0 for as long as this thread is actually open.
  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const [latest] = await Promise.all([
          getMessagesForConversation(conversationId),
          markConversationRead(conversationId),
        ]);
        if (!cancelled) setMessages(latest);
      } catch {
        // Transient poll failure — the next interval tick will retry.
      }
    }

    void refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
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
      const latest = await getMessagesForConversation(conversationId);
      setMessages(latest);
    });
  }

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl flex flex-col h-[60vh]">
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

      <div className="border-t border-surface-variant p-lg flex flex-col gap-2">
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
