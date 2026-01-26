"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { saveOnboardState } from "@/lib/onboard/state";

export default function OnboardExecutorPage() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  const handleSelect = (isExecutor: boolean) => {
    saveOnboardState({ isExecutor });

    if (isExecutor) {
      router.push("/onboard/relationship");
    } else {
      router.push("/onboard/non-executor");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          Are you the executor?
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          The executor is the person named in the will to manage the estate.
        </p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => handleSelect(true)}
          className="w-full h-16 text-lg font-medium rounded-xl border-2 border-[color:var(--border-muted)]
                     hover:border-[color:var(--brand)] hover:bg-[color:var(--brand)]/5
                     transition-all duration-200"
        >
          Yes, I am the executor
        </button>

        <button
          onClick={() => handleSelect(false)}
          className="w-full h-16 text-lg font-medium rounded-xl border-2 border-[color:var(--border-muted)]
                     hover:border-[color:var(--brand)] hover:bg-[color:var(--brand)]/5
                     transition-all duration-200"
        >
          No, I am not the executor
        </button>
      </div>

      <div className="pt-4">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 text-sm text-[color:var(--muted-ink)] hover:text-[color:var(--brand)] mx-auto"
        >
          <HelpCircle className="h-4 w-4" />
          What if I&apos;m not sure?
        </button>

        {showHelp && (
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">How to check if you&apos;re the executor:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Look at the will - the executor is named near the beginning</li>
              <li>If there&apos;s no will, you may need to apply as an administrator</li>
              <li>If you&apos;re unsure, select &quot;No&quot; and we&apos;ll help you figure it out</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
