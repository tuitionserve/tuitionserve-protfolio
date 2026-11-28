import { afterEach, describe, expect, it, vi } from "vitest";
import { buildAdsTxtContent, getAdSenseClientId, isAdUnitEnabled } from "./ads";

describe("AdSense helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("validates ca-pub client IDs strictly", () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "ca-pub-1234567890123456");
    expect(getAdSenseClientId()).toBe("ca-pub-1234567890123456");

    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "not-valid");
    expect(getAdSenseClientId()).toBeNull();
  });

  it("formats IAB ads.txt line cleanly", () => {
    expect(buildAdsTxtContent("ca-pub-1234567890123456")).toBe(
      "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n",
    );
    expect(buildAdsTxtContent(null)).toBeNull();
  });

  it("enables ad units only when both client ID and numeric slot ID are valid", () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "ca-pub-1234567890123456");
    expect(isAdUnitEnabled("9876543210")).toBe(true);
    expect(isAdUnitEnabled("")).toBe(false);
    expect(isAdUnitEnabled("invalid-slot")).toBe(false);

    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "");
    expect(isAdUnitEnabled("9876543210")).toBe(false);
  });
});
