import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { formatIntakeDraftRecord } from "@/lib/intake/format";

type InfoRow = { label: string; value: string };

function InfoSection({
  title,
  description,
  rows,
  editHref,
}: {
  title: string;
  description: string;
  rows: InfoRow[];
  editHref: string;
}) {
  return (
    <div className="portal-card space-y-4 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-serif text-xl text-[color:var(--ink)]">{title}</h3>
        <p className="text-sm text-[color:var(--ink-muted)]">{description}</p>
      </div>
      <dl className="space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 rounded-2xl bg-[color:var(--bg-muted)] p-3 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-[color:var(--ink-muted)]">{row.label}</dt>
            <dd className="font-semibold text-[color:var(--ink)]">{row.value || "Not provided"}</dd>
          </div>
        ))}
      </dl>
      <Link
        href={editHref}
        className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--bg-muted)]"
      >
        Edit
      </Link>
    </div>
  );
}

export default async function PortalInfoPage() {
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);

  if (!matter) {
    return (
      <PortalShell
        title="Your Info"
        description="Create a matter first, then return to review every section."
        eyebrow="Your Info"
      >
        <div className="portal-card space-y-3 p-6 text-sm text-[color:var(--ink-muted)]">
          <p>We couldn’t find an active matter for this account.</p>
        </div>
      </PortalShell>
    );
  }

  const formattedDraft = matter.draft ? formatIntakeDraftRecord(matter.draft) : null;
  const deceasedRows: InfoRow[] = [
    { label: "Full name", value: formattedDraft?.deceased.fullName ?? matter.draft?.decFullName ?? "" },
    { label: "Address", value: formattedDraft?.deceased.residenceAddress ?? "" },
    { label: "City / Province", value: formattedDraft?.deceased.cityProvince ?? "" },
    { label: "Date of death", value: formattedDraft?.deceased.dateOfDeath ?? "" },
  ];

  const executorRows: InfoRow[] =
    matter.executors.length > 0
      ? matter.executors.map((executor) => ({
          label: executor.fullName,
          value: [executor.addressLine1, executor.city, executor.province].filter(Boolean).join(", "),
        }))
      : [
          {
            label: formattedDraft?.executor.fullName ?? "Executor",
            value: formattedDraft?.executor.addressLine1 ?? "",
          },
        ];

  const beneficiaryRows: InfoRow[] =
    matter.beneficiaries.length > 0
      ? matter.beneficiaries.map((beneficiary) => ({
          label: beneficiary.fullName,
          value: [beneficiary.addressLine1, beneficiary.city, beneficiary.province].filter(Boolean).join(", "),
        }))
      : [{ label: "Beneficiaries", value: "No beneficiaries recorded yet" }];

  const assetRows: InfoRow[] = [
    { label: "Real property", value: formattedDraft?.will.realPropertyDetails ?? "" },
    { label: "Bank accounts", value: formattedDraft?.will.bankAccounts ?? "" },
    { label: "Investment accounts", value: formattedDraft?.will.investmentAccounts ?? "" },
    { label: "Business interests", value: formattedDraft?.will.businessInterests ?? "" },
  ];

  const debtRows: InfoRow[] = [
    { label: "Liabilities / debts", value: formattedDraft?.will.liabilities ?? "" },
    { label: "Insurance policies", value: formattedDraft?.will.insurancePolicies ?? "" },
    { label: "Special requests", value: formattedDraft?.will.specialRequests ?? "" },
  ];

  return (
    <PortalShell
      title="Your Info"
      description="These sections pull directly from your intake. Update them anytime before downloading documents."
      eyebrow="Your Info"
    >
      <div className="grid gap-6">
        <InfoSection
          title="Deceased"
          description="Legal details used on every form."
          rows={deceasedRows}
          editHref="/portal/intake"
        />
        <InfoSection
          title="Executor(s)"
          description="People responsible for the application."
          rows={executorRows}
          editHref="/portal/executors"
        />
        <InfoSection
          title="Beneficiaries"
          description="Everyone who must receive formal notice."
          rows={beneficiaryRows}
          editHref="/portal/beneficiaries"
        />
        <InfoSection
          title="Assets"
          description="What makes up the estate."
          rows={assetRows}
          editHref="/portal/intake"
        />
        <InfoSection
          title="Debts and expenses"
          description="Liabilities and notes that will appear on the affidavits."
          rows={debtRows}
          editHref="/portal/intake"
        />
      </div>
    </PortalShell>
  );
}
