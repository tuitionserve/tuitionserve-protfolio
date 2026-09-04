import { branchesCollection, geographicLocationsCollection } from "./collections";

/**
 * Resolves which Branch a city-level GeographicLocation belongs to, by
 * exact name match against `Branch.city` (both are admin-entered/seeded
 * from the same city vocabulary — see location-seed-data.ts). Used to
 * route both tutor verification review and parent tuition requests to the
 * correct Branch Admin (PRD section 25 / BRANCH-001).
 *
 * Returns null when the location isn't city-level or no branch covers
 * that city yet — callers must treat that as "unrouted" (visible to Super
 * Admin only), never as an error, since not every city has a branch.
 */
export async function resolveBranchIdForLocation(locationId: string): Promise<string | null> {
  const locationSnap = await geographicLocationsCollection().doc(locationId).get();
  if (!locationSnap.exists) return null;
  const location = locationSnap.data()!;
  if (location.level !== "CITY") return null;

  const branchSnap = await branchesCollection()
    .where("city", "==", location.name)
    .where("status", "==", "ACTIVE")
    .limit(1)
    .get();

  return branchSnap.empty ? null : branchSnap.docs[0]!.id;
}
