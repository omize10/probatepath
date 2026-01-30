"use client";

const MISTAKES = [
  {
    title: "Signing before the notary appointment",
    description: "Affidavits must be signed in front of a notary public. If you sign at home first, the document is invalid and you'll need to reprint and start over.",
    severity: "critical" as const,
  },
  {
    title: "Leaving fields blank instead of writing 'nil' or 'N/A'",
    description: "Empty fields can be interpreted as incomplete. Write 'nil', 'N/A', or 'none' in any field that doesn't apply to your estate.",
    severity: "high" as const,
  },
  {
    title: "Stapling documents together",
    description: "Leave all pages loose (unstapled). The court registry will bind them in the correct order. Stapled documents may be rejected.",
    severity: "high" as const,
  },
  {
    title: "Printing double-sided",
    description: "All court documents must be printed single-sided. Double-sided prints will be rejected at the registry.",
    severity: "high" as const,
  },
  {
    title: "Forgetting to keep a copy for your records",
    description: "Before mailing or filing anything, make a photocopy of every document. You'll need these if the court has questions or if anything is lost in the mail.",
    severity: "medium" as const,
  },
  {
    title: "Using the wrong paper size",
    description: "BC courts require letter-size paper (8.5 x 11 inches). Legal size or A4 paper will be rejected.",
    severity: "medium" as const,
  },
  {
    title: "Mailing notices without tracking",
    description: "You need proof that each beneficiary received their P1 notice. Use registered mail or a courier with signature confirmation.",
    severity: "high" as const,
  },
  {
    title: "Filing before the 21-day waiting period",
    description: "You must wait 21 days after the last P1 notice is delivered before filing your probate application. Filing early means starting over.",
    severity: "critical" as const,
  },
  {
    title: "Wrong exhibit tab labels",
    description: "If your packet includes exhibits, label them exactly as specified: Exhibit A, Exhibit B, etc. Use adhesive tabs on the right side.",
    severity: "medium" as const,
  },
  {
    title: "Signing in black ink",
    description: "Sign all originals in blue ink. Blue ink distinguishes originals from photocopies. The court needs to verify originals.",
    severity: "medium" as const,
  },
];

const SEVERITY_STYLES = {
  critical: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-800", icon: "text-red-500" },
  high: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-800", icon: "text-amber-500" },
  medium: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-800", icon: "text-blue-500" },
};

const SEVERITY_LABELS = {
  critical: "Common and costly",
  high: "Frequently missed",
  medium: "Good to know",
};

export function CommonMistakes() {
  return (
    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-[color:var(--border-subtle)]">
        <h3 className="text-base font-semibold text-[color:var(--ink)]">Common mistakes to avoid</h3>
        <p className="text-xs text-[color:var(--text-tertiary)] mt-0.5">These are the most frequent errors executors make. Read each one carefully.</p>
      </div>
      <div className="divide-y divide-gray-50">
        {MISTAKES.map((mistake) => {
          const styles = SEVERITY_STYLES[mistake.severity];
          return (
            <div key={mistake.title} className={`px-5 py-3 ${styles.bg}`}>
              <div className="flex items-start gap-3">
                <svg className={`h-5 w-5 mt-0.5 shrink-0 ${styles.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[color:var(--ink)]">{mistake.title}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}>
                      {SEVERITY_LABELS[mistake.severity]}
                    </span>
                  </div>
                  <p className="text-xs text-[color:var(--text-secondary)] mt-1">{mistake.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
