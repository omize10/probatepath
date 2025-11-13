import { prisma } from "@/src/server/db/prisma";

export async function logAudit({
  matterId,
  actorId,
  action,
  meta,
}: {
  matterId: string;
  actorId?: string | null;
  action: string;
  meta?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      matterId,
      actorId: actorId ?? null,
      action,
      meta,
    },
  });
}
