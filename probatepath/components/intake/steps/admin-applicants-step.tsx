"use client";

import { Input } from "@/components/ui/input";
import { FormRow } from "@/components/wizard/FormRow";
import { QuestionCard } from "@/components/intake/question-card";
import type { EstateIntake, IntestateRelationshipType, PersonName } from "@/lib/intake/case-blueprint";

interface AdminApplicantsStepProps {
  estate: EstateIntake;
  updateAdministration: (updates: Partial<EstateIntake["administration"]>) => void;
  updateName: (
    section: "spouseName",
    field: keyof PersonName,
    value: string
  ) => void;
}

const RELATIONSHIP_OPTIONS: { value: IntestateRelationshipType; label: string; priority: number }[] = [
  { value: "spouse", label: "Spouse or common-law partner", priority: 1 },
  { value: "child", label: "Child (adult)", priority: 2 },
  { value: "grandchild", label: "Grandchild", priority: 3 },
  { value: "parent", label: "Parent", priority: 4 },
  { value: "sibling", label: "Sibling (brother or sister)", priority: 5 },
  { value: "niece_nephew", label: "Niece or nephew", priority: 6 },
  { value: "other_relative", label: "Other relative", priority: 7 },
];

const SPOUSE_CONSENT_OPTIONS = [
  { value: "applying", label: "They are applying with me (co-applicant)" },
  { value: "yes", label: "They consent but are not applying (will need P17 renunciation)" },
  { value: "no", label: "They do not consent" },
];

