import Image from "next/image";
import Link from "next/link";
import { requireActiveTutor } from "@/server/auth/guards";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { countUnreadNotifications } from "@/server/queries/my-notifications";
import { BottomTabBar } from "@/components/shared/BottomTabBar";
import { Sidebar } from "@/components/shared/Sidebar";

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireActiveTutor();
  const unreadCount = await countUnreadNotifications(session.uid);
  const sections = [
    { links: [{ label: "Dashboard", href: "/tutor/dashboard", icon: "home" }] },
    {
      label: "Tuitions",
      links: [
        { label: "Available Tuitions", href: "/tutor/opportunities", icon: "search" },
        { label: "My Applications", href: "/tutor/applications", icon: "assignment" },
      ],
    },
    {
      label: "Communication",
      links: [
        { label: "Messages", href: "/tutor/messages", icon: "chat" },
        { label: "Notifications", href: "/tutor/notifications", icon: "notifications", badge: unreadCount },
      ],
    },
  ];
  // Shorter labels for the mobile bottom tab bar, where space is tight.
  const tabLinks = [
    { label: "Home", href: "/tutor/dashboard", icon: "home" },
    { label: "Tuitions", href: "/tutor/opportunities", icon: "search" },
    { label: "Applied", href: "/tutor/applications", icon: "assignment" },
    { label: "Messages", href: "/tutor/messages", icon: "chat" },
    { label: "Alerts", href: "/tutor/notifications", icon: "notifications", badge: unreadCount },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar
        sections={sections}
        homeHref="/tutor/dashboard"
        profileHref="/tutor/profile"
        roleLabel={session.tutor?.tutorUid ?? "Tutor"}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile-only — the sidebar above is desktop-only (md:), and the
            bottom tab bar below covers primary nav on mobile, so this is
            just the logo + a way to log out on small screens. */}
        <header className="md:hidden bg-surface-container-lowest border-b border-surface-variant">
          <div className="flex justify-between items-center w-full px-margin-mobile py-4">
            <Link href="/tutor/dashboard" className="flex items-center">
              <Image src="/images/logo.svg" alt="Tuition Serve" width={128} height={32} className="h-8 w-auto" priority />
            </Link>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl pb-24 md:pb-xl">
          {children}
        </main>
      </div>

      <BottomTabBar links={tabLinks} />
    </div>
  );
}
