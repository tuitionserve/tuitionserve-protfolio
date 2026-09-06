// Not a "use server" module — a plain sync helper shared by several
// server action files. Server Actions files can only export async
// functions, so this can't live alongside them.
//
// Joins the full path with dots (e.g. "students.0.subjectIds") rather
// than just the first segment — identical to the old behavior for every
// flat field (a single-segment path joins to itself), but lets a nested
// array field (like a per-student block) surface an error keyed to the
// exact student/field a form can look up, instead of everything
// collapsing onto one generic top-level key.
export function fieldErrorsFrom(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join(".") : "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
