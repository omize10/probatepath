import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { logAudit, logSecurityAudit } from "@/lib/audit";
import { ensureMatter } from "@/lib/matter/server";
import { formatIntakeDraftRecord } from "@/lib/intake/format";

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

function mapDraftUpdates(step: string, data: Record<string, unknown>) {
  const payload = data ?? {};
  const update: Partial<Prisma.IntakeDraftUncheckedCreateInput> = {
    payload: payload as Prisma.InputJsonValue,
  };

  if (step === "welcome") {
    if (typeof payload.email === "string") {
      update.email = payload.email;
    }
    update.consent = Boolean(payload.consent);
  }
  if (step === "executor") {
    if (typeof payload.fullName === "string") {
      update.exFullName = payload.fullName;
    }
    update.exPhone = typeof payload.phone === "string" ? payload.phone : null;
    if (typeof payload.city === "string") {
      update.exCity = payload.city;
    }
    if (typeof payload.relationToDeceased === "string") {
      update.exRelation = payload.relationToDeceased;
    }
  }
  if (step === "deceased") {
    if (typeof payload.fullName === "string") {
      update.decFullName = payload.fullName;
    }
    if (typeof payload.dateOfDeath === "string" && payload.dateOfDeath) {
      update.decDateOfDeath = new Date(payload.dateOfDeath);
    }
    if (typeof payload.cityProvince === "string") {
      update.decCityProv = payload.cityProvince;
    }
    if (payload.hadWill !== undefined) {
      update.hadWill = payload.hadWill === "yes" || payload.hadWill === true;
    }
  }
  if (step === "will") {
    if (typeof payload.willLocation === "string") {
      update.willLocation = payload.willLocation;
    }
    if (typeof payload.estateValueRange === "string") {
      update.estateValueRange = payload.estateValueRange;
    }
    if (payload.anyRealProperty !== undefined) {
      update.anyRealProperty = payload.anyRealProperty === "yes" || payload.anyRealProperty === true;
    }
    if (payload.multipleBeneficiaries !== undefined) {
      update.multipleBeneficiaries = payload.multipleBeneficiaries === "yes" || payload.multipleBeneficiaries === true;
    }
    if (typeof payload.specialCircumstances === "string") {
      update.specialCircumstances = payload.specialCircumstances;
    }
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
  const userId = (session?.user as { id?: string })?.id;
  const draftUpdates = mapDraftUpdates(step, data);

  try {
    const matter = await ensureMatter({ clientKey, matterId, userId });

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
        ...draftUpdates,
      },
      update: draftUpdates as Prisma.IntakeDraftUncheckedUpdateInput,
    });

    await logAudit({
      matterId: matter.id,
      actorId: userId,
      action: `INTAKE_${step.toUpperCase()}`,
      meta: { step },
    });

      // Log security audit for user intake activity
      if (userId) {
        await logSecurityAudit({
          userId,
          matterId: matter.id,
          action: "intake.save",
          meta: { step },
        });
      }

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
    const formatted = formatIntakeDraftRecord(matter.draft);
    return NextResponse.json({ matterId: matter.id, draft: formatted });
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      console.warn("[intake] Database unavailable, returning local-only state");
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    console.error("[intake] Failed to load draft", error);
    return NextResponse.json({ error: "Failed to load draft" }, { status: 500 });
  }
}
