import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "@/components/wizard/FormRow";
import { QuestionCard } from "@/components/intake/question-card";
import { YesNoPill } from "@/components/intake/yes-no-pill";
import type { PortalStepErrors } from "@/lib/intake/portal/validation";
import type { IntakeDraft } from "@/lib/intake/types";

interface AssetsStepProps {
  draft: IntakeDraft;
  errors: PortalStepErrors;
  showErrors: boolean;
  updateWill: (updates: Partial<IntakeDraft["will"]>) => void;
}

export function AssetsStep({ draft, errors, showErrors, updateWill }: AssetsStepProps) {
  const { will } = draft;
  const err = (key: keyof PortalStepErrors) => (showErrors ? errors[key] : undefined);

  return (
    <div className="space-y-6">
      <QuestionCard title="Estate size" description="A quick range lets us confirm filing fees and registry expectations.">
        <FormRow fieldId="assets-estate-range" label="Approximate estate value" error={err("willEstateValueRange")} required>
          <select
            value={will.estateValueRange}
            onChange={(event) => updateWill({ estateValueRange: event.target.value as typeof will.estateValueRange })}
            className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-4 py-3 text-sm"
          >
            <option value="<$100k">Under $100,000</option>
            <option value="$100k-$500k">$100,000 – $500,000</option>
            <option value="$500k-$1M">$500,000 – $1M</option>
            <option value=">$1M">Over $1M</option>
          </select>
        </FormRow>
        <FormRow fieldId="assets-real-property" label="Does the estate include real property?" error={err("willAnyRealProperty")} required>
          <YesNoPill value={will.anyRealProperty} onChange={(value) => updateWill({ anyRealProperty: value })} questionId="assets-real-property" />
        </FormRow>
        <FormRow fieldId="assets-real-details" label="Real property details" error={err("willRealPropertyDetails")}>
          <Textarea
            rows={3}
            value={will.realPropertyDetails}
            onChange={(event) => updateWill({ realPropertyDetails: event.target.value })}
            placeholder="Addresses, type of ownership, approximate value"
          />
        </FormRow>
      </QuestionCard>

      <QuestionCard title="Accounts and debts" description="Summaries are fine—list whatever helps us prepare the P10 inventory.">
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="assets-liabilities" label="Liabilities / debts" error={err("willLiabilities")}>
            <Textarea rows={3} value={will.liabilities} onChange={(event) => updateWill({ liabilities: event.target.value })} />
          </FormRow>
          <FormRow fieldId="assets-bank" label="Bank accounts" error={err("willBankAccounts")}>
            <Textarea rows={3} value={will.bankAccounts} onChange={(event) => updateWill({ bankAccounts: event.target.value })} />
          </FormRow>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="assets-investments" label="Investment accounts" error={err("willInvestmentAccounts")}>
            <Textarea rows={3} value={will.investmentAccounts} onChange={(event) => updateWill({ investmentAccounts: event.target.value })} />
          </FormRow>
          <FormRow fieldId="assets-insurance" label="Insurance policies" error={err("willInsurancePolicies")}>
            <Textarea rows={3} value={will.insurancePolicies} onChange={(event) => updateWill({ insurancePolicies: event.target.value })} />
          </FormRow>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="assets-business" label="Business interests" error={err("willBusinessInterests")}>
            <Textarea rows={3} value={will.businessInterests} onChange={(event) => updateWill({ businessInterests: event.target.value })} />
          </FormRow>
          <FormRow fieldId="assets-digital" label="Digital assets" error={err("willDigitalAssets")}>
            <Textarea rows={3} value={will.digitalAssets} onChange={(event) => updateWill({ digitalAssets: event.target.value })} />
          </FormRow>
        </div>
      </QuestionCard>
    </div>
  );
}