export function AdminApplicantsStep({
  estate,
  updateAdministration,
  updateName,
}: AdminApplicantsStepProps) {
  const { administration } = estate;
  const selectedRelationship = administration.applicantRelationship;

  // Check if we need to ask about spouse (if applicant is not the spouse)
  const needsSpouseCheck = selectedRelationship && selectedRelationship !== "spouse";

  // Check if we need to ask about children (if applicant is grandchild, parent, sibling, etc.)
  const needsChildrenCheck =
    selectedRelationship &&
    !["spouse", "child"].includes(selectedRelationship);

  // Determine if there's a blocking issue
  const spouseBlocks =
    administration.spouseExists === "yes" && administration.spouseConsents === "no";

  const childrenBlock =
    needsChildrenCheck &&
    administration.childrenExist === "yes" &&
    administration.childrenConsent === "no";

  return (
    <div className="space-y-6">
      {/* Relationship Selection */}
      <QuestionCard
        title="Your relationship to the deceased"
        description="Under BC law (WESA), certain people have priority to apply for administration of an estate without a will."
        why="Priority determines who can apply. If someone with higher priority exists, they must either apply with you or formally renounce their right."
      >
        <FormRow fieldId="admin-relationship" label="What is your relationship to the deceased?" required>
          <div className="grid gap-2">
            {RELATIONSHIP_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedRelationship === option.value
                    ? "border-[color:var(--brand)] bg-blue-50"
                    : "border-[color:var(--border-subtle)] hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="admin-relationship"
                  value={option.value}
                  checked={selectedRelationship === option.value}
                  onChange={() => updateAdministration({ applicantRelationship: option.value })}
                  className="h-4 w-4 text-[color:var(--brand)]"
                />
                <span className="flex-1">{option.label}</span>
                <span className="text-xs text-[color:var(--text-tertiary)]">Priority {option.priority}</span>
              </label>
            ))}
          </div>
        </FormRow>
      </QuestionCard>

      {/* Spouse Priority Check - only if applicant is NOT the spouse */}
      {needsSpouseCheck && (
        <QuestionCard
          title="Spouse or common-law partner"
          description="Spouses have first priority under BC law. We need to know if one exists."
          why="If the deceased had a spouse, they must either apply with you or formally renounce their right to apply."
        >
          <FormRow fieldId="spouse-exists" label="Did the deceased have a spouse or common-law partner at the time of death?" required>
            <div className="flex gap-3">
              {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "deceased", label: "Yes, but they are also deceased" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex-1 text-center rounded-lg border p-3 cursor-pointer transition-colors ${
                    administration.spouseExists === option.value
                      ? "border-[color:var(--brand)] bg-blue-50"
                      : "border-[color:var(--border-subtle)] hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="spouse-exists"
                    value={option.value}
                    checked={administration.spouseExists === option.value}
                    onChange={() =>
                      updateAdministration({
                        spouseExists: option.value as "yes" | "no" | "deceased",
                      })
                    }
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </FormRow>

          {/* If spouse is deceased, ask for death date */}
          {administration.spouseExists === "deceased" && (
            <FormRow fieldId="spouse-death-date" label="When did the spouse pass away?">
              <Input
                type="date"
                value={administration.spouseDeathDate}
                onChange={(e) => updateAdministration({ spouseDeathDate: e.target.value })}
              />
            </FormRow>
          )}

          {/* If spouse exists and is alive, ask about consent */}
          {administration.spouseExists === "yes" && (
            <>
              <FormRow fieldId="spouse-name-first" label="Spouse's first name" required>
                <Input
                  value={administration.spouseName.first}
                  onChange={(e) => updateName("spouseName", "first", e.target.value)}
                  placeholder="First name"
                />
              </FormRow>
              <FormRow fieldId="spouse-name-last" label="Spouse's last name" required>
                <Input
                  value={administration.spouseName.last}
                  onChange={(e) => updateName("spouseName", "last", e.target.value)}
                  placeholder="Last name"
                />
              </FormRow>

              <FormRow fieldId="spouse-consent" label="Is the spouse applying with you, or do they consent to you applying instead?" required>
                <div className="grid gap-2">
                  {SPOUSE_CONSENT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        administration.spouseConsents === option.value
                          ? "border-[color:var(--brand)] bg-blue-50"
                          : "border-[color:var(--border-subtle)] hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="spouse-consent"
                        value={option.value}
                        checked={administration.spouseConsents === option.value}
                        onChange={() =>
                          updateAdministration({
                            spouseConsents: option.value as "yes" | "no" | "applying",
                          })
                        }
                        className="h-4 w-4 text-[color:var(--brand)]"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </FormRow>
            </>
          )}

          {/* Blocking message if spouse doesn't consent */}
          {spouseBlocks && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 mt-4">
              <p className="font-semibold text-red-800">Unable to proceed</p>
              <p className="text-red-700 mt-1">
                The spouse has first priority to apply for administration. They must either apply
                themselves or formally renounce their right. Please contact us to discuss options.
              </p>
            </div>
          )}
        </QuestionCard>
      )}

      {/* Children Priority Check - only if applicant is grandchild, parent, sibling, etc. */}
      {needsChildrenCheck && administration.spouseExists !== "yes" && (
        <QuestionCard
          title="Children of the deceased"
          description="Children have second priority under BC law, after the spouse."
        >
          <FormRow fieldId="children-exist" label="Did the deceased have any living adult children?" required>
            <div className="flex gap-3">
              {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex-1 text-center rounded-lg border p-3 cursor-pointer transition-colors ${
                    administration.childrenExist === option.value
                      ? "border-[color:var(--brand)] bg-blue-50"
                      : "border-[color:var(--border-subtle)] hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="children-exist"
                    value={option.value}
                    checked={administration.childrenExist === option.value}
                    onChange={() =>
                      updateAdministration({
                        childrenExist: option.value as "yes" | "no",
                      })
                    }
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </FormRow>

          {administration.childrenExist === "yes" && (
            <FormRow fieldId="children-consent" label="Do all children consent to you applying?" required>
              <div className="flex gap-3">
                {[
                  { value: "yes", label: "Yes, they all consent" },
                  { value: "no", label: "No" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex-1 text-center rounded-lg border p-3 cursor-pointer transition-colors ${
                      administration.childrenConsent === option.value
                        ? "border-[color:var(--brand)] bg-blue-50"
                        : "border-[color:var(--border-subtle)] hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="children-consent"
                      value={option.value}
                      checked={administration.childrenConsent === option.value}
                      onChange={() =>
                        updateAdministration({
                          childrenConsent: option.value as "yes" | "no",
                        })
                      }
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </FormRow>
          )}

          {/* Blocking message if children don't consent */}
          {childrenBlock && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 mt-4">
              <p className="font-semibold text-red-800">Unable to proceed</p>
              <p className="text-red-700 mt-1">
                The children have priority over you to apply for administration. They must either
                apply themselves or formally renounce their right. Please contact us to discuss options.
              </p>
            </div>
          )}
        </QuestionCard>
      )}

      {/* Summary of what's needed */}
      {selectedRelationship && !spouseBlocks && !childrenBlock && (
        <QuestionCard title="What happens next">
          <div className="text-sm text-[color:var(--text-secondary)] space-y-2">
            {administration.spouseConsents === "yes" && (
              <p className="flex items-start gap-2">
                <span className="text-amber-600">⚠</span>
                <span>
                  You will need a <strong>P17 Renunciation</strong> form signed by{" "}
                  {administration.spouseName.first || "the spouse"} before filing.
                </span>
              </p>
            )}
            {administration.spouseConsents === "applying" && (
              <p className="flex items-start gap-2">
                <span className="text-blue-600">ℹ</span>
                <span>
                  {administration.spouseName.first || "The spouse"} will be listed as a co-applicant
                  on the application for administration.
                </span>
              </p>
            )}
            {administration.childrenExist === "yes" && administration.childrenConsent === "yes" && (
              <p className="flex items-start gap-2">
                <span className="text-amber-600">⚠</span>
                <span>
                  You will need <strong>P17 Renunciation</strong> forms signed by all children who are
                  not applying with you.
                </span>
              </p>
            )}
            {(administration.spouseExists === "no" || administration.spouseExists === "deceased") &&
              (administration.childrenExist === "no" || !needsChildrenCheck) && (
                <p className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>
                    Based on what you have told us, you appear to have priority to apply for
                    administration.
                  </span>
                </p>
              )}
          </div>
        </QuestionCard>
      )}
    </div>
  );
}
