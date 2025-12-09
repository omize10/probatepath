import { NextResponse } from "next/server";

const OPS_PASSWORD = process.env.OPS_PASSWORD ?? "123";

export async function POST(request: Request) {
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
