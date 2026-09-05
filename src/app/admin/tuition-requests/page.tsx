import { redirect } from "next/navigation";

// The bundled New+Open view was split into separate sidebar tabs
// (new/open/assigned/rejected) — this bare route now just points
// old links/bookmarks somewhere sensible.
export default function AdminTuitionRequestsIndexPage() {
  redirect("/admin/tuition-requests/new");
}
