import "server-only";
import crypto from "crypto";

type VerifyResult =
  | { ok: true; userId: string; passwordSig: string; expiresAt: Date }
  | { ok: false; error: "Invalid" | "Expired" | "Misconfigured" };

const TOKEN_VERSION = "v1";
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

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

function sha256Hex(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function constantTimeEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createPasswordResetToken(params: { userId: string; passwordHash: string | null; ttlMs?: number }) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required to issue password reset tokens");
  }

  const ttlMs = params.ttlMs ?? DEFAULT_TTL_MS;
  const expMs = Date.now() + ttlMs;
  const payload = {
    v: TOKEN_VERSION,
    uid: params.userId,
    exp: Math.floor(expMs / 1000),
    pwd: sha256Hex(params.passwordHash ?? ""),
  };

  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signingInput = `${TOKEN_VERSION}.${payloadB64}`;
  const sigB64 = base64urlEncode(hmacSha256(secret, signingInput));

  return `${signingInput}.${sigB64}`;
}

export function verifyPasswordResetToken(token: string): VerifyResult {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return { ok: false, error: "Misconfigured" };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, error: "Invalid" };
  const [version, payloadB64, sigB64] = parts;
  if (version !== TOKEN_VERSION) return { ok: false, error: "Invalid" };

  let payload: unknown;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64).toString("utf8"));
  } catch {
    return { ok: false, error: "Invalid" };
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    (payload as { v?: unknown }).v !== TOKEN_VERSION ||
    typeof (payload as { uid?: unknown }).uid !== "string" ||
    typeof (payload as { exp?: unknown }).exp !== "number" ||
    typeof (payload as { pwd?: unknown }).pwd !== "string"
  ) {
    return { ok: false, error: "Invalid" };
  }

  const signingInput = `${TOKEN_VERSION}.${payloadB64}`;
  const expectedSig = hmacSha256(secret, signingInput);
  const providedSig = base64urlDecode(sigB64);
  if (!constantTimeEqual(expectedSig, providedSig)) return { ok: false, error: "Invalid" };

  const expSeconds = (payload as { exp: number }).exp;
  const expiresAt = new Date(expSeconds * 1000);
  if (Date.now() > expiresAt.getTime()) return { ok: false, error: "Expired" };

  return {
    ok: true,
    userId: (payload as { uid: string }).uid,
    passwordSig: (payload as { pwd: string }).pwd,
    expiresAt,
  };
}

export function passwordSigFromHash(passwordHash: string | null) {
  return sha256Hex(passwordHash ?? "");
}

