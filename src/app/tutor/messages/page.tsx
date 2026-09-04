import Link from "next/link";
import { requireActiveTutor } from "@/server/auth/guards";
import { getConversationsForTutor } from "@/server/actions/messaging";
import { branchesCollection } from "@/server/domain/collections";

function formatDate(millis: number | null): string {
  if (!millis) return "";
  return new Date(millis).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function TutorMessagesPage() {
  await requireActiveTutor();
  const conversations = await getConversationsForTutor();

  const branches = await Promise.all(
    conversations.map((c) => (c.branchId ? branchesCollection().doc(c.branchId).get() : null)),
  );

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Messages</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Conversations with your branch administrators.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No conversations yet. An administrator will reach out here if they need to message you.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {conversations.map((c, i) => (
            <Link
              key={c.id}
              href={`/tutor/messages/${c.id}`}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4 hover:shadow-md transition-all"
            >
              <div className="min-w-0">
                <p className="font-label-md text-label-md text-on-surface">
                  {branches[i]?.exists ? branches[i]!.data()!.name : "Administrator"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {c.lastMessagePreview || "No messages yet"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  {formatDate(c.lastMessageAt)}
                </span>
                {c.tutorUnreadCount > 0 && (
                  <span className="font-label-md text-label-md bg-primary-container text-on-primary px-2 py-1 rounded-full">
                    {c.tutorUnreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
