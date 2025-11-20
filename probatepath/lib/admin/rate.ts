const MAP = new Map<string, { tokens: number; last: number }>();

export function checkRateLimit(key: string, capacity = 10, refillPerSec = 0.2) {
  const now = Date.now();
  const entry = MAP.get(key) ?? { tokens: capacity, last: now };
  const elapsed = (now - entry.last) / 1000;
  entry.tokens = Math.min(capacity, entry.tokens + elapsed * refillPerSec);
  entry.last = now;
  if (entry.tokens < 1) {
    MAP.set(key, entry);
    return false;
  }
  entry.tokens -= 1;
  MAP.set(key, entry);
  return true;
}
