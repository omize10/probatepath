import { cn } from "@/lib/utils";
import type { StepDefinition } from "@/lib/intake/steps";

interface ProgressProps {
  steps: StepDefinition[];
  currentIndex: number;
}

export function Progress({ steps, currentIndex }: ProgressProps) {
  const total = steps.length;
  const percentage = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
        <span>
          Step {currentIndex + 1} of {total}
        </span>
        <span>{percentage}% complete</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#ff6a00] transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {steps.map((step, index) => (
          <span
            key={step.id}
            className={cn(
              "rounded-full border border-white/5 px-3 py-1",
              index === currentIndex && "border-[#ff6a00]/50 bg-[#ff6a00]/10 text-slate-200",
              index < currentIndex && "border-[#ff6a00]/30 bg-[#ff6a00]/10 text-slate-100",
            )}
          >
            {step.title}
          </span>
        ))}
      </div>
    </div>
  );
}
