import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { IntakeDraft } from "@/lib/intake/types";

interface SummaryProps {
  draft: IntakeDraft;
}

export function Summary({ draft }: SummaryProps) {
  const { executor, deceased, will } = draft;

  const sections = [
    {
      title: "Executor",
      description: "Information about the executor responsible for filing.",
      href: "/start/step-2",
      rows: [
        { label: "Full name", value: executor.fullName },
        { label: "Email", value: executor.email },
        { label: "Phone", value: executor.phone || "Not provided" },
        { label: "City", value: executor.city },
        { label: "Relationship", value: labelRelationship(executor.relationToDeceased) },
        { label: "Address", value: `${executor.addressLine1} ${executor.addressLine2}`.trim() },
        { label: "Province / Postal code", value: `${executor.province} ${executor.postalCode}`.trim() },
        { label: "Communication preference", value: executor.communicationPreference },
        { label: "Availability window", value: executor.availabilityWindow || "Not shared" },
        { label: "Time zone", value: executor.timeZone },
        { label: "Emergency contact", value: `${executor.emergencyContactName} (${executor.emergencyContactPhone})` },
        { label: "Alternate executor", value: formatBoolean(executor.alternateExecutor) },
        {
          label: "Alternate executor details",
          value: executor.alternateExecutorDetails || "None provided",
        },
      ],
    },
    {
      title: "Deceased",
      description: "Key facts about the deceased person.",
      href: "/start/step-3",
      rows: [
        { label: "Full name", value: deceased.fullName },
        { label: "Date of death", value: deceased.dateOfDeath },
        { label: "City / Province", value: deceased.cityProvince },
        { label: "Had a will", value: formatBoolean(deceased.hadWill) },
        { label: "Date of birth", value: deceased.birthDate || "Not provided" },
        { label: "Place of birth", value: deceased.placeOfBirth || "Not provided" },
        { label: "Marital status", value: deceased.maritalStatus || "Not provided" },
        { label: "Occupation", value: deceased.occupation || "Not provided" },
        { label: "Residence", value: deceased.residenceAddress || "Not provided" },
        { label: "Residence type", value: deceased.residenceType || "Not provided" },
        { label: "Years lived in BC", value: deceased.yearsLivedInBC || "Not provided" },
        { label: "Previous partnerships", value: formatBoolean(deceased.hadPriorUnions) },
        { label: "Children", value: deceased.childrenCount || "0" },
        { label: "Assets outside Canada", value: formatBoolean(deceased.assetsOutsideCanada) },
        { label: "Foreign asset details", value: deceased.assetsOutsideDetails || "None shared" },
        { label: "Digital estate notes", value: deceased.digitalEstateNotes || "None shared" },
      ],
    },
    {
      title: "Will & assets",
      description: "Details about documents and estate structure.",
      href: "/start/step-4",
      rows: [
        { label: "Location of original will", value: will.willLocation },
        { label: "Approx. estate value", value: formatEstateRange(will.estateValueRange) },
        { label: "Real property", value: formatBoolean(will.anyRealProperty) },
        { label: "Multiple beneficiaries", value: formatBoolean(will.multipleBeneficiaries) },
        { label: "Codicils present", value: formatBoolean(will.hasCodicils) },
        { label: "Codicil details", value: will.codicilDetails || "None shared" },
        { label: "Notary support needed", value: formatBoolean(will.notaryNeeded) },
        { label: "Probate registry", value: will.probateRegistry || "Not decided" },
        { label: "Date on the physical will", value: will.physicalWillDate || "Not provided" },
        { label: "Electronic will signing date", value: will.electronicWillDate || "Not provided" },
        { label: "Target filing date", value: will.expectedFilingDate || "Not set" },
        { label: "Real property details", value: will.realPropertyDetails || "Not provided" },
        { label: "Liabilities / debts", value: will.liabilities || "Not provided" },
        { label: "Bank accounts", value: will.bankAccounts || "Not provided" },
        { label: "Investment accounts", value: will.investmentAccounts || "Not provided" },
        { label: "Insurance policies", value: will.insurancePolicies || "Not provided" },
        { label: "Business interests", value: will.businessInterests || "Not provided" },
        { label: "Charitable gifts", value: will.charitableGifts || "None shared" },
        { label: "Digital assets", value: will.digitalAssets || "None shared" },
        { label: "Document delivery preference", value: will.documentDeliveryPreference || "Not set" },
        {
          label: "Special circumstances",
          value: will.specialCircumstances || "None shared",
        },
        {
          label: "Special requests",
          value: will.specialRequests || "None shared",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-xl text-[color:var(--brand)]">{section.title}</CardTitle>
              <CardDescription className="text-[color:var(--muted-ink)]">{section.description}</CardDescription>
            </div>
            <Link
              href={section.href}
              className="text-sm font-semibold text-[color:var(--brand)] underline-offset-4 hover:text-[color:var(--accent-dark)] hover:underline"
            >
              Edit
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[color:var(--muted-ink)]">
            {section.rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <span className="text-[#445266]">{row.label}</span>
                <span className="font-medium text-[color:var(--brand)] sm:text-right">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatBoolean(value: string) {
  return value === "yes" ? "Yes" : "No";
}

function labelRelationship(value: string) {
  switch (value) {
    case "partner":
      return "Partner";
    case "child":
      return "Child";
    case "relative":
      return "Relative";
    case "friend":
      return "Friend";
    default:
      return "Other";
  }
}

function formatEstateRange(value: string) {
  switch (value) {
    case "<$100k":
      return "Under $100,000";
    case "$100k-$500k":
      return "$100,000 – $500,000";
    case "$500k-$1M":
      return "$500,000 – $1M";
    case ">$1M":
      return "Over $1M";
    default:
      return value;
  }
}
