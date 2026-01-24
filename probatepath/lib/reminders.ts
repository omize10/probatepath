import { addDays } from "date-fns";
import type { Reminder, User, Matter, IntakeDraft } from "@prisma/client";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";

export const WILL_SEARCH_REMINDER_TYPE = "willSearchFollowup";
export const NOTICES_WAIT_REMINDER_TYPE = "notices21DayWait";
export const REMINDER_EMAIL_CHANNEL = "email";

export type ReminderWithRelations = Reminder & {
  case: { user: User | null; draft: IntakeDraft | null };
};

export function getWillSearchReminder(reminders: Reminder[]): Reminder | undefined {
  return reminders.find((reminder) => reminder.type === WILL_SEARCH_REMINDER_TYPE);
}

function buildDueDate(mailedAt: Date) {
  return addDays(mailedAt, 21);
}

async function upsertReminder({
  caseId,
  type,
  dueAt,
}: {
  caseId: string;
  type: string;
  dueAt: Date;
}) {
  return prisma.reminder.upsert({
    where: { caseId_type: { caseId, type } },
    create: { caseId, type, channel: REMINDER_EMAIL_CHANNEL, dueAt },
    update: { dueAt, sentAt: null, channel: REMINDER_EMAIL_CHANNEL },
  });
}

export async function scheduleWillSearchReminder({ caseId, mailedAt }: { caseId: string; mailedAt: Date }) {
  return upsertReminder({ caseId, type: WILL_SEARCH_REMINDER_TYPE, dueAt: buildDueDate(mailedAt) });
}

export async function scheduleNoticeWaitReminder({ caseId, mailedAt }: { caseId: string; mailedAt: Date }) {
  return upsertReminder({ caseId, type: NOTICES_WAIT_REMINDER_TYPE, dueAt: buildDueDate(mailedAt) });
}

/** Get the executor phone from a matter's intake draft */
function getPhone(draft: IntakeDraft | null): string {
  return draft?.exPhone?.trim() ?? "";
}

export async function sendReminder(reminder: ReminderWithRelations) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "notifications@example.com";
  const email = reminder.case?.user?.email ?? "";
  const phone = getPhone(reminder.case?.draft ?? null);
  const subject = "ProbateDesk – It's time for your next step";
  const portalLink = `${(process.env.APP_URL ?? "https://probatedesk.com").replace(/\/$/, "")}/portal`;
  const body = [
    "Hi there,",
    "",
    "It's time to continue your ProbateDesk steps.",
    `Log in to review what's next: ${portalLink}`,
    "",
    "Thanks,",
    "ProbateDesk",
  ].join("\n");

  if (!email) {
    console.warn("[reminders] Missing email for reminder", { id: reminder.id, caseId: reminder.caseId, type: reminder.type });
    return false;
  }

  if (!resendKey) {
    console.log(`[reminders] (dry-run) type=${reminder.type} case=${reminder.caseId} to=${email}`);
    return true;
  }

  const resend = new Resend(resendKey);
  await resend.emails.send({ from, to: email, subject, text: body });

  // Also send SMS
  if (phone) {
    await sendSMS({
      to: phone,
      body: `ProbateDesk: It's time for your next step. Log in at ${portalLink}`,
    });
  }

  return true;
}

type CaseWithUser = Matter & { user: User | null; draft?: IntakeDraft | null };

export async function notifyPacketReady(record: CaseWithUser) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "notifications@example.com";
  const email = record.user?.email ?? "";
  const phone = getPhone(record.draft ?? null);
  const portalLink = `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/portal`;
  const subject = "Your ProbateDesk packet is ready";
  const body = [
    "Hi there,",
    "",
    "Your ProbateDesk packet is ready. Log in to start your next step.",
    `Portal: ${portalLink}`,
    "",
    "Thanks,",
    "ProbateDesk",
  ].join("\n");

  if (!email) {
    console.warn("[packet-ready] Missing email for case", { caseId: record.id });
    return false;
  }
  if (!resendKey) {
    console.log(`[packet-ready] (dry-run) would send to ${email}: ${portalLink}`);
    return true;
  }
  const resend = new Resend(resendKey);
  await resend.emails.send({ from, to: email, subject, text: body });

  if (phone) {
    await sendSMS({
      to: phone,
      body: `ProbateDesk: Your packet is ready! Log in at ${portalLink}`,
    });
  }

  return true;
}

