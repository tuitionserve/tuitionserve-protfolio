import { branchesCollection, geographicLocationsCollection } from "./collections";
import { getLocationAncestry } from "@/server/queries/location-hierarchy";

/**
 * Resolves which Branch a location belongs to, by matching the covering
 * Local Government's name against `Branch.city`. Accepts a WARD id (the
 * finest level tutors/parents select — walks up to its parent Local
 * Government) or, for backward compatibility with M3-era provisional
 * "CITY" records, a CITY id directly. Used to route both tutor
 * verification review and parent tuition requests to the correct Branch
 * Admin (PRD section 25 / BRANCH-001).
 *
 * Branch.city is free text entered when a Branch Admin is provisioned
 * (scripts/provision-admin.ts) and commonly the informal/short name
 * (e.g. "Janakpur"), which will not always exactly equal the official
 * Local Government name (e.g. "Janakpurdham" / "जनकपुरधाम
 * उपमहानगरपालिका"). Matching therefore checks, in order: exact name,
 * exact English name, then a case-insensitive substring match in either
 * direction — a documented v1 heuristic, not a guarantee every branch
 * resolves. Returns null (unrouted, Super-Admin-only visibility) rather
 * than guessing when nothing matches.
 */
export async function resolveBranchIdForLocation(locationId: string): Promise<string | null> {
  const locationSnap = await geographicLocationsCollection().doc(locationId).get();
  if (!locationSnap.exists) return null;
  const location = locationSnap.data()!;

  let localGovernmentName: string | null = null;
  let localGovernmentNameEnglish: string | null = null;

  if (location.level === "CITY") {
    // M3-era provisional record — match directly (see location-seed-data.ts).
    localGovernmentName = location.name;
  } else if (location.level === "WARD") {
    const ancestry = await getLocationAncestry(locationId);
    const localGovernment = ancestry.find((l) => l.level === "LOCAL_GOVERNMENT");
    if (!localGovernment) return null;
    localGovernmentName = localGovernment.name;
    localGovernmentNameEnglish = localGovernment.nameEnglish;
  } else if (location.level === "LOCAL_GOVERNMENT") {
    localGovernmentName = location.name;
    localGovernmentNameEnglish = location.nameEnglish;
  } else {
    return null; // PROVINCE/DISTRICT are too coarse to route to a single branch.
  }

  const branchSnap = await branchesCollection().where("status", "==", "ACTIVE").get();
  const candidates = [localGovernmentName, localGovernmentNameEnglish].filter(
    (v): v is string => Boolean(v),
  );

  for (const branch of branchSnap.docs) {
    const city = branch.data().city.trim().toLowerCase();
    const isMatch = candidates.some((name) => {
      const n = name.trim().toLowerCase();
      return n === city || n.includes(city) || city.includes(n);
    });
    if (isMatch) return branch.id;
  }

  return null;
}
