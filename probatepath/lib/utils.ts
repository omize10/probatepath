import { type MutableRefObject } from "react";

export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassDictionary
  | ClassValue[];

export interface ClassDictionary {
  [className: string]: boolean | string | number | null | undefined;
}

function toValue(value: ClassValue): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(toValue).filter(Boolean).join(" ");
  }

  const entries = Object.entries(value)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([className]) => className);

  return entries.join(" ");
}

export function cn(...inputs: ClassValue[]): string {
  return inputs.map(toValue).filter(Boolean).join(" ");
}

export function mergeRefs<T>(
  ...refs: Array<MutableRefObject<T | null> | ((instance: T | null) => void) | null | undefined>
): (instance: T | null) => void {
  return (instance) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(instance);
        continue;
      }
      try {
        // eslint-disable-next-line no-param-reassign
        ref.current = instance;
      } catch {
        // ignore if ref is read only
      }
    }
  };
}
