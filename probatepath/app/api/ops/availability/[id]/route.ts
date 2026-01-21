import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma, prismaEnabled } from "@/lib/prisma";

async function checkOpsAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("ops_auth")?.value === "1";
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthed = await checkOpsAuth();
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prismaEnabled) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { id } = await params;

    // Get the slot first to check for bookings
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    // Check if there's a callback booked for this slot
    const bookedCallback = await prisma.callbackSchedule.findFirst({
      where: {
        scheduledDate: slot.date,
        scheduledTime: slot.time,
        status: { notIn: ["cancelled", "no_show"] },
      },
    });

    if (bookedCallback) {
      return NextResponse.json(
        { error: "Cannot delete slot with active booking" },
        { status: 409 }
      );
    }

    await prisma.availabilitySlot.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/ops/availability/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete availability slot" },
      { status: 500 }
    );
  }
}
