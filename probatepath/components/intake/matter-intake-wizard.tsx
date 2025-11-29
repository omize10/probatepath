'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IntakeWizardLayout, type SaveStatus } from "@/components/intake/wizard-layout";
import { QuestionCard } from "@/components/intake/question-card";
import { NameFields, type StructuredNameValue } from "@/components/intake/patterns/name-fields";
import { AddressFields, type AddressValue } from "@/components/intake/patterns/text-field-group";
import { YesNoButtons } from "@/components/intake/patterns/yes-no-buttons";
import { RepeatableCardList } from "@/components/intake/patterns/repeatable-card-list";
import type { IntakeDraft } from "@/lib/intake/types";
import { portalSteps, type PortalStepId, getPortalStepIndex, getPortalNextStep, getPortalPreviousStep } from "@/lib/intake/portal/steps";
import { getPortalStepInfo } from "@/lib/intake/portal/info";
import { saveMatterDraft } from "@/lib/intake/api";
import { validatePortalStep, type PortalStepErrors } from "@/lib/intake/portal/validation";
import type { Relationship } from "@/lib/intake/case-blueprint";

interface MatterIntakeWizardProps {
  matterId: string;
  initialDraft: IntakeDraft;
  currentStep: PortalStepId;
  journeyHref: string;
  infoHref: string;
  documentsHref: string;
  helpHref: string;
}

const newId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export function MatterIntakeWizard({
  matterId,
  initialDraft,
  currentStep,
  journeyHref,
  infoHref,
  documentsHref,
  helpHref,
}: MatterIntakeWizardProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<IntakeDraft>(initialDraft);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const hydratedRef = useRef(false);
  const skipNextSave = useRef(true);
  const pendingSave = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(initialDraft);
    skipNextSave.current = true;
  }, [initialDraft]);

  useEffect(() => {
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (pendingSave.current) {
      clearTimeout(pendingSave.current);
    }
    setSaveStatus("saving");
    setSaveError(null);
    pendingSave.current = setTimeout(async () => {
      try {
        await saveMatterDraft(matterId, draft);
        setSaveStatus("saved");
        setSaveError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to save";
        setSaveStatus("error");
        setSaveError(message);
      }
      pendingSave.current = null;
    }, 700);
    return () => {
      if (pendingSave.current) {
        clearTimeout(pendingSave.current);
        pendingSave.current = null;
      }
    };
  }, [draft, matterId]);

  const stepDefinition = portalSteps.find((step) => step.id === currentStep) ?? portalSteps[0];
  const stepIndex = getPortalStepIndex(stepDefinition.id);
  const infoBlock = getPortalStepInfo(stepDefinition.id);
  const validation = useMemo(() => validatePortalStep(stepDefinition.id, draft), [draft, stepDefinition.id]);

  useEffect(() => {
    setShowErrors(false);
  }, [stepDefinition.id]);

  const updateEstate = (updater: (estate: IntakeDraft["estateIntake"]) => IntakeDraft["estateIntake"]) => {
    setDraft((prev) => ({
      ...prev,
      estateIntake: updater(prev.estateIntake),
    }));
  };

  const handleNext = async () => {
    if (!validation.valid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    try {
      setSaveStatus("saving");
      await saveMatterDraft(matterId, draft);
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveError(error instanceof Error ? error.message : "Unable to save");
      return;
    }
    const next = getPortalNextStep(stepDefinition.id, draft);
    if (next) {
      router.push(`/matters/${matterId}/intake?step=${next.id}`);
      return;
    }
    router.push("/portal");
  };

  const handleBack = () => {
    const previous = getPortalPreviousStep(stepDefinition.id, draft);
    if (previous) {
      router.push(`/matters/${matterId}/intake?step=${previous.id}`);
    }
  };

  const stepErrors: PortalStepErrors = validation.errors;

  const renderProps: RenderContext = {
    draft,
    updateEstate,
    errors: showErrors ? stepErrors : {},
  };

  const content = renderStep(stepDefinition.id, renderProps);

  return (
    <IntakeWizardLayout
      stepIndex={stepIndex}
      totalSteps={portalSteps.length}
      title={stepDefinition.title}
      description={stepDefinition.section}
      info={infoBlock}
      onNext={handleNext}
      onBack={getPortalPreviousStep(stepDefinition.id, draft) ? handleBack : undefined}
      disableNext={!validation.valid}
      saveStatus={saveStatus}
      saveError={saveError}
    >
      {content}
    </IntakeWizardLayout>
  );
}

interface RenderContext {
  draft: IntakeDraft;
  errors: PortalStepErrors;
  updateEstate: (updater: (estate: IntakeDraft["estateIntake"]) => IntakeDraft["estateIntake"]) => void;
}

function renderStep(stepId: PortalStepId, context: RenderContext) {
  switch (stepId) {
    case "applicant-name-contact":
      return <ApplicantNameContact {...context} />;
    case "applicant-address-relationship":
      return <ApplicantAddressRelationship {...context} />;
    case "applicant-coapp-question":
      return <ApplicantCoApplicantQuestion {...context} />;
    case "applicant-coapp-list":
      return <ApplicantCoApplicants {...context} />;
    case "deceased-basics":
      return <DeceasedBasics {...context} />;
    case "deceased-birth-address":
      return <DeceasedBirthResidence {...context} />;
    case "deceased-marital":
      return <DeceasedMarital {...context} />;
    case "will-presence":
      return <WillPresence {...context} />;
    case "will-details":
      return <WillDetails {...context} />;
    case "will-original":
      return <WillOriginal {...context} />;
    case "will-executors":
      return <WillExecutors {...context} />;
    case "will-codicils":
      return <WillCodicils {...context} />;
    case "family-spouse":
      return <FamilySpouse {...context} />;
    case "family-children":
      return <FamilyChildren {...context} />;
    case "family-relatives":
      return <FamilyRelatives {...context} />;
    case "beneficiaries-people":
      return <BeneficiariesPeople {...context} />;
    case "beneficiaries-organizations":
      return <BeneficiariesOrganizations {...context} />;
    case "assets-realestate":
      return <AssetsRealEstate {...context} />;
    case "assets-accounts":
      return <AssetsAccounts {...context} />;
    case "assets-property":
      return <AssetsProperty {...context} />;
    case "debts-liabilities":
      return <DebtsLiabilities {...context} />;
    case "special-prior":
      return <SpecialIssues {...context} />;
    case "filing-registry":
      return <FilingDetails {...context} />;
    default:
      return null;
  }
}

// Helper components for each step follow.

function ApplicantNameContact({ draft, updateEstate, errors }: RenderContext) {
  const applicant = draft.estateIntake.applicant;
  const handleNameChange = (value: StructuredNameValue) => {
    updateEstate((estate) => ({
      ...estate,
      applicant: {
        ...estate.applicant,
        name: { ...estate.applicant.name, ...value },
      },
    }));
  };

  return (
    <div className="space-y-6">
      <QuestionCard
        title="Your full legal name"
        description="This must match the name on your ID and the court filings."
        why="The registry and banks need to recognise you as the executor/applicant."
        where="Use the exact name shown on your passport, driver’s licence, or the will."
      >
        <NameFields
          value={applicant.name}
          onChange={handleNameChange}
          errors={{
            first: errors["applicant.name.first"],
            last: errors["applicant.name.last"],
          }}
        />
      </QuestionCard>
      <QuestionCard
        title="Contact details"
        description="We’ll use these to keep you updated and for court notices."
        why="The court or our partner firm may need to contact you quickly."
        where="Use an email and phone number you check regularly."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Email" required error={errors["applicant.contact.email"]}>
            <Input type="email" value={applicant.contact.email} onChange={(event) => updateEstate((estate) => ({
              ...estate,
              applicant: { ...estate.applicant, contact: { ...estate.applicant.contact, email: event.target.value } },
            }))} />
          </Field>
          <Field label="Phone number" required error={errors["applicant.contact.phone"]}>
            <Input value={applicant.contact.phone} onChange={(event) => updateEstate((estate) => ({
              ...estate,
              applicant: { ...estate.applicant, contact: { ...estate.applicant.contact, phone: event.target.value } },
            }))} />
          </Field>
        </div>
      </QuestionCard>
    </div>
  );
}

