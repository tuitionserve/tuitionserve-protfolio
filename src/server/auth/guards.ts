import { redirect } from "next/navigation";
import { getCurrentSession, type AuthSession } from "./session";
import type { Role } from "@/server/domain/types";

/** Redirects to /login when there is no valid session. */
export async function requireSession(): Promise<AuthSession> {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return session;
}

/** Redirects to /login unless the caller's role is one of `roles`. */
export async function requireRole(roles: Role[]): Promise<AuthSession> {
  const session = await requireSession();
  if (!roles.includes(session.role)) redirect("/login");
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
