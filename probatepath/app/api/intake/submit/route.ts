import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAudit, logSecurityAudit } from "@/lib/audit";
import { getServerAuth } from "@/lib/auth";
import { sendTemplateEmail } from "@/lib/email";
import { intakeDraftSchema } from "@/lib/intake/schema";
import { ensureMatter } from "@/lib/matter/server";
import { splitName } from "@/lib/name";
import type { IntakeDraft } from "@/lib/intake/types";

const SubmitSchema = z.object({
  clientKey: z.string().min(4),
  matterId: z.string().optional(),
  draft: intakeDraftSchema.optional(),
});

const DEFAULT_EXPIRY_HOURS = 24;

function safeDate(value?: string): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
}

function buildDraftInput(matterId: string, draft: IntakeDraft): Prisma.IntakeDraftUncheckedCreateInput {
  return {
    matterId,
    email: draft.welcome.email || "",
    consent: Boolean(draft.welcome.consent),
    exFullName: draft.executor.fullName || "",
    exPhone: draft.executor.phone || null,
    exCity: draft.executor.city || "",
    exRelation: draft.executor.relationToDeceased || "",
    decFullName: draft.deceased.fullName || "",
    decDateOfDeath: safeDate(draft.deceased.dateOfDeath),
    decCityProv: draft.deceased.cityProvince || "",
    hadWill: draft.deceased.hadWill === "yes",
    willLocation: draft.will.willLocation || "",
    estateValueRange: draft.will.estateValueRange,
    anyRealProperty: draft.will.anyRealProperty === "yes",
    multipleBeneficiaries: draft.will.multipleBeneficiaries === "yes",
    specialCircumstances: draft.will.specialCircumstances?.trim() || null,
    payload: draft as Prisma.InputJsonValue,
  };
}

export async function POST(request: Request) {
  const json = await request.json();
  const input = SubmitSchema.safeParse(json);
  if (!input.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { session } = await getServerAuth();
  const sessionUserId = session?.user && (session.user as { id?: string }).id;

  const matter = await ensureMatter({
    clientKey: input.data.clientKey,
    matterId: input.data.matterId,
    userId: sessionUserId,
  });

  let draftRecord = await prisma.intakeDraft.findUnique({ where: { matterId: matter.id } });

  if (input.data.draft) {
    const createInput = buildDraftInput(matter.id, input.data.draft);
    const { matterId: _omit, ...updateData } = createInput;
    void _omit;
    draftRecord = await prisma.intakeDraft.upsert({
      where: { matterId: matter.id },
      create: createInput,
      update: updateData,
    });
  }

  if (!draftRecord) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const draftEmail = draftRecord.email?.trim();
  const normalizedEmail = draftEmail && draftEmail.includes("@") ? draftEmail : null;
  const resumeTokenEmail = normalizedEmail ?? `${matter.clientKey}@no-email.probatepath.local`;

  const result = await prisma.$transaction(async (tx) => {
    const updatedMatter = await tx.matter.update({
      where: { id: matter.id },
      data: { status: "REVIEW", userId: matter.userId ?? sessionUserId ?? null },
    });

    await tx.generatedPack.upsert({
      where: { matterId: matter.id },
      create: { matterId: matter.id },
      update: {},
    });

    const resumeToken = await tx.resumeToken.create({
      data: {
        token: crypto.randomUUID(),
        matterId: matter.id,
        email: resumeTokenEmail,
        expiresAt: new Date(Date.now() + DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });

    const existingRequest = await tx.willSearchRequest.findFirst({ where: { matterId: matter.id } });
    if (!existingRequest) {
      const fallbackExecutorName = draftRecord.exFullName?.trim() || "Executor";
      const fallbackDeceasedName = draftRecord.decFullName?.trim() || "Deceased";
      const deceasedParts = splitName(fallbackDeceasedName);
      await tx.willSearchRequest.create({
        data: {
          matterId: matter.id,
          executorEmail: resumeTokenEmail,
          executorFullName: fallbackExecutorName,
          executorPhone: draftRecord.exPhone ?? null,
          executorCity: draftRecord.exCity ?? null,
          executorRelationship: draftRecord.exRelation ?? null,
          deceasedFullName: fallbackDeceasedName,
          deceasedGivenNames: deceasedParts.givenNames || null,
          deceasedSurname: deceasedParts.surname || null,
          deceasedDateOfDeath: draftRecord.decDateOfDeath ?? null,
          deceasedCity: draftRecord.decCityProv ?? null,
          hasWill: draftRecord.hadWill ?? null,
        },
      });
    }

    await tx.intakeDraft.update({
      where: { matterId: matter.id },
      data: { submittedAt: new Date(), finalSnapshot: draftRecord.payload ?? {} },
    });

    await logAudit({
      matterId: matter.id,
      action: "INTAKE_SUBMITTED",
      actorId: updatedMatter.userId,
    });

    if (updatedMatter.userId) {
      await logSecurityAudit({
        userId: updatedMatter.userId,
        matterId: matter.id,
        action: "intake.submit",
      });
    }

    return { updatedMatter, resumeToken };
  });

  const resumeLink = `${process.env.APP_URL ?? "http://localhost:3000"}/resume/${result.resumeToken.token}`;

  if (normalizedEmail) {
    await sendTemplateEmail({
      to: normalizedEmail,
      subject: "Your ProbatePath draft",
      template: "intake-submitted",
      matterId: matter.id,
      html: `<p>Your draft is saved.</p><p>Resume anytime: <a href="${resumeLink}">${resumeLink}</a></p>`,
    });
  } else {
    console.warn("[intake.submit] Draft email missing; skipping notification");
  }

  const response = NextResponse.json({
    matterId: result.updatedMatter.id,
    resumeLink,
  });
  response.cookies.set("portalMatterId", result.updatedMatter.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
