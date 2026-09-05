import { redirect } from "next/navigation";

// Split into dedicated tabs: admin accounts now live at /admin/admins (with
// an Add Admin flow), and tutor browsing lives at /admin/tutors/all — this
// bare route now just points old links/bookmarks somewhere sensible.
export default function AdminUsersIndexPage() {
  redirect("/admin/admins");
}
