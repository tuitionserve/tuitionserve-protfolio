"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ConversationListItemView } from "@/server/domain/messaging-views";

function formatDate(millis: number | null): string {
  if (!millis) return "";
  return new Date(millis).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function mergeAndSort(
  existing: ConversationListItemView[],
  incoming: ConversationListItemView[],
): ConversationListItemView[] {
  const byId = new Map(existing.map((c) => [c.id, c]));
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
}

/**
 * Live-updating conversation list — the left pane of the WhatsApp-Web-
 * style messaging shell. Starts from the server-rendered initial page,
 * then subscribes to the SSE list stream so new messages reorder/update
 * rows and bump unread badges without a refresh.
 */
export function ConversationListPane({
  initialItems,
  basePath,
  unreadField,
  emptyMessage,
}: {
  initialItems: ConversationListItemView[];
  basePath: string;
  unreadField: "adminUnreadCount" | "tutorUnreadCount";
  emptyMessage: string;
}) {
  const [items, setItems] = useState(initialItems);
  const pathname = usePathname();

  useEffect(() => {
    const es = new EventSource("/api/messages/list-stream");
    es.onmessage = (event) => {
      const item: ConversationListItemView = JSON.parse(event.data);
      setItems((prev) => mergeAndSort(prev, [item]));
    };
    return () => es.close();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      {items.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant p-lg">{emptyMessage}</p>
      ) : (
        items.map((c) => {
          const active = pathname === `${basePath}/${c.id}`;
          const unread = c[unreadField];
          return (
            <Link
              key={c.id}
              href={`${basePath}/${c.id}`}
              className={`flex items-center justify-between gap-3 px-lg py-3.5 border-b border-surface-variant transition-colors ${
                active ? "bg-primary-container/10" : "hover:bg-surface-container"
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`font-label-md text-label-md truncate ${
                    unread > 0 ? "text-on-surface font-semibold" : "text-on-surface"
                  }`}
                >
                  {c.displayName}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {c.lastMessagePreview || "No messages yet"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  {formatDate(c.lastMessageAt)}
                </span>
                {unread > 0 && (
                  <span className="font-label-md text-label-md bg-primary-container text-on-primary min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">
                    {unread}
                  </span>
                )}
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
