import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormRowProps {
  fieldId: string;
  label: string;
  description?: string;
  error?: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}

export function FormRow({ fieldId, label, description, error, children, hint, required }: FormRowProps) {
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  let control = children;

  if (isValidElement(children)) {
    const element = children as ReactElement<Record<string, unknown>>;
    control = cloneElement(element, {
      id: element.props.id ?? fieldId,
      "aria-describedby": [element.props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined,
      "aria-invalid": error ? true : undefined,
    });
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="text-sm font-semibold text-slate-200"
      >
        {label}
        {required ? <span className="ml-1 text-xs font-normal text-slate-400">(required)</span> : null}
      </label>
      {description ? (
        <p id={descriptionId} className="text-sm text-slate-400">
          {description}
        </p>
      ) : null}
      {control}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-[#ffb703]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
