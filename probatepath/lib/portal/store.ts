'use client';

import { useSyncExternalStore } from "react";
import {
  defaultPortalDraft,
  portalChecklistItems,
  type PortalDraft,
  type PortalChecklistDefinition,
} from "@/lib/portal/mock";
import {
  journeySteps,
  type JourneyStepId,
  type JourneyStatus,
  type JourneyState,
  type JourneyEntry,
  createDefaultJourneyState,
} from "@/lib/portal/journey";

const DRAFT_KEY = "pp.draft";
const CHECKLIST_KEY = "pp.checklist";
const STEPS_KEY = "pp.steps";

type ChecklistEntry = {
  completed: boolean;
  updatedAt: string | null;
  meta?: Record<string, string>;
};

export type PortalChecklistState = Record<string, ChecklistEntry>;

type PortalSnapshot = {
  ready: boolean;
  draft: PortalDraft;
  checklist: PortalChecklistState;
  journey: JourneyState;
};

const defaultChecklistState: PortalChecklistState = portalChecklistItems.reduce((acc, item) => {
  acc[item.id] = { completed: false, updatedAt: null, meta: {} };
  return acc;
}, {} as PortalChecklistState);

const defaultJourneyState: JourneyState = createDefaultJourneyState();

let snapshot: PortalSnapshot = {
  ready: false,
  draft: defaultPortalDraft,
  checklist: defaultChecklistState,
  journey: defaultJourneyState,
};

const listeners = new Set<() => void>();
let hydrated = false;

