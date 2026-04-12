import twilio from "twilio";

/**
 * Validate that an incoming Twilio webhook actually came from Twilio.
 *
 * Returns null if valid, or a NextResponse-shaped error tuple to return.
 * In dev (no TWILIO_AUTH_TOKEN configured) we skip verification so local
 * runs don't break.
 */
export async function verifyTwilioRequest(req: Request, body: URLSearchParams | string): Promise<string | null> {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return null; // dev / not configured
  const signature = req.headers.get("x-twilio-signature");
  if (!signature) return "Missing signature";
  const url = req.headers.get("x-forwarded-proto")
    ? `${req.headers.get("x-forwarded-proto")}://${req.headers.get("host")}${new URL(req.url).pathname}${new URL(req.url).search}`
    : req.url;
  const params: Record<string, string> = {};
  const usp = body instanceof URLSearchParams ? body : new URLSearchParams(body);
  for (const [k, v] of usp.entries()) params[k] = v;
  const ok = twilio.validateRequest(token, signature, url, params);
  return ok ? null : "Invalid signature";
}
