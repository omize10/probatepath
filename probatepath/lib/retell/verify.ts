/**
 * Retell webhook signature verification
 * Per Retell documentation: https://docs.retellai.com/features/secure-webhook
 * Retell uses the API Key itself for webhook verification, not a separate secret
 */
import crypto from "crypto";

const RETELL_API_KEY = process.env.RETELL_API_KEY;

/**
 * Verify the Retell webhook signature
 * @param payload - The raw request body as a string
 * @param signature - The x-retell-signature header value
 * @returns true if signature is valid
 */
export function verifyRetellSignature(payload: string, signature: string | null): boolean {
  // Check if API key is missing or empty
  if (!RETELL_API_KEY || RETELL_API_KEY.trim() === "") {
    const isProduction = process.env.NODE_ENV === "production";
    console.warn("[retell] ⚠️ RETELL_API_KEY not configured", {
      is_production: isProduction,
      api_key_exists: RETELL_API_KEY !== undefined,
      api_key_empty: RETELL_API_KEY === "" || RETELL_API_KEY?.trim() === "",
    });
    // In production, reject if no API key
    if (isProduction) {
      console.error("[retell] ❌ REJECTING webhook in production due to missing API key");
      return false;
    }
    // In development, allow with warning
    console.warn("[retell] ✅ Allowing webhook in development without API key verification");
    return true;
  }

  if (!signature) {
    console.error("[retell] Missing x-retell-signature header");
    return false;
  }

  try {
    // Use API key as the HMAC secret (per Retell documentation)
    const expectedSignature = crypto
      .createHmac("sha256", RETELL_API_KEY)
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
