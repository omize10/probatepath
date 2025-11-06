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
        {
          label: "Special circumstances",
          value: will.specialCircumstances || "None shared",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.title} className="border-white/12 bg-[#111217]/90">
          <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-xl text-white">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </div>
            <Link
              href={section.href}
              className="text-sm font-semibold text-[#ff6a00] underline-offset-4 hover:text-[#ff8840] hover:underline"
            >
              Edit
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-200">
            {section.rows.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 rounded-2xl border border-white/8 bg-black/20 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <span className="text-slate-400">{row.label}</span>
                <span className="font-medium text-white sm:text-right">{row.value}</span>
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
    case "spouse":
      return "Spouse";
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