export async function notifyProbatePackageReady(record: CaseWithUser) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "notifications@example.com";
  const email = record.user?.email ?? "";
  const phone = getPhone(record.draft ?? null);
  const portalLink = `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/portal/probate-filing`;
  const subject = "Your probate filing package is ready";
  const body = [
    "Hi there,",
    "",
    "Your probate filing package is ready. Log in to download, sign, notarize, and file it with the registry.",
    `Portal: ${portalLink}`,
    "",
    "Thanks,",
    "ProbateDesk",
  ].join("\n");

  if (!email) {
    console.warn("[probate-package-ready] Missing email for case", { caseId: record.id });
    return false;
  }
  if (!resendKey) {
    console.log(`[probate-package-ready] (dry-run) would send to ${email}: ${portalLink}`);
    return true;
  }
  const resend = new Resend(resendKey);
  await resend.emails.send({ from, to: email, subject, text: body });

  if (phone) {
    await sendSMS({
      to: phone,
      body: `ProbateDesk: Your probate filing package is ready. Log in at ${portalLink}`,
    });
  }

  return true;
}

export async function notifyProbateFilingReady(record: CaseWithUser) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "notifications@example.com";
  const email = record.user?.email ?? "";
  const phone = getPhone(record.draft ?? null);
  const portalLink = `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/portal/probate-filing`;
  const subject = "Your ProbateDesk filing packet is ready";
  const body = [
    "Hi there,",
    "",
    "We've prepared your probate filing forms.",
    "Log into your ProbateDesk portal to download your packet, sign and notarize where indicated, assemble your documents, and mail or file them at court.",
    `Portal: ${portalLink}`,
    "",
    "Thanks,",
    "ProbateDesk",
  ].join("\n");

  if (!email) {
    console.warn("[probate-filing-ready] Missing email for case", { caseId: record.id });
    return false;
  }
  if (!resendKey) {
    console.log(`[probate-filing-ready] (dry-run) would send to ${email}: ${portalLink}`);
    return true;
  }
  const resend = new Resend(resendKey);
  await resend.emails.send({ from, to: email, subject, text: body });

  if (phone) {
    await sendSMS({
      to: phone,
      body: `ProbateDesk: Your filing packet is ready. Log in at ${portalLink}`,
    });
  }

  return true;
}

export async function sendGrantCheckInReminders() {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "notifications@example.com";
  const portalLink = `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/portal`;
  const cases = await prisma.matter.findMany({
    where: {
      portalStatus: "probate_filed",
      grantIssuedAt: null,
      probateFiledAt: { not: null },
    },
    include: { user: true, draft: true },
  });

  if (!cases.length) {
    return;
  }

  for (const record of cases) {
    const email = record.user?.email ?? "";
    const phone = getPhone(record.draft);
    if (!email) {
      console.warn("[grant-check-in] Missing email for case", { caseId: record.id });
      continue;
    }
    const subject = "ProbateDesk – quick check-in on your grant";
    const body = [
      `Hi ${record.user?.name ?? "there"},`,
      "",
      "Have you received your estate grant from the court yet?",
      "If yes, please reply to this message or log in and update your portal.",
      "If not, no action needed. We'll keep checking in.",
      `Portal: ${portalLink}`,
      "",
      "Thanks,",
      "ProbateDesk",
    ].join("\n");

    if (!resendKey) {
      console.log(`[grant-check-in] (dry-run) would send to ${email} for case ${record.id}`);
      continue;
    }

    const resend = new Resend(resendKey);
    await resend.emails.send({ from, to: email, subject, text: body });

    if (phone) {
      await sendSMS({
        to: phone,
        body: `ProbateDesk: Have you received your estate grant yet? Log in at ${portalLink} or reply to this text.`,
      });
    }

    console.log(`[grant-check-in] Sent to ${email} for case ${record.id}`);
  }
}
