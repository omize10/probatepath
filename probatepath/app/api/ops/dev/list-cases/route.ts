import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Only allow in dev mode
  const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true";
  if (!isDev) {
    return NextResponse.json({ error: "Dev mode only" }, { status: 403 });
  }

  try {
    const cases = await prisma.matter.findMany({
      select: {
        id: true,
        caseCode: true,
        pathType: true,
        portalStatus: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        draft: {
          select: {
            decFullName: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const formattedCases = cases.map((c) => ({
      id: c.id,
      caseCode: c.caseCode,
      pathType: c.pathType,
      portalStatus: c.portalStatus,
      clientName: c.user?.name || "Unknown",
      clientEmail: c.user?.email || "No email",
      deceasedName: c.draft?.decFullName || "Unknown",
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      count: formattedCases.length,
      cases: formattedCases,
    });
  } catch (error) {
    console.error("[dev/list-cases] Error:", error);
    return NextResponse.json(
      { error: "Failed to list cases", details: String(error) },
      { status: 500 }
    );
  }
}
