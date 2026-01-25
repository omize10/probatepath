import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { matterId, pathType } = await request.json();

    if (!matterId || !pathType) {
      return NextResponse.json(
        { error: "Matter ID and path type are required" },
        { status: 400 }
      );
    }

    if (pathType !== "probate" && pathType !== "administration") {
      return NextResponse.json(
        { error: "Invalid path type. Must be 'probate' or 'administration'" },
        { status: 400 }
      );
    }

    // Find the matter
    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
    });

    if (!matter) {
      return NextResponse.json(
        { error: "Case not found", matterId },
        { status: 404 }
      );
    }

    const previousPathType = matter.pathType;

    // Update the path type
    await prisma.matter.update({
      where: { id: matterId },
      data: { pathType },
    });

    return NextResponse.json({
      success: true,
      message: `Path type updated from ${previousPathType} to ${pathType}`,
      matterId,
      previousPathType,
      newPathType: pathType,
    });
  } catch (error) {
    console.error("[dev/set-path-type] Error:", error);
    return NextResponse.json(
      { error: "Failed to update path type", details: String(error) },
      { status: 500 }
    );
  }
}
