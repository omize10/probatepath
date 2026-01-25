import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminder, sendGrantCheckInReminders, type ReminderWithRelations } from "@/lib/reminders";
import { processAbandonedCallReminders } from "@/lib/retell/recovery";

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

  // Clean up expired payment tokens
  const { count: paymentTokensDeleted } = await prisma.paymentToken.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  // Process due reminders that haven't been sent yet
  // Exclude abandoned call reminders - those are handled separately
  const dueReminders = await prisma.reminder.findMany({
    where: {
      dueAt: { lte: now },
      sentAt: null,
      type: {
        notIn: ["abandoned_call_1h", "abandoned_call_24h", "abandoned_call_3d"],
      },
    },
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

  // Process abandoned call recovery reminders
  let abandonedCallRemindersSent = 0;
  try {
    abandonedCallRemindersSent = await processAbandonedCallReminders();
  } catch (err) {
    console.error("[cron] Abandoned call reminders failed", { error: err });
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
    paymentTokensDeleted,
    remindersSent,
    remindersProcessed: dueReminders.length,
    abandonedCallRemindersSent,
  });
}
