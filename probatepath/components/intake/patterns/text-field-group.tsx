'use client';

import { Input } from "@/components/ui/input";

export interface AddressValue {
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

interface TextFieldGroupProps {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  errors?: Partial<Record<keyof AddressValue, string>>;
  legend?: string;
}

export function AddressFields({ value, onChange, errors, legend }: TextFieldGroupProps) {
  const handle = (key: keyof AddressValue, newValue: string) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <fieldset className="space-y-3">
      {legend ? <legend className="text-sm font-semibold text-[color:var(--ink)]">{legend}</legend> : null}
      <div className="grid gap-4">
        <label className="space-y-2 text-sm text-[color:var(--ink)]">
          <span>Address line 1 *</span>
          <Input value={value.line1} onChange={(event) => handle("line1", event.target.value)} aria-invalid={errors?.line1 ? true : undefined} />
          {errors?.line1 ? <span className="text-xs text-[color:var(--error)]">{errors.line1}</span> : null}
        </label>
        <label className="space-y-2 text-sm text-[color:var(--ink)]">
          <span>Address line 2</span>
          <Input value={value.line2} onChange={(event) => handle("line2", event.target.value)} />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-[color:var(--ink)]">
            <span>City *</span>
            <Input value={value.city} onChange={(event) => handle("city", event.target.value)} aria-invalid={errors?.city ? true : undefined} />
            {errors?.city ? <span className="text-xs text-[color:var(--error)]">{errors.city}</span> : null}
          </label>
          <label className="space-y-2 text-sm text-[color:var(--ink)]">
            <span>Province / Territory *</span>
            <Input value={value.region} onChange={(event) => handle("region", event.target.value)} aria-invalid={errors?.region ? true : undefined} />
            {errors?.region ? <span className="text-xs text-[color:var(--error)]">{errors.region}</span> : null}
          </label>
          <label className="space-y-2 text-sm text-[color:var(--ink)]">
            <span>Postal code *</span>
            <Input value={value.postalCode} onChange={(event) => handle("postalCode", event.target.value)} aria-invalid={errors?.postalCode ? true : undefined} />
            {errors?.postalCode ? <span className="text-xs text-[color:var(--error)]">{errors.postalCode}</span> : null}
          </label>
        </div>
        <label className="space-y-2 text-sm text-[color:var(--ink)]">
          <span>Country</span>
          <Input value={value.country} onChange={(event) => handle("country", event.target.value)} />
        </label>
      </div>
    </fieldset>
  );
}