const intakeStepOrder = ["welcome", "executor", "deceased", "willSearch", "notices", "review"] as const;

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function clone<T>(value: T): T {
  // structuredClone is available in modern runtimes but fall back if needed.
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function readStorage<T>(key: string): T | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function persistDraft(draft: PortalDraft) {
  if (!isBrowser()) return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function persistChecklist(state: PortalChecklistState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
}

function persistJourney(state: JourneyState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STEPS_KEY, JSON.stringify(state));
}

function mergeDraft(value: PortalDraft | null): PortalDraft {
  if (!value) {
    return clone(defaultPortalDraft);
  }
  const merged = clone(defaultPortalDraft);
  merged.progress = value.progress ?? merged.progress;
  merged.lastSaved = value.lastSaved ?? merged.lastSaved;
  merged.intake = {
    welcome: { ...merged.intake.welcome, ...value.intake?.welcome },
    executor: { ...merged.intake.executor, ...value.intake?.executor },
    deceased: { ...merged.intake.deceased, ...value.intake?.deceased },
    willSearch: { ...merged.intake.willSearch, ...value.intake?.willSearch },
    notices: { ...merged.intake.notices, ...value.intake?.notices },
    review: { ...merged.intake.review, ...value.intake?.review },
  };
  return merged;
}

function mergeChecklist(value: PortalChecklistState | null): PortalChecklistState {
  const merged: PortalChecklistState = clone(defaultChecklistState);
  if (!value) return merged;
  for (const key of Object.keys(merged)) {
    if (value[key]) {
      merged[key] = {
        completed: Boolean(value[key]?.completed),
        updatedAt: value[key]?.updatedAt ?? null,
        meta: { ...value[key]?.meta },
      };
    }
  }
  return merged;
}

function mergeJourney(value: JourneyState | null): JourneyState {
  const merged: JourneyState = clone(defaultJourneyState);
  if (!value) return merged;
  for (const key of Object.keys(merged)) {
    if (value[key as JourneyStepId]) {
      merged[key as JourneyStepId] = {
        status: value[key as JourneyStepId].status ?? "not_started",
        updatedAt: value[key as JourneyStepId].updatedAt ?? null,
      };
    }
  }
  return merged;
}

function hydrate() {
  if (hydrated || !isBrowser()) return;
  hydrated = true;
  const storedDraft = readStorage<PortalDraft>(DRAFT_KEY);
  const storedChecklist = readStorage<PortalChecklistState>(CHECKLIST_KEY);
  const storedJourney = readStorage<JourneyState>(STEPS_KEY);
  const draft = mergeDraft(storedDraft);
  const checklist = mergeChecklist(storedChecklist);
  const journey = mergeJourney(storedJourney);
  draft.progress = calculateProgress(draft, checklist);
  snapshot = { ready: true, draft, checklist, journey };
  persistDraft(draft);
  persistChecklist(checklist);
  persistJourney(journey);
  emit();
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => snapshot;

function intakeStepComplete(step: (typeof intakeStepOrder)[number], draft: PortalDraft): boolean {
  const data = draft.intake;
  switch (step) {
    case "welcome":
      return Boolean(data.welcome.email && data.welcome.consent);
    case "executor":
      return Boolean(data.executor.fullName && data.executor.city && data.executor.relation);
    case "deceased":
      return Boolean(data.deceased.fullName && data.deceased.dateOfDeath && data.deceased.city);
    case "willSearch":
      return Boolean(data.willSearch.searchAreas && data.willSearch.packetPrepared);
    case "notices":
      return Boolean(data.notices.recipients && data.notices.mailed);
    case "review":
      return Boolean(data.review.confirmed);
    default:
      return false;
  }
}

function calculateProgress(draft: PortalDraft, checklist: PortalChecklistState) {
  const intakeComplete = intakeStepOrder.reduce(
    (count, step) => (intakeStepComplete(step, draft) ? count + 1 : count),
    0,
  );
  const checklistComplete = portalChecklistItems.reduce(
    (count, item) => (checklist[item.id]?.completed ? count + 1 : count),
    0,
  );
  const total = intakeStepOrder.length + portalChecklistItems.length;
  if (total === 0) return 0;
  return Math.min(100, Math.round(((intakeComplete + checklistComplete) / total) * 100));
}

export function usePortalStore<T>(selector: (state: PortalSnapshot) => T): T {
  hydrate();
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return selector(state);
}

export function updatePortalDraft(mutator: (draft: PortalDraft) => void) {
  hydrate();
  const nextDraft = clone(snapshot.draft);
  mutator(nextDraft);
  nextDraft.lastSaved = new Date().toISOString();
  nextDraft.progress = calculateProgress(nextDraft, snapshot.checklist);
  snapshot = { ...snapshot, draft: nextDraft, ready: true };
  persistDraft(nextDraft);
  emit();
  return nextDraft;
}

export function setChecklistItem(
  id: PortalChecklistDefinition["id"],
  updates: Partial<Omit<ChecklistEntry, "updatedAt">> & { completed?: boolean }
) {
  hydrate();
  const current = snapshot.checklist[id] ?? { completed: false, updatedAt: null, meta: {} };
  const nextEntry: ChecklistEntry = {
    ...current,
    ...updates,
    updatedAt: updates.completed !== undefined ? new Date().toISOString() : current.updatedAt,
  };
  const nextChecklist = { ...snapshot.checklist, [id]: nextEntry };
  snapshot = {
    ...snapshot,
    checklist: nextChecklist,
  };
  snapshot.draft.progress = calculateProgress(snapshot.draft, nextChecklist);
  persistChecklist(nextChecklist);
  persistDraft(snapshot.draft);
  emit();
  return nextEntry;
}

export function updateChecklistMeta(id: PortalChecklistDefinition["id"], meta: Record<string, string>) {
  return setChecklistItem(id, {
    meta: {
      ...(snapshot.checklist[id]?.meta ?? {}),
      ...meta,
    },
  });
}

export function getPortalDraft(): PortalDraft {
  hydrate();
  return snapshot.draft;
}

export function getPortalChecklist(): PortalChecklistState {
  hydrate();
  return snapshot.checklist;
}

export function resetPortalData() {
  hydrate();
  snapshot = {
    ready: true,
    draft: clone(defaultPortalDraft),
    checklist: clone(defaultChecklistState),
    journey: clone(defaultJourneyState),
  };
  persistDraft(snapshot.draft);
  persistChecklist(snapshot.checklist);
  persistJourney(snapshot.journey);
  emit();
}

export function useJourneyState<T>(selector: (state: JourneyState) => T): T {
  hydrate();
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return selector(state.journey);
}

export function setJourneyStepStatus(id: JourneyStepId, status: JourneyStatus) {
  hydrate();
  const current = snapshot.journey[id] ?? { status: "not_started", updatedAt: null };
  const next: JourneyEntry = {
    status,
    updatedAt: new Date().toISOString(),
  };
  const nextJourney = { ...snapshot.journey, [id]: next };
  snapshot = { ...snapshot, journey: nextJourney };
  persistJourney(nextJourney);
  emit();
  return next;
}

export function getJourneyState() {
  hydrate();
  return snapshot.journey;
}

export function journeyProgress(journey: JourneyState) {
  const total = journeySteps.length;
  if (total === 0) return 0;
  const completed = journeySteps.reduce(
    (count, step) => (journey[step.id]?.status === "done" ? count + 1 : count),
    0,
  );
  return Math.round((completed / total) * 100);
}
