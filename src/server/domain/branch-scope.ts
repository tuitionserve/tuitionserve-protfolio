import type { AuthSession } from "@/server/auth/session";

/**
 * Resolves which branch a query should be scoped to, given an optional
 * client-requested filter. A Branch Admin is ALWAYS locked to their own
 * branch regardless of what's requested — never let a client-supplied
 * value widen their scope. A Super Admin sees everything by default
 * (null) and can optionally narrow to one branch via the filter.
 */
export function resolveBranchScope(session: AuthSession, requestedBranchFilter: string | null): string | null {
  if (session.role === "BRANCH_ADMIN") return session.branchId;
  return requestedBranchFilter || null;
}
