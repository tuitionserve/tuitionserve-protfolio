/** Client-safe location helpers — no Firebase imports, safe to use in "use client" components. */

export interface LocationNodeLike {
  name: string;
  nameEnglish: string | null;
}

/** Display label: English name when we have one, Nepali otherwise — never fabricated (M6 SOURCES.md). */
export function locationLabel(node: LocationNodeLike): string {
  return node.nameEnglish ? `${node.nameEnglish} (${node.name})` : node.name;
}

/** Ward IDs are derived deterministically from the local government code — no query needed. */
export function buildWardOptions(localGovernmentId: string, wardCount: number) {
  const code = localGovernmentId.replace(/^lg-/, "");
  return Array.from({ length: wardCount }, (_, i) => {
    const n = i + 1;
    return { id: `ward-${code}-${String(n).padStart(2, "0")}`, wardNumber: n };
  });
}
