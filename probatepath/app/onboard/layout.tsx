"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getProgress } from "@/lib/onboard/state";

const STEPS = [
  { path: "/onboard/executor", label: "Start" },
  { path: "/onboard/relationship", label: "About You" },
  { path: "/onboard/email", label: "Email" },
  { path: "/onboard/phone", label: "Phone" },
  { path: "/onboard/call-choice", label: "Options" },
  { path: "/onboard/screening", label: "Questions" },
  { path: "/onboard/result", label: "Result" },
  { path: "/onboard/pricing", label: "Pricing" },
];

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const progress = getProgress(pathname ?? "/onboard/executor");

  return (
    <div className="min-h-screen bg-[color:var(--bg-canvas)] flex flex-col">
      {/* Header - Logo only */}
      <header className="border-b border-[color:var(--border-muted)] bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-semibold text-[color:var(--brand)]">
              ProbateDesk
            </span>
          </Link>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b border-[color:var(--border-muted)]">
        <div className="mx-auto max-w-2xl px-4">
          <div className="h-1 w-full bg-[color:var(--border-muted)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[color:var(--brand)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer - Minimal */}
      <footer className="border-t border-[color:var(--border-muted)] bg-white py-4">
        <div className="mx-auto max-w-2xl px-4">
          <p className="text-center text-xs text-[color:var(--muted-ink)]">
            Questions? Call{" "}
            <a href="tel:+16046703534" className="underline hover:text-[color:var(--brand)]">
              (604) 670-3534
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
