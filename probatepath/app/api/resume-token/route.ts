import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTemplateEmail } from "@/lib/email";

const BodySchema = z.object({
  matterId: z.string(),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json();
  const input = BodySchema.safeParse(json);
  if (!input.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const matter = await prisma.matter.findFirst({
    where: { id: input.data.matterId, userId },
  });
  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }

  const token = crypto.randomUUID();
  await prisma.resumeToken.create({
    data: {
      token,
      matterId: matter.id,
      email: input.data.email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const link = `${process.env.APP_URL ?? 'http://localhost:3000'}/resume/${token}`;
  await sendTemplateEmail({
    to: input.data.email,
    subject: "Resume your ProbateDesk draft",
    template: "resume-token",
    matterId: matter.id,
    html: `<p>Resume your draft: <a href="${link}">${link}</a></p>`,
  });

  return NextResponse.json({ ok: true });
}
