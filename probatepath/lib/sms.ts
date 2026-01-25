import "server-only";
import twilio from "twilio";

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

export async function sendSMS({ to, body }: { to: string; body: string }): Promise<boolean> {
  console.log("[sms] Attempting to send SMS:", { to, bodyLength: body.length });

  if (!to || !to.trim()) {
    console.warn("[sms] No phone number provided, skipping");
    return false;
  }

  // Normalize Canadian phone numbers
  const normalized = normalizePhone(to);
  if (!normalized) {
    console.warn("[sms] Invalid phone number format", { to, reason: "normalization failed" });
    return false;
  }

  if (!client || !fromNumber) {
    console.log(`[sms] (dry-run) Twilio not configured - would send to=${normalized}:`, body.substring(0, 100));
    return true;
  }

  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: normalized,
    });
    console.log(`[sms] Successfully sent to ${normalized}:`, { sid: message.sid, status: message.status });
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[sms] Failed to send:", { to: normalized, error: errorMessage });
    return false;
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
