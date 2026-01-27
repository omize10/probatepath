"use client";

import { QuestionCard } from "@/components/intake/question-card";
import type { EstateIntake, IntestateHeirEntry, IntestateRelationshipType } from "@/lib/intake/case-blueprint";
import { useMemo } from "react";

interface AdminConsentStepProps {
  estate: EstateIntake;
  updateAdministration: (updates: Partial<EstateIntake["administration"]>) => void;
}

// WESA intestacy distribution rules (simplified)
function calculateIntestateDistribution(estate: EstateIntake): IntestateHeirEntry[] {
  const heirs: IntestateHeirEntry[] = [];
  const { family, administration, deceased } = estate;

  const hasSpouse = family.hasSpouse === "yes" || administration.spouseExists === "yes";
  const spouseIsDeceased = administration.spouseExists === "deceased";
  const hasChildren = family.hasChildren === "yes";
  const children = family.children || [];

  // Empty address template
  const emptyAddress = {
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "Canada",
  };

  // Empty name template
  const emptyName = {
    first: "",
    middle1: "",
    middle2: "",
    middle3: "",
    last: "",
  };

  // Case 1: Spouse exists and is alive
  if (hasSpouse && !spouseIsDeceased) {
    const spouseName = administration.spouseName.first
      ? administration.spouseName
      : family.spouse?.name || emptyName;

    if (!hasChildren) {
      // Spouse gets everything
      heirs.push({
        id: "spouse-1",
        name: spouseName,
        relationship: "spouse",
        isApplicant: administration.spouseConsents === "applying",
        sharePercent: 100,
        address: family.spouse?.address || emptyAddress,
        isDeceased: false,
        deceasedDate: "",
      });
    } else {
      // Spouse + children scenario
      // Check if all children are from this relationship (affects distribution)
      // For simplicity, assume household share scenario: spouse gets $300k + 50%
      // We can't calculate exact amounts without estate value, so we use percentages
      // Simplified: Spouse gets 50%, children split 50%
      heirs.push({
        id: "spouse-1",
        name: spouseName,
        relationship: "spouse",
        isApplicant: administration.spouseConsents === "applying",
        sharePercent: 50,
        address: family.spouse?.address || emptyAddress,
        isDeceased: false,
        deceasedDate: "",
      });

      // Add children
      const childShare = children.length > 0 ? 50 / children.length : 0;
      children.forEach((child, index) => {
        heirs.push({
          id: `child-${index + 1}`,
          name: child.name,
          relationship: "child",
          isApplicant: false,
          sharePercent: childShare,
          address: child.address || emptyAddress,
          isDeceased: false,
          deceasedDate: "",
        });
      });
    }
  }
  // Case 2: No spouse (or spouse deceased), has children
  else if (hasChildren && children.length > 0) {
    const childShare = 100 / children.length;
    children.forEach((child, index) => {
      heirs.push({
        id: `child-${index + 1}`,
        name: child.name,
        relationship: "child",
        isApplicant: false,
        sharePercent: childShare,
        address: child.address || emptyAddress,
        isDeceased: false,
        deceasedDate: "",
      });
    });
  }
  // Case 3: No spouse, no children - goes to parents, then siblings, etc.
  else {
    // Check for parents in otherRelatives
    const parents = family.otherRelatives.filter(
      (r) => r.relationship === "parent" || r.relationship?.toLowerCase().includes("parent")
    );
    const siblings = family.otherRelatives.filter(
      (r) => r.relationship === "sibling" || r.relationship?.toLowerCase().includes("sibling")
    );

    if (parents.length > 0) {
      const parentShare = 100 / parents.length;
      parents.forEach((parent, index) => {
        heirs.push({
          id: `parent-${index + 1}`,
          name: parent.name,
          relationship: "parent",
          isApplicant: false,
          sharePercent: parentShare,
          address: parent.address || emptyAddress,
          isDeceased: false,
          deceasedDate: "",
        });
      });
    } else if (siblings.length > 0) {
      const siblingShare = 100 / siblings.length;
      siblings.forEach((sibling, index) => {
        heirs.push({
          id: `sibling-${index + 1}`,
          name: sibling.name,
          relationship: "sibling",
          isApplicant: false,
          sharePercent: siblingShare,
          address: sibling.address || emptyAddress,
          isDeceased: false,
          deceasedDate: "",
        });
      });
    } else {
      // No identified heirs - will need manual entry
      // This would go to nieces/nephews, then further relatives
    }
  }

  // Mark the applicant
  const applicantRelationship = administration.applicantRelationship;
  if (applicantRelationship) {
    const applicantHeir = heirs.find(
      (h) => h.relationship === applicantRelationship && !h.isApplicant
    );
    if (applicantHeir) {
      applicantHeir.isApplicant = true;
    }
  }

  return heirs;
}

const RELATIONSHIP_LABELS: Record<IntestateRelationshipType, string> = {
  spouse: "Spouse",
  child: "Child",
  grandchild: "Grandchild",
  parent: "Parent",
  sibling: "Sibling",
  niece_nephew: "Niece/Nephew",
  other_relative: "Other Relative",
};

