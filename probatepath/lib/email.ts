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
}): Promise<{ success: boolean; error?: string }> {
  console.log(`[email] Attempting to send email:`, {
    to,
    subject,
    template,
    matterId,
    from,
    hasResendKey: Boolean(resend),
  });

  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured; logging email only (dry-run mode)");
    await logEmail({ to, subject, template, matterId, meta, sent: false });
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const result = await resend.emails.send({ from, to, subject, html });
    console.log(`[email] Successfully sent email to ${to}:`, { template, resendId: result.data?.id });
    await logEmail({ to, subject, template, matterId, meta, sent: true });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[email] Failed to send email to ${to}:`, { template, error: errorMessage });
    await logEmail({ to, subject, template, matterId, meta, sent: false });
    return { success: false, error: errorMessage };
  }
}

export async function logEmail({
  to,
  subject,
  template,
  matterId,
  meta,
  sent = true,
}: {
  to: string;
  subject: string;
  template: string;
  matterId?: string;
  meta?: Prisma.InputJsonValue | null;
  sent?: boolean;
}) {
  console.log(`[email] Logging email to database:`, { to, template, sent, matterId });
  await prisma.emailLog.create({
    data: {
      to,
      subject,
      template,
      matterId,
      meta: meta ? { ...meta as object, sent } : { sent },
    },
  });
}
