import type { Prisma } from "@prisma/client";
import { prisma, prismaEnabled } from "@/lib/prisma";
import {
  canonicalizeJourneyStatus,
  createDefaultJourneyState,
  journeySteps,
  mergeJourneyStatuses,
  normalizeJourneyState,
  type JourneyState,
  type JourneyStepId,
  type JourneyStatus,
} from "@/lib/portal/journey";

const STEP_IDS = journeySteps.map((step) => step.id);
const STEP_ID_SET = new Set<JourneyStepId>(STEP_IDS);

export type PrismaStepProgress = Prisma.MatterStepProgressGetPayload<{
  select: {
    id: true;
    matterId: true;
    stepKey: true;
    status: true;
    pageIndex: true;
    metadata: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export async function initializeMatterStepProgress(matterId: string, initialState?: JourneyState) {
  if (!prismaEnabled) return;
  try {
    const state = initialState ?? createDefaultJourneyState();
    await prisma.matterStepProgress.createMany({
      data: STEP_IDS.map((id) => ({
        matterId,
        stepKey: id,
        status: state[id]?.status ?? "not_started",
        pageIndex: 0,
      })),
      skipDuplicates: true,
    });
    await prisma.matter.update({
      where: { id: matterId },
      data: { journeyStatus: state },
    });
  } catch (error) {
    console.warn("[portal] Failed to initialize step progress (continuing with journeyStatus only)", error);
  }
}

export async function ensureMatterStepProgress(params: {
  matterId: string;
  existing: PrismaStepProgress[] | undefined;
  journeyStatus?: unknown;
}): Promise<PrismaStepProgress[]> {
  if (!prismaEnabled) {
    return params.existing ?? [];
  }
  const { matterId, existing, journeyStatus } = params;
  let current: PrismaStepProgress[] = existing ?? [];
  if (!current.length) {
    try {
      current = await prisma.matterStepProgress.findMany({
        where: { matterId },
        orderBy: { createdAt: "asc" },
      });
    } catch (error) {
      console.warn("[portal] Cannot read step progress (falling back to journeyStatus)", error);
      return [];
    }
  }
  const presentKeys = new Set(current.map((row) => row.stepKey));
  const normalizedState = normalizeJourneyState(journeyStatus);
  const missing = STEP_IDS.filter((id) => !presentKeys.has(id));
  if (missing.length === 0) {
    return current;
  }
  try {
    await prisma.matterStepProgress.createMany({
      data: missing.map((id) => ({
        matterId,
        stepKey: id,
        status: normalizedState[id]?.status ?? "not_started",
        pageIndex: 0,
      })),
      skipDuplicates: true,
    });
    return prisma.matterStepProgress.findMany({
      where: { matterId },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.warn("[portal] Failed to ensure step progress (falling back to journeyStatus only)", error);
    return current;
  }
}

export function journeyStateFromProgress(progress: PrismaStepProgress[] | undefined, fallback?: JourneyState): JourneyState {
  const base = fallback ?? createDefaultJourneyState();
  if (!progress || progress.length === 0) {
    return base;
  }
  const next: JourneyState = { ...base };
  for (const row of progress) {
    if (!isJourneyStepId(row.stepKey)) continue;
    const normalizedStatus = canonicalizeJourneyStatus(row.status);
    const existingEntry = next[row.stepKey];
    const existingStatus = existingEntry?.status ?? "not_started";
    const mergedStatus = mergeJourneyStatuses(existingStatus, normalizedStatus);
    const updatedAt =
      mergedStatus === normalizedStatus
        ? row.updatedAt?.toISOString?.() ?? existingEntry?.updatedAt ?? null
        : existingEntry?.updatedAt ?? row.updatedAt?.toISOString?.() ?? null;
    next[row.stepKey] = {
      status: mergedStatus,
      updatedAt,
    };
  }
  return next;
}

export async function updateStepProgressStatus(matterId: string, stepId: JourneyStepId, status: JourneyStatus) {
  const canonicalStatus = canonicalizeJourneyStatus(status);
  await prisma.matterStepProgress.upsert({
    where: { matterId_stepKey: { matterId, stepKey: stepId } },
    create: { matterId, stepKey: stepId, status: canonicalStatus, pageIndex: 0 },
    update: { status: canonicalStatus },
  });
}

function isJourneyStepId(value: string): value is JourneyStepId {
  return STEP_ID_SET.has(value as JourneyStepId);
}

function normalizeStatus(value: string): JourneyStatus {
  return canonicalizeJourneyStatus(value);
}
