'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { clearDraft, loadDraft, saveDraft } from "@/lib/intake/persist";
import { defaultIntakeDraft, type IntakeDraft } from "@/lib/intake/types";

type Action =
  | { type: "UPDATE"; section: keyof IntakeDraft; value: IntakeDraft[keyof IntakeDraft] }
  | { type: "RESET" }
  | { type: "LOAD"; payload: IntakeDraft };

function intakeReducer(state: IntakeDraft, action: Action): IntakeDraft {
  switch (action.type) {
    case "UPDATE":
      return {
        ...state,
        [action.section]: action.value,
      };
    case "LOAD":
      return action.payload;
    case "RESET":
      return defaultIntakeDraft;
    default:
      return state;
  }
}

type IntakeContextValue = {
  draft: IntakeDraft;
  hydrated: boolean;
  update: <Section extends keyof IntakeDraft>(section: Section, value: IntakeDraft[Section]) => void;
  reset: () => void;
  load: (payload: IntakeDraft) => void;
  persist: () => void;
};

const IntakeContext = createContext<IntakeContextValue | null>(null);

export function IntakeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(intakeReducer, defaultIntakeDraft);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadDraft();
    if (stored) {
      dispatch({ type: "LOAD", payload: stored });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDraft(state);
  }, [state, hydrated]);

  const value = useMemo<IntakeContextValue>(
    () => ({
      draft: state,
      hydrated,
      update: (section, value) => {
        dispatch({ type: "UPDATE", section, value });
      },
      reset: () => {
        dispatch({ type: "RESET" });
        clearDraft();
      },
      load: (payload) => {
        dispatch({ type: "LOAD", payload });
      },
      persist: () => {
        saveDraft(state);
      },
    }),
    [state, hydrated],
  );

  return <IntakeContext.Provider value={value}>{children}</IntakeContext.Provider>;
}

export function useIntake() {
  const context = useContext(IntakeContext);
  if (!context) {
    throw new Error("useIntake must be used within an <IntakeProvider />");
  }
  return context;
}
