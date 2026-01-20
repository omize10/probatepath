import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    prismaEnabled,
    nodeEnv: process.env.NODE_ENV,
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    dbUrlStart: process.env.DATABASE_URL?.substring(0, 50) + "...",
  };

  if (!prismaEnabled) {
    return NextResponse.json({
      ...checks,
      status: "error",
      error: "Prisma not enabled - DATABASE_URL not set",
    }, { status: 500 });
  }

  try {
    // Test basic connectivity
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    checks.rawQueryResult = result;

    // Test user table exists
    const userCount = await prisma.user.count();
    checks.userCount = userCount;

    return NextResponse.json({
      ...checks,
      status: "ok",
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      ...checks,
      status: "error",
      errorName: err.name,
      errorMessage: err.message,
      errorStack: err.stack?.split("\n").slice(0, 5),
    }, { status: 500 });
  }
}
