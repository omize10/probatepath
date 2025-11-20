export type EligibilityAnswer = "yes" | "no" | "unsure" | "helper";

export interface EligibilityAnswers {
  estateInBC: EligibilityAnswer | null;
  isExecutor: EligibilityAnswer | null;
  willStraightforward: "yes" | "no" | "no-will" | null;
  assetsCommon: EligibilityAnswer | null;
  complexAssetsNotes?: string;
}

export type EligibilityDecision =
  | { status: "eligible"; reasons: string[] }
  | { status: "not_fit"; reasons: string[] };

const disqualifyingReasons = {
  bc: "ProbatePath is currently limited to estates probated in British Columbia.",
  executor: "We need to work directly with the executor or appointed administrator.",
  disputes: "Contested or litigated wills require a full-service law firm.",
  assets: "Highly complex assets are better handled by Open Door Law directly.",
};

export function evaluateEligibility(answers: EligibilityAnswers): EligibilityDecision {
  const reasons: string[] = [];

  if (answers.estateInBC === "no") {
    reasons.push(disqualifyingReasons.bc);
  }
  if (answers.isExecutor === "no") {
    reasons.push(disqualifyingReasons.executor);
  }
  if (answers.willStraightforward === "no") {
    reasons.push(disqualifyingReasons.disputes);
  }
  if (answers.assetsCommon === "no" && (answers.complexAssetsNotes?.trim() || "").length > 0) {
    reasons.push(disqualifyingReasons.assets);
  }

  if (reasons.length > 0) {
    return { status: "not_fit", reasons };
  }
  return { status: "eligible", reasons: [] };
}
