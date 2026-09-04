import { describe, expect, it } from "vitest";
import { formatUid } from "./uid-format";

describe("formatUid", () => {
  it("formats a tutor UID with zero-padding", () => {
    expect(formatUid("tutor", 127)).toBe("TS-T-000127");
  });

  it("formats each entity kind with its own prefix", () => {
    expect(formatUid("tuition", 482, 5)).toBe("TS-TU-00482");
    expect(formatUid("application", 931, 5)).toBe("TS-APP-00931");
    expect(formatUid("assignment", 1)).toBe("TS-ASG-000001");
  });

  it("does not truncate a sequence longer than the pad width", () => {
    expect(formatUid("tutor", 1234567)).toBe("TS-T-1234567");
  });

  it("rejects non-positive or non-integer sequences", () => {
    expect(() => formatUid("tutor", 0)).toThrow();
    expect(() => formatUid("tutor", -1)).toThrow();
    expect(() => formatUid("tutor", 1.5)).toThrow();
  });
});
