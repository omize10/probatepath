import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ matterId: string }> }
) {
  const { session } = await getServerAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matterId } = await context.params;
  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    select: { userId: true },
  });
  if (!matter || matter.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const mailings = await prisma.beneficiaryMailing.findMany({
    where: { matterId },
    include: { proofs: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ mailings });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ matterId: string }> }
) {
  const { session } = await getServerAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matterId } = await context.params;
  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    include: { beneficiaries: true },
  });
  if (!matter || matter.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  if (body.action === "initialize") {
    // Create mailing records for all beneficiaries
    const existing = await prisma.beneficiaryMailing.findMany({
      where: { matterId },
      select: { beneficiaryId: true },
    });
    const existingIds = new Set(existing.map((e) => e.beneficiaryId));

    const toCreate = matter.beneficiaries.filter(
      (b) => !existingIds.has(b.id)
    );

    if (toCreate.length > 0) {
      await prisma.beneficiaryMailing.createMany({
        data: toCreate.map((b) => ({
          matterId,
          beneficiaryId: b.id,
          beneficiaryName: b.fullName,
        })),
      });
    }

    const mailings = await prisma.beneficiaryMailing.findMany({
      where: { matterId },
      include: { proofs: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ mailings });
  }

  if (body.action === "update") {
    const { mailingId, ...updates } = body;
    if (!mailingId) {
      return NextResponse.json({ error: "mailingId required" }, { status: 400 });
    }

    const allowedFields = [
      "status",
      "deliveryMethod",
      "trackingNumber",
      "carrierName",
      "notes",
      "printedAt",
      "mailedAt",
      "deliveredAt",
      "confirmedMailedViaRegistered",
      "confirmedCorrectAddress",
      "confirmedUnderstand21Days",
      "confirmationsCompletedAt",
    ];
    const data: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        data[key] = updates[key];
      }
    }

    const updated = await prisma.beneficiaryMailing.update({
      where: { id: mailingId },
      data,
      include: { proofs: true },
    });

    return NextResponse.json({ mailing: updated });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
