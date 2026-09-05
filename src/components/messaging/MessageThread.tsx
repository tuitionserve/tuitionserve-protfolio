"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  getNewMessagesSince,
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
  // Tracks the latest message's timestamp so the poll can ask for only
  // what's new, without re-subscribing the interval on every message.
  const latestSentAtRef = useRef<number>(
    initialMessages.length > 0 ? (initialMessages[initialMessages.length - 1]!.sentAt ?? 0) : 0,
  );

  // Mark read on open, and poll for new messages only (not the whole
  // history) on a modest interval while the thread stays mounted — an
  // idle conversation matches zero new messages per tick instead of
  // re-reading the last 100 every 8 seconds. markConversationRead is a
  // no-op write once the unread count is already 0, so leaving a thread
  // open costs one cheap read per tick, not a write.
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const [newOnes] = await Promise.all([
          getNewMessagesSince(conversationId, latestSentAtRef.current),
          markConversationRead(conversationId),
        ]);
        if (cancelled || newOnes.length === 0) return;
        latestSentAtRef.current = newOnes[newOnes.length - 1]!.sentAt ?? latestSentAtRef.current;
        setMessages((prev) => [...prev, ...newOnes]);
      } catch {
        // Transient poll failure — the next interval tick will retry.
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS);
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
      const newOnes = await getNewMessagesSince(conversationId, latestSentAtRef.current);
      if (newOnes.length > 0) {
        latestSentAtRef.current = newOnes[newOnes.length - 1]!.sentAt ?? latestSentAtRef.current;
        setMessages((prev) => [...prev, ...newOnes]);
      }
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
