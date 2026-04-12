// Lightweight in-process rate limiter. Not durable across serverless
// instances, but enough to slow casual abuse before things hit downstream
// systems (Resend, Twilio, Retell, the DB).
const buckets = new Map<string, { count: number; firstAt: number }>();

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec?: number;
}

export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.firstAt > windowMs) {
    buckets.set(key, { count: 1, firstAt: now });
    return { ok: true };
  }
  entry.count += 1;
  if (entry.count > max) {
    return { ok: false, retryAfterSec: Math.ceil((entry.firstAt + windowMs - now) / 1000) };
  }
  return { ok: true };
}

export function ipFromRequest(req: Request): string {
  return (
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
