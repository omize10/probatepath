import { NextResponse } from "next/server";

// ⚠️ PRE-LAUNCH ONLY: falls back to "123" when OPS_PASSWORD env var is unset.
// Set OPS_PASSWORD in Vercel before going public — that value overrides this fallback.
const OPS_PASSWORD = process.env.OPS_PASSWORD || "123";

// Per-IP rate limit for ops login attempts. 10 failed attempts per 15 minutes.
// This is a simple in-memory map — fine for a single-instance hot path.
// Multi-instance deployments would need a shared store (Redis, etc.).
const FAIL_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 10;
const failMap = new Map<string, { count: number; firstAt: number }>();

function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = failMap.get(ip);
  if (!entry) return false;
  if (now - entry.firstAt > FAIL_WINDOW_MS) {
    failMap.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILS;
}

function recordFail(ip: string) {
  const now = Date.now();
  const entry = failMap.get(ip);
  if (!entry || now - entry.firstAt > FAIL_WINDOW_MS) {
    failMap.set(ip, { count: 1, firstAt: now });
  } else {
    entry.count++;
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const password = (body as { password?: string }).password ?? "";

  if (password !== OPS_PASSWORD) {
    recordFail(ip);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // successful login — clear failure record
  failMap.delete(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("ops_auth", "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
