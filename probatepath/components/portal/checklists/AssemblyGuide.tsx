"use client";

const ASSEMBLY_STEPS = [
  {
    step: 1,
    title: "Gather all printed documents",
    description: "Collect every page you printed. Do not leave any out, even blank pages.",
    details: [
      "P2 Submission of Estate Grant (front page of your application)",
      "P3 or P4 Affidavit of the Applicant",
      "P10 or P11 Statement of Assets",
      "Any supplemental schedules",
      "Certified copy of the will (if applicable)",
    ],
  },
  {
    step: 2,
    title: "Put them in the correct order",
    description: "Stack documents in this exact order, top to bottom:",
    details: [
      "1. P2 (Submission for Estate Grant) - always on top",
      "2. P3 or P4 (Affidavit of Applicant)",
      "3. P10 or P11 (Statement of Assets and Liabilities)",
      "4. Any supplemental schedules (in order)",
      "5. Certified copy of the death certificate",
      "6. Original will and any codicils (if testate estate)",
    ],
  },
  {
    step: 3,
    title: "Add exhibit tabs (if needed)",
    description: "If your packet has exhibits referenced in the affidavit, add adhesive tabs.",
    details: [
      "Use self-adhesive tabs from any office supply store",
      "Place tabs on the RIGHT edge of the page",
      "Label: Exhibit A, Exhibit B, Exhibit C, etc.",
      "Tabs should be staggered (not stacked on top of each other)",
      "Each exhibit gets its own tab",
    ],
  },
  {
    step: 4,
    title: "Do NOT staple or bind",
    description: "Leave all pages completely loose. Do not staple, clip, or bind them in any way.",
    details: [
      "No staples (the court will reject stapled documents)",
      "No paper clips (pages can slip out)",
      "No binder clips",
      "No hole punches",
      "Keep pages in a folder or large envelope to transport",
    ],
  },
  {
    step: 5,
    title: "Prepare your filing package",
    description: "You'll need to bring or mail the following to the court registry:",
    details: [
      "The complete document stack (in order)",
      "Filing fee (check current BC Supreme Court fees)",
      "Two copies of everything (one for the court, one for your records)",
      "Government-issued photo ID",
      "If mailing: include a cover letter with your contact information",
    ],
  },
];

export function AssemblyGuide() {
  return (
    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Document assembly guide</h3>
        <p className="text-xs text-gray-500 mt-0.5">How to put your probate filing package together, step by step.</p>
      </div>
      <div className="divide-y divide-gray-100">
        {ASSEMBLY_STEPS.map((step) => (
          <div key={step.step} className="px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand)] text-xs font-bold text-white">
                {step.step}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                <p className="text-xs text-gray-600 mt-0.5">{step.description}</p>
                <ul className="mt-2 space-y-1">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="mt-1 h-1 w-1 rounded-full bg-gray-400 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
        <div className="flex items-start gap-2">
          <svg className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-xs text-amber-800">
            <strong>Remember:</strong> Do not sign any affidavits until you are in front of a notary public. Signing at home invalidates the document.
          </p>
        </div>
      </div>
    </div>
  );
}
