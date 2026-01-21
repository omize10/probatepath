import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma, prismaEnabled } from "@/lib/prisma";

async function checkOpsAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("ops_auth")?.value === "1";
}

export async function GET(request: NextRequest) {
  try {
    const isAuthed = await checkOpsAuth();
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prismaEnabled) {
      return NextResponse.json({ slots: [] });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    const whereClause: Record<string, unknown> = {};
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      whereClause.date = { gte: new Date(startDate) };
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: whereClause,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("[api/ops/availability] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { date, times, slots } = body as {
      date?: string;
      times?: string[];
      slots?: { date: string; time: string }[];
    };

    // Support two formats:
    // 1. { date: "2025-01-20", times: ["9:00 AM", "10:00 AM"] }
    // 2. { slots: [{ date: "2025-01-20", time: "9:00 AM" }, ...] }

    const slotsToCreate: { date: Date; time: string }[] = [];

    if (date && times && Array.isArray(times)) {
      const dateObj = new Date(date);
      for (const time of times) {
        slotsToCreate.push({ date: dateObj, time });
      }
    } else if (slots && Array.isArray(slots)) {
      for (const slot of slots) {
        slotsToCreate.push({ date: new Date(slot.date), time: slot.time });
      }
    } else {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Use createMany with skipDuplicates to handle existing slots gracefully
    const result = await prisma.availabilitySlot.createMany({
      data: slotsToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({
      created: result.count,
      message: `Created ${result.count} availability slot(s)`,
    });
  } catch (error) {
    console.error("[api/ops/availability] Error:", error);
    return NextResponse.json(
      { error: "Failed to create availability slots" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { date, times } = body as { date?: string; times?: string[] };

    if (!date || !times || !Array.isArray(times)) {
      return NextResponse.json(
        { error: "Invalid request body - need date and times array" },
        { status: 400 }
      );
    }

    const dateObj = new Date(date);

    // Check if any of these slots have callbacks booked
    const bookedCallbacks = await prisma.callbackSchedule.findMany({
      where: {
        scheduledDate: dateObj,
        scheduledTime: { in: times },
        status: { notIn: ["cancelled", "no_show"] },
      },
      select: { scheduledTime: true },
    });

    if (bookedCallbacks.length > 0) {
      const bookedTimes = bookedCallbacks.map((c) => c.scheduledTime);
      return NextResponse.json(
        {
          error: "Cannot remove slots with active bookings",
          bookedTimes,
        },
        { status: 409 }
      );
    }

    // Delete the slots
    const result = await prisma.availabilitySlot.deleteMany({
      where: {
        date: dateObj,
        time: { in: times },
      },
    });

    return NextResponse.json({
      deleted: result.count,
      message: `Deleted ${result.count} availability slot(s)`,
    });
  } catch (error) {
    console.error("[api/ops/availability] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete availability slots" },
      { status: 500 }
    );
  }
}
