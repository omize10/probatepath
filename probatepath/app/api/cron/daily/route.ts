import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminder, sendGrantCheckInReminders, type ReminderWithRelations } from "@/lib/reminders";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Clean up expired resume tokens
  const { count: tokensDeleted } = await prisma.resumeToken.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  // Process due reminders that haven't been sent yet
  const dueReminders = await prisma.reminder.findMany({
    where: { dueAt: { lte: now }, sentAt: null },
    include: { case: { include: { user: true, draft: true } } },
  });

  let remindersSent = 0;
  for (const reminder of dueReminders) {
    try {
      const sent = await sendReminder(reminder as ReminderWithRelations);
      if (sent) {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { sentAt: now },
        });
        remindersSent++;
      }
    } catch (err) {
      console.error("[cron] Failed to send reminder", { id: reminder.id, error: err });
    }
  }

  // Send grant check-in emails for cases waiting on court
  try {
    await sendGrantCheckInReminders();
  } catch (err) {
    console.error("[cron] Grant check-in reminders failed", { error: err });
  }

  return NextResponse.json({
    ok: true,
    tokensDeleted,
    remindersSent,
    remindersProcessed: dueReminders.length,
  });
}
