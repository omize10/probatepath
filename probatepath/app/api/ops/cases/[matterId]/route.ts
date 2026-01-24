import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma, prismaEnabled } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ matterId: string }> }
) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get("ops_auth")?.value !== "1") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { matterId } = await params;

    if (!prismaEnabled) {
      return NextResponse.json({ success: true });
    }

    const matter = await prisma.matter.findUnique({ where: { id: matterId } });
    if (!matter) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Delete all related records in a transaction
    await prisma.$transaction([
      prisma.matterStepProgress.deleteMany({ where: { matterId } }),
      prisma.intakeDraft.deleteMany({ where: { matterId } }),
      prisma.generatedPack.deleteMany({ where: { matterId } }),
      prisma.beneficiary.deleteMany({ where: { matterId } }),
      prisma.executor.deleteMany({ where: { matterId } }),
      prisma.reminder.deleteMany({ where: { caseId: matterId } }),
      prisma.file.deleteMany({ where: { matterId } }),
      prisma.emailLog.deleteMany({ where: { matterId } }),
      prisma.resumeToken.deleteMany({ where: { matterId } }),
      prisma.supplementalSchedule.deleteMany({ where: { matterId } }),
      prisma.willSearchRequest.deleteMany({ where: { matterId } }),
      prisma.willFile.deleteMany({ where: { matterId } }),
      prisma.auditLog.deleteMany({ where: { matterId } }),
      prisma.matter.delete({ where: { id: matterId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/ops/cases/delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete case" },
      { status: 500 }
    );
  }
}
