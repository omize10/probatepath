import { NextRequest, NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";

// Public endpoint - no auth required
// Returns available slots for client booking
export async function GET(request: NextRequest) {
  try {
    if (!prismaEnabled) {
      return NextResponse.json({ available: [] });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    // Default to next 60 days if not specified
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // Get all available slots in date range
    const availableSlots = await prisma.availabilitySlot.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    // Get all booked callbacks in date range (exclude cancelled/no-show)
    const bookedCallbacks = await prisma.callbackSchedule.findMany({
      where: {
        scheduledDate: {
          gte: start,
          lte: end,
        },
        status: { notIn: ["cancelled", "no_show"] },
      },
      select: {
        scheduledDate: true,
        scheduledTime: true,
      },
    });

    // Create a set of booked date+time combinations
    const bookedSet = new Set(
      bookedCallbacks.map(
        (cb) =>
          `${cb.scheduledDate.toISOString().split("T")[0]}|${cb.scheduledTime}`
      )
    );

    // Group available slots by date, excluding booked ones
    const availableByDate = new Map<string, string[]>();

    for (const slot of availableSlots) {
      const dateStr = slot.date.toISOString().split("T")[0];
      const key = `${dateStr}|${slot.time}`;

      // Skip if this slot is already booked
      if (bookedSet.has(key)) continue;

      // Skip if date is in the past
      const slotDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (slotDate < today) continue;

      // Add to map
      if (!availableByDate.has(dateStr)) {
        availableByDate.set(dateStr, []);
      }
      availableByDate.get(dateStr)!.push(slot.time);
    }

    // Convert to array format
    const available = Array.from(availableByDate.entries())
      .map(([date, times]) => ({ date, times }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ available });
  } catch (error) {
    console.error("[api/availability] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
