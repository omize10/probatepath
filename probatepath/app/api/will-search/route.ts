import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/src/server/db/prisma";
import { savePlaceholder } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

const BodySchema = z.object({
  matterId: z.string(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json();
  const input = BodySchema.safeParse(json);
  if (!input.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const matter = await prisma.matter.findFirst({
    where: { id: input.data.matterId, userId },
  });
  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }

  const placeholder = await savePlaceholder("packet");

  const record = await prisma.$transaction(async (tx) => {
    const existing = await tx.willSearchRequest.findFirst({ where: { matterId: matter.id } });
    if (existing) {
      return tx.willSearchRequest.update({
        where: { id: existing.id },
        data: { status: "GENERATED", packetUrl: placeholder.url },
      });
    }
    return tx.willSearchRequest.create({
      data: {
        matterId: matter.id,
        status: "GENERATED",
        packetUrl: placeholder.url,
      },
    });
  });

  await logAudit({ matterId: matter.id, actorId: userId, action: "WILL_SEARCH_GENERATED" });

  return NextResponse.json({ packetUrl: record.packetUrl });
}
