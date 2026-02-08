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
  // Check if secret is missing or empty
  if (!RETELL_WEBHOOK_SECRET || RETELL_WEBHOOK_SECRET.trim() === "") {
    const isProduction = process.env.NODE_ENV === "production";
    console.warn("[retell] ⚠️ RETELL_WEBHOOK_SECRET not configured", {
      is_production: isProduction,
      secret_exists: RETELL_WEBHOOK_SECRET !== undefined,
      secret_empty: RETELL_WEBHOOK_SECRET === "" || RETELL_WEBHOOK_SECRET?.trim() === "",
    });
    // In production, reject if no secret
    if (isProduction) {
      console.error("[retell] ❌ REJECTING webhook in production due to missing secret");
      return false;
    }
    // In development, allow with warning
    console.warn("[retell] ✅ Allowing webhook in development without secret");
    return true;
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
