import { describe, expect, it, vi, beforeEach } from "vitest";
import { resolveBranchIdForLocation } from "./branch-routing";
import type { GeographicLocation, Branch } from "./types";

vi.mock("./collections", () => ({
  branchesCollection: vi.fn(),
  geographicLocationsCollection: vi.fn(),
}));

vi.mock("@/server/queries/location-hierarchy", () => ({
  getLocationAncestry: vi.fn(),
}));

import { branchesCollection, geographicLocationsCollection } from "./collections";
import { getLocationAncestry } from "@/server/queries/location-hierarchy";

const mockedBranchesCollection = vi.mocked(branchesCollection);
const mockedLocationsCollection = vi.mocked(geographicLocationsCollection);
const mockedGetLocationAncestry = vi.mocked(getLocationAncestry);

function mockLocation(loc: Partial<GeographicLocation>) {
  mockedLocationsCollection.mockReturnValue({
    doc: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({
        exists: true,
        data: () => loc as GeographicLocation,
      }),
    }),
  } as unknown as ReturnType<typeof geographicLocationsCollection>);
}

function mockBranches(branches: Partial<Branch>[]) {
  mockedBranchesCollection.mockReturnValue({
    where: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({
        docs: branches.map((b) => ({
          id: b.id ?? "branch-1",
          data: () => b as Branch,
        })),
      }),
    }),
  } as unknown as ReturnType<typeof branchesCollection>);
}

describe("resolveBranchIdForLocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes location when entire district is covered by a branch", async () => {
    mockLocation({ id: "ward-dhanushadham-1", level: "WARD" });

    mockedGetLocationAncestry.mockResolvedValue([
      { id: "ward-dhanushadham-1", level: "WARD" } as GeographicLocation,
      { id: "lg-dhanushadham", level: "LOCAL_GOVERNMENT", name: "धनुषाधाम नगरपालिका", nameEnglish: "Dhanushadham Municipality" } as GeographicLocation,
      { id: "district-dhanusha", level: "DISTRICT", name: "धनुषा", nameEnglish: "Dhanusha" } as GeographicLocation,
      { id: "province-madhesh", level: "PROVINCE", name: "मधेश", nameEnglish: "Madhesh" } as GeographicLocation,
    ]);

    mockBranches([
      {
        id: "branch-janakpur",
        name: "Janakpur Branch",
        city: "Janakpur",
        status: "ACTIVE",
        coverage: [
          {
            districtId: "district-dhanusha",
            localGovernmentIds: [], // entire district
          },
        ],
      },
    ]);

    const branchId = await resolveBranchIdForLocation("ward-dhanushadham-1");
    expect(branchId).toBe("branch-janakpur");
  });

  it("routes location when specific municipality matches", async () => {
    mockLocation({ id: "ward-janakpur-1", level: "WARD" });

    mockedGetLocationAncestry.mockResolvedValue([
      { id: "ward-janakpur-1", level: "WARD" } as GeographicLocation,
      { id: "lg-janakpurdham", level: "LOCAL_GOVERNMENT", name: "जनकपुरधाम उपमहानगरपालिका", nameEnglish: "Janakpurdham" } as GeographicLocation,
      { id: "district-dhanusha", level: "DISTRICT", name: "धनुषा", nameEnglish: "Dhanusha" } as GeographicLocation,
    ]);

    mockBranches([
      {
        id: "branch-janakpur",
        name: "Janakpur Branch",
        city: "Janakpur",
        status: "ACTIVE",
        coverage: [
          {
            districtId: "district-dhanusha",
            localGovernmentIds: ["lg-janakpurdham"],
          },
        ],
      },
    ]);

    const branchId = await resolveBranchIdForLocation("ward-janakpur-1");
    expect(branchId).toBe("branch-janakpur");
  });

  it("does not match branch if district is restricted and this municipality is not included", async () => {
    mockLocation({ id: "ward-dhanushadham-1", level: "WARD" });

    mockedGetLocationAncestry.mockResolvedValue([
      { id: "ward-dhanushadham-1", level: "WARD" } as GeographicLocation,
      { id: "lg-dhanushadham", level: "LOCAL_GOVERNMENT", name: "धनुषाधाम नगरपालिका", nameEnglish: "Dhanushadham" } as GeographicLocation,
      { id: "district-dhanusha", level: "DISTRICT", name: "धनुषा", nameEnglish: "Dhanusha" } as GeographicLocation,
    ]);

    mockBranches([
      {
        id: "branch-janakpur",
        name: "Janakpur Branch",
        city: "Janakpur",
        status: "ACTIVE",
        coverage: [
          {
            districtId: "district-dhanusha",
            localGovernmentIds: ["lg-janakpurdham"], // Only Janakpurdham, not Dhanushadham
          },
        ],
      },
    ]);

    const branchId = await resolveBranchIdForLocation("ward-dhanushadham-1");
    expect(branchId).toBeNull();
  });

  it("falls back to legacy city name match when branch has no structured coverage", async () => {
    mockLocation({ id: "ward-pokhara-1", level: "WARD" });

    mockedGetLocationAncestry.mockResolvedValue([
      { id: "ward-pokhara-1", level: "WARD" } as GeographicLocation,
      { id: "lg-pokhara", level: "LOCAL_GOVERNMENT", name: "पोखरा महानगरपालिका", nameEnglish: "Pokhara Metropolitan City" } as GeographicLocation,
      { id: "district-kaski", level: "DISTRICT", name: "कास्की", nameEnglish: "Kaski" } as GeographicLocation,
    ]);

    mockBranches([
      {
        id: "branch-pokhara",
        name: "Pokhara Branch",
        city: "Pokhara",
        status: "ACTIVE",
        // No coverage defined -> legacy fallback
      },
    ]);

    const branchId = await resolveBranchIdForLocation("ward-pokhara-1");
    expect(branchId).toBe("branch-pokhara");
  });
});
