import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DraftStatus = "draft" | "submitted";

type DraftStatusCardProps = {
  status: DraftStatus;
  progress: number;
  lastSavedText?: string | null;
  resumeHref: string;
};

export function DraftStatusCard({ status, progress, lastSavedText, resumeHref }: DraftStatusCardProps) {
  const submitted = status === "submitted";
  const statusLabel = submitted ? "Submitted" : "In progress";
  const description = submitted
    ? "Your intake is locked in. You can still download packets or update executor / beneficiary details here."
    : `${Math.min(100, Math.max(0, progress))}% complete${lastSavedText ? ` · last saved ${lastSavedText}` : ""}`;

  return (
    <div className="portal-card space-y-4 border-2 border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Intake status</p>
            <Badge
              variant={submitted ? "default" : "outline"}
              className={submitted ? "bg-[color:var(--brand-navy)] text-white" : "border-[color:var(--brand-ink)] text-[color:var(--brand-ink)]"}
            >
              {statusLabel}
            </Badge>
          </div>
          <p className="text-sm text-[color:var(--ink-muted)]">{description}</p>
        </div>
        {!submitted ? (
          <Button asChild size="sm">
            <Link href={resumeHref}>Resume intake</Link>
          </Button>
        ) : null}
      </div>
      {!submitted ? (
        <div className="h-2 w-full rounded-full bg-[color:var(--bg-muted)]">
          <div
            className="h-2 rounded-full bg-[color:var(--brand-ink)] transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
