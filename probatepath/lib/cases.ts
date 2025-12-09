import "server-only";
import type { PortalStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { scheduleNoticeWaitReminder, scheduleWillSearchReminder } from "@/lib/reminders";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type PortalStateInput = {
  portalStatus?: PortalStatus;
  willSearchPreparedAt?: Date | null;
  willSearchMailedAt?: Date | null;
  noticesPreparedAt?: Date | null;
  noticesMailedAt?: Date | null;
  probatePackagePreparedAt?: Date | null;
  probateFiledAt?: Date | null;
  grantIssuedAt?: Date | null;
  willSearchPdfUrl?: string | null;
  p1NoticePdfUrl?: string | null;
  p1PacketPdfUrl?: string | null;
  p1CoverLetterPdfUrl?: string | null;
  probatePackagePdfUrl?: string | null;
  registryName?: string | null;
  registryAddress?: string | null;
};

export async function updatePortalState(caseId: string, input: PortalStateInput) {
  const data: Prisma.MatterUpdateInput = {};

  if (input.portalStatus) data.portalStatus = input.portalStatus;

  if (input.willSearchPreparedAt !== undefined) {
    data.willSearchPreparedAt = input.willSearchPreparedAt;
    data.willSearchPackageReady = Boolean(input.willSearchPreparedAt);
  }
  if (input.willSearchMailedAt !== undefined) {
    data.willSearchMailedAt = input.willSearchMailedAt;
    data.p1MailedAt = input.willSearchMailedAt;
    data.p1Mailed = Boolean(input.willSearchMailedAt);
  }
  if (input.noticesPreparedAt !== undefined) {
    data.noticesPreparedAt = input.noticesPreparedAt;
    data.p1NoticesReady = Boolean(input.noticesPreparedAt);
  }
  if (input.noticesMailedAt !== undefined) {
    data.noticesMailedAt = input.noticesMailedAt;
  }
  if (input.probatePackagePreparedAt !== undefined) {
    data.probatePackagePreparedAt = input.probatePackagePreparedAt;
    data.standardProbatePackageReady = Boolean(input.probatePackagePreparedAt);
  }
  if (input.probateFiledAt !== undefined) {
    data.probateFiledAt = input.probateFiledAt;
  }
  if (input.grantIssuedAt !== undefined) {
    data.grantIssuedAt = input.grantIssuedAt;
  }
  if (input.willSearchPdfUrl !== undefined) {
    data.willSearchPdfUrl = input.willSearchPdfUrl;
  }
  if (input.p1NoticePdfUrl !== undefined) {
    data.p1NoticePdfUrl = input.p1NoticePdfUrl;
  }
  if (input.p1PacketPdfUrl !== undefined) {
    data.p1PacketPdfUrl = input.p1PacketPdfUrl;
  }
  if (input.p1CoverLetterPdfUrl !== undefined) {
    data.p1CoverLetterPdfUrl = input.p1CoverLetterPdfUrl;
  }
  if (input.probatePackagePdfUrl !== undefined) {
    data.probatePackagePdfUrl = input.probatePackagePdfUrl;
  }
  if (input.registryName !== undefined) {
    data.registryName = input.registryName;
  }
  if (input.registryAddress !== undefined) {
    data.registryAddress = input.registryAddress;
  }

  // Skip update if nothing to write
  if (Object.keys(data).length === 0) {
    return prisma.matter.findUnique({ where: { id: caseId } });
  }

  return prisma.matter.update({
    where: { id: caseId },
    data,
  });
}

export async function markWillSearchMailed({
  caseId,
  mailedAt,
  portalStatus = "will_search_sent",
}: {
  caseId: string;
  mailedAt: Date;
  portalStatus?: PortalStatus;
}) {
  await updatePortalState(caseId, { willSearchMailedAt: mailedAt, portalStatus });
  await scheduleWillSearchReminder({ caseId, mailedAt });
}

export async function markNoticesMailed({
  caseId,
  mailedAt,
  portalStatus = "notices_waiting_21_days",
}: {
  caseId: string;
  mailedAt: Date;
  portalStatus?: PortalStatus;
}) {
  await updatePortalState(caseId, { noticesMailedAt: mailedAt, portalStatus });
  await scheduleNoticeWaitReminder({ caseId, mailedAt });
}

export async function markProbateFiled({
  caseId,
  filedAt,
  portalStatus = "probate_filed",
}: {
  caseId: string;
  filedAt: Date;
  portalStatus?: PortalStatus;
}) {
  await updatePortalState(caseId, { probateFiledAt: filedAt, portalStatus });
}

export async function getNextCaseCode() {
  const last = await prisma.matter.findFirst({
    where: { caseCode: { not: null } },
    orderBy: { caseCode: "desc" },
    select: { caseCode: true },
  });
  const current = last?.caseCode;
  const nextNumber = current ? parseInt(current, 10) + 1 : 1;
  const padded = String(Number.isNaN(nextNumber) ? 1 : nextNumber).padStart(4, "0");
  return padded;
}

export async function ensureCaseCode(matterId: string) {
  const record = await prisma.matter.findUnique({ where: { id: matterId }, select: { caseCode: true } });
  if (record?.caseCode) return record.caseCode;
  const code = await getNextCaseCode();
  try {
    await prisma.matter.update({ where: { id: matterId }, data: { caseCode: code } });
    return code;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      const fallback = await getNextCaseCode();
      await prisma.matter.update({ where: { id: matterId }, data: { caseCode: fallback } });
      return fallback;
    }
    throw error;
  }
}

export async function listCases(filter?: { q?: string }) {
  const where: Prisma.MatterWhereInput = {};
  if (filter?.q) {
    const q = filter.q.trim();
    if (q) {
      where.OR = [
        { caseCode: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { draft: { decFullName: { contains: q, mode: "insensitive" } } },
      ];
    }
  }
  return prisma.matter.findMany({
    where,
    include: { user: true, draft: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCaseById(caseId: string) {
  return prisma.matter.findUnique({
    where: { id: caseId },
    include: {
      user: true,
      draft: true,
      executors: true,
      beneficiaries: true,
      reminders: true,
    },
  });
}

export async function updateCaseStatus(caseId: string, data: Prisma.MatterUpdateInput) {
  return prisma.matter.update({ where: { id: caseId }, data });
}
