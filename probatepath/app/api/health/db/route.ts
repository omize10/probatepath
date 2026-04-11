import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";

// Minimal health endpoint. Never leaks connection strings, stack traces, or
// schema info — only a boolean-ish status.
export async function GET() {
  if (!prismaEnabled) {
    return NextResponse.json(
      { status: "error", message: "Database not configured" },
      { status: 503 },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[health/db] connection failed", error);
    return NextResponse.json(
      { status: "error", message: "Database connection failed" },
      { status: 503 },
    );
  }
}
