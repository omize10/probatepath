import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { type CallbackStatus } from "@prisma/client";

const validStatuses: CallbackStatus[] = [
  "scheduled",
  "call_in_progress",
  "call_complete",
  "intake_complete",
  "cancelled",
  "no_show",
];

export async function PATCH(
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
    const { status } = body as { status: CallbackStatus };

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

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

    // Update status
    await prisma.callbackSchedule.update({
      where: { id },
      data: {
        status,
        assignedWorker: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/ops/callbacks/status] Error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
