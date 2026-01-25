import "server-only";
import { cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { ensureMatterStepProgress, type PrismaStepProgress } from "@/lib/portal/step-progress";
import { ensureCaseCode } from "@/lib/cases";

const portalMatterInclude = {
  executors: {
    orderBy: { orderIndex: "asc" },
  },
  beneficiaries: {
    orderBy: { createdAt: "asc" },
  },
  intestateHeirs: {
    orderBy: { createdAt: "asc" },
  },
  willSearch: true,
  schedules: {
    orderBy: { sortOrder: "asc" },
  },
  draft: true,
  reminders: true,
  user: true,
} as const;

type BasePortalMatter = Prisma.MatterGetPayload<{ include: typeof portalMatterInclude }>;
export type PortalMatter = BasePortalMatter & { stepProgress: PrismaStepProgress[] };

export async function getPortalMatter(userId: string): Promise<BasePortalMatter | null> {
  if (!prismaEnabled) {
    return null;
  }
  try {
    return prisma.matter.findFirst({
      where: { userId },
      include: portalMatterInclude,
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.warn("[portal] Failed to load matter for user", { userId, error });
    return null;
  }
}

export async function getPortalMatterById(matterId: string): Promise<BasePortalMatter | null> {
  if (!prismaEnabled) {
    return null;
  }
  try {
    return prisma.matter.findUnique({
      where: { id: matterId },
      include: portalMatterInclude,
    });
  } catch (error) {
    console.warn("[portal] Failed to load matter by id", { matterId, error });
    return null;
  }
}

function isLikelyMatterId(value?: string | null) {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return false;
  }
  // Basic check: cuid strings are at least 25 chars and alphanumeric.
  return /^[a-z0-9]+$/i.test(trimmed) && trimmed.length >= 20;
}

async function readPortalMatterId() {
  try {
    const cookieStore = await cookies();
    const entry = cookieStore.get("portalMatterId");
    if (!entry) return null;
    if (!isLikelyMatterId(entry.value)) {
      cookieStore.delete("portalMatterId");
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

async function claimMatterForUser(matterId: string, userId: string): Promise<BasePortalMatter | null> {
  if (!prismaEnabled) return null;
  if (!isLikelyMatterId(matterId)) return null;
  try {
    const matter = await prisma.matter.findUnique({ where: { id: matterId }, include: portalMatterInclude });
    if (!matter) return null;
    if (matter.userId && matter.userId !== userId) {
      return null;
    }
    if (!matter.userId) {
      return prisma.matter.update({
        where: { id: matterId },
        data: { userId },
        include: portalMatterInclude,
      });
    }
    return matter;
  } catch (error) {
    console.warn("[portal] Failed to claim matter ID from cookie", { matterId, error });
    return null;
  }
}

export async function resolvePortalMatter(userId?: string | null): Promise<PortalMatter | null> {
  if (!prismaEnabled) {
    return null;
  }
  const cookieMatterId = await readPortalMatterId();

  if (userId) {
    if (cookieMatterId) {
      const claimed = await claimMatterForUser(cookieMatterId, userId);
      if (claimed) {
        return ensurePortalMatterProgress(claimed);
      }
    }
    const userMatter = await getPortalMatter(userId);
    if (userMatter) {
      return ensurePortalMatterProgress(userMatter);
    }
  }

  if (!cookieMatterId) return null;
  const byCookie = await getPortalMatterById(cookieMatterId);
  return ensurePortalMatterProgress(byCookie);
}

async function ensurePortalMatterProgress(matter: BasePortalMatter | null): Promise<PortalMatter | null> {
  if (!matter) return null;
  if (!prismaEnabled) return { ...matter, stepProgress: [] };
  if (!matter.caseCode) {
    await ensureCaseCode(matter.id);
    const refreshed = await prisma.matter.findUnique({ where: { id: matter.id }, include: portalMatterInclude });
    matter = refreshed ?? matter;
  }
  const stepProgress = await ensureMatterStepProgress({
    matterId: matter.id,
    existing: undefined,
    journeyStatus: matter.journeyStatus ?? undefined,
  });
  return { ...matter, stepProgress };
}
