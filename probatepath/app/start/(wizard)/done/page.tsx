'use client';

import Link from "next/link";
import { StepShell } from "@/components/wizard/StepShell";
import { Guard } from "@/components/wizard/Guard";
import { Button } from "@/components/ui/button";
import { useIntake } from "@/lib/intake/store";
import { useWizard } from "@/components/wizard/use-wizard";

export default function DonePage() {
  const { draft, reset } = useIntake();
  const { goto } = useWizard("done");

  const handleDownload = () => {
    const payload = JSON.stringify(draft, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "probatepath-intake-draft.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleStartOver = () => {
    reset();
    goto("welcome");
  };

  return (
    <>
      <Guard stepId="done" />
      <StepShell
        stepId="done"
        title="Draft saved"
        description="Your intake draft is stored securely on this device. Download a copy or continue the conversation with our team."
        hideBack
        hideNext
        onSubmit={(event) => event.preventDefault()}
        customFooter={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              className="sm:min-w-[180px]"
              onClick={handleDownload}
            >
              Download summary (JSON)
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="ghost" className="justify-center border border-white/10">
                <Link href="/contact">Contact us</Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="justify-center border border-white/10 text-slate-200"
                onClick={handleStartOver}
              >
                Start over
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0f1115] p-6 text-sm text-slate-300">
          <p>
            We’ll keep this draft available on this browser so you can refine it anytime. When you’re ready, get in touch and we’ll guide you through the next steps.
          </p>
        </div>
      </StepShell>
    </>
  );
}
