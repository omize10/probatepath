import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/server/db/prisma";
import { logAudit } from "@/lib/audit";
import { sendTemplateEmail } from "@/lib/email";

const SubmitSchema = z.object({
  clientKey: z.string().min(4),
  matterId: z.string().optional(),
});

const DEFAULT_EXPIRY_HOURS = 24;

export async function POST(request: Request) {
  const json = await request.json();
  const input = SubmitSchema.safeParse(json);
  if (!input.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const matter = await prisma.matter.findFirst({
    where: {
      OR: [{ id: input.data.matterId ?? "" }, { clientKey: input.data.clientKey }],
    },
    include: { draft: true },
  });

  if (!matter || !matter.draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const rez = await prisma.$transaction(async (tx) => {
    const updatedMatter = await tx.matter.update({
      where: { id: matter.id },
      data: { status: "REVIEW" },
    });

    const pack = await tx.generatedPack.upsert({
      where: { matterId: matter.id },
      create: { matterId: matter.id },
      update: {},
    });

    const resumeToken = await tx.resumeToken.create({
      data: {
        token: crypto.randomUUID(),
        matterId: matter.id,
        email: matter.draft.email,
        expiresAt: new Date(Date.now() + DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });

    await tx.willSearchRequest.upsert({
      where: { matterId: matter.id },
      create: { matterId: matter.id },
      update: {},
    });

    await logAudit({
      matterId: matter.id,
      action: "INTAKE_SUBMITTED",
      actorId: matter.userId,
    });

    return { updatedMatter, pack, resumeToken };
  });

  const resumeLink = `${process.env.APP_URL ?? 'http://localhost:3000'}/resume/${rez.resumeToken.token}`;
  await sendTemplateEmail({
    to: matter.draft.email,
    subject: "Your ProbatePath draft",
    template: "intake-submitted",
    matterId: matter.id,
    html: `<p>Your draft is saved.</p><p>Resume anytime: <a href="${resumeLink}">${resumeLink}</a></p>`,
  });

  return NextResponse.json({
    matterId: rez.updatedMatter.id,
    resumeLink,
  });
}
