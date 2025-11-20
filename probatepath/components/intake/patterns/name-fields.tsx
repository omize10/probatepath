'use client';

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface StructuredNameValue {
  first: string;
  middle1: string;
  middle2: string;
  middle3: string;
  last: string;
  suffix?: string;
}

interface NameFieldsProps {
  value: StructuredNameValue;
  onChange: (value: StructuredNameValue) => void;
  errors?: Partial<Record<keyof StructuredNameValue, string>>;
  helperText?: string;
  className?: string;
}

export function NameFields({ value, onChange, errors, helperText, className }: NameFieldsProps) {
  const handleChange = (key: keyof StructuredNameValue, newValue: string) => {
    onChange({ ...value, [key]: newValue });
  };

  const field = (id: keyof StructuredNameValue, label: string, required = false) => (
    <label key={id} className="space-y-2 text-sm text-[color:var(--ink)]">
      <span className="flex items-center gap-1 font-semibold">
        {label}
        {required ? <span className="text-[color:var(--error)]">*</span> : null}
      </span>
      <Input value={value[id] ?? ""} onChange={(event) => handleChange(id, event.target.value)} aria-invalid={errors?.[id] ? true : undefined} />
      {errors?.[id] ? <span className="text-xs text-[color:var(--error)]">{errors[id]}</span> : null}
    </label>
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-4 md:grid-cols-2">
        {field("first", "First name", true)}
        {field("last", "Last name", true)}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {field("middle1", "Middle name 1")}
        {field("middle2", "Middle name 2")}
        {field("middle3", "Middle name 3")}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {field("suffix", "Suffix / honourific")}
        <div className="md:col-span-2 text-xs text-[color:var(--ink-muted)]">{helperText ?? "Use full legal names exactly as they appear on ID or the will."}</div>
      </div>
    </div>
  );
}
