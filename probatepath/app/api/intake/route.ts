import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/src/server/db/prisma";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

type StepId = "welcome" | "executor" | "deceased" | "will";

type StepPayload = {
  clientKey: string;
  matterId?: string;
  step: StepId;
  data: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStepPayload(payload: unknown): StepPayload | null {
  if (!isRecord(payload)) return null;
  const clientKey = typeof payload.clientKey === "string" ? payload.clientKey : null;
  const matterId = payload.matterId === undefined || typeof payload.matterId === "string" ? payload.matterId : null;
  const step = payload.step;
  const data = isRecord(payload.data) ? (payload.data as Record<string, unknown>) : null;

  if (!clientKey || clientKey.length < 4) return null;
  if (!data) return null;
  if (matterId === null) return null;
  if (step !== "welcome" && step !== "executor" && step !== "deceased" && step !== "will") {
    return null;
  }

  return { clientKey, matterId: matterId ?? undefined, step, data };
}

function parseQuery(searchParams: URLSearchParams) {
  const clientKey = searchParams.get("clientKey");
  return typeof clientKey === "string" && clientKey.length > 0 ? clientKey : null;
}

function isPrismaConnectionError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }
  const { code, name, message } = error as { code?: string; name?: string; message?: string };
  if (typeof code === "string" && code.toUpperCase() === "P1001") {
    return true;
  }
  if (name === "PrismaClientInitializationError") {
    return true;
  }
  return typeof message === "string" && message.includes("Can't reach database server");
}

async function ensureMatter(clientKey: string, matterId?: string, userId?: string | null) {
  if (matterId) {
    const existing = await prisma.matter.findFirst({ where: { id: matterId } });
    if (existing) {
      if (!existing.userId && userId) {
        await prisma.matter.update({ where: { id: existing.id }, data: { userId } });
      }
      return existing;
    }
  }

  const matter = await prisma.matter.upsert({
    where: { clientKey },
    update: userId ? { userId } : {},
    create: {
      clientKey,
      userId,
    },
  });
  return matter;
}

function mapDraftUpdates(step: string, data: Record<string, unknown>) {
  const payload = data ?? {};
  const update: Partial<Prisma.IntakeDraftUncheckedUpdateInput> = {
    payload: payload as Prisma.InputJsonValue,
  };

  if (step === "welcome") {
    update.email = payload.email;
    update.consent = Boolean(payload.consent);
  }
  if (step === "executor") {
    update.exFullName = payload.fullName ?? update.exFullName;
    update.exPhone = payload.phone ?? null;
    update.exCity = payload.city ?? update.exCity;
    update.exRelation = payload.relationToDeceased ?? update.exRelation;
  }
  if (step === "deceased") {
    update.decFullName = payload.fullName ?? update.decFullName;
    if (payload.dateOfDeath) {
      update.decDateOfDeath = new Date(payload.dateOfDeath as string);
    }
    update.decCityProv = payload.cityProvince ?? update.decCityProv;
    if (payload.hadWill !== undefined) {
      update.hadWill = payload.hadWill === "yes" || payload.hadWill === true;
    }
  }
  if (step === "will") {
    update.willLocation = payload.willLocation ?? update.willLocation;
    update.estateValueRange = payload.estateValueRange ?? update.estateValueRange;
    if (payload.anyRealProperty !== undefined) {
      update.anyRealProperty = payload.anyRealProperty === "yes" || payload.anyRealProperty === true;
    }
    if (payload.multipleBeneficiaries !== undefined) {
      update.multipleBeneficiaries = payload.multipleBeneficiaries === "yes" || payload.multipleBeneficiaries === true;
    }
    update.specialCircumstances = payload.specialCircumstances ?? update.specialCircumstances;
  }

  return update;
}

export async function POST(request: Request) {
  const json = await request.json();
  const input = parseStepPayload(json);
  if (!input) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { clientKey, matterId, data, step } = input;
  const session = await getServerSession(authOptions);

  try {
    const matter = await ensureMatter(clientKey, matterId, session?.user?.id);

    await prisma.intakeDraft.upsert({
      where: { matterId: matter.id },
      create: {
        matterId: matter.id,
        email: step === "welcome" ? (data.email as string) : "",
        consent: Boolean(data.consent ?? false),
        exFullName: "",
        exCity: "",
        exRelation: "",
        decFullName: "",
        decDateOfDeath: new Date(),
        decCityProv: "",
        hadWill: true,
        willLocation: "",
        estateValueRange: "<$100k",
        anyRealProperty: false,
        multipleBeneficiaries: false,
        specialCircumstances: null,
        ...mapDraftUpdates(step, data),
      },
      update: mapDraftUpdates(step, data),
    });

    await logAudit({
      matterId: matter.id,
      actorId: session?.user?.id,
      action: `INTAKE_${step.toUpperCase()}`,
      meta: { step },
    });

    return NextResponse.json({ matterId: matter.id });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      console.warn("[intake] Database unavailable, skipping persistence");
      return NextResponse.json(
        {
          matterId: matterId ?? clientKey,
          persisted: false,
        },
        { status: 200 },
      );
    }
    console.error("[intake] Failed to save draft", error, { code: (error as { code?: string })?.code });
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientKey = parseQuery(searchParams);
  if (!clientKey) {
    return NextResponse.json({ error: "Missing clientKey" }, { status: 400 });
  }
  try {
    const matter = await prisma.matter.findUnique({
      where: { clientKey },
      include: { draft: true },
    });
    if (!matter || !matter.draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    return NextResponse.json({ matterId: matter.id, draft: matter.draft });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      console.warn("[intake] Database unavailable, returning local-only state");
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    console.error("[intake] Failed to load draft", error);
    return NextResponse.json({ error: "Failed to load draft" }, { status: 500 });
  }
}
