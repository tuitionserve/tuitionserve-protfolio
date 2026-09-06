import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { countUnreadNotifications } from "@/server/queries/my-notifications";
import { countUnreadContactQueries } from "@/server/queries/contact-queries";
import { countUnreadSchoolContactQueries } from "@/server/queries/school-contact-queries";
import { BottomTabBar } from "@/components/shared/BottomTabBar";
import { Sidebar, type SidebarSection } from "@/components/shared/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const [unreadCount, unreadContactCount, unreadSchoolContactCount] = await Promise.all([
    countUnreadNotifications(session.uid),
    countUnreadContactQueries(),
    countUnreadSchoolContactQueries(),
  ]);
  const isSuperAdmin = session.role === "SUPER_ADMIN";

  const sections: SidebarSection[] = [
    { links: [{ label: "Dashboard", href: "/admin/dashboard", icon: "home" }] },
    {
      label: "Tuition Requests",
      links: [
        { label: "New Requests", href: "/admin/tuition-requests/new", icon: "post_add" },
        { label: "Open Tuitions", href: "/admin/tuition-requests/open", icon: "menu_book" },
        { label: "Assigned", href: "/admin/tuition-requests/assigned", icon: "task_alt" },
        { label: "Rejected", href: "/admin/tuition-requests/rejected", icon: "block" },
        { label: "Post Tuition", href: "/admin/tuition-requests/post", icon: "add_circle" },
      ],
    },
    {
      label: "Tutors",
      links: [
        { label: "Applications", href: "/admin/applications", icon: "assignment_ind" },
        { label: "Tutor Reviews", href: "/admin/tutors", icon: "fact_check" },
        { label: "All Tutors", href: "/admin/tutors/all", icon: "group" },
        { label: "Profile Changes", href: "/admin/profile-changes", icon: "edit_note" },
      ],
    },
    {
      label: "Support",
      links: [
        { label: "Contact Queries", href: "/admin/contact-queries", icon: "mail", badge: unreadContactCount },
        { label: "School Contact", href: "/admin/school-contact-queries", icon: "apartment", badge: unreadSchoolContactCount },
        { label: "Post School Enquiry", href: "/admin/school-contact-queries/post", icon: "add_business" },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            label: "Administration",
            links: [
              { label: "Admins", href: "/admin/admins", icon: "manage_accounts" },
              { label: "Branches", href: "/admin/branches", icon: "store" },
            ],
          },
        ]
      : []),
    {
      label: "Communication",
      links: [
        { label: "Messages", href: "/admin/messages", icon: "chat" },
        { label: "Notifications", href: "/admin/notifications", icon: "notifications", badge: unreadCount },
      ],
    },
  ];

  // Curated subset for the mobile bottom tab bar — space for 5 max.
  const tabLinks = [
    { label: "Home", href: "/admin/dashboard", icon: "home" },
    { label: "Requests", href: "/admin/tuition-requests/new", icon: "post_add" },
    { label: "Tutors", href: "/admin/tutors", icon: "fact_check" },
    { label: "Messages", href: "/admin/messages", icon: "chat" },
    { label: "Alerts", href: "/admin/notifications", icon: "notifications", badge: unreadCount },
  ];

  return (
    <div className="min-h-screen md:h-screen flex md:overflow-hidden">
      <Sidebar
        sections={sections}
        homeHref="/admin/dashboard"
        profileHref="/admin/profile"
        roleLabel={isSuperAdmin ? "Super Admin" : "Branch Admin"}
      />

      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-hidden">
        {/* Mobile-only — the sidebar above is desktop-only (md:), and the
            bottom tab bar below covers primary nav on mobile, so this is
            just the logo + a way to log out on small screens. */}
        <header className="md:hidden shrink-0 bg-surface-container-lowest border-b border-surface-variant">
          <div className="flex justify-between items-center w-full px-margin-mobile py-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Image src="/images/logo.svg" alt="Tuition Serve" width={128} height={32} className="h-8 w-auto" priority />
            </Link>
            <LogoutButton />
          </div>
        </header>

        {/* The one scrolling region on desktop — the sidebar and mobile
            header stay put; only this panel's content scrolls. */}
        <main className="flex-1 md:overflow-y-auto w-full">
          <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl pb-24 md:pb-xl">
            {children}
          </div>
        </main>
      </div>

      <BottomTabBar links={tabLinks} />
    </div>
  );
}
