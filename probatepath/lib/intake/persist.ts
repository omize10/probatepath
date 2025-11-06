import type { IntakeDraft } from "@/lib/intake/types";

const STORAGE_KEY = "probatepath:intake-draft";

const isBrowser = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

export function saveDraft(draft: IntakeDraft) {
  if (!isBrowser()) return;
  try {
    const payload = JSON.stringify(draft);
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // Ignore persistence errors (e.g. storage full or disabled).
  }
}

export function loadDraft(): IntakeDraft | null {
  if (!isBrowser()) return null;
  try {
    const payload = window.localStorage.getItem(STORAGE_KEY);
    if (!payload) return null;
    return JSON.parse(payload) as IntakeDraft;
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
