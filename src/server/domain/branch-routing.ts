import { branchesCollection, geographicLocationsCollection } from "./collections";
import { getLocationAncestry } from "@/server/queries/location-hierarchy";

/**
 * Resolves which Branch a location belongs to.
 *
 * Routing precedence:
 * 1. Structured Branch Coverage (District + optional Municipality list):
 *    - Matches if the location's parent district is listed in `branch.coverage`:
 *      - If specific `localGovernmentIds` are defined: matches ONLY if the
 *        location's Local Government ID is in that list.
 *      - If NO `localGovernmentIds` are defined (or empty): matches the ENTIRE district!
 * 2. Legacy Fallback (for branches configured only with a free-text city):
 *    - Matches the covering Local Government's name against `Branch.city` via exact or
 *      case-insensitive substring match.
 *
 * Returns null (unrouted, Super-Admin-only visibility) when no active branch matches.
 */
export async function resolveBranchIdForLocation(locationId: string): Promise<string | null> {
  const locationSnap = await geographicLocationsCollection().doc(locationId).get();
  if (!locationSnap.exists) return null;
  const location = locationSnap.data()!;

  let localGovernmentId: string | null = null;
  let localGovernmentName: string | null = null;
  let localGovernmentNameEnglish: string | null = null;
  let districtId: string | null = null;

  if (location.level === "CITY") {
    // M3-era provisional record — match directly (see location-seed-data.ts).
    localGovernmentName = location.name;
  } else if (location.level === "WARD") {
    const ancestry = await getLocationAncestry(locationId);
    const localGov = ancestry.find((l) => l.level === "LOCAL_GOVERNMENT");
    const dist = ancestry.find((l) => l.level === "DISTRICT");
    if (!localGov) return null;
    localGovernmentId = localGov.id;
    localGovernmentName = localGov.name;
    localGovernmentNameEnglish = localGov.nameEnglish;
    if (dist) districtId = dist.id;
  } else if (location.level === "LOCAL_GOVERNMENT") {
    localGovernmentId = location.id;
    localGovernmentName = location.name;
    localGovernmentNameEnglish = location.nameEnglish;
    districtId = location.parentLocationId;
  } else {
    return null; // PROVINCE/DISTRICT are too coarse to route to a single branch.
  }

  const branchSnap = await branchesCollection().where("status", "==", "ACTIVE").get();
  const activeBranches = branchSnap.docs.map((d) => d.data());

  // Pass 1: Structured coverage matching
  for (const branch of activeBranches) {
    if (branch.coverage && branch.coverage.length > 0) {
      if (districtId) {
        const distCoverage = branch.coverage.find((c) => c.districtId === districtId);
        if (distCoverage) {
          if (distCoverage.localGovernmentIds && distCoverage.localGovernmentIds.length > 0) {
            if (localGovernmentId && distCoverage.localGovernmentIds.includes(localGovernmentId)) {
              return branch.id;
            }
            // In this district, but this branch only covers other specific municipalities.
            continue;
          }
          // No specific municipalities specified => ENTIRE district covered!
          return branch.id;
        }
      }

      // Direct municipality coverage list fallback
      if (localGovernmentId && branch.coverageLocalGovernmentIds?.includes(localGovernmentId)) {
        return branch.id;
      }
    }
  }

  // Pass 2: Legacy fallback for branches without structured coverage
  const candidates = [localGovernmentName, localGovernmentNameEnglish].filter(
    (v): v is string => Boolean(v),
  );

  for (const branch of activeBranches) {
    if (!branch.coverage || branch.coverage.length === 0) {
      const city = branch.city.trim().toLowerCase();
      const isMatch = candidates.some((name) => {
        const n = name.trim().toLowerCase();
        return n === city || n.includes(city) || city.includes(n);
      });
      if (isMatch) return branch.id;
    }
  }

  return null;
}
