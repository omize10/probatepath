import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function requireOps(): Promise<NextResponse | null> {
  const c = await cookies();
  if (c.get("ops_auth")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
