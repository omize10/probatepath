'use client';

import { cva } from "class-variance-authority";
import { useId } from "react";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
  description?: string;
};

const pill = cva(
  "flex-1 rounded-full border px-4 py-3 text-center text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      selected: {
        true: "bg-[color:var(--brand)] text-white border-[color:var(--brand)]",
        false: "border-[color:var(--border-muted)] text-[color:var(--ink)] hover:border-[color:var(--brand)]",
      },
    },
  },
);

interface YesNoButtonsProps {
  value: string | null;
  options?: Option[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}

const defaultOptions: Option[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export function YesNoButtons({ value, options = defaultOptions, onChange, ariaLabel }: YesNoButtonsProps) {
  const groupId = useId();

  return (
    <div role="radiogroup" aria-labelledby={groupId} className="flex flex-col gap-3 sm:flex-row">
      <span id={groupId} className="sr-only">
        {ariaLabel ?? "Choose an option"}
      </span>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(pill({ selected }))}
          >
            <span className="text-base">{option.label}</span>
            {option.description ? <span className="mt-1 block text-xs font-normal text-[color:var(--ink-muted)]">{option.description}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