function ApplicantAddressRelationship({ draft, updateEstate, errors }: RenderContext) {
  const applicant = draft.estateIntake.applicant;
  const handleAddressChange = (value: AddressValue) => {
    updateEstate((estate) => ({
      ...estate,
      applicant: {
        ...estate.applicant,
        address: {
          line1: value.line1,
          line2: value.line2,
          city: value.city,
          region: value.region,
          postalCode: value.postalCode,
          country: value.country,
        },
      },
    }));
  };
  return (
    <div className="space-y-6">
      <QuestionCard
        title="Your home address"
        description="Use your current residential address."
        why="This appears on the grant and is where documents can be served."
        where="Use the address on your government-issued ID."
      >
        <AddressFields
          value={applicant.address}
          onChange={handleAddressChange}
          errors={{
            line1: errors["applicant.address.line1"],
            city: errors["applicant.address.city"],
            region: errors["applicant.address.region"],
            postalCode: errors["applicant.address.postalCode"],
          }}
        />
      </QuestionCard>
      <QuestionCard
        title="Relationship to the person who died"
        why="Your relationship helps the court understand your role and priority."
        where="Choose the option that best describes how you’re connected."
      >
        <RelationshipPicker
          value={applicant.relationship}
          onChange={(value) => updateEstate((estate) => ({ ...estate, applicant: { ...estate.applicant, relationship: value } }))}
          error={errors["applicant.relationship"]}
        />
      </QuestionCard>
    </div>
  );
}

