import Link from "next/link";
import type { ReactNode } from "react";

type HiddenFields = Record<string, string>;

interface StepFlowLayoutProps {
  stepTitle: string;
  pageTitle: string;
  pageDescription?: string;
  body: ReactNode;
  currentIndex: number;
  totalPages: number;
  action: (formData: FormData) => Promise<void>;
  hiddenFields: HiddenFields;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function StepFlowLayout({
  stepTitle,
  pageTitle,
  pageDescription,
  body,
  currentIndex,
  totalPages,
  action,
  hiddenFields,
  ctaLabel,
  secondaryHref,
  secondaryLabel = "Go back",
}: StepFlowLayoutProps) {
  const primaryClasses =
    "inline-flex items-center justify-center rounded-full bg-[color:var(--brand-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90";
  const secondaryClasses =
    "inline-flex items-center justify-center rounded-full border border-[color:var(--border-muted)] px-4 py-3 text-sm font-semibold text-[color:var(--ink)] hover:bg-[color:var(--bg-muted)]";

  return (
    <form
      action={action}
      className="space-y-6 rounded-[32px] border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_30px_120px_-80px_rgba(15,23,42,0.4)]"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
          {stepTitle} · Action {currentIndex + 1} of {totalPages}
        </p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]">{pageTitle}</h1>
        {pageDescription ? <p className="text-sm text-[color:var(--ink-muted)]">{pageDescription}</p> : null}
      </div>
      <div className="space-y-4 text-sm text-[color:var(--ink-muted)]">{body}</div>
      {Object.entries(hiddenFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <div className="flex flex-wrap gap-3">
        {secondaryHref ? (
          <Link href={secondaryHref} className={secondaryClasses}>
            {secondaryLabel}
          </Link>
        ) : null}
        <button type="submit" className={primaryClasses}>
          {ctaLabel}
        </button>
      </div>
    </form>
  );
}
