const CLIENT_KEY = "probatepath:client-key";
const MATTER_ID_KEY = "probatepath:matter-id";

const isBrowser = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function getClientKey() {
  if (!isBrowser()) return "server-client-key";
  const existing = window.localStorage.getItem(CLIENT_KEY);
  if (existing) return existing;
  const fresh = generateId();
  window.localStorage.setItem(CLIENT_KEY, fresh);
  return fresh;
}

export function setClientKey(key: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CLIENT_KEY, key);
}

export function setMatterId(id: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(MATTER_ID_KEY, id);
}

export function getMatterId() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(MATTER_ID_KEY);
}

export function clearMatterSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(MATTER_ID_KEY);
}
