import Link from "next/link";
import type { PageResult } from "@/server/domain/pagination";
import type { NotificationView } from "@/server/queries/my-notifications";

export function NotificationsCard({
  notifications,
  viewAllHref,
}: {
  notifications: PageResult<NotificationView>;
  viewAllHref: string;
}) {
  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Notifications</h2>
        {notifications.totalCount > 0 && (
          <Link href={viewAllHref} className="font-label-md text-label-md text-primary-container">
            View all
          </Link>
        )}
      </div>
      {notifications.items.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">No notifications yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.items.slice(0, 5).map((n) => (
            <Link
              key={n.id}
              href={viewAllHref}
              className={`font-body-sm text-body-sm hover:text-primary-container transition-colors ${
                n.read ? "text-on-surface-variant" : "text-on-surface font-medium"
              }`}
            >
              {n.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
