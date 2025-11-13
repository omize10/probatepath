import type { IntakeDraft } from "@/lib/intake/types";

const USER_KEY = "pp_user";
const CHECKLIST_KEY = "pp_portal_checklist";
const DRAFT_KEY = "pp_intake_draft";

export type PortalUser = {
  email: string;
  signedInAt?: string;
};

export type ChecklistState = Record<string, boolean>;

const isBrowser = () => typeof window !== "undefined";

export function loadUser(): PortalUser | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalUser;
  } catch {
    return null;
  }
}

export function loadChecklist(): ChecklistState {
  if (!isBrowser()) return {};
  const raw = window.localStorage.getItem(CHECKLIST_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ChecklistState;
  } catch {
    return {};
  }
}

export function saveChecklist(state: ChecklistState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
}

export function setChecklistItem(id: string, completed: boolean) {
  const current = loadChecklist();
  current[id] = completed;
  saveChecklist(current);
  return current;
}

export function clearChecklist() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(CHECKLIST_KEY);
}

export function loadDraft(): IntakeDraft | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IntakeDraft;
  } catch {
    return null;
  }
}

export type DraftStatus = "Not started" | "In progress" | "Ready to submit";

export function deriveDraftStatus(draft: IntakeDraft | null): DraftStatus {
  if (!draft) return "Not started";
  const sections = [draft.welcome, draft.executor, draft.deceased, draft.will];
  const hasAny = sections.some((section) => Object.values(section).some(Boolean));
  if (!hasAny) return "Not started";
  if (draft.confirmation?.confirmed) return "Ready to submit";
  return "In progress";
}
