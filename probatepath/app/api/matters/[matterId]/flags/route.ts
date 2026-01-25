import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FlagType, FlagSeverity } from "@prisma/client";

const VALID_FLAG_TYPES: FlagType[] = [
  "NO_ORIGINAL_WILL",
  "DIFFERENT_WILL_FOUND",
  "MINOR_BENEFICIARY",
  "DISABLED_BENEFICIARY",
  "FOREIGN_ASSETS",
  "BUSINESS_INTERESTS",
  "EXPECTED_DISPUTE",
  "POSSIBLY_INSOLVENT",
  "PRIORITY_CONFLICT",
  "COMPLEX_FAMILY",
  "INTESTATE_CASE",
  "OTHER",
];

const VALID_SEVERITIES: FlagSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matterId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { matterId } = await params;

    // Verify matter exists
    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
    });

    if (!matter) {
      return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    }

    const body = await request.json();
    const { flagType, severity, description } = body;

    if (!flagType || !VALID_FLAG_TYPES.includes(flagType as FlagType)) {
      return NextResponse.json({ error: "Invalid flag type" }, { status: 400 });
    }

    if (!severity || !VALID_SEVERITIES.includes(severity as FlagSeverity)) {
      return NextResponse.json({ error: "Invalid severity" }, { status: 400 });
    }

    const flag = await prisma.matterFlag.create({
      data: {
        matterId,
        flagType: flagType as FlagType,
        severity: severity as FlagSeverity,
        status: "OPEN",
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(flag);
  } catch (error) {
    console.error("Error creating flag:", error);
    return NextResponse.json({ error: "Failed to create flag" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matterId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { matterId } = await params;

    const flags = await prisma.matterFlag.findMany({
      where: { matterId },
      orderBy: [
        { status: "asc" },
        { severity: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(flags);
  } catch (error) {
    console.error("Error fetching flags:", error);
    return NextResponse.json({ error: "Failed to fetch flags" }, { status: 500 });
  }
}
