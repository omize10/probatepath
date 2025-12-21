import "dotenv/config";
import { prisma } from "../lib/prisma";
import { sendGrantCheckInReminders, sendReminder, type ReminderWithRelations } from "../lib/reminders";

async function main() {
  const now = new Date();
  if (!process.env.RESEND_API_KEY) {
    console.warn("[reminders] RESEND_API_KEY not set. Running in dry-run mode.");
  }

  await sendGrantCheckInReminders();

  const dueReminders: ReminderWithRelations[] = await prisma.reminder.findMany({
    where: { sentAt: null, dueAt: { lte: now } },
    include: { case: { include: { user: true } } },
    orderBy: { dueAt: "asc" },
  });

  if (!dueReminders.length) {
    console.log("[reminders] No reminders due.");
    return;
  }

  console.log(`[reminders] Processing ${dueReminders.length} reminder(s) at ${now.toISOString()}`);

  for (const reminder of dueReminders) {
    try {
      const sent = await sendReminder(reminder);
      await prisma.reminder.update({ where: { id: reminder.id }, data: { sentAt: new Date() } });
      const to = reminder.case?.user?.email ?? "unknown";
      if (sent) {
        console.log(`[reminders] Sent ${reminder.type} to ${to} for case ${reminder.caseId}`);
      } else {
        console.warn(`[reminders] Unable to send ${reminder.type} to ${to} (marked as sent)`);
      }
    } catch (error) {
      console.error("[reminders] Failed to send reminder", { id: reminder.id, caseId: reminder.caseId, error });
    }
  }
}

main()
  .catch((error) => {
    console.error("[reminders] Failed to send reminders", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
