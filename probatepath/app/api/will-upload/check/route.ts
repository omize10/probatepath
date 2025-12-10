import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get session (optional - can work without auth)
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ hasWill: false, extractionId: null });
    }

    const userId = session.user.id;

    // Find the latest extraction for this user
    const extraction = await prisma.willExtraction.findFirst({
      where: { userId },
      orderBy: { extractedAt: "desc" },
    });

    if (!extraction) {
      return NextResponse.json({ hasWill: false, extractionId: null });
    }

    return NextResponse.json({
      hasWill: true,
      extractionId: extraction.id,
    });
  } catch (error) {
    console.error("Will check error:", error);
    // Return false on error to avoid breaking the UI
    return NextResponse.json({ hasWill: false, extractionId: null });
  }
}
