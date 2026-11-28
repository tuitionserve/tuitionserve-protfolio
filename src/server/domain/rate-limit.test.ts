import { describe, expect, it } from "vitest";
import { checkRateLimitKey, isHoneypotTriggered } from "./rate-limit";

describe("rate-limit", () => {
  it("allows requests up to the limit and blocks excess within window", () => {
    const key = "test:ip-1";
    const base = 1_000_000;
    expect(checkRateLimitKey(key, 2, 60_000, base).allowed).toBe(true);
    expect(checkRateLimitKey(key, 2, 60_000, base + 1000).allowed).toBe(true);
    expect(checkRateLimitKey(key, 2, 60_000, base + 2000).allowed).toBe(false);
    // Once window slides past the first timestamp, allows again.
    expect(checkRateLimitKey(key, 2, 60_000, base + 61_000).allowed).toBe(true);
  });

  it("detects non-empty honeypot submissions", () => {
    const clean = new FormData();
    clean.set("_hp_check", "");
    expect(isHoneypotTriggered(clean)).toBe(false);

    const bot = new FormData();
    bot.set("_hp_check", "http://spam.example");
    expect(isHoneypotTriggered(bot)).toBe(true);
  });
});
