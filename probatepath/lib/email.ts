import { Prisma } from "@prisma/client";
import "server-only";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.RESEND_FROM ?? "notifications@example.com";

export async function sendTemplateEmail({
  to,
  subject,
  html,
  template,
  matterId,
  meta,
}: {
  to: string;
  subject: string;
  html: string;
  template: string;
  matterId?: string;
  meta?: Prisma.InputJsonValue | null;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured; logging email only");
  } else {
    await resend.emails.send({ from, to, subject, html });
  }
  await logEmail({ to, subject, template, matterId, meta });
}

export async function logEmail({
  to,
  subject,
  template,
  matterId,
  meta,
}: {
  to: string;
  subject: string;
  template: string;
  matterId?: string;
  meta?: Prisma.InputJsonValue | null;
}) {
  await prisma.emailLog.create({
    data: {
      to,
      subject,
      template,
      matterId,
      meta: meta ?? Prisma.JsonNull,
    },
  });
}
