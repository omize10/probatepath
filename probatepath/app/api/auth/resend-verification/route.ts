import { NextResponse } from "next/server";

// Verification flow was removed from the app (DB model retained). Keep a small
// shim endpoint that returns 404 so any lingering references don't crash the
// typecheck/build. This file can be safely deleted later.
export async function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
