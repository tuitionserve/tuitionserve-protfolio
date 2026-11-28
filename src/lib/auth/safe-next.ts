/**
 * Sanitizes an optional post-login/post-registration `?next=` redirect path.
 * Only permits same-origin relative paths scoped to the user's portal so
 * open redirects and cross-role landings cannot occur.
 */
export function resolveSafeNextPath(nextParam: string | null | undefined, role: string): string {
  const defaultPath = role === "TUTOR" ? "/tutor/dashboard" : "/admin/dashboard";
  if (!nextParam) return defaultPath;

  const trimmed = nextParam.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return defaultPath;
  }

  if (role === "TUTOR") {
    if (trimmed.startsWith("/tutor") || trimmed.startsWith("/vacancies")) {
      return trimmed;
    }
    return defaultPath;
  }

  if (trimmed.startsWith("/admin") || trimmed.startsWith("/vacancies")) {
    return trimmed;
  }
  return defaultPath;
}
