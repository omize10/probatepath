import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { beneficiaryBatchSchema } from "@/lib/beneficiaries/schema";
import { logAudit } from "@/lib/audit";
import { splitFullName } from "@/lib/name";
import { regenerateSchedulesForMatter } from "@/lib/schedules/generate";

async function resolveParams(ctx: any) {
  let params = ctx?.params;
  if (params && typeof params.then === "function") {
    try {
      params = await params;
    } catch (error) {
      params = undefined;
    }
  }
  return params?.matterId;
}

export async function GET(request: Request, ctx: any) {
  const matterId = await resolveParams(ctx);
  if (!matterId) {
    return NextResponse.json({ error: "Missing matterId" }, { status: 400 });
  }

  const { session } = await getServerAuth();
  const userId = session?.user && (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matter = await prisma.matter.findFirst({ where: { id: matterId, userId } });
  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { matterId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ beneficiaries });
}

export async function POST(request: Request, ctx: any) {
  const matterId = await resolveParams(ctx);
  if (!matterId) {
    return NextResponse.json({ error: "Missing matterId" }, { status: 400 });
  }

  const { session } = await getServerAuth();
  const userId = session?.user && (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matter = await prisma.matter.findFirst({ where: { id: matterId, userId } });
  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const parsed = beneficiaryBatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const inputs = parsed.data.beneficiaries;
  const existingIds = inputs.map((item) => item.id).filter(Boolean) as string[];

  if (existingIds.length > 0) {
    await prisma.beneficiary.deleteMany({
      where: {
        matterId,
        id: { notIn: existingIds },
      },
    });
  } else {
    await prisma.beneficiary.deleteMany({ where: { matterId } });
  }

  for (const [index, input] of inputs.entries()) {
    const nameParts = splitFullName(input.fullName);
    let dateOfBirth: Date | null = null;
    if (input.dateOfBirth) {
      const parsedDate = new Date(input.dateOfBirth);
      if (!Number.isNaN(parsedDate.getTime())) {
        dateOfBirth = parsedDate;
      }
    }

    const beneficiaryData = {
      matterId,
      type: input.type,
      status: input.status ?? "ALIVE",
      fullName: nameParts.fullName,
      givenNames: nameParts.givenNames,
      surname: nameParts.surname,
      relationshipLabel: input.relationshipLabel?.trim() || null,
      isMinor: Boolean(input.isMinor),
      dateOfBirth,
      addressLine1: input.addressLine1?.trim() || null,
      addressLine2: input.addressLine2?.trim() || null,
      city: input.city?.trim() || null,
      province: input.province?.trim() || null,
      postalCode: input.postalCode?.trim() || null,
      country: input.country?.trim() || null,
      shareDescription: input.shareDescription?.trim() || null,
      notes: input.notes?.trim() || null,
      representedById: input.representedById || null,
    } as const;

    if (input.id) {
      await prisma.beneficiary.upsert({
        where: { id: input.id },
        update: beneficiaryData,
        create: { ...beneficiaryData, id: input.id },
      });
    } else {
      await prisma.beneficiary.create({ data: beneficiaryData });
    }
  }

  await regenerateSchedulesForMatter(matterId, prisma);

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { matterId },
    orderBy: { createdAt: "asc" },
  });

  await logAudit({ matterId, actorId: userId, action: "beneficiary.save", meta: { count: beneficiaries.length } });

  return NextResponse.json({ beneficiaries });
}
