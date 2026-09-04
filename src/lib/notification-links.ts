/**
 * Maps a notification's (relatedEntityType, relatedEntityId) to where it
 * should navigate on click (PRD section 25: "Notification click should
 * navigate to the associated entity"). Client-safe — no Firebase
 * imports. Role-dependent because the same entity type resolves to a
 * different route for a tutor vs. an admin.
 *
 * Some mappings are approximate by necessity: a TutorApplication has no
 * standalone admin-side detail route (applicants are reviewed inline on
 * the tuition's page), so an admin's application-related notification
 * links to the tuition instead — the closest real page, not a perfect
 * 1:1 link. Documented rather than silently wrong.
 */
export function notificationLink(
  relatedEntityType: string | null,
  relatedEntityId: string | null,
  role: "TUTOR" | "SUPER_ADMIN" | "BRANCH_ADMIN",
): string {
  const isAdmin = role !== "TUTOR";
  if (!relatedEntityType || !relatedEntityId) {
    return isAdmin ? "/admin/dashboard" : "/tutor/dashboard";
  }

  switch (relatedEntityType) {
    case "Tutor":
      return isAdmin ? `/admin/tutors/${relatedEntityId}` : "/tutor/dashboard";
    case "TuitionRequest":
      return isAdmin ? `/admin/tuition-requests/${relatedEntityId}` : `/tutor/opportunities/${relatedEntityId}`;
    case "TutorApplication":
      // No standalone admin route for a single application — applicants
      // are reviewed inline on the tuition detail page.
      return isAdmin ? "/admin/tuition-requests" : "/tutor/applications";
    case "TuitionAssignment":
      return isAdmin ? "/admin/tuition-requests" : "/tutor/applications";
    case "Conversation":
      return isAdmin ? `/admin/messages/${relatedEntityId}` : `/tutor/messages/${relatedEntityId}`;
    default:
      return isAdmin ? "/admin/dashboard" : "/tutor/dashboard";
  }
}
