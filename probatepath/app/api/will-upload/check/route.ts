import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id ?? null;
    if (!userId) {
      return NextResponse.json({ extractionId: null, hasWill: false });
    }

    const extraction = await prisma.willExtraction.findFirst({
      where: { userId },
      orderBy: { extractedAt: "desc" },
    });

    return NextResponse.json({
      extractionId: extraction?.id ?? null,
      hasWill: Boolean(extraction),
    });
  } catch {
    return NextResponse.json({ extractionId: null, hasWill: false });
  }
}
