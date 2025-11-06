import {
  cloneElement,
  isValidElement,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

type ClassValue = string | number | null | undefined | false | ClassDictionary | ClassValue[];

interface ClassDictionary {
  [className: string]: ClassValue | boolean;
}

function toClassName(value: ClassValue): string {
  if (!value) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value.map(toClassName).filter(Boolean).join(" ");
  }

  return Object.entries(value)
    .filter(([, condition]) => Boolean(condition))
    .map(([className]) => className)
    .join(" ");
}

export function cn(...inputs: ClassValue[]): string {
  return inputs.map(toClassName).filter(Boolean).join(" ");
}

type PossibleRef<T> = Ref<T> | MutableRefObject<T | null> | null | undefined;

export function mergeRefs<T>(...refs: PossibleRef<T>[]) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(value);
        return;
      }
      try {
        (ref as MutableRefObject<T | null>).current = value;
      } catch {
        // Ignore errors if the ref is read-only.
      }
    });
  };
}

export function cloneWithClassName<T extends HTMLElement>(
  child: ReactNode,
  className: string,
  ref?: Ref<T>,
  extraProps?: Record<string, unknown>,
): ReactNode {
  if (!isValidElement(child)) {
    return child;
  }

  const element = child as ReactElement<{ className?: string }>;
  const existingRef = (element as ReactElement & { ref?: Ref<T> }).ref;

  const mergedRef = mergeRefs(existingRef, ref);

  return cloneElement(
    element as ReactElement,
    {
      ...extraProps,
      className: cn(element.props.className, className),
      ref: mergedRef,
    } as any,
  );
}
