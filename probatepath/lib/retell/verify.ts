/**
 * Retell webhook signature verification
 * Based on Retell SDK source: retell-sdk/src/lib/webhook_auth.ts
 *
 * Signature format: v=<timestamp_ms>,d=<hmac_sha256_hex>
 * HMAC input: <body_string><timestamp_ms>  (concatenated, no separator)
 * HMAC key: RETELL_API_KEY
 */
import crypto from "crypto";

const FIVE_MINUTES = 5 * 60 * 1000;

export function verifyRetellSignature(
  payload: string,
  signature: string | null,
): boolean {
  const apiKey = process.env.RETELL_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      console.error("[retell] ❌ REJECTING webhook – missing RETELL_API_KEY");
      return false;
    }
    console.warn("[retell] ⚠️ Skipping verification in dev (no API key)");
    return true;
  }

  if (!signature) {
    console.error("[retell] ❌ Missing x-retell-signature header");
    return false;
  }

  // Parse "v=<timestamp>,d=<digest>"
  const match = /^v=(\d+),d=(.+)$/.exec(signature);
  if (!match) {
    console.error("[retell] ❌ Malformed signature format:", signature.slice(0, 40));
    return false;
  }

  const timestamp = Number(match[1]);
  const digest = match[2];

  // Reject if older than 5 minutes
  const age = Math.abs(Date.now() - timestamp);
  if (age > FIVE_MINUTES) {
    console.error("[retell] ❌ Signature expired:", { age_ms: age });
    return false;
  }

  // HMAC-SHA256( payload + timestamp, apiKey )
  const expected = crypto
    .createHmac("sha256", apiKey)
    .update(payload + timestamp)
    .digest("hex");

  if (expected !== digest) {
    console.error("[retell] ❌ Signature mismatch");
    return false;
  }

  return true;
}
