import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const body = await request.json();
    const { date, time, phoneNumber, tierSelectionId } = body;

    if (!date || !time || !phoneNumber) {
      return NextResponse.json(
        { error: "Date, time, and phone number are required" },
        { status: 400 }
      );
    }

    if (!prismaEnabled) {
      return NextResponse.json({
        callbackScheduleId: "mock-callback-schedule-id",
        scheduledDate: date,
        scheduledTime: time,
      });
    }

    // Get the most recent tier selection for the user if not provided
    let selectionId = tierSelectionId;
    if (!selectionId) {
      const latestSelection = await prisma.tierSelection.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (!latestSelection) {
        return NextResponse.json(
          { error: "No tier selection found" },
          { status: 400 }
        );
      }
      selectionId = latestSelection.id;
    }

    // Parse the date string to a Date object
    const scheduledDate = new Date(date);

    // Create callback schedule
    const callbackSchedule = await prisma.callbackSchedule.create({
      data: {
        userId,
        tierSelectionId: selectionId,
        scheduledDate,
        scheduledTime: time,
        phoneNumber,
        status: "scheduled",
      },
    });

    return NextResponse.json({
      callbackScheduleId: callbackSchedule.id,
      scheduledDate: callbackSchedule.scheduledDate,
      scheduledTime: callbackSchedule.scheduledTime,
    });
  } catch (error) {
    console.error("[api/callback/schedule] Error:", error);
    return NextResponse.json(
      { error: "Failed to schedule callback" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    if (!prismaEnabled) {
      return NextResponse.json({ callbacks: [] });
    }

    const callbacks = await prisma.callbackSchedule.findMany({
      where: { userId },
      include: {
        tierSelection: true,
        willUploads: true,
      },
      orderBy: { scheduledDate: "desc" },
    });

    return NextResponse.json({ callbacks });
  } catch (error) {
    console.error("[api/callback/schedule] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch callbacks" },
      { status: 500 }
    );
  }
}
