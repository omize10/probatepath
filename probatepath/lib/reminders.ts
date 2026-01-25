import { addDays } from "date-fns";
import type { Reminder, User, Matter, IntakeDraft } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/messaging/service";

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
  const email = reminder.case?.user?.email ?? "";
  const phone = getPhone(reminder.case?.draft ?? null);
  const portalLink = `${(process.env.APP_URL ?? "https://probatedesk.com").replace(/\/$/, "")}/portal`;

  if (!email) {
    console.warn("[reminders] Missing email for reminder", { id: reminder.id, caseId: reminder.caseId, type: reminder.type });
    return false;
  }

  const result = await sendMessage({
    templateKey: "generic_reminder",
    to: { email, phone: phone || undefined },
    variables: { portalLink },
    matterId: reminder.caseId,
    meta: { reminderType: reminder.type },
  });

  return result.email?.success ?? false;
}

type CaseWithUser = Matter & { user: User | null; draft?: IntakeDraft | null };

export async function notifyPacketReady(record: CaseWithUser) {
  const email = record.user?.email ?? "";
  const phone = getPhone(record.draft ?? null);
  const portalLink = `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/portal`;

  if (!email) {
    console.warn("[packet-ready] Missing email for case", { caseId: record.id });
    return false;
  }

  const result = await sendMessage({
    templateKey: "packet_ready",
    to: { email, phone: phone || undefined },
    variables: { portalLink },
    matterId: record.id,
  });

  return result.email?.success ?? false;
}

export async function notifyProbatePackageReady(record: CaseWithUser) {
  const email = record.user?.email ?? "";
  const phone = getPhone(record.draft ?? null);
  const portalLink = `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/portal/probate-filing`;

  if (!email) {
    console.warn("[probate-package-ready] Missing email for case", { caseId: record.id });
    return false;
  }

  const result = await sendMessage({
    templateKey: "probate_package_ready",
    to: { email, phone: phone || undefined },
    variables: { portalLink },
    matterId: record.id,
  });

  return result.email?.success ?? false;
}

export async function notifyProbateFilingReady(record: CaseWithUser) {
  const email = record.user?.email ?? "";
  const phone = getPhone(record.draft ?? null);
  const portalLink = `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/portal/probate-filing`;

  if (!email) {
    console.warn("[probate-filing-ready] Missing email for case", { caseId: record.id });
    return false;
  }

  const result = await sendMessage({
    templateKey: "probate_filing_ready",
    to: { email, phone: phone || undefined },
    variables: { portalLink },
    matterId: record.id,
  });

  return result.email?.success ?? false;
}

export async function sendGrantCheckInReminders() {
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
    const name = record.user?.name ?? "there";

    if (!email) {
      console.warn("[grant-check-in] Missing email for case", { caseId: record.id });
      continue;
    }

    const result = await sendMessage({
      templateKey: "grant_checkin",
      to: { email, phone: phone || undefined },
      variables: { name, portalLink },
      matterId: record.id,
    });

    if (result.email?.success) {
      console.log(`[grant-check-in] Sent to ${email} for case ${record.id}`);
    }
  }
}
