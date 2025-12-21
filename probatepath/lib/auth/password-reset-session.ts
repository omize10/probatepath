import "server-only";
import crypto from "crypto";

type SessionVerifyResult =
  | { ok: true; userId: string; emailLogId: string; expiresAt: Date }
  | { ok: false; error: "Invalid" | "Expired" | "Misconfigured" };

const SESSION_VERSION = "v1";
const DEFAULT_TTL_MS = 15 * 60 * 1000;

function base64urlEncode(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64urlDecode(input: string) {
  const padLen = (4 - (input.length % 4)) % 4;
  const padded = input.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat(padLen);
  return Buffer.from(padded, "base64");
}

function hmacSha256(secret: string, data: string) {
  return crypto.createHmac("sha256", secret).update(data).digest();
}

function constantTimeEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createPasswordResetSessionToken(params: { userId: string; emailLogId: string; ttlMs?: number }) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required");

  const ttlMs = params.ttlMs ?? DEFAULT_TTL_MS;
  const expMs = Date.now() + ttlMs;
  const payload = {
    v: SESSION_VERSION,
    uid: params.userId,
    lid: params.emailLogId,
    exp: Math.floor(expMs / 1000),
  };

  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signingInput = `${SESSION_VERSION}.${payloadB64}`;
  const sigB64 = base64urlEncode(hmacSha256(secret, signingInput));
  return `${signingInput}.${sigB64}`;
}

export function verifyPasswordResetSessionToken(token: string): SessionVerifyResult {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return { ok: false, error: "Misconfigured" };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, error: "Invalid" };
  const [version, payloadB64, sigB64] = parts;
  if (version !== SESSION_VERSION) return { ok: false, error: "Invalid" };

  let payload: unknown;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64).toString("utf8"));
  } catch {
    return { ok: false, error: "Invalid" };
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    (payload as { v?: unknown }).v !== SESSION_VERSION ||
    typeof (payload as { uid?: unknown }).uid !== "string" ||
    typeof (payload as { lid?: unknown }).lid !== "string" ||
    typeof (payload as { exp?: unknown }).exp !== "number"
  ) {
    return { ok: false, error: "Invalid" };
  }

  const signingInput = `${SESSION_VERSION}.${payloadB64}`;
  const expectedSig = hmacSha256(secret, signingInput);
  const providedSig = base64urlDecode(sigB64);
  if (!constantTimeEqual(expectedSig, providedSig)) return { ok: false, error: "Invalid" };

  const expiresAt = new Date((payload as { exp: number }).exp * 1000);
  if (Date.now() > expiresAt.getTime()) return { ok: false, error: "Expired" };

  return {
    ok: true,
    userId: (payload as { uid: string }).uid,
    emailLogId: (payload as { lid: string }).lid,
    expiresAt,
  };
}

