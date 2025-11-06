import type { SectionKey } from "@/lib/intake/schema";

export type StepId = "welcome" | "executor" | "deceased" | "will" | "review" | "done";

export interface StepDefinition {
  id: StepId;
  title: string;
  description: string;
  href: string;
  section?: SectionKey;
}

export const wizardSteps: StepDefinition[] = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Share your email and acknowledge our document preparation scope.",
    href: "/start/step-1",
    section: "welcome",
  },
  {
    id: "executor",
    title: "Executor details",
    description: "Tell us about the executor responsible for filing.",
    href: "/start/step-2",
    section: "executor",
  },
  {
    id: "deceased",
    title: "Deceased",
    description: "Provide basic details about the deceased and the will.",
    href: "/start/step-3",
    section: "deceased",
  },
  {
    id: "will",
    title: "Will & assets",
    description: "Outline where documents are kept and the estate’s shape.",
    href: "/start/step-4",
    section: "will",
  },
  {
    id: "review",
    title: "Review & confirm",
    description: "Review your answers and confirm they are accurate.",
    href: "/start/review",
    section: "confirmation",
  },
  {
    id: "done",
    title: "Draft saved",
    description: "Download a summary or continue the conversation with us.",
    href: "/start/done",
  },
];

const stepIndexMap = wizardSteps.reduce<Record<StepId, number>>((acc, step, index) => {
  acc[step.id] = index;
  return acc;
}, {} as Record<StepId, number>);

export function getStepIndex(stepId: StepId): number {
  return stepIndexMap[stepId] ?? 0;
}

export function getStepById(stepId: StepId): StepDefinition {
  return wizardSteps[getStepIndex(stepId)];
}

export function getStepByHref(href: string): StepDefinition | undefined {
  return wizardSteps.find((step) => step.href === href);
}

export function getPreviousStep(stepId: StepId): StepDefinition | null {
  const index = getStepIndex(stepId);
  return index > 0 ? wizardSteps[index - 1] : null;
}

export function getNextStep(stepId: StepId): StepDefinition | null {
  const index = getStepIndex(stepId);
  return index < wizardSteps.length - 1 ? wizardSteps[index + 1] : null;
}
