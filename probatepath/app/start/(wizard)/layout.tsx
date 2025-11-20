'use client';

import type { ReactNode } from "react";
import { IntakeProvider } from "@/lib/intake/store";

export default function StartWizardLayout({ children }: { children: ReactNode }) {
  return (
    <IntakeProvider>
      <div className="mx-auto w-full max-w-5xl space-y-10 pb-20 px-4">{children}</div>
    </IntakeProvider>
  );
}
