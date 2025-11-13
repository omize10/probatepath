'use client';

import { useMemo, useState } from "react";
import { StepShell } from "@/components/wizard/StepShell";
import { FormRow } from "@/components/wizard/FormRow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Guard } from "@/components/wizard/Guard";
import { useIntake } from "@/lib/intake/store";
import { extractErrors, willSchema } from "@/lib/intake/schema";
import { useWizard } from "@/components/wizard/use-wizard";
import { saveIntakeStep } from "@/lib/intake/api";

export default function StepFourPage() {
  const { draft, update } = useIntake();
  const { goNext } = useWizard("will");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const values = draft.will;

  const isValid = useMemo(() => willSchema.safeParse(values).success, [values]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = willSchema.safeParse(values);
    if (!result.success) {
      setErrors(extractErrors(result.error));
      return;
    }
    setErrors({});
    await saveIntakeStep("will", values);
    goNext();
  };

  const updateField = (key: keyof typeof values, value: string) => update("will", { ...values, [key]: value });

  return (
    <>
      <Guard stepId="will" />
      <StepShell
        stepId="will"
        title="Will and estate details"
        description="Tell us where documents are stored and give a sense of the estate so we can confirm fit for the fixed fee."
        isNextDisabled={!isValid}
        onSubmit={handleSubmit}
        image={{ src: "/images/steps-5.jpg", alt: "Documents showing estate overview" }}
      >
        <div className="grid gap-6">
          <FormRow fieldId="will-location" label="Where is the original will kept?" error={errors.willLocation} required>
            <Input
              id="will-location"
              value={values.willLocation}
              onChange={(event) => updateField("willLocation", event.target.value)}
              placeholder="Locked home file cabinet, downtown Vancouver apartment"
            />
          </FormRow>

          <FormRow fieldId="will-estate-value" label="Approximate estate value" error={errors.estateValueRange} required>
            <select
              id="will-estate-value"
              value={values.estateValueRange}
              onChange={(event) =>
                updateField("estateValueRange", event.target.value as typeof values.estateValueRange)
              }
              className="w-full rounded-2xl border border-[#d7ddec] bg-white px-4 py-3 text-sm text-[#0f172a] shadow-sm transition focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="<$100k">Under $100,000</option>
              <option value="$100k-$500k">$100,000 – $500,000</option>
              <option value="$500k-$1M">$500,000 – $1M</option>
              <option value=">$1M">Over $1M</option>
            </select>
          </FormRow>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BinaryRow
            label="Does the estate include any real property (homes, land)?"
            value={values.anyRealProperty}
            onChange={(choice) => updateField("anyRealProperty", choice)}
            error={errors.anyRealProperty}
          />
          <BinaryRow
            label="Are there multiple beneficiaries?"
            value={values.multipleBeneficiaries}
            onChange={(choice) => updateField("multipleBeneficiaries", choice)}
            error={errors.multipleBeneficiaries}
          />
          <BinaryRow
            label="Are there codicils?"
            value={values.hasCodicils}
            onChange={(choice) => updateField("hasCodicils", choice)}
            error={errors.hasCodicils}
          />
          <BinaryRow
            label="Do you need us to help coordinate notarisation?"
            value={values.notaryNeeded}
            onChange={(choice) => updateField("notaryNeeded", choice)}
            error={errors.notaryNeeded}
          />
        </div>

        <FormRow fieldId="will-codicil-details" label="Codicil details" error={errors.codicilDetails}>
          <Textarea
            id="will-codicil-details"
            rows={3}
            value={values.codicilDetails}
            onChange={(event) => updateField("codicilDetails", event.target.value)}
            placeholder="Describe any amendments or attachments"
          />
        </FormRow>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormRow fieldId="will-registry" label="Preferred probate registry" error={errors.probateRegistry}>
            <Input
              id="will-registry"
              value={values.probateRegistry}
              onChange={(event) => updateField("probateRegistry", event.target.value)}
              placeholder="Vancouver Supreme Court"
            />
          </FormRow>
          <FormRow fieldId="will-expected-date" label="Target filing date" error={errors.expectedFilingDate}>
            <Input
              id="will-expected-date"
              type="date"
              value={values.expectedFilingDate}
              onChange={(event) => updateField("expectedFilingDate", event.target.value)}
            />
          </FormRow>
        </div>

        <FormRow fieldId="will-real-property-details" label="Real property details" error={errors.realPropertyDetails}>
          <Textarea
            id="will-real-property-details"
            rows={3}
            value={values.realPropertyDetails}
            onChange={(event) => updateField("realPropertyDetails", event.target.value)}
            placeholder="123 Main Street (principal residence), 10 acres in Kelowna, etc."
          />
        </FormRow>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormRow fieldId="will-liabilities" label="Liabilities / debts" error={errors.liabilities}>
            <Textarea
              id="will-liabilities"
              rows={3}
              value={values.liabilities}
              onChange={(event) => updateField("liabilities", event.target.value)}
              placeholder="LOC $15k, TD Visa $4k"
            />
          </FormRow>
          <FormRow fieldId="will-bank-accounts" label="Bank accounts" error={errors.bankAccounts}>
            <Textarea
              id="will-bank-accounts"
              rows={3}
              value={values.bankAccounts}
              onChange={(event) => updateField("bankAccounts", event.target.value)}
              placeholder="RBC Chequing ****1234, BMO savings"
            />
          </FormRow>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormRow fieldId="will-investments" label="Investment accounts" error={errors.investmentAccounts}>
            <Textarea
              id="will-investments"
              rows={3}
              value={values.investmentAccounts}
              onChange={(event) => updateField("investmentAccounts", event.target.value)}
            />
          </FormRow>
          <FormRow fieldId="will-insurance" label="Insurance policies" error={errors.insurancePolicies}>
            <Textarea
              id="will-insurance"
              rows={3}
              value={values.insurancePolicies}
              onChange={(event) => updateField("insurancePolicies", event.target.value)}
            />
          </FormRow>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormRow fieldId="will-business" label="Business interests" error={errors.businessInterests}>
            <Textarea
              id="will-business"
              rows={3}
              value={values.businessInterests}
              onChange={(event) => updateField("businessInterests", event.target.value)}
            />
          </FormRow>
          <FormRow fieldId="will-charity" label="Charitable gifts" error={errors.charitableGifts}>
            <Textarea
              id="will-charity"
              rows={3}
              value={values.charitableGifts}
              onChange={(event) => updateField("charitableGifts", event.target.value)}
            />
          </FormRow>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormRow fieldId="will-digital-assets" label="Digital assets" error={errors.digitalAssets}>
            <Textarea
              id="will-digital-assets"
              rows={3}
              value={values.digitalAssets}
              onChange={(event) => updateField("digitalAssets", event.target.value)}
              placeholder="Crypto wallets, online stores, cloud drives"
            />
          </FormRow>
          <FormRow fieldId="will-delivery" label="Document delivery preference" error={errors.documentDeliveryPreference}>
            <Input
              id="will-delivery"
              value={values.documentDeliveryPreference}
              onChange={(event) => updateField("documentDeliveryPreference", event.target.value)}
              placeholder="Secure download + courier"
            />
          </FormRow>
        </div>

        <FormRow fieldId="will-special" label="Any special circumstances we should know about?" error={errors.specialCircumstances}>
          <Textarea
            id="will-special"
            rows={4}
            value={values.specialCircumstances}
            onChange={(event) => updateField("specialCircumstances", event.target.value)}
            placeholder="Share anything that may affect timelines, notarisation, or court expectations."
          />
        </FormRow>

        <FormRow fieldId="will-special-requests" label="Special requests" error={errors.specialRequests}>
          <Textarea
            id="will-special-requests"
            rows={3}
            value={values.specialRequests}
            onChange={(event) => updateField("specialRequests", event.target.value)}
          />
        </FormRow>
      </StepShell>
    </>
  );
}

type YesNo = "yes" | "no";

interface BinaryRowProps {
  label: string;
  value: YesNo;
  onChange: (value: YesNo) => void;
  error?: string;
}

function BinaryRow({ label, value, onChange, error }: BinaryRowProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#0f172a]">{label}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {(["yes", "no"] as const).map((option) => (
          <button key={option} type="button" onClick={() => onChange(option)} className={cnRadio(option === value)}>
            {option === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
      {error ? <p className="text-xs font-medium text-[#c2410c]">{error}</p> : null}
    </div>
  );
}

function cnRadio(active: boolean) {
  return [
    "rounded-2xl border px-5 py-3 text-sm font-semibold transition sm:flex-1",
    active
      ? "border-[#ff6a00]/50 bg-[#fff3ec] text-[#0f172a]"
      : "border-[#d7ddec] bg-white text-[#495067] hover:border-[#1e3a8a]/40",
  ].join(" ");
}
