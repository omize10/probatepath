import "server-only";
import twilio from "twilio";
import { Prisma } from "@prisma/client";
import { prisma, prismaEnabled } from "@/lib/prisma";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Log Twilio configuration status on module load
console.log("[sms] Twilio configuration:", {
  hasAccountSid: Boolean(accountSid),
  hasAuthToken: Boolean(authToken),
  hasFromNumber: Boolean(fromNumber),
  clientInitialized: Boolean(client),
});

export async function sendSMS({ to, body }: { to: string; body: string }): Promise<{ success: boolean; error?: string; sid?: string }> {
  console.log("[sms] Attempting to send SMS:", { to, bodyLength: body.length });

  if (!to || !to.trim()) {
    console.warn("[sms] No phone number provided, skipping");
    return { success: false, error: "No phone number provided" };
  }

  // Normalize Canadian phone numbers
  const normalized = normalizePhone(to);
  if (!normalized) {
    console.warn("[sms] Invalid phone number format", { to, reason: "normalization failed" });
    return { success: false, error: "Invalid phone number format" };
  }

  if (!client || !fromNumber) {
    console.log(`[sms] (dry-run) Twilio not configured - would send to=${normalized}:`, body.substring(0, 100));
    return { success: true, error: "dry-run (Twilio not configured)" };
  }

  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: normalized,
    });
    console.log(`[sms] Successfully sent to ${normalized}:`, { sid: message.sid, status: message.status });
    return { success: true, sid: message.sid };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[sms] Failed to send:", { to: normalized, error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Normalize a phone number to E.164 format for Canadian numbers.
 * Accepts: 604-555-1234, (604) 555-1234, 6045551234, +16045551234
 */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("+1")) {
    return digits;
  }

  return null;
}

/**
 * Log an SMS to the database for tracking and auditing
 */
export async function logSms({
  to,
  body,
  templateKey,
  matterId,
  status,
  twilioSid,
  errorMessage,
  meta,
}: {
  to: string;
  body: string;
  templateKey?: string;
  matterId?: string;
  status: "sent" | "failed" | "dry_run";
  twilioSid?: string;
  errorMessage?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  if (!prismaEnabled) {
    console.log("[sms] Database not enabled, skipping log:", { to, templateKey, status });
    return;
  }

  try {
    await prisma.smsLog.create({
      data: {
        to,
        body,
        templateKey,
        matterId,
        status,
        twilioSid,
        errorMessage,
        meta: meta as Prisma.InputJsonValue,
      },
    });
    console.log("[sms] Logged SMS to database:", { to, templateKey, status });
  } catch (error) {
    console.error("[sms] Failed to log SMS:", error);
  }
}
