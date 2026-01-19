import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { id?: string; role?: string };
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { retellIntakeData, manualIntake = false, callNotes } = body;

    if (!prismaEnabled) {
      return NextResponse.json({ success: true });
    }

    // Verify callback exists
    const callback = await prisma.callbackSchedule.findUnique({
      where: { id },
    });

    if (!callback) {
      return NextResponse.json({ error: "Callback not found" }, { status: 404 });
    }

    // Update callback status
    await prisma.callbackSchedule.update({
      where: { id },
      data: {
        status: "call_complete",
        callNotes: callNotes || callback.callNotes,
        assignedWorker: user.id,
      },
    });

    // If Retell intake data is provided, save it
    if (retellIntakeData && !manualIntake) {
      await prisma.retellIntake.upsert({
        where: { callbackScheduleId: id },
        create: {
          callbackScheduleId: id,
          retellCallId: retellIntakeData.callId,
          callDuration: retellIntakeData.callDuration,
          recordingUrl: retellIntakeData.recordingUrl,
          transcriptUrl: retellIntakeData.transcriptUrl,
          intakeData: retellIntakeData.intakeData || {},
          confidenceScore: retellIntakeData.confidence?.overall,
          flaggedFields: retellIntakeData.confidence?.flaggedFields || [],
        },
        update: {
          retellCallId: retellIntakeData.callId,
          callDuration: retellIntakeData.callDuration,
          recordingUrl: retellIntakeData.recordingUrl,
          transcriptUrl: retellIntakeData.transcriptUrl,
          intakeData: retellIntakeData.intakeData || {},
          confidenceScore: retellIntakeData.confidence?.overall,
          flaggedFields: retellIntakeData.confidence?.flaggedFields || [],
        },
      });
    } else if (manualIntake) {
      // Create empty retell intake record for manual intakes
      await prisma.retellIntake.upsert({
        where: { callbackScheduleId: id },
        create: {
          callbackScheduleId: id,
          intakeData: { manual: true },
          confidenceScore: null,
          flaggedFields: [],
        },
        update: {
          intakeData: { manual: true },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/ops/callbacks/complete] Error:", error);
    return NextResponse.json(
      { error: "Failed to complete callback" },
      { status: 500 }
    );
  }
}
