import "server-only";
import { prisma } from "@/lib/prisma";
import { ensureCaseCode, getNextCaseCode } from "@/lib/cases";

type EnsureMatterArgs = {
  clientKey: string;
  matterId?: string;
  userId?: string | null;
};

export async function ensureMatter({ clientKey, matterId, userId }: EnsureMatterArgs) {
  if (matterId) {
    const existing = await prisma.matter.findUnique({ where: { id: matterId } });
    if (existing) {
      if (!existing.userId && userId) {
        await prisma.matter.update({ where: { id: existing.id }, data: { userId } });
      }
      if (!existing.caseCode) {
        await ensureCaseCode(existing.id);
      }
      return existing;
    }
  }

  const caseCode = await getNextCaseCode();
  const matter = await prisma.matter.upsert({
    where: { clientKey },
    update: userId ? { userId } : {},
    create: {
      clientKey,
      userId,
      caseCode,
    },
  });
  return matter;
}

export async function getMatterForUser(matterId: string, userId: string) {
  return prisma.matter.findFirst({ where: { id: matterId, userId }, include: { draft: true } });
}
