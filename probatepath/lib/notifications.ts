import "server-only";
import { prisma } from "@/lib/prisma";

type CreateNotificationInput = {
  userId: string;
  matterId?: string;
  type: "document_ready" | "countdown_milestone" | "action_required" | "status_update" | "system";
  title: string;
  body: string;
  href?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      matterId: input.matterId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href,
    },
  });
}

export async function getUserNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

/** Notify user when their document packet is ready */
export async function notifyDocumentReady(userId: string, matterId: string, docType: string) {
  return createNotification({
    userId,
    matterId,
    type: "document_ready",
    title: "Document ready",
    body: `Your ${docType} is ready to download.`,
    href: "/portal/documents",
  });
}

/** Notify user about countdown milestones */
export async function notifyCountdownMilestone(userId: string, matterId: string, daysLeft: number) {
  const body = daysLeft === 0
    ? "Your 21-day waiting period is complete. You can now proceed to filing."
    : `${daysLeft} day(s) left in your 21-day waiting period.`;
  return createNotification({
    userId,
    matterId,
    type: "countdown_milestone",
    title: daysLeft === 0 ? "Waiting period complete" : `${daysLeft} days remaining`,
    body,
    href: "/portal",
  });
}

/** Notify user when action is required */
export async function notifyActionRequired(userId: string, matterId: string, action: string, href?: string) {
  return createNotification({
    userId,
    matterId,
    type: "action_required",
    title: "Action needed",
    body: action,
    href: href ?? "/portal",
  });
}

/** Notify user of a status change */
export async function notifyStatusUpdate(userId: string, matterId: string, newStatus: string) {
  return createNotification({
    userId,
    matterId,
    type: "status_update",
    title: "Status updated",
    body: `Your case has moved to: ${newStatus}`,
    href: "/portal",
  });
}
