/**
 * Tier Recommendation Engine
 *
 * Takes screening quiz answers and returns the recommended tier.
 * Priority order: Open Door Law > White Glove > Premium > Basic
 */

import type { FitAnswers } from "./onboard/state";

export type RecommendedTier = "basic" | "premium" | "white_glove" | "open_door_law";

export interface Recommendation {
  tier: RecommendedTier;
  reason: string;
  showGrantOfAdministration: boolean;
  complicatedAnswerCount: number;
  canDowngradeToBasic: boolean;
}

/**
 * Complicated answer definitions (for count-based tier logic):
 * - Will not signed by 2 witnesses (No or Not sure)
 * - Will not prepared in BC (No or Not sure)
 * - No original will
 * - Beneficiaries not fully aware
 * - Unsure about disputes
 * - Assets in other Canadian provinces
 *
 * Open Door Law triggers (disputes=yes, international assets) are NOT counted.
 */
function countComplicatedAnswers(answers: FitAnswers): number {
  let count = 0;

  if (
    answers.willProperlyWitnessed === "no" ||
    answers.willProperlyWitnessed === "not_sure"
  ) {
    count++;
  }

  if (
    answers.willPreparedInBC === "no" ||
    answers.willPreparedInBC === "not_sure"
  ) {
    count++;
  }

  if (answers.hasOriginalWill === false) {
    count++;
  }

  // Any beneficiaries answer other than "yes" (everyone knows)
  if (
    answers.beneficiariesAware !== undefined &&
    answers.beneficiariesAware !== "yes"
  ) {
    count++;
  }

  if (answers.potentialDisputes === "not_sure") {
    count++;
  }

  if (answers.assetsOutsideBC === "other_provinces") {
    count++;
  }

  return count;
}

export function getRecommendation(answers: FitAnswers): Recommendation {
  const showGrantOfAdministration = answers.hasWill === "no";

  // ─── 1. Open Door Law (highest priority) ───
  if (answers.potentialDisputes === "yes") {
    return {
      tier: "open_door_law",
      reason:
        "Potential disputes require specialized legal expertise that goes beyond our service.",
      showGrantOfAdministration,
      complicatedAnswerCount: 0,
      canDowngradeToBasic: false,
    };
  }

  if (answers.assetsOutsideBC === "international") {
    return {
      tier: "open_door_law",
      reason:
        "International assets require specialized legal expertise that goes beyond our service.",
      showGrantOfAdministration,
      complicatedAnswerCount: 0,
      canDowngradeToBasic: false,
    };
  }

  const complicatedCount = countComplicatedAnswers(answers);

  // ─── 2. White Glove (second priority) ───
  // Individual White Glove triggers
  const whiteGloveTriggers: string[] = [];

  if (answers.hasWill === "no") {
    whiteGloveTriggers.push(
      "Your estate requires a Grant of Administration (no will)."
    );
  }

  if (answers.hasWill === "not_sure") {
    whiteGloveTriggers.push(
      "Uncertainty about the will requires additional support."
    );
  }

  if (
    answers.willProperlyWitnessed === "no" ||
    answers.willProperlyWitnessed === "not_sure"
  ) {
    whiteGloveTriggers.push(
      "Will witnessing issues may require extra review."
    );
  }

  if (answers.hasOriginalWill === false) {
    whiteGloveTriggers.push(
      "Without the original will, additional court steps are needed."
    );
  }

  // "Some know, some don't" → White Glove
  if (answers.beneficiariesAware === "partial") {
    whiteGloveTriggers.push(
      "Not all beneficiaries are aware, which adds complexity."
    );
  }

  // 3+ complicated answers → White Glove
  if (complicatedCount > 2) {
    whiteGloveTriggers.push(
      "Multiple complexity factors detected in your answers."
    );
  }

  if (whiteGloveTriggers.length > 0) {
    return {
      tier: "white_glove",
      reason: whiteGloveTriggers[0],
      showGrantOfAdministration,
      complicatedAnswerCount: complicatedCount,
      canDowngradeToBasic: false,
    };
  }

  // ─── 3. Premium (third priority) ───
  const premiumTriggers: string[] = [];

  if (
    answers.willPreparedInBC === "no" ||
    answers.willPreparedInBC === "not_sure"
  ) {
    premiumTriggers.push(
      "A will not prepared in BC may require additional steps."
    );
  }

  // "No, I haven't shared it yet" → Premium
  if (answers.beneficiariesAware === "no") {
    premiumTriggers.push(
      "Beneficiaries have not yet been notified of the will."
    );
  }

  if (answers.potentialDisputes === "not_sure") {
    premiumTriggers.push(
      "Uncertainty about potential disputes warrants extra support."
    );
  }

  if (answers.assetsOutsideBC === "other_provinces") {
    premiumTriggers.push(
      "Assets in other Canadian provinces add complexity."
    );
  }

  // 1-2 complicated answers → Premium
  if (complicatedCount >= 1 && complicatedCount <= 2) {
    premiumTriggers.push("Some complexity factors detected in your answers.");
  }

  if (premiumTriggers.length > 0) {
    return {
      tier: "premium",
      reason: premiumTriggers[0],
      showGrantOfAdministration,
      complicatedAnswerCount: complicatedCount,
      canDowngradeToBasic: false,
    };
  }

  // ─── 4. Basic (default) ───
  return {
    tier: "basic",
    reason: "Your estate appears straightforward.",
    showGrantOfAdministration,
    complicatedAnswerCount: 0,
    canDowngradeToBasic: true,
  };
}
