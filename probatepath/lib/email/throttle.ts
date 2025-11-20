const windowMs = 30 * 60 * 1000; // 30 minutes
const maxPerWindow = 5;

type Entry = { count: number; windowStart: number };

const map = new Map<string, Entry>();

export function canSend(key: string) {
  const now = Date.now();
  const existing = map.get(key);
  if (!existing) {
    map.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (now - existing.windowStart > windowMs) {
    map.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (existing.count >= maxPerWindow) return false;
  existing.count += 1;
  return true;
}

export function resetKey(key: string) {
  map.delete(key);
}

export function getCounts(key: string) {
  return map.get(key) ?? { count: 0, windowStart: 0 };
}

export default { canSend, resetKey, getCounts };
