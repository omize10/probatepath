import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";

async function verifyAccess(matterId: string, userId: string) {
  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    select: { userId: true },
  });
  return matter && matter.userId === userId;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ matterId: string }> }
) {
  const { session } = await getServerAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matterId } = await context.params;
  if (!(await verifyAccess(matterId, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [assets, debts, distributions, releases] = await Promise.all([
    prisma.postGrantAsset.findMany({ where: { matterId }, orderBy: { createdAt: "asc" } }),
    prisma.postGrantDebt.findMany({ where: { matterId }, orderBy: { createdAt: "asc" } }),
    prisma.distribution.findMany({ where: { matterId }, orderBy: { createdAt: "asc" } }),
    prisma.beneficiaryRelease.findMany({ where: { matterId }, orderBy: { createdAt: "asc" } }),
  ]);

  return NextResponse.json({ assets, debts, distributions, releases });
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
  if (!(await verifyAccess(matterId, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { entity, action, id, data } = body;

  // ASSETS
  if (entity === "asset") {
    if (action === "create") {
      const asset = await prisma.postGrantAsset.create({
        data: { matterId, name: data.name, category: data.category, institution: data.institution, accountNumber: data.accountNumber, estimatedValue: data.estimatedValue, notes: data.notes },
      });
      return NextResponse.json({ asset });
    }
    if (action === "update" && id) {
      const result = await prisma.postGrantAsset.updateMany({
        where: { id, matterId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.actualValue !== undefined && { actualValue: data.actualValue }),
          ...(data.contactedAt !== undefined && { contactedAt: data.contactedAt }),
          ...(data.documentsSentAt !== undefined && { documentsSentAt: data.documentsSentAt }),
          ...(data.fundsReceivedAt !== undefined && { fundsReceivedAt: data.fundsReceivedAt }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      });
      if (!result.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const asset = await prisma.postGrantAsset.findFirst({ where: { id, matterId } });
      return NextResponse.json({ asset });
    }
    if (action === "delete" && id) {
      const result = await prisma.postGrantAsset.deleteMany({ where: { id, matterId } });
      if (!result.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
  }

  // DEBTS
  if (entity === "debt") {
    if (action === "create") {
      const debt = await prisma.postGrantDebt.create({
        data: { matterId, creditor: data.creditor, category: data.category, amount: data.amount, notes: data.notes },
      });
      return NextResponse.json({ debt });
    }
    if (action === "update" && id) {
      const result = await prisma.postGrantDebt.updateMany({
        where: { id, matterId },
        data: {
          ...(data.status !== undefined && { status: data.status }),
          ...(data.verifiedAmount !== undefined && { verifiedAmount: data.verifiedAmount }),
          ...(data.verifiedAt !== undefined && { verifiedAt: data.verifiedAt }),
          ...(data.paidAt !== undefined && { paidAt: data.paidAt }),
          ...(data.receiptUrl !== undefined && { receiptUrl: data.receiptUrl }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      });
      if (!result.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const debt = await prisma.postGrantDebt.findFirst({ where: { id, matterId } });
      return NextResponse.json({ debt });
    }
    if (action === "delete" && id) {
      const result = await prisma.postGrantDebt.deleteMany({ where: { id, matterId } });
      if (!result.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
  }

  // DISTRIBUTIONS
  if (entity === "distribution") {
    if (action === "create") {
      const dist = await prisma.distribution.create({
        data: { matterId, beneficiaryId: data.beneficiaryId, beneficiaryName: data.beneficiaryName, sharePercent: data.sharePercent, shareAmount: data.shareAmount, notes: data.notes },
      });
      return NextResponse.json({ distribution: dist });
    }
    if (action === "update" && id) {
      const result = await prisma.distribution.updateMany({
        where: { id, matterId },
        data: {
          ...(data.shareAmount !== undefined && { shareAmount: data.shareAmount }),
          ...(data.paidAt !== undefined && { paidAt: data.paidAt }),
          ...(data.method !== undefined && { method: data.method }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      });
      if (!result.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const dist = await prisma.distribution.findFirst({ where: { id, matterId } });
      return NextResponse.json({ distribution: dist });
    }
    if (action === "delete" && id) {
      const result = await prisma.distribution.deleteMany({ where: { id, matterId } });
      if (!result.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
  }

  // RELEASES
  if (entity === "release") {
    if (action === "create") {
      const release = await prisma.beneficiaryRelease.create({
        data: { matterId, beneficiaryId: data.beneficiaryId, beneficiaryName: data.beneficiaryName, notes: data.notes },
      });
      return NextResponse.json({ release });
    }
    if (action === "update" && id) {
      const result = await prisma.beneficiaryRelease.updateMany({
        where: { id, matterId },
        data: {
          ...(data.sentAt !== undefined && { sentAt: data.sentAt }),
          ...(data.signedAt !== undefined && { signedAt: data.signedAt }),
          ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      });
      if (!result.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const release = await prisma.beneficiaryRelease.findFirst({ where: { id, matterId } });
      return NextResponse.json({ release });
    }
    if (action === "delete" && id) {
      const result = await prisma.beneficiaryRelease.deleteMany({ where: { id, matterId } });
      if (!result.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
