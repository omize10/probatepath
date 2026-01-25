/**
 * Retell webhook signature verification
 */
import crypto from "crypto";

const RETELL_WEBHOOK_SECRET = process.env.RETELL_WEBHOOK_SECRET;

/**
 * Verify the Retell webhook signature
 * @param payload - The raw request body as a string
 * @param signature - The x-retell-signature header value
 * @returns true if signature is valid
 */
export function verifyRetellSignature(payload: string, signature: string | null): boolean {
  if (!RETELL_WEBHOOK_SECRET) {
    console.warn("[retell] RETELL_WEBHOOK_SECRET not configured, skipping signature verification");
    return true; // Allow in dev mode
  }

  if (!signature) {
    console.error("[retell] Missing x-retell-signature header");
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", RETELL_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.error("[retell] Invalid webhook signature");
    }

    return isValid;
  } catch (error) {
    console.error("[retell] Signature verification error:", error);
    return false;
  }
}
