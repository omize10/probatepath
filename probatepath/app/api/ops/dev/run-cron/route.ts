import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminder, sendGrantCheckInReminders, type ReminderWithRelations } from "@/lib/reminders";

export async function POST() {
  // Only allow in dev mode
  const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true";
  if (!isDev) {
    return NextResponse.json({ error: "Dev mode only" }, { status: 403 });
  }

  try {
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
    const reminderResults: Array<{ id: string; type: string; sent: boolean }> = [];

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
        reminderResults.push({ id: reminder.id, type: reminder.type, sent });
      } catch (err) {
        console.error("[dev-cron] Failed to send reminder", { id: reminder.id, error: err });
        reminderResults.push({ id: reminder.id, type: reminder.type, sent: false });
      }
    }

    // Count cases waiting for grant
    const casesWaitingForGrant = await prisma.matter.count({
      where: {
        portalStatus: "probate_filed",
        grantIssuedAt: null,
        probateFiledAt: { not: null },
      },
    });

    // Send grant check-in reminders
    let grantCheckInError: string | null = null;
    try {
      await sendGrantCheckInReminders();
    } catch (err: any) {
      grantCheckInError = err.message || "Unknown error";
      console.error("[dev-cron] Grant check-in reminders failed", { error: err });
    }

    return NextResponse.json({
      success: true,
      message: "Cron job executed",
      results: {
        tokensDeleted,
        remindersProcessed: dueReminders.length,
        remindersSent,
        reminderResults,
        casesWaitingForGrant,
        grantCheckInError,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Cron job failed", success: false },
      { status: 500 }
    );
  }
}
