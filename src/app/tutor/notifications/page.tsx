import { requireActiveTutor } from "@/server/auth/guards";
import { getNotifications } from "@/server/queries/my-notifications";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { NotificationRow } from "@/components/shared/NotificationRow";
import { MarkAllReadButton } from "@/components/shared/MarkAllReadButton";

export default async function TutorNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursors?: string }>;
}) {
  const session = await requireActiveTutor();
  const cursorStack = parseCursorStack((await searchParams).cursors);
  const page = await getNotifications(session.uid, currentCursor(cursorStack));

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Notifications</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{page.totalCount} total.</p>
        </div>
        {page.totalCount > 0 && <MarkAllReadButton />}
      </div>

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No notifications yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map((n) => (
            <NotificationRow key={n.id} notification={n} role="TUTOR" />
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/tutor/notifications"
        cursorParamName="cursors"
        cursorStack={cursorStack}
        nextCursor={page.nextCursor}
        hasNextPage={page.hasNextPage}
        itemsCount={page.items.length}
        totalCount={page.totalCount}
        pageSize={DEFAULT_PAGE_SIZE}
      />
    </div>
  );
}
