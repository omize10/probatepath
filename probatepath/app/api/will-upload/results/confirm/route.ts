import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { extractionId, confirmedItems } = (await req.json().catch(() => ({}))) as {
    extractionId?: string;
    confirmedItems?: unknown;
  };
  if (!extractionId) {
    return NextResponse.json({ error: "Missing extraction" }, { status: 400 });
  }

  const owned = await prisma.willExtraction.findFirst({ where: { id: extractionId, userId } });
  if (!owned) {
    return NextResponse.json({ error: "Extraction not found" }, { status: 404 });
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action: "confirmed_will_extraction",
      resourceType: "will_extraction",
      resourceId: extractionId,
      metadata: confirmedItems ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
