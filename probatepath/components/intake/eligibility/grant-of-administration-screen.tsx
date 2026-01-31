'use client';

import { Button } from "@/components/ui/button";

interface GrantOfAdministrationScreenProps {
  onContinue: () => void;
}

export function GrantOfAdministrationScreen({ onContinue }: GrantOfAdministrationScreenProps) {
  return (
    <section className="space-y-6 rounded-3xl border border-[color:var(--border-muted)] bg-gradient-to-br from-blue-50 to-white p-8 shadow-[0_40px_140px_-100px_rgba(59,130,246,0.5)]">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">
          Grant of Administration
        </p>
        <h2 className="font-serif text-3xl text-[color:var(--brand)]">
          It looks like you need a Grant of Administration
        </h2>
      </div>

      <div className="space-y-4">
        <p className="text-base text-[color:var(--ink-muted)]">
          When someone passes away without a will, the process is called{" "}
          <span className="font-semibold text-[color:var(--ink)]">"administration"</span>{" "}
          rather than "probate."
        </p>

        <p className="text-base text-[color:var(--ink-muted)]">
          <span className="font-semibold text-[color:var(--ink)]">Good news:</span>{" "}
          we handle this too with our Premium service, which includes additional support
          for the extra complexity of intestate estates.
        </p>
      </div>

      <div className="rounded-lg bg-blue-100 border border-blue-200 p-4">
        <p className="text-sm font-medium text-blue-900">
          What this means for you
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-800">
          <li>We'll determine the rightful administrators based on BC law</li>
          <li>We'll prepare all required court forms for administration</li>
          <li>We'll guide you through the additional steps required</li>
          <li>You'll get dedicated support throughout the process</li>
        </ul>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <Button size="lg" onClick={onContinue}>
          Continue to Premium recommendation
        </Button>
      </div>
    </section>
  );
}
