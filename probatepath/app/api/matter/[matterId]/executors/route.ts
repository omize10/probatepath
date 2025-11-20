import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { executorBatchSchema } from "@/lib/executors/schema";
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

  const executors = await prisma.executor.findMany({
    where: { matterId },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ executors });
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

  const parsed = executorBatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
  }

  const inputs = parsed.data.executors;
  const existingIds = inputs.map((exe) => exe.id).filter(Boolean) as string[];

  if (existingIds.length > 0) {
    await prisma.executor.deleteMany({
      where: {
        matterId,
        id: { notIn: existingIds },
      },
    });
  } else {
    await prisma.executor.deleteMany({ where: { matterId } });
  }

  for (const [index, input] of inputs.entries()) {
    const nameParts = splitFullName(input.fullName);
    const executorData = {
      matterId,
      fullName: nameParts.fullName,
      givenNames: nameParts.givenNames,
      surname: nameParts.surname,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      addressLine1: input.addressLine1?.trim() || null,
      addressLine2: input.addressLine2?.trim() || null,
      city: input.city?.trim() || null,
      province: input.province?.trim() || null,
      postalCode: input.postalCode?.trim() || null,
      country: input.country?.trim() || null,
      isPrimary: Boolean(input.isPrimary),
      isAlternate: Boolean(input.isAlternate),
      isRenouncing: Boolean(input.isRenouncing),
      isMinor: Boolean(input.isMinor),
      isDeceased: Boolean(input.isDeceased),
      orderIndex: typeof input.orderIndex === "number" ? input.orderIndex : index,
    } as const;

    if (input.id) {
      await prisma.executor.upsert({
        where: { id: input.id },
        update: executorData,
        create: { ...executorData, id: input.id },
      });
    } else {
      await prisma.executor.create({ data: executorData });
    }
  }

  await regenerateSchedulesForMatter(matterId, prisma);

  const executors = await prisma.executor.findMany({
    where: { matterId },
    orderBy: { orderIndex: "asc" },
  });

  await logAudit({ matterId, actorId: userId, action: "executor.save", meta: { count: executors.length } });

  return NextResponse.json({ executors });
}