function ApplicantCoApplicantQuestion({ draft, updateEstate, errors }: RenderContext) {
  const value = draft.estateIntake.applicant.isOnlyApplicant;
  return (
    <QuestionCard
      title="Are you the only person applying as executor/administrator?"
      why="If more than one person is applying we must list everyone on the forms."
      where="Check the will to see who was named as executor. If others want to apply with you, choose No."
    >
      <YesNoButtons
        value={value}
        onChange={(answer) => updateEstate((estate) => ({ ...estate, applicant: { ...estate.applicant, isOnlyApplicant: answer as "yes" | "no" } }))}
        options={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
      />
      {errors["applicant.isOnlyApplicant"] ? <ErrorText>{errors["applicant.isOnlyApplicant"]}</ErrorText> : null}
    </QuestionCard>
  );
}

function ApplicantCoApplicants({ draft, updateEstate, errors }: RenderContext) {
  const coApplicants = draft.estateIntake.applicant.coApplicants;
  const addCoApplicant = () => {
    updateEstate((estate) => ({
      ...estate,
      applicant: {
        ...estate.applicant,
        coApplicants: [
          ...estate.applicant.coApplicants,
          {
            id: newId(),
            name: { first: "", middle1: "", middle2: "", middle3: "", last: "", suffix: "" },
            relationship: "",
            email: "",
            phone: "",
            address: { line1: "", line2: "", city: "", region: "", postalCode: "", country: "Canada" },
          },
        ],
      },
    }));
  };
  const updateCoApplicant = (index: number, updater: (original: (typeof coApplicants)[number]) => (typeof coApplicants)[number]) => {
    updateEstate((estate) => {
      const updated = [...estate.applicant.coApplicants];
      updated[index] = updater(updated[index]);
      return {
        ...estate,
        applicant: { ...estate.applicant, coApplicants: updated },
      };
    });
  };

  const removeCoApplicant = (index: number) => {
    updateEstate((estate) => {
      const updated = [...estate.applicant.coApplicants];
      updated.splice(index, 1);
      return {
        ...estate,
        applicant: { ...estate.applicant, coApplicants: updated },
      };
    });
  };

  if (draft.estateIntake.applicant.isOnlyApplicant !== "no") {
    return (
      <QuestionCard title="Other applicants">
        <p className="text-sm text-[color:var(--ink-muted)]">You indicated you are the only applicant, so there’s nothing else to add here.</p>
      </QuestionCard>
    );
  }

  return (
    <div className="space-y-6">
      <QuestionCard
        title="Other people applying with you"
        description="Add the legal name and contact details for each co-applicant."
        why="All co-applicants must be identified on the court forms."
        where="Use the same details they use on their own ID and correspondence."
      >
        <RepeatableCardList
          items={coApplicants}
          onAdd={addCoApplicant}
          addLabel="Add another applicant"
          emptyState="List anyone who is applying with you so we can include them on the application."
          renderItem={(item, index) => (
            <div key={item.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[color:var(--ink)]">Applicant {index + 1}</p>
                <button type="button" className="text-sm text-[color:var(--brand)] underline-offset-2 hover:underline" onClick={() => removeCoApplicant(index)}>
                  Remove
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <NameFields value={item.name} onChange={(value) => updateCoApplicant(index, (original) => ({ ...original, name: value }))} />
                <Field label="Relationship to the deceased">
                  <Input value={item.relationship} onChange={(event) => updateCoApplicant(index, (original) => ({ ...original, relationship: event.target.value }))} />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Email">
                    <Input value={item.email} onChange={(event) => updateCoApplicant(index, (original) => ({ ...original, email: event.target.value }))} />
                  </Field>
                  <Field label="Phone">
                    <Input value={item.phone} onChange={(event) => updateCoApplicant(index, (original) => ({ ...original, phone: event.target.value }))} />
                  </Field>
                </div>
                <AddressFields value={item.address} onChange={(value) => updateCoApplicant(index, (original) => ({
                  ...original,
                  address: { line1: value.line1, line2: value.line2, city: value.city, region: value.region, postalCode: value.postalCode, country: value.country },
                }))} />
              </div>
            </div>
          )}
        />
        {errors["applicant.coApplicants"] ? <ErrorText>{errors["applicant.coApplicants"]}</ErrorText> : null}
      </QuestionCard>
    </div>
  );
}

function DeceasedBasics({ draft, updateEstate, errors }: RenderContext) {
  const deceased = draft.estateIntake.deceased;
  const handleNameChange = (value: StructuredNameValue) => {
    updateEstate((estate) => ({
      ...estate,
      deceased: {
        ...estate.deceased,
        name: { ...estate.deceased.name, ...value },
      },
    }));
  };
  return (
    <div className="space-y-6">
      <QuestionCard
        title="Full legal name of the person who died"
        why="The court compares this against the death certificate and the will."
        where="Copy it exactly from the death certificate. We’ll handle alternate spellings later."
      >
        <NameFields
          value={deceased.name}
          onChange={handleNameChange}
          errors={{
            first: errors["deceased.name.first"],
            last: errors["deceased.name.last"],
          }}
        />
      </QuestionCard>
      <QuestionCard
        title="Date and place of death"
        why="The date and place confirm BC jurisdiction and timelines."
        where="Use the death certificate."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Date of death" required error={errors["deceased.dateOfDeath"]}>
            <Input type="date" value={deceased.dateOfDeath} onChange={(event) => updateEstate((estate) => ({
              ...estate,
              deceased: { ...estate.deceased, dateOfDeath: event.target.value },
            }))} />
          </Field>
          <Field label="City of death" required error={errors["deceased.placeOfDeath.city"]}>
            <Input value={deceased.placeOfDeath.city} onChange={(event) => updateEstate((estate) => ({
              ...estate,
              deceased: { ...estate.deceased, placeOfDeath: { ...estate.deceased.placeOfDeath, city: event.target.value } },
            }))} />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Province / State" required error={errors["deceased.placeOfDeath.province"]}>
            <Input value={deceased.placeOfDeath.province} onChange={(event) => updateEstate((estate) => ({
              ...estate,
              deceased: { ...estate.deceased, placeOfDeath: { ...estate.deceased.placeOfDeath, province: event.target.value } },
            }))} />
          </Field>
          <Field label="Country" required error={errors["deceased.placeOfDeath.country"]}>
            <Input value={deceased.placeOfDeath.country} onChange={(event) => updateEstate((estate) => ({
              ...estate,
              deceased: { ...estate.deceased, placeOfDeath: { ...estate.deceased.placeOfDeath, country: event.target.value } },
            }))} />
          </Field>
        </div>
      </QuestionCard>
    </div>
  );
}

function DeceasedBirthResidence({ draft, updateEstate, errors }: RenderContext) {
  const deceased = draft.estateIntake.deceased;
  const handleAddressChange = (value: AddressValue) => {
    updateEstate((estate) => ({
      ...estate,
      deceased: {
        ...estate.deceased,
        address: {
          line1: value.line1,
          line2: value.line2,
          city: value.city,
          region: value.region,
          postalCode: value.postalCode,
          country: value.country,
        },
      },
    }));
  };
  return (
    <div className="space-y-6">
      <QuestionCard
        title="Date of birth"
        why="Used to confirm identity and for certain notices."
        where="Use the birth date on the death certificate, passport, or ID."
      >
        <Field label="Date of birth" required error={errors["deceased.dateOfBirth"]}>
          <Input type="date" value={deceased.dateOfBirth} onChange={(event) => updateEstate((estate) => ({
            ...estate,
            deceased: { ...estate.deceased, dateOfBirth: event.target.value },
          }))} />
        </Field>
      </QuestionCard>
      <QuestionCard
        title="Last residential address"
        description="Where they usually lived just before death."
        why="The last usual residence determines the appropriate registry."
        where="Use the primary home address. If they were in care, note the facility."
      >
        <AddressFields
          value={deceased.address}
          onChange={handleAddressChange}
          errors={{
            line1: errors["deceased.address.line1"],
            city: errors["deceased.address.city"],
            region: errors["deceased.address.region"],
            postalCode: errors["deceased.address.postalCode"],
          }}
        />
      </QuestionCard>
    </div>
  );
}

function DeceasedMarital({ draft, updateEstate, errors }: RenderContext) {
  return (
    <QuestionCard
      title="Marital status at the time of death"
      why="Spouses may have special rights, and this affects who must receive notice."
      where="If separated but not divorced, choose “separated”."
    >
      <div className="grid gap-3 md:grid-cols-3">
        {["single", "married", "common-law", "separated", "divorced", "widowed"].map((option) => (
          <button
            key={option}
            type="button"
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
              draft.estateIntake.deceased.maritalStatus === option ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white" : "border-[color:var(--border-muted)] text-[color:var(--ink)]"
            }`}
            onClick={() => updateEstate((estate) => ({ ...estate, deceased: { ...estate.deceased, maritalStatus: option as typeof estate.deceased.maritalStatus } }))}
          >
            {option.replace("-", " ").replace("common law", "Common-law").replace("widowed", "Widowed").replace("single", "Single").replace("married", "Married")}
          </button>
        ))}
      </div>
      {errors["deceased.maritalStatus"] ? <ErrorText>{errors["deceased.maritalStatus"]}</ErrorText> : null}
    </QuestionCard>
  );
}

function WillPresence({ draft, updateEstate, errors }: RenderContext) {
  const value = draft.estateIntake.will.hasWill;
  return (
    <QuestionCard
      title="Is there a will?"
      why="The process differs depending on whether a will exists."
      where="Check with family, law firms, or safety deposit boxes."
    >
      <YesNoButtons
        value={value}
        onChange={(answer) => updateEstate((estate) => ({ ...estate, will: { ...estate.will, hasWill: answer as "yes" | "no" | "unknown" } }))}
        options={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
          { label: "Not sure", value: "unknown" },
        ]}
      />
      {errors["will.hasWill"] ? <ErrorText>{errors["will.hasWill"]}</ErrorText> : null}
    </QuestionCard>
  );
}

function WillDetails({ draft, updateEstate, errors }: RenderContext) {
  const will = draft.estateIntake.will;
  return (
    <QuestionCard
      title="Will details"
      why="The court needs to know which will is the latest valid one."
      where="You’ll usually find the date and place near the signature block."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Date the will was signed" required={will.hasWill === "yes"} error={errors["will.dateSigned"]}>
          <Input type="date" value={will.dateSigned} onChange={(event) => updateEstate((estate) => ({ ...estate, will: { ...estate.will, dateSigned: event.target.value } }))} />
        </Field>
        <Field label="Signing city" required={will.hasWill === "yes"} error={errors["will.signingLocation.city"]}>
          <Input value={will.signingLocation.city} onChange={(event) => updateEstate((estate) => ({
            ...estate,
            will: { ...estate.will, signingLocation: { ...estate.will.signingLocation, city: event.target.value } },
          }))} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Signing province/state" required={will.hasWill === "yes"}>
          <Input value={will.signingLocation.province} onChange={(event) => updateEstate((estate) => ({
            ...estate,
            will: { ...estate.will, signingLocation: { ...estate.will.signingLocation, province: event.target.value } },
          }))} />
        </Field>
        <Field label="Signing country" required={will.hasWill === "yes"}>
          <Input value={will.signingLocation.country} onChange={(event) => updateEstate((estate) => ({
            ...estate,
            will: { ...estate.will, signingLocation: { ...estate.will.signingLocation, country: event.target.value } },
          }))} />
        </Field>
      </div>
    </QuestionCard>
  );
}

function WillOriginal({ draft, updateEstate, errors }: RenderContext) {
  const will = draft.estateIntake.will;
  return (
    <QuestionCard
      title="Do you have the original signed will?"
      why="The registry usually requires the original, not a copy."
      where="Think of anything with wet ink signatures, often stored at home or a law firm."
    >
      <YesNoButtons
        value={will.hasOriginal}
        onChange={(answer) => updateEstate((estate) => ({ ...estate, will: { ...estate.will, hasOriginal: answer as "yes" | "no" | "unknown" } }))}
        options={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
          { label: "Not sure", value: "unknown" },
        ]}
      />
      {errors["will.hasOriginal"] ? <ErrorText>{errors["will.hasOriginal"]}</ErrorText> : null}
      <Field label="Where is the original will stored now?" required error={errors["will.storageLocation"]}>
        <Input value={will.storageLocation} onChange={(event) => updateEstate((estate) => ({ ...estate, will: { ...estate.will, storageLocation: event.target.value } }))} placeholder="e.g., In a fireproof safe at home" />
      </Field>
    </QuestionCard>
  );
}

function WillExecutors({ draft, updateEstate, errors }: RenderContext) {
  const executors = draft.estateIntake.will.namedExecutors;
  const addExecutor = () => {
    updateEstate((estate) => ({
      ...estate,
      will: {
        ...estate.will,
        namedExecutors: [
          ...estate.will.namedExecutors,
          { id: newId(), name: { first: "", middle1: "", middle2: "", middle3: "", last: "", suffix: "" }, isApplicant: null },
        ],
      },
    }));
  };
  const updateExecutor = (index: number, updater: (executor: (typeof executors)[number]) => (typeof executors)[number]) => {
    updateEstate((estate) => {
      const updated = [...estate.will.namedExecutors];
      updated[index] = updater(updated[index]);
      return {
        ...estate,
        will: { ...estate.will, namedExecutors: updated },
      };
    });
  };
  const removeExecutor = (index: number) => {
    updateEstate((estate) => {
      const updated = [...estate.will.namedExecutors];
      updated.splice(index, 1);
      return {
        ...estate,
        will: { ...estate.will, namedExecutors: updated },
      };
    });
  };
  return (
    <QuestionCard
      title="Who is named as executor in the will?"
      description="Include alternates or replacements."
      why="The court must know everyone appointed, even if they aren’t applying."
      where="Look near the beginning of the will for the “Appointment of Executor” clause."
    >
      <RepeatableCardList
        items={executors}
        onAdd={addExecutor}
        addLabel="Add another executor"
        emptyState="List every person appointed in the will."
        renderItem={(executor, index) => (
          <div key={executor.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[color:var(--ink)]">Executor {index + 1}</p>
              <button type="button" className="text-sm text-[color:var(--brand)] underline-offset-2 hover:underline" onClick={() => removeExecutor(index)}>
                Remove
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <NameFields value={executor.name} onChange={(value) => updateExecutor(index, (original) => ({ ...original, name: value }))} />
              <Field label="Is this you or a co-applicant?">
                <YesNoButtons
                  value={executor.isApplicant}
                  onChange={(value) => updateExecutor(index, (original) => ({ ...original, isApplicant: value as "yes" | "no" }))}
                />
              </Field>
            </div>
          </div>
        )}
      />
      {errors["will.namedExecutors"] ? <ErrorText>{errors["will.namedExecutors"]}</ErrorText> : null}
    </QuestionCard>
  );
}

function WillCodicils({ draft, updateEstate, errors }: RenderContext) {
  const codicils = draft.estateIntake.will.codicils;
  const addCodicil = () => {
    updateEstate((estate) => ({
      ...estate,
      will: {
        ...estate.will,
        codicils: [...estate.will.codicils, { id: newId(), dateSigned: "", notes: "" }],
      },
    }));
  };
  return (
    <QuestionCard
      title="Are there any codicils (updates to the will)?"
      why="Codicils can change gifts or executors and must accompany the application."
      where="Look for any document titled “Codicil” or “Supplement” to the will."
    >
      <YesNoButtons
        value={draft.estateIntake.will.hasCodicils}
        onChange={(value) => updateEstate((estate) => ({ ...estate, will: { ...estate.will, hasCodicils: value as "yes" | "no" } }))}
      />
      {errors["will.hasCodicils"] ? <ErrorText>{errors["will.hasCodicils"]}</ErrorText> : null}
      {draft.estateIntake.will.hasCodicils === "yes" ? (
        <div className="mt-4 space-y-4">
          {codicils.map((codicil, index) => (
            <div key={codicil.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[color:var(--ink)]">Codicil {index + 1}</p>
                <button
                  type="button"
                  className="text-sm text-[color:var(--brand)] underline-offset-2 hover:underline"
                  onClick={() =>
                    updateEstate((estate) => {
                      const updated = [...estate.will.codicils];
                      updated.splice(index, 1);
                      return { ...estate, will: { ...estate.will, codicils: updated } };
                    })
                  }
                >
                  Remove
                </button>
              </div>
              <div className="mt-4 space-y-3">
                <Field label="Date signed" required error={errors[`will.codicils.${index}.dateSigned`]}>
                  <Input
                    type="date"
                    value={codicil.dateSigned}
                    onChange={(event) =>
                      updateEstate((estate) => {
                        const updated = [...estate.will.codicils];
                        updated[index] = { ...updated[index], dateSigned: event.target.value };
                        return { ...estate, will: { ...estate.will, codicils: updated } };
                      })
                    }
                  />
                </Field>
                <Field label="Brief description">
                  <Textarea
                    value={codicil.notes}
                    onChange={(event) =>
                      updateEstate((estate) => {
                        const updated = [...estate.will.codicils];
                        updated[index] = { ...updated[index], notes: event.target.value };
                        return { ...estate, will: { ...estate.will, codicils: updated } };
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addCodicil}>
            Add another codicil
          </Button>
        </div>
      ) : null}
      {errors["will.codicils"] ? <ErrorText>{errors["will.codicils"]}</ErrorText> : null}
    </QuestionCard>
  );
}

function FamilySpouse({ draft, updateEstate, errors }: RenderContext) {
  const family = draft.estateIntake.family;
  const spouse = family.spouse;
  const handleSpouseName = (value: StructuredNameValue) => {
    updateEstate((estate) => ({
      ...estate,
      family: {
        ...estate.family,
        spouse: { ...estate.family.spouse, name: value },
      },
    }));
  };
  const handleSpouseAddress = (value: AddressValue) => {
    updateEstate((estate) => ({
      ...estate,
      family: {
        ...estate.family,
        spouse: {
          ...estate.family.spouse,
          address: { line1: value.line1, line2: value.line2, city: value.city, region: value.region, postalCode: value.postalCode, country: value.country },
        },
      },
    }));
  };

  return (
    <QuestionCard
      title="Did the deceased have a spouse at the time of death?"
      why="Spouses often must receive notice and may have special rights."
      where="Spouse can include married or long-term common-law partners."
    >
      <YesNoButtons
        value={family.hasSpouse}
        onChange={(value) => updateEstate((estate) => ({ ...estate, family: { ...estate.family, hasSpouse: value as "yes" | "no" } }))}
      />
      {errors["family.hasSpouse"] ? <ErrorText>{errors["family.hasSpouse"]}</ErrorText> : null}
      {family.hasSpouse === "yes" ? (
        <div className="mt-4 space-y-4">
          <NameFields
            value={spouse.name}
            onChange={handleSpouseName}
            errors={{
              first: errors["family.spouse.name.first"],
              last: errors["family.spouse.name.last"],
            }}
          />
          <Field label="Date of birth">
            <Input type="date" value={spouse.dateOfBirth} onChange={(event) => updateEstate((estate) => ({ ...estate, family: { ...estate.family, spouse: { ...estate.family.spouse, dateOfBirth: event.target.value } } }))} />
          </Field>
          <AddressFields
            value={spouse.address}
            onChange={handleSpouseAddress}
            errors={{
              line1: errors["family.spouse.address.line1"],
              city: errors["family.spouse.address.city"],
              region: errors["family.spouse.address.region"],
              postalCode: errors["family.spouse.address.postalCode"],
            }}
          />
        </div>
      ) : null}
    </QuestionCard>
  );
}

function FamilyChildren({ draft, updateEstate, errors }: RenderContext) {
  const family = draft.estateIntake.family;
  const children = family.children;
  const addChild = () => {
    updateEstate((estate) => ({
      ...estate,
      family: {
        ...estate.family,
        children: [
          ...estate.family.children,
          {
            id: newId(),
            name: { first: "", middle1: "", middle2: "", middle3: "", last: "", suffix: "" },
            dateOfBirth: "",
            isMinor: false,
            relationship: "child",
            address: { line1: "", line2: "", city: "", region: "", postalCode: "", country: "Canada" },
          },
        ],
      },
    }));
  };
  return (
    <QuestionCard
      title="Did the deceased have any biological or adopted children?"
      why="Children may need notice and may have support or inheritance rights."
      where="Include adopted children; step-children will be handled separately."
    >
      <YesNoButtons
        value={family.hasChildren}
        onChange={(value) => updateEstate((estate) => ({ ...estate, family: { ...estate.family, hasChildren: value as "yes" | "no" } }))}
      />
      {errors["family.hasChildren"] ? <ErrorText>{errors["family.hasChildren"]}</ErrorText> : null}
      {family.hasChildren === "yes" ? (
        <RepeatableCardList
          items={children}
          onAdd={addChild}
          addLabel="Add another child"
          emptyState="Add each biological or adopted child."
          renderItem={(child, index) => (
            <div key={child.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[color:var(--ink)]">Child {index + 1}</p>
                <button
                  type="button"
                  className="text-sm text-[color:var(--brand)] underline-offset-2 hover:underline"
                  onClick={() =>
                    updateEstate((estate) => {
                      const updated = [...estate.family.children];
                      updated.splice(index, 1);
                      return { ...estate, family: { ...estate.family, children: updated } };
                    })
                  }
                >
                  Remove
                </button>
              </div>
              <div className="mt-4 space-y-3">
                <NameFields value={child.name} onChange={(value) => updateEstate((estate) => {
                  const updated = [...estate.family.children];
                  updated[index] = { ...updated[index], name: value };
                  return { ...estate, family: { ...estate.family, children: updated } };
                })} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Date of birth">
                    <Input
                      type="date"
                      value={child.dateOfBirth}
                      onChange={(event) =>
                        updateEstate((estate) => {
                          const updated = [...estate.family.children];
                          updated[index] = { ...updated[index], dateOfBirth: event.target.value };
                          return { ...estate, family: { ...estate.family, children: updated } };
                        })
                      }
                    />
                  </Field>
                  <Field label="Is this person under 19?">
                    <YesNoButtons
                      value={child.isMinor ? "yes" : "no"}
                      onChange={(value) =>
                        updateEstate((estate) => {
                          const updated = [...estate.family.children];
                          updated[index] = { ...updated[index], isMinor: value === "yes" };
                          return { ...estate, family: { ...estate.family, children: updated } };
                        })
                      }
                    />
                  </Field>
                </div>
                <AddressFields
                  value={child.address}
                  onChange={(value) =>
                    updateEstate((estate) => {
                      const updated = [...estate.family.children];
                      updated[index] = {
                        ...updated[index],
                        address: { line1: value.line1, line2: value.line2, city: value.city, region: value.region, postalCode: value.postalCode, country: value.country },
                      };
                      return { ...estate, family: { ...estate.family, children: updated } };
                    })
                  }
                />
              </div>
            </div>
          )}
        />
      ) : null}
      {errors["family.children"] ? <ErrorText>{errors["family.children"]}</ErrorText> : null}
    </QuestionCard>
  );
}

function FamilyRelatives({ draft, updateEstate }: RenderContext) {
  const relatives = draft.estateIntake.family.otherRelatives;
  const addRelative = () => {
    updateEstate((estate) => ({
      ...estate,
      family: {
        ...estate.family,
        otherRelatives: [
          ...estate.family.otherRelatives,
          {
            id: newId(),
            name: { first: "", middle1: "", middle2: "", middle3: "", last: "", suffix: "" },
            dateOfBirth: "",
            isMinor: false,
            relationship: "",
            address: { line1: "", line2: "", city: "", region: "", postalCode: "", country: "Canada" },
          },
        ],
      },
    }));
  };
  return (
    <QuestionCard
      title="Other close relatives"
      description="Optional, but helpful if there is no spouse or children."
      why="Closest relatives may need notice if there’s no spouse or children."
      where="Think of siblings, parents, nieces, or nephews."
    >
      <RepeatableCardList
        items={relatives}
        onAdd={addRelative}
        addLabel="Add a relative"
        emptyState="Add anyone else you expect the court to ask about."
        renderItem={(relative, index) => (
          <div key={relative.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[color:var(--ink)]">Relative {index + 1}</p>
              <button
                type="button"
                className="text-sm text-[color:var(--brand)] underline-offset-2 hover:underline"
                onClick={() =>
                  updateEstate((estate) => {
                    const updated = [...estate.family.otherRelatives];
                    updated.splice(index, 1);
                    return { ...estate, family: { ...estate.family, otherRelatives: updated } };
                  })
                }
              >
                Remove
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <NameFields value={relative.name} onChange={(value) => updateEstate((estate) => {
                const updated = [...estate.family.otherRelatives];
                updated[index] = { ...updated[index], name: value };
                return { ...estate, family: { ...estate.family, otherRelatives: updated } };
              })} />
              <Field label="Relationship">
                <Input value={relative.relationship} onChange={(event) => updateEstate((estate) => {
                  const updated = [...estate.family.otherRelatives];
                  updated[index] = { ...updated[index], relationship: event.target.value };
                  return { ...estate, family: { ...estate.family, otherRelatives: updated } };
                })} />
              </Field>
              <AddressFields
                value={relative.address}
                onChange={(value) =>
                  updateEstate((estate) => {
                    const updated = [...estate.family.otherRelatives];
                    updated[index] = {
                      ...updated[index],
                      address: { line1: value.line1, line2: value.line2, city: value.city, region: value.region, postalCode: value.postalCode, country: value.country },
                    };
                    return { ...estate, family: { ...estate.family, otherRelatives: updated } };
                  })
                }
              />
            </div>
          </div>
        )}
      />
    </QuestionCard>
  );
}

function BeneficiariesPeople({ draft, updateEstate, errors }: RenderContext) {
  const beneficiaries = draft.estateIntake.beneficiaries.people;
  const addBeneficiary = () => {
    updateEstate((estate) => ({
      ...estate,
      beneficiaries: {
        ...estate.beneficiaries,
        people: [
          ...estate.beneficiaries.people,
          {
            id: newId(),
            name: { first: "", middle1: "", middle2: "", middle3: "", last: "", suffix: "" },
            type: "person",
            address: { line1: "", line2: "", city: "", region: "", postalCode: "", country: "Canada" },
            giftDescription: "",
            isMinorOrIncapable: false,
          },
        ],
      },
    }));
  };
  return (
    <QuestionCard
      title="People named in the will"
      description="List everyone who receives something."
      why="Everyone who benefits under the will must be listed for notices."
      where="Read through the will and list each person or organisation."
    >
      <RepeatableCardList
        items={beneficiaries}
        onAdd={addBeneficiary}
        addLabel="Add a beneficiary"
        emptyState="List everyone named in the will. You can summarise similar gifts."
        renderItem={(beneficiary, index) => (
          <div key={beneficiary.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[color:var(--ink)]">Beneficiary {index + 1}</p>
              <button
                type="button"
                className="text-sm text-[color:var(--brand)] underline-offset-2 hover:underline"
                onClick={() =>
                  updateEstate((estate) => {
                    const updated = [...estate.beneficiaries.people];
                    updated.splice(index, 1);
                    return { ...estate, beneficiaries: { ...estate.beneficiaries, people: updated } };
                  })
                }
              >
                Remove
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <NameFields value={beneficiary.name} onChange={(value) => updateEstate((estate) => {
                const updated = [...estate.beneficiaries.people];
                updated[index] = { ...updated[index], name: value };
                return { ...estate, beneficiaries: { ...estate.beneficiaries, people: updated } };
              })} />
              <AddressFields
                value={beneficiary.address}
                onChange={(value) =>
                  updateEstate((estate) => {
                    const updated = [...estate.beneficiaries.people];
                    updated[index] = {
                      ...updated[index],
                      address: { line1: value.line1, line2: value.line2, city: value.city, region: value.region, postalCode: value.postalCode, country: value.country },
                    };
                    return { ...estate, beneficiaries: { ...estate.beneficiaries, people: updated } };
                  })
                }
              />
              <Field label="Gift description">
                <Textarea
                  value={beneficiary.giftDescription}
                  onChange={(event) =>
                    updateEstate((estate) => {
                      const updated = [...estate.beneficiaries.people];
                      updated[index] = { ...updated[index], giftDescription: event.target.value };
                      return { ...estate, beneficiaries: { ...estate.beneficiaries, people: updated } };
                    })
                  }
                />
              </Field>
              <Field label="Is this person a minor or incapable person?">
                <YesNoButtons
                  value={beneficiary.isMinorOrIncapable ? "yes" : "no"}
                  onChange={(value) =>
                    updateEstate((estate) => {
                      const updated = [...estate.beneficiaries.people];
                      updated[index] = { ...updated[index], isMinorOrIncapable: value === "yes" };
                      return { ...estate, beneficiaries: { ...estate.beneficiaries, people: updated } };
                    })
                  }
                />
              </Field>
            </div>
          </div>
        )}
      />
      {errors["beneficiaries.people"] ? <ErrorText>{errors["beneficiaries.people"]}</ErrorText> : null}
    </QuestionCard>
  );
}

function BeneficiariesOrganizations({ draft, updateEstate }: RenderContext) {
  const orgs = draft.estateIntake.beneficiaries.organizations;
  const addOrg = () => {
    updateEstate((estate) => ({
      ...estate,
      beneficiaries: {
        ...estate.beneficiaries,
        organizations: [
          ...estate.beneficiaries.organizations,
          {
            id: newId(),
            type: "organization",
            legalName: "",
            registeredNumber: "",
            address: { line1: "", line2: "", city: "", region: "", postalCode: "", country: "Canada" },
            giftDescription: "",
          },
        ],
      },
    }));
  };
  return (
    <QuestionCard
      title="Organisations or charities named in the will"
      why="Charities must be named correctly on the forms and notices."
      where="Use the full legal name from the will or the charity’s CRA listing."
    >
      <RepeatableCardList
        items={orgs}
        onAdd={addOrg}
        addLabel="Add an organisation"
        emptyState="Add charities or organisations if the will leaves them anything."
        renderItem={(org, index) => (
          <div key={org.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[color:var(--ink)]">Organisation {index + 1}</p>
              <button
                type="button"
                className="text-sm text-[color:var(--brand)] underline-offset-2 hover:underline"
                onClick={() =>
                  updateEstate((estate) => {
                    const updated = [...estate.beneficiaries.organizations];
                    updated.splice(index, 1);
                    return { ...estate, beneficiaries: { ...estate.beneficiaries, organizations: updated } };
                  })
                }
              >
                Remove
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <Field label="Legal name">
                <Input
                  value={org.legalName}
                  onChange={(event) =>
                    updateEstate((estate) => {
                      const updated = [...estate.beneficiaries.organizations];
                      updated[index] = { ...updated[index], legalName: event.target.value };
                      return { ...estate, beneficiaries: { ...estate.beneficiaries, organizations: updated } };
                    })
                  }
                />
              </Field>
              <Field label="Registered number (if known)">
                <Input
                  value={org.registeredNumber}
                  onChange={(event) =>
                    updateEstate((estate) => {
                      const updated = [...estate.beneficiaries.organizations];
                      updated[index] = { ...updated[index], registeredNumber: event.target.value };
                      return { ...estate, beneficiaries: { ...estate.beneficiaries, organizations: updated } };
                    })
                  }
                />
              </Field>
              <AddressFields
                value={org.address}
                onChange={(value) =>
                  updateEstate((estate) => {
                    const updated = [...estate.beneficiaries.organizations];
                    updated[index] = {
                      ...updated[index],
                      address: { line1: value.line1, line2: value.line2, city: value.city, region: value.region, postalCode: value.postalCode, country: value.country },
                    };
                    return { ...estate, beneficiaries: { ...estate.beneficiaries, organizations: updated } };
                  })
                }
              />
              <Field label="Gift description">
                <Textarea
                  value={org.giftDescription}
                  onChange={(event) =>
                    updateEstate((estate) => {
                      const updated = [...estate.beneficiaries.organizations];
                      updated[index] = { ...updated[index], giftDescription: event.target.value };
                      return { ...estate, beneficiaries: { ...estate.beneficiaries, organizations: updated } };
                    })
                  }
                />
              </Field>
            </div>
          </div>
        )}
      />
    </QuestionCard>
  );
}

function AssetsRealEstate({ draft, updateEstate, errors }: RenderContext) {
  const assets = draft.estateIntake.assets;
  const addProperty = () => {
    updateEstate((estate) => ({
      ...estate,
      assets: {
        ...estate.assets,
        bcProperties: [
          ...estate.assets.bcProperties,
          {
            id: newId(),
            address: { line1: "", line2: "", city: "", region: "", postalCode: "", country: "Canada" },
            ownershipType: "sole",
            coOwners: "",
            estimatedValue: "",
            mortgageBalance: "",
          },
        ],
      },
    }));
  };
  return (
    <QuestionCard
      title="Did the deceased own or co-own any real estate in BC?"
      why="Properties must be listed separately in the probate schedules."
      where="Think of any houses, condos, land, or cabins in BC."
    >
      <YesNoButtons
        value={assets.hasBCRealEstate}
        onChange={(value) => updateEstate((estate) => ({ ...estate, assets: { ...estate.assets, hasBCRealEstate: value as "yes" | "no" } }))}
      />
      {errors["assets.hasBCRealEstate"] ? <ErrorText>{errors["assets.hasBCRealEstate"]}</ErrorText> : null}
      {assets.hasBCRealEstate === "yes" ? (
        <RepeatableCardList
          items={assets.bcProperties}
          onAdd={addProperty}
          addLabel="Add another property"
          emptyState="List each BC property with the best details you have."
          renderItem={(property, index) => (
            <div key={property.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[color:var(--ink)]">Property {index + 1}</p>
                <button
                  type="button"
                  className="text-sm text-[color:var(--brand)] underline-offset-2 hover:underline"
                  onClick={() =>
                    updateEstate((estate) => {
                      const updated = [...estate.assets.bcProperties];
                      updated.splice(index, 1);
                      return { ...estate, assets: { ...estate.assets, bcProperties: updated } };
                    })
                  }
                >
                  Remove
                </button>
              </div>
              <div className="mt-4 space-y-3">
                <AddressFields
                  value={property.address}
                  onChange={(value) =>
                    updateEstate((estate) => {
                      const updated = [...estate.assets.bcProperties];
                      updated[index] = {
                        ...updated[index],
                        address: { line1: value.line1, line2: value.line2, city: value.city, region: value.region, postalCode: value.postalCode, country: value.country },
                      };
                      return { ...estate, assets: { ...estate.assets, bcProperties: updated } };
                    })
                  }
                />
                <Field label="Ownership type">
                  <select
                    value={property.ownershipType}
                    onChange={(event) =>
                      updateEstate((estate) => {
                        const updated = [...estate.assets.bcProperties];
                        updated[index] = { ...updated[index], ownershipType: event.target.value as typeof property.ownershipType };
                        return { ...estate, assets: { ...estate.assets, bcProperties: updated } };
                      })
                    }
                    className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-4 py-3 text-sm"
                  >
                    <option value="sole">Sole owner</option>
                    <option value="joint-tenancy">Joint tenancy</option>
                    <option value="tenants-in-common">Tenants in common</option>
                    <option value="unknown">Not sure</option>
                  </select>
                </Field>
                <Field label="Co-owners (if any)">
                  <Input
                    value={property.coOwners}
                    onChange={(event) =>
                      updateEstate((estate) => {
                        const updated = [...estate.assets.bcProperties];
                        updated[index] = { ...updated[index], coOwners: event.target.value };
                        return { ...estate, assets: { ...estate.assets, bcProperties: updated } };
                      })
                    }
                  />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Estimated value">
                    <Input
                      value={property.estimatedValue}
                      onChange={(event) =>
                        updateEstate((estate) => {
                          const updated = [...estate.assets.bcProperties];
                          updated[index] = { ...updated[index], estimatedValue: event.target.value };
                          return { ...estate, assets: { ...estate.assets, bcProperties: updated } };
                        })
                      }
                      placeholder="$"
                    />
                  </Field>
                  <Field label="Approximate mortgage balance">
                    <Input
                      value={property.mortgageBalance}
                      onChange={(event) =>
                        updateEstate((estate) => {
                          const updated = [...estate.assets.bcProperties];
                          updated[index] = { ...updated[index], mortgageBalance: event.target.value };
                          return { ...estate, assets: { ...estate.assets, bcProperties: updated } };
                        })
                      }
                      placeholder="$"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}
        />
      ) : null}
      {errors["assets.bcProperties"] ? <ErrorText>{errors["assets.bcProperties"]}</ErrorText> : null}
    </QuestionCard>
  );
}

function AssetsAccounts({ draft, updateEstate, errors }: RenderContext) {
  const assets = draft.estateIntake.assets;
  const addAccount = () => {
    updateEstate((estate) => ({
      ...estate,
      assets: {
        ...estate.assets,
        accounts: [
          ...estate.assets.accounts,
          { id: newId(), institutionName: "", accountType: "", approxBalance: "", ownership: "sole" },
        ],
      },
    }));
  };
  return (
    <QuestionCard
      title="Does the estate include bank accounts or investment accounts?"
      why="Accounts are usually part of the estate and must be valued."
      where="Think of banks, credit unions, and investment platforms."
    >
      <YesNoButtons
        value={assets.hasBankOrInvestments}
        onChange={(value) => updateEstate((estate) => ({ ...estate, assets: { ...estate.assets, hasBankOrInvestments: value as "yes" | "no" } }))}
      />
      {errors["assets.hasBankOrInvestments"] ? <ErrorText>{errors["assets.hasBankOrInvestments"]}</ErrorText> : null}
      {assets.hasBankOrInvestments === "yes" ? (
        <RepeatableCardList
          items={assets.accounts}
          onAdd={addAccount}
          addLabel="Add another account"
          emptyState="List each account category with an approximate balance."
          renderItem={(account, index) => (
            <div key={account.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
              <Field label="Institution name">
                <Input
                  value={account.institutionName}
                  onChange={(event) =>
                    updateEstate((estate) => {
                      const updated = [...estate.assets.accounts];
                      updated[index] = { ...updated[index], institutionName: event.target.value };
                      return { ...estate, assets: { ...estate.assets, accounts: updated } };
                    })
                  }
                />
              </Field>
              <Field label="Account type">
                <Input
                  value={account.accountType}
                  onChange={(event) =>
                    updateEstate((estate) => {
                      const updated = [...estate.assets.accounts];
                      updated[index] = { ...updated[index], accountType: event.target.value };
                      return { ...estate, assets: { ...estate.assets, accounts: updated } };
                    })
                  }
                  placeholder="Chequing, savings, TFSA, RRSP…"
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Approximate balance">
                  <Input
                    value={account.approxBalance}
                    onChange={(event) =>
                      updateEstate((estate) => {
                        const updated = [...estate.assets.accounts];
                        updated[index] = { ...updated[index], approxBalance: event.target.value };
                        return { ...estate, assets: { ...estate.assets, accounts: updated } };
                      })
                    }
                    placeholder="$"
                  />
                </Field>
                <Field label="Ownership">
                  <select
                    value={account.ownership}
                    onChange={(event) =>
                      updateEstate((estate) => {
                        const updated = [...estate.assets.accounts];
                        updated[index] = { ...updated[index], ownership: event.target.value as typeof account.ownership };
                        return { ...estate, assets: { ...estate.assets, accounts: updated } };
                      })
                    }
                    className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-4 py-3 text-sm"
                  >
                    <option value="sole">Sole</option>
                    <option value="joint">Joint</option>
                    <option value="unknown">Not sure</option>
                  </select>
                </Field>
              </div>
            </div>
          )}
        />
      ) : null}
      {errors["assets.accounts"] ? <ErrorText>{errors["assets.accounts"]}</ErrorText> : null}
    </QuestionCard>
  );
}

function AssetsProperty({ draft, updateEstate }: RenderContext) {
  const assets = draft.estateIntake.assets;
  const addVehicle = () => {
    updateEstate((estate) => ({
      ...estate,
      assets: {
        ...estate.assets,
        vehicles: [...estate.assets.vehicles, { id: newId(), description: "", approxValue: "" }],
      },
    }));
  };
  const addItem = () => {
    updateEstate((estate) => ({
      ...estate,
      assets: {
        ...estate.assets,
        valuableItems: [...estate.assets.valuableItems, { id: newId(), description: "", approxValue: "" }],
      },
    }));
  };
  return (
    <div className="space-y-6">
      <QuestionCard
        title="Vehicles"
        description="Cars, trucks, boats, motorcycles, etc."
        why="Vehicles above modest values often need to be listed separately."
        where="Use insurance documents or your best estimate."
      >
        <RepeatableCardList
          items={assets.vehicles}
          onAdd={addVehicle}
          addLabel="Add a vehicle"
          emptyState="Add each vehicle owned by the deceased."
          renderItem={(vehicle, index) => (
            <div key={vehicle.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
              <Field label="Description">
                <Input
                  value={vehicle.description}
                  onChange={(event) =>
                    updateEstate((estate) => {
                      const updated = [...estate.assets.vehicles];
                      updated[index] = { ...updated[index], description: event.target.value };
                      return { ...estate, assets: { ...estate.assets, vehicles: updated } };
                    })
                  }
                  placeholder="2018 Toyota Corolla, blue"
                />
              </Field>
              <Field label="Approximate value">
                <Input
                  value={vehicle.approxValue}
                  onChange={(event) =>
                    updateEstate((estate) => {
                      const updated = [...estate.assets.vehicles];
                      updated[index] = { ...updated[index], approxValue: event.target.value };
                      return { ...estate, assets: { ...estate.assets, vehicles: updated } };
                    })
                  }
                  placeholder="$"
                />
              </Field>
            </div>
          )}
        />
      </QuestionCard>
      <QuestionCard
        title="Other significant valuables"
        description="Jewellery, art, collections, or equipment worth over ~$5,000."
        why="High-value items may need to be listed separately."
        where="Use insurance appraisals or reasonable estimates."
      >
        <RepeatableCardList
          items={assets.valuableItems}
          onAdd={addItem}
          addLabel="Add an item"
          emptyState="List any high-value items."
          renderItem={(item, index) => (
            <div key={item.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
              <Field label="Description">
                <Input
                  value={item.description}
                  onChange={(event) =>
                    updateEstate((estate) => {
                      const updated = [...estate.assets.valuableItems];
                      updated[index] = { ...updated[index], description: event.target.value };
                      return { ...estate, assets: { ...estate.assets, valuableItems: updated } };
                    })
                  }
                  placeholder="Diamond ring, art collection…"
                />
              </Field>
              <Field label="Approximate value">
                <Input
                  value={item.approxValue}
                  onChange={(event) =>
                    updateEstate((estate) => {
                      const updated = [...estate.assets.valuableItems];
                      updated[index] = { ...updated[index], approxValue: event.target.value };
                      return { ...estate, assets: { ...estate.assets, valuableItems: updated } };
                    })
                  }
                  placeholder="$"
                />
              </Field>
            </div>
          )}
        />
      </QuestionCard>
    </div>
  );
}

function DebtsLiabilities({ draft, updateEstate, errors }: RenderContext) {
  const debts = draft.estateIntake.debts;
  const addLiability = () => {
    updateEstate((estate) => ({
      ...estate,
      debts: {
        ...estate.debts,
        liabilities: [...estate.debts.liabilities, { id: newId(), type: "other", creditorName: "", approxBalance: "" }],
      },
    }));
  };
  return (
    <QuestionCard
      title="Debts and funeral costs"
      why="The court considers liabilities when confirming the net estate."
      where="Use statements, correspondence, or your best estimates."
    >
      <RepeatableCardList
        items={debts.liabilities}
        onAdd={addLiability}
        addLabel="Add a debt"
        emptyState="List credit cards, loans, tax balances, or other liabilities."
        renderItem={(liability, index) => (
          <div key={liability.id} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
            <Field label="Type of debt">
              <select
                value={liability.type}
                onChange={(event) =>
                  updateEstate((estate) => {
                    const updated = [...estate.debts.liabilities];
                    updated[index] = { ...updated[index], type: event.target.value as typeof liability.type };
                    return { ...estate, debts: { ...estate.debts, liabilities: updated } };
                  })
                }
                className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-4 py-3 text-sm"
              >
                <option value="credit_card">Credit card</option>
                <option value="loan">Loan</option>
                <option value="line_of_credit">Line of credit</option>
                <option value="tax">Tax debt</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Creditor name">
              <Input
                value={liability.creditorName}
                onChange={(event) =>
                  updateEstate((estate) => {
                    const updated = [...estate.debts.liabilities];
                    updated[index] = { ...updated[index], creditorName: event.target.value };
                    return { ...estate, debts: { ...estate.debts, liabilities: updated } };
                  })
                }
              />
            </Field>
            <Field label="Approximate balance">
              <Input
                value={liability.approxBalance}
                onChange={(event) =>
                  updateEstate((estate) => {
                    const updated = [...estate.debts.liabilities];
                    updated[index] = { ...updated[index], approxBalance: event.target.value };
                    return { ...estate, debts: { ...estate.debts, liabilities: updated } };
                  })
                }
                placeholder="$"
              />
            </Field>
          </div>
        )}
      />
      {errors["debts.liabilities"] ? <ErrorText>{errors["debts.liabilities"]}</ErrorText> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Funeral or memorial costs (if known)">
          <Input
            value={debts.funeralCostsAmount}
            onChange={(event) => updateEstate((estate) => ({ ...estate, debts: { ...estate.debts, funeralCostsAmount: event.target.value } }))}
            placeholder="$"
          />
        </Field>
        <Field label="Who paid (or will pay) these costs?">
          <Input
            value={debts.funeralCostsPaidBy}
            onChange={(event) => updateEstate((estate) => ({ ...estate, debts: { ...estate.debts, funeralCostsPaidBy: event.target.value } }))}
          />
        </Field>
      </div>
    </QuestionCard>
  );
}

function SpecialIssues({ draft, updateEstate, errors }: RenderContext) {
  const issues = draft.estateIntake.specialIssues;
  return (
    <div className="space-y-6">
      <QuestionCard
        title="Has anyone already applied for probate or an estate grant for this estate?"
        why="If another grant exists, the process may be different."
        where="Check if any lawyer or family member has already filed with the court."
      >
        <YesNoButtons
          value={issues.hasPriorGrant}
          onChange={(value) => updateEstate((estate) => ({ ...estate, specialIssues: { ...estate.specialIssues, hasPriorGrant: value as "yes" | "no" } }))}
        />
        {errors["specialIssues.hasPriorGrant"] ? <ErrorText>{errors["specialIssues.hasPriorGrant"]}</ErrorText> : null}
        {issues.hasPriorGrant === "yes" ? (
          <Field label="Describe any prior application">
            <Textarea value={issues.priorGrantDetails} onChange={(event) => updateEstate((estate) => ({ ...estate, specialIssues: { ...estate.specialIssues, priorGrantDetails: event.target.value } }))} />
          </Field>
        ) : null}
      </QuestionCard>
      <QuestionCard
        title="Do you expect anyone to object to the will or your role as executor?"
        why="Disputes can change timelines and whether this portal is the right fit."
        where="Think of anyone who has already complained or threatened legal action."
      >
        <YesNoButtons
          value={issues.hasPotentialDispute}
          onChange={(value) => updateEstate((estate) => ({ ...estate, specialIssues: { ...estate.specialIssues, hasPotentialDispute: value as "yes" | "no" } }))}
        />
        {errors["specialIssues.hasPotentialDispute"] ? <ErrorText>{errors["specialIssues.hasPotentialDispute"]}</ErrorText> : null}
        {issues.hasPotentialDispute === "yes" ? (
          <Field label="Brief summary of the potential dispute">
            <Textarea value={issues.disputeSummary} onChange={(event) => updateEstate((estate) => ({ ...estate, specialIssues: { ...estate.specialIssues, disputeSummary: event.target.value } }))} />
          </Field>
        ) : null}
      </QuestionCard>
    </div>
  );
}

function FilingDetails({ draft, updateEstate, errors }: RenderContext) {
  const filing = draft.estateIntake.filing;
  const handleAddressChange = (value: AddressValue) => {
    updateEstate((estate) => ({
      ...estate,
      filing: {
        ...estate.filing,
        returnAddress: { line1: value.line1, line2: value.line2, city: value.city, region: value.region, postalCode: value.postalCode, country: value.country },
      },
    }));
  };
  return (
    <div className="space-y-6">
      <QuestionCard
        title="Which BC probate registry should this go to?"
        why="The application must be filed in a specific Supreme Court registry."
        where="Usually the registry closest to the deceased’s home."
      >
        <Field label="Registry location" required error={errors["filing.registryLocation"]}>
          <Input value={filing.registryLocation} onChange={(event) => updateEstate((estate) => ({ ...estate, filing: { ...estate.filing, registryLocation: event.target.value } }))} placeholder="e.g., Vancouver Supreme Court Registry" />
        </Field>
      </QuestionCard>
      <QuestionCard
        title="Where should court documents be mailed back?"
        description="This is where the original grant and returned will will be sent."
        why="We need a safe mailing address for the court to return the final documents."
        where="Use an address where important documents can be received securely."
      >
        <AddressFields
          value={filing.returnAddress}
          onChange={handleAddressChange}
          errors={{
            line1: errors["filing.returnAddress.line1"],
            city: errors["filing.returnAddress.city"],
            region: errors["filing.returnAddress.region"],
            postalCode: errors["filing.returnAddress.postalCode"],
          }}
        />
      </QuestionCard>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm text-[color:var(--ink)]">
      <span className="flex items-center gap-1 font-semibold">
        {label}
        {required ? <span className="text-[color:var(--error)]">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs text-[color:var(--error)]">{error}</span> : null}
    </label>
  );
}

function RelationshipPicker({
  value,
  onChange,
  error,
}: {
  value: RenderContext["draft"]["estateIntake"]["applicant"]["relationship"];
  onChange: (value: RenderContext["draft"]["estateIntake"]["applicant"]["relationship"]) => void;
  error?: string;
}) {
  const options: { label: string; value: Relationship }[] = [
    { label: "Spouse/Partner", value: "spouse" },
    { label: "Child", value: "child" },
    { label: "Sibling", value: "sibling" },
    { label: "Other family", value: "other_family" },
    { label: "Friend", value: "friend" },
    { label: "Professional", value: "professional" },
    { label: "Other", value: "other" },
  ];
  return (
    <div className="space-y-2">
      <div className="grid gap-3 md:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
              value === option.value ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white" : "border-[color:var(--border-muted)] text-[color:var(--ink)]"
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-[color:var(--error)]">{children}</p>;
}
