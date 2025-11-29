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
  const completed = !submitted && progress >= 100;
  const statusLabel = submitted ? "Submitted" : completed ? "Complete" : "In progress";
  const badgeClasses = submitted
    ? "bg-[color:var(--brand-navy)] text-white"
    : completed
      ? "border-transparent bg-[#dff9e7] text-[#0f9d58]"
      : "border-[color:var(--brand-ink)] text-[color:var(--brand-ink)]";
  const description = submitted
    ? "Your intake is locked in. You can still download packets or update executor / beneficiary details here."
    : `${Math.min(100, Math.max(0, progress))}% complete${lastSavedText ? ` · last saved ${lastSavedText}` : ""}`;
  const showProgressBar = !submitted && !completed;
  const buttonLabel = submitted ? null : completed ? "Edit intake" : "Resume intake";
  const cardClassName = completed
    ? "space-y-4 rounded-[32px] border-2 border-[#c4eccf] bg-[#f3fcf6] p-6"
    : "portal-card space-y-4 border-2 border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6";
  const buttonVariant = completed ? "outline" : undefined;
  const buttonClassName = completed ? "border-[#8bd49c] text-[#0f8a4e] hover:bg-[#edf9f0]" : undefined;

  return (
    <div className={cardClassName}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Intake status</p>
            <Badge variant={submitted ? "default" : "outline"} className={badgeClasses}>
              {statusLabel}
            </Badge>
          </div>
          <p className="text-sm text-[color:var(--ink-muted)]">{description}</p>
        </div>
        {buttonLabel ? (
          <Button asChild size="sm" variant={buttonVariant} className={buttonClassName}>
            <Link href={resumeHref}>{buttonLabel}</Link>
          </Button>
        ) : null}
      </div>
      {showProgressBar ? (
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
