"use client";

import { useRouter } from "next/navigation";
import { markNotificationRead } from "@/server/actions/notifications";
import { notificationLink } from "@/lib/notification-links";
import type { NotificationView } from "@/server/queries/my-notifications";

export function NotificationRow({
  notification,
  role,
}: {
  notification: NotificationView;
  role: "TUTOR" | "SUPER_ADMIN" | "BRANCH_ADMIN";
}) {
  const router = useRouter();

  function handleClick() {
    if (!notification.read) void markNotificationRead(notification.id); // fire-and-forget — don't block navigation on it.
    router.push(notificationLink(notification.relatedEntityType, notification.relatedEntityId, role));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left bg-surface-container-lowest border rounded-xl p-lg flex items-start gap-3 hover:shadow-md transition-all ${
        notification.read ? "border-surface-variant" : "border-primary-container"
      }`}
    >
      {!notification.read && <span className="w-2 h-2 rounded-full bg-primary-container mt-2 shrink-0" />}
      <div className="min-w-0">
        <p className="font-label-md text-label-md text-on-surface">{notification.title}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{notification.body}</p>
      </div>
    </button>
  );
}
