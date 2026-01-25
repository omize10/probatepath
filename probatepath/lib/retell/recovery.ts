/**
 * Recovery sequences for abandoned AI calls
 */
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/messaging/service";
import type { Prisma } from "@prisma/client";

const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

// Reminder types for abandoned calls
export const ABANDONED_CALL_1H = "abandoned_call_1h";
export const ABANDONED_CALL_24H = "abandoned_call_24h";
export const ABANDONED_CALL_3D = "abandoned_call_3d";

interface RecoveryReminder {
  id: string;
  caseId: string;
  type: string;
  channel: string;
}

/**
 * Process abandoned call reminders
 * Called by the daily cron job
 */
export async function processAbandonedCallReminders() {
  const now = new Date();

  // Find due reminders for abandoned calls
  const dueReminders = await prisma.reminder.findMany({
    where: {
      type: {
        in: [ABANDONED_CALL_1H, ABANDONED_CALL_24H, ABANDONED_CALL_3D],
      },
      dueAt: { lte: now },
      sentAt: null,
    },
  });

  console.log(`[recovery] Found ${dueReminders.length} abandoned call reminders to process`);

  for (const reminder of dueReminders) {
    try {
      await sendAbandonedCallReminder(reminder);

      // Mark as sent
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { sentAt: now },
      });

      console.log(`[recovery] Sent ${reminder.type} reminder for AI call ${reminder.caseId}`);
    } catch (error) {
      console.error(`[recovery] Failed to send reminder ${reminder.id}:`, error);
    }
  }

  return dueReminders.length;
}

async function sendAbandonedCallReminder(reminder: RecoveryReminder) {
  // Get the AI call details
  const aiCall = await prisma.aiCall.findUnique({
    where: { id: reminder.caseId },
    include: {
      user: true,
      paymentTokens: {
        where: { usedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!aiCall) {
    console.warn(`[recovery] AI call ${reminder.caseId} not found`);
    return;
  }

  // Don't send if they already completed payment
  if (aiCall.paymentTokens.some((t) => t.usedAt)) {
    console.log(`[recovery] Skipping - user already paid for AI call ${aiCall.id}`);
    return;
  }

  const phone = aiCall.phoneNumber || aiCall.user?.phone;
  const email = aiCall.user?.email;
  const name = aiCall.user?.name || "there";
  const collectedData = (aiCall.collectedData as Record<string, unknown>) || {};
  const deceasedName = (collectedData.deceased_name as string) || "your loved one";

  // Get or create a payment token
  let paymentToken = aiCall.paymentTokens[0]?.token;
  if (!paymentToken) {
    paymentToken = crypto.randomUUID().replace(/-/g, "");
    const prefillData = {
      tier: aiCall.recommendedTier || "standard",
      name: (collectedData.executor_name || collectedData.executor_full_name) as string | undefined,
      email: collectedData.executor_email as string | undefined,
      phone: collectedData.executor_phone as string | undefined,
    };
    await prisma.paymentToken.create({
      data: {
        token: paymentToken,
        userId: aiCall.userId,
        aiCallId: aiCall.id,
        prefillData: prefillData as Prisma.InputJsonValue,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const paymentUrl = `${APP_URL}/pay?token=${paymentToken}`;

  // Send based on reminder type using the unified messaging service
  switch (reminder.type) {
    case ABANDONED_CALL_1H:
      // 1-hour SMS only
      if (phone) {
        await sendMessage({
          templateKey: "abandoned_call_1h",
          to: { phone },
          variables: { name, paymentUrl },
          meta: { aiCallId: aiCall.id },
        });
      }
      break;

    case ABANDONED_CALL_24H:
      // 24-hour email + SMS
      await sendMessage({
        templateKey: "abandoned_call_24h",
        to: { email, phone: phone || undefined },
        variables: { name, deceasedName, paymentUrl },
        meta: { aiCallId: aiCall.id },
      });
      break;

    case ABANDONED_CALL_3D:
      // 3-day final SMS only
      if (phone) {
        await sendMessage({
          templateKey: "abandoned_call_3d",
          to: { phone },
          variables: { paymentUrl },
          meta: { aiCallId: aiCall.id },
        });
      }
      break;
  }
}

/**
 * Schedule recovery reminders for an abandoned call
 * Called when a call ends without payment
 */
export async function scheduleAbandonedCallRecovery(aiCallId: string) {
  const now = new Date();

  // Schedule 1-hour reminder
  await prisma.reminder.upsert({
    where: { caseId_type: { caseId: aiCallId, type: ABANDONED_CALL_1H } },
    create: {
      caseId: aiCallId,
      type: ABANDONED_CALL_1H,
      channel: "sms",
      dueAt: new Date(now.getTime() + 60 * 60 * 1000),
    },
    update: {
      dueAt: new Date(now.getTime() + 60 * 60 * 1000),
      sentAt: null,
    },
  });

  // Schedule 24-hour reminder
  await prisma.reminder.upsert({
    where: { caseId_type: { caseId: aiCallId, type: ABANDONED_CALL_24H } },
    create: {
      caseId: aiCallId,
      type: ABANDONED_CALL_24H,
      channel: "email",
      dueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    },
    update: {
      dueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      sentAt: null,
    },
  });

  // Schedule 3-day reminder
  await prisma.reminder.upsert({
    where: { caseId_type: { caseId: aiCallId, type: ABANDONED_CALL_3D } },
    create: {
      caseId: aiCallId,
      type: ABANDONED_CALL_3D,
      channel: "sms",
      dueAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
    update: {
      dueAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      sentAt: null,
    },
  });

  console.log(`[recovery] Scheduled recovery reminders for AI call: ${aiCallId}`);
}

/**
 * Cancel recovery reminders (e.g., when user completes payment)
 */
export async function cancelAbandonedCallRecovery(aiCallId: string) {
  await prisma.reminder.deleteMany({
    where: {
      caseId: aiCallId,
      type: {
        in: [ABANDONED_CALL_1H, ABANDONED_CALL_24H, ABANDONED_CALL_3D],
      },
      sentAt: null,
    },
  });

  console.log(`[recovery] Cancelled recovery reminders for AI call: ${aiCallId}`);
}
