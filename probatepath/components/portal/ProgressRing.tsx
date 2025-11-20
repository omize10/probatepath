interface ProgressRingProps {
  value: number;
  label?: string;
}

export function ProgressRing({ value, label }: ProgressRingProps) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="portal-card flex flex-col items-center justify-center p-6 text-center">
      <svg width="160" height="160" viewBox="0 0 180 180" className="mb-4" aria-hidden="true">
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="rgba(15,23,42,0.08)"
          strokeWidth="16"
          fill="transparent"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="var(--brand-orange)"
          strokeWidth="16"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x="90"
          y="95"
          textAnchor="middle"
          className="fill-[color:var(--brand-navy)] text-3xl font-semibold"
        >
          {clamped}%
        </text>
      </svg>
      {label ? <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{label}</p> : null}
    </div>
  );
}
