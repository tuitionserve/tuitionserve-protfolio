import { redirect } from "next/navigation";
import { getCurrentSession, type AuthSession } from "./session";
import { writeAuditEvent } from "@/server/domain/audit";
import type { Role } from "@/server/domain/types";

const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "BRANCH_ADMIN"];

/** Redirects to /login when there is no valid session. */
export async function requireSession(): Promise<AuthSession> {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Redirects to /login unless the caller's role is one of `roles`. Also
 * enforces the forced-first-login password change for an admin who was
 * just handed a system-generated temp password (mustChangePassword) —
 * checked here, not just on the admin layout, so it's enforced on every
 * admin page's own server-side entry point (same reasoning as the
 * suspension/branch-scope checks: a layout running first is not
 * guaranteed). /change-password-required is a top-level route outside
 * admin/layout.tsx and reads the session directly (not via this
 * function), so it never redirects to itself.
 *
 * A tutor or an anonymous visitor specifically trying an admin/super-admin
 * route (not just any protected route) gets sent to /access-denied
 * instead of the plain /login bounce — deliberate URL-guessing at staff
 * areas is worth a harder stop than a routine "please sign in", and the
 * attempt is audit-logged. A staff member hitting a route above their
 * own role (e.g. Branch Admin on a Super-Admin-only page) still gets the
 * ordinary /login redirect — not malicious, just the wrong permission.
 * /access-denied is a top-level route outside admin/layout.tsx, so it
 * never re-triggers this check on itself.
 */
export async function requireRole(roles: Role[]): Promise<AuthSession> {
  const isAdminRouteCheck = roles.some((r) => ADMIN_ROLES.includes(r));
  const session = await getCurrentSession();

  if (!session) {
    if (isAdminRouteCheck) {
      await writeAuditEvent({
        action: "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT",
        actorUserId: null,
        actorRole: "SYSTEM",
        targetType: "AdminRoute",
        targetId: "anonymous",
        metadata: { reason: "no session" },
      });
      redirect("/access-denied");
    }
    redirect("/login");
  }

  if (!roles.includes(session.role)) {
    if (isAdminRouteCheck && session.role === "TUTOR") {
      await writeAuditEvent({
        action: "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT",
        actorUserId: session.uid,
        actorRole: session.role,
        targetType: "AdminRoute",
        targetId: session.uid,
        metadata: { reason: "tutor role" },
      });
      redirect("/access-denied");
    }
    redirect("/login");
  }

  if (session.mustChangePassword) redirect("/change-password-required");
  return session;
}

/**
 * Redirects a tutor whose profile lifecycle state is SUSPENDED to the
 * suspended-account screen before they can reach normal tutor operations
 * (PRD section 13 / tutor-lifecycle skill). Non-tutor roles pass through.
 */
export async function requireActiveTutor(): Promise<AuthSession> {
  const session = await requireRole(["TUTOR"]);
  if (session.tutor?.verificationStatus === "SUSPENDED") {
    redirect("/suspended");
  }
  return session;
}

/**
 * Enforces branch scope for Branch Admin callers: SUPER_ADMIN passes
 * through, BRANCH_ADMIN must match the resource's branch exactly. Never
 * trust a client-supplied branch ID — always compare against the caller's
 * own session-derived branchId (role-authorization skill).
 */
export function assertBranchScope(session: AuthSession, resourceBranchId: string | null): void {
  if (session.role === "SUPER_ADMIN") return;
  if (session.role === "BRANCH_ADMIN" && session.branchId && session.branchId === resourceBranchId) {
    return;
  }
  throw new Error("BRANCH_SCOPE_VIOLATION");
}
