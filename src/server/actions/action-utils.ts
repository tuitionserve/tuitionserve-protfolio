// Not a "use server" module — a plain sync helper shared by several
// server action files. Server Actions files can only export async
// functions, so this can't live alongside them.
export function fieldErrorsFrom(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
