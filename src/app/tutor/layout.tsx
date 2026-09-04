import Image from "next/image";
import Link from "next/link";
import { requireActiveTutor } from "@/server/auth/guards";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { countUnreadNotifications } from "@/server/queries/my-notifications";
import { BottomTabBar } from "@/components/shared/BottomTabBar";

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireActiveTutor();
  const unreadCount = await countUnreadNotifications(session.uid);
  const tabLinks = [
    { label: "Home", href: "/tutor/dashboard", icon: "home" },
    { label: "Tuitions", href: "/tutor/opportunities", icon: "search" },
    { label: "Applied", href: "/tutor/applications", icon: "assignment" },
    { label: "Messages", href: "/tutor/messages", icon: "chat" },
    { label: "Alerts", href: "/tutor/notifications", icon: "notifications", badge: unreadCount },
  ];

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-surface-container-lowest border-b border-surface-variant relative">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-max-width mx-auto">
          <div className="flex items-center gap-xl">
            <Link href="/tutor/dashboard" className="flex items-center">
              <Image src="/images/logo.svg" alt="Tuition Serve" width={160} height={36} className="h-8 w-auto" priority />
            </Link>
            <nav className="hidden md:flex gap-gutter items-center">
              <Link href="/tutor/dashboard" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/tutor/opportunities" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">
                Available Tuitions
              </Link>
              <Link href="/tutor/applications" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">
                My Applications
              </Link>
              <Link href="/tutor/messages" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors">
                Messages
              </Link>
              <Link href="/tutor/notifications" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors flex items-center gap-1">
                Notifications
                {unreadCount > 0 && (
                  <span className="font-label-md text-label-md bg-primary-container text-on-primary px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-md">
            <span className="font-body-sm text-body-sm text-on-surface-variant hidden sm:inline">
              {session.tutor?.tutorUid}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl pb-24 md:pb-xl">
        {children}
      </main>
      <BottomTabBar links={tabLinks} />
    </div>
  );
}
