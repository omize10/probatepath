import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/server/db/prisma";
import { logAudit, logSecurityAudit } from "@/lib/audit";
import { getServerAuth } from "@/lib/auth";
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

  // If caller provided a matterId and is authenticated, perform an authenticated submit
  const { session } = await getServerAuth();
  if (input.data.matterId && session && session.user && (session.user as any).id) {
    try {
      const matter = await prisma.matter.findUnique({ where: { id: input.data.matterId }, include: { draft: true } });
      if (!matter || !matter.draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });
      // ensure ownership
      const userId = (session.user as any).id as string;
      if (matter.userId && matter.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const now = new Date();
      await prisma.intakeDraft.update({ where: { matterId: matter.id }, data: { submittedAt: now, finalSnapshot: matter.draft.payload ?? {} } });

      await logAudit({ matterId: matter.id, action: "INTAKE_SUBMITTED", actorId: userId });
      await logSecurityAudit({ userId, matterId: matter.id, action: "intake.submit" });

      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[intake.submit.auth] failed", err);
      return NextResponse.json({ error: "Unable to submit" }, { status: 500 });
    }
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
  const draftEmail = matter.draft.email;

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
        email: draftEmail,
        expiresAt: new Date(Date.now() + DEFAULT_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });

    const existingRequest = await tx.willSearchRequest.findFirst({ where: { matterId: matter.id } });
    if (!existingRequest) {
      await tx.willSearchRequest.create({ data: { matterId: matter.id } });
    }

    await logAudit({
      matterId: matter.id,
      action: "INTAKE_SUBMITTED",
      actorId: matter.userId,
    });

    // Security audit for intake submit
    if (matter.userId) {
      await logSecurityAudit({
        userId: matter.userId,
        matterId: matter.id,
        action: "intake.submit",
      });
    }

    return { updatedMatter, pack, resumeToken };
  });

  const resumeLink = `${process.env.APP_URL ?? 'http://localhost:3000'}/resume/${rez.resumeToken.token}`;
  await sendTemplateEmail({
    to: draftEmail,
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
