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
  const json = await request.json();
  const input = BodySchema.safeParse(json);
  if (!input.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const matter = await prisma.matter.findFirst({
    where: { id: input.data.matterId, userId: session.user.id },
  });
  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }

  const placeholder = await savePlaceholder("packet");

  const record = await prisma.willSearchRequest.upsert({
    where: { matterId: matter.id },
    create: {
      matterId: matter.id,
      status: "GENERATED",
      packetUrl: placeholder.url,
    },
    update: {
      status: "GENERATED",
      packetUrl: placeholder.url,
    },
  });

  await logAudit({ matterId: matter.id, actorId: session.user.id, action: "WILL_SEARCH_GENERATED" });

  return NextResponse.json({ packetUrl: record.packetUrl });
}
