"use client";

type TimelineStep = {
  id: string;
  label: string;
  status: "done" | "active" | "upcoming";
  date?: string;
};

type JourneyTimelineProps = {
  steps: TimelineStep[];
};

export function JourneyTimeline({ steps }: JourneyTimelineProps) {
  const activeIndex = steps.findIndex((s) => s.status === "active");
  const progressPercent = steps.length > 1
    ? Math.round(((activeIndex >= 0 ? activeIndex : steps.length) / (steps.length - 1)) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[color:var(--ink)]">Your journey</h3>
        <span className="text-xs font-medium text-slate-600">{progressPercent}% complete</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 rounded-full bg-gray-100 mb-6 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[color:var(--brand)] transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Shimmer effect on active portion */}
        <div
          className="absolute top-0 h-full rounded-full opacity-30 animate-shimmer"
          style={{
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* Timeline steps */}
      <div className="relative">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div key={step.id} className="flex items-start gap-3 relative">
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`absolute left-[11px] top-6 w-0.5 ${
                    step.status === "done" ? "bg-[color:var(--brand)]" : "bg-gray-200"
                  }`}
                  style={{ height: "calc(100% - 8px)" }}
                />
              )}

              {/* Dot */}
              <div className="relative z-10 shrink-0">
                {step.status === "done" ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--brand)]">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : step.status === "active" ? (
                  <div className="relative flex h-6 w-6 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[color:var(--brand)] opacity-20 animate-pulse" />
                    <div className="h-3 w-3 rounded-full bg-[color:var(--brand)]" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full border-2 border-gray-300 bg-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
                <p className={`text-sm ${
                  step.status === "active" ? "font-semibold text-[color:var(--ink)]" :
                  step.status === "done" ? "font-medium text-slate-700" :
                  "text-slate-600"
                }`}>
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-xs text-slate-700 mt-0.5">{step.date}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}
