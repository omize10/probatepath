import { NextResponse } from "next/server";

const OPS_PASSWORD = process.env.OPS_PASSWORD;

export async function POST(request: Request) {
  if (!OPS_PASSWORD || OPS_PASSWORD.length < 8) {
    console.error("[ops-auth] OPS_PASSWORD env var missing or too short — refusing all logins");
    return NextResponse.json({ ok: false, error: "Ops auth not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const password = (body as { password?: string }).password ?? "";

  if (password !== OPS_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

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