export function AdminConsentStep({ estate, updateAdministration }: AdminConsentStepProps) {
  const { administration } = estate;

  // Calculate intestate heirs based on family data
  const calculatedHeirs = useMemo(() => calculateIntestateDistribution(estate), [estate]);

  // Update heirs in administration when calculated
  const syncHeirs = () => {
    updateAdministration({ intestateHeirs: calculatedHeirs });
  };

  const formatName = (name: { first: string; last: string }) => {
    return [name.first, name.last].filter(Boolean).join(" ") || "Unknown";
  };

  const hasHeirs = calculatedHeirs.length > 0;

  return (
    <div className="space-y-6">
      {/* Intestacy Explanation */}
      <QuestionCard
        title="Intestate distribution under BC law"
        description="When someone dies without a valid will, BC's Wills, Estates and Succession Act (WESA) determines who inherits."
      >
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
          <p className="font-medium text-[color:var(--ink)]">BC Intestacy Rules (simplified):</p>
          <ul className="list-disc list-inside text-slate-700 space-y-1">
            <li>
              <strong>Spouse only, no children:</strong> Spouse inherits everything
            </li>
            <li>
              <strong>Spouse + children (same relationship):</strong> Spouse gets first $300,000 +
              50% of remainder; children split the other 50%
            </li>
            <li>
              <strong>Spouse + children (different relationship):</strong> Spouse gets first
              $150,000 + 50% of remainder; children split the other 50%
            </li>
            <li>
              <strong>No spouse:</strong> Children inherit equally
            </li>
            <li>
              <strong>No spouse or children:</strong> Parents, then siblings, then nieces/nephews,
              etc.
            </li>
          </ul>
        </div>
      </QuestionCard>

      {/* Calculated Distribution */}
      <QuestionCard
        title="Calculated distribution"
        description="Based on the family information you provided, here is who we believe will inherit:"
      >
        {hasHeirs ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Relationship</th>
                    <th className="text-right p-3 font-medium">Estimated Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {calculatedHeirs.map((heir) => (
                    <tr
                      key={heir.id}
                      className={heir.isApplicant ? "bg-blue-50" : ""}
                    >
                      <td className="p-3">
                        {formatName(heir.name)}
                        {heir.isApplicant && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            You (Applicant)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700">
                        {RELATIONSHIP_LABELS[heir.relationship] || heir.relationship}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {heir.sharePercent.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-600 mt-0.5">⚠</span>
              <p className="text-sm text-amber-800">
                These shares are estimates based on the simplified rules. The actual distribution
                may differ based on the total estate value and specific circumstances. We will
                prepare the exact calculations when generating your forms.
              </p>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={administration.confirmedHeirCalculation}
                  onChange={(e) => {
                    updateAdministration({ confirmedHeirCalculation: e.target.checked });
                    if (e.target.checked) {
                      syncHeirs();
                    }
                  }}
                  className="h-5 w-5 rounded border-gray-300 text-[color:var(--brand)] mt-0.5"
                />
                <span className="text-sm">
                  I confirm this list of heirs appears correct based on the family information I
                  have provided. I understand the final distribution will be calculated based on the
                  actual estate value.
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 font-medium">Unable to calculate heirs</p>
            <p className="text-sm text-amber-700 mt-1">
              We could not determine the intestate heirs based on the information provided. Please
              go back and ensure you have entered the family information (spouse, children, or other
              relatives).
            </p>
          </div>
        )}
      </QuestionCard>

      {/* Administrator Role Understanding */}
      <QuestionCard
        title="Understanding your role as Administrator"
        description="When there is no will, you apply to become the 'Administrator' of the estate (not 'Executor')."
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
            <p className="font-medium text-[color:var(--ink)]">As Administrator, you will:</p>
            <ul className="list-disc list-inside text-slate-700 space-y-1">
              <li>Apply for a "Grant of Administration" (not "Grant of Probate")</li>
              <li>Collect and manage the estate assets</li>
              <li>Pay valid debts and claims against the estate</li>
              <li>Distribute the estate according to BC intestacy rules (not a will)</li>
              <li>File final tax returns for the deceased</li>
              <li>Prepare an accounting of the estate if required</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900">Key difference from Executor:</p>
            <p className="text-blue-800 mt-1">
              Unlike an Executor who follows the deceased&apos;s wishes in a will, an Administrator
              must follow BC&apos;s intestacy rules exactly. You cannot change how the estate is
              distributed.
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={administration.understandsAdministratorRole}
                onChange={(e) =>
                  updateAdministration({ understandsAdministratorRole: e.target.checked })
                }
                className="h-5 w-5 rounded border-gray-300 text-[color:var(--brand)] mt-0.5"
              />
              <span className="text-sm">
                I understand that I am applying to become the Administrator of this estate, and that
                I must distribute the estate according to BC intestacy rules, not according to any
                wishes the deceased may have expressed.
              </span>
            </label>
          </div>
        </div>
      </QuestionCard>

      {/* P1 Notices Info */}
      {hasHeirs && (
        <QuestionCard title="Notice requirements">
          <div className="text-sm text-slate-700 space-y-2">
            <p>
              You will need to send a P1 Notice to all intestate heirs listed above. This is the
              same process as for estates with a will, but the recipients are determined by BC law
              rather than the will.
            </p>
            <p className="font-medium">
              Based on the heirs identified above, you will need to send{" "}
              <span className="text-[color:var(--brand)]">{calculatedHeirs.length} P1 notice(s)</span>.
            </p>
          </div>
        </QuestionCard>
      )}
    </div>
  );
}
