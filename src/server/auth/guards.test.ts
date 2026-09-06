import { describe, expect, it } from "vitest";
import { assertBranchScope } from "./guards";
import type { AuthSession } from "./session";

function session(overrides: Partial<AuthSession>): AuthSession {
  return {
    uid: "u1",
    email: "a@example.com",
    fullName: null,
    role: "BRANCH_ADMIN",
    branchId: "branch-1",
    accountStatus: "ACTIVE",
    mustChangePassword: false,
    tutor: null,
    ...overrides,
  };
}

describe("assertBranchScope", () => {
  it("allows Super Admin to access any branch", () => {
    expect(() =>
      assertBranchScope(session({ role: "SUPER_ADMIN", branchId: null }), "branch-2"),
    ).not.toThrow();
  });

  it("allows Branch Admin to access their own branch's resource", () => {
    expect(() => assertBranchScope(session({ branchId: "branch-1" }), "branch-1")).not.toThrow();
  });

  it("blocks Branch Admin from another branch's resource", () => {
    expect(() => assertBranchScope(session({ branchId: "branch-1" }), "branch-2")).toThrow(
      "BRANCH_SCOPE_VIOLATION",
    );
  });

  it("blocks a Branch Admin with no assigned branch", () => {
    expect(() => assertBranchScope(session({ branchId: null }), "branch-1")).toThrow(
      "BRANCH_SCOPE_VIOLATION",
    );
  });

  it("blocks a Tutor from branch-scoped resources", () => {
    expect(() =>
      assertBranchScope(session({ role: "TUTOR", branchId: null }), "branch-1"),
    ).toThrow("BRANCH_SCOPE_VIOLATION");
  });
});
