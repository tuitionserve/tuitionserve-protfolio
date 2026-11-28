import { headers } from "next/headers";

interface BucketEntry {
  timestamps: number[];
}

const buckets = new Map<string, BucketEntry>();
const MAX_BUCKETS = 5000;

/**
 * Lightweight in-memory sliding-window rate limiter keyed by client IP +
 * namespace. Protects public form endpoints against burst spam without
 * extra Firestore reads per request. Bounded map size prevents memory
 * growth on long-lived Node servers.
 */
export async function checkPublicRateLimit(
  namespace: string,
  maxRequests = 8,
  windowMs = 10 * 60 * 1000,
): Promise<{ allowed: boolean }> {
  let clientIp = "unknown";
  try {
    const hdrs = await headers();
    const forwarded = hdrs.get("x-forwarded-for");
    const realIp = hdrs.get("x-real-ip");
    clientIp = (forwarded?.split(",")[0] ?? realIp ?? "unknown").trim() || "unknown";
  } catch {
    // Outside a request context (e.g. unit tests) — fall back to a shared key.
  }

  return checkRateLimitKey(`${namespace}:${clientIp}`, maxRequests, windowMs);
}

/** Pure synchronous helper (also unit-testable directly). */
export function checkRateLimitKey(
  key: string,
  maxRequests: number,
  windowMs: number,
  now = Date.now(),
): { allowed: boolean } {
  const cutoff = now - windowMs;
  const entry = buckets.get(key);

  if (entry) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length >= maxRequests) {
      return { allowed: false };
    }
    entry.timestamps.push(now);
    return { allowed: true };
  }

  if (buckets.size >= MAX_BUCKETS) {
    // Evict the oldest bucket entry to keep memory bounded.
    const oldestKey = buckets.keys().next().value;
    if (oldestKey !== undefined) buckets.delete(oldestKey);
  }

  buckets.set(key, { timestamps: [now] });
  return { allowed: true };
}

/** Hidden anti-bot honeypot field check. */
export function isHoneypotTriggered(formData: FormData): boolean {
  const value = formData.get("_hp_check");
  return typeof value === "string" && value.trim().length > 0;
}
