import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = session.user as { id?: string; role?: string };
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!prismaEnabled) {
      return NextResponse.json({ callbacks: [] });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const includeCompleted = searchParams.get("includeCompleted") === "true";

    // Build where clause
    const whereClause: Record<string, unknown> = {};
    if (status) {
      whereClause.status = status;
    } else if (!includeCompleted) {
      // Exclude intake_complete by default
      whereClause.status = { not: "intake_complete" };
    }

    const callbacks = await prisma.callbackSchedule.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tierSelection: {
          select: {
            selectedTier: true,
            tierPrice: true,
          },
        },
        willUploads: {
          select: {
            id: true,
            filename: true,
            fileType: true,
            thumbnailUrl: true,
            qualityScore: true,
          },
        },
        retellIntake: {
          select: {
            id: true,
            pushedToEstate: true,
          },
        },
      },
      orderBy: [
        { scheduledDate: "asc" },
        { scheduledTime: "asc" },
      ],
    });

    // Format response
    const formattedCallbacks = callbacks.map((callback) => ({
      id: callback.id,
      scheduledDate: callback.scheduledDate,
      scheduledTime: callback.scheduledTime,
      phoneNumber: callback.phoneNumber,
      status: callback.status,
      tier: callback.tierSelection.selectedTier,
      tierPrice: callback.tierSelection.tierPrice,
      user: {
        id: callback.user.id,
        name: callback.user.name,
        email: callback.user.email,
      },
      willUploadsCount: callback.willUploads.length,
      willUploads: callback.willUploads,
      hasIntakeData: !!callback.retellIntake,
      intakePushed: callback.retellIntake?.pushedToEstate ?? false,
      assignedWorker: callback.assignedWorker,
      callNotes: callback.callNotes,
      createdAt: callback.createdAt,
      updatedAt: callback.updatedAt,
    }));

    return NextResponse.json({ callbacks: formattedCallbacks });
  } catch (error) {
    console.error("[api/ops/callbacks] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch callbacks" },
      { status: 500 }
    );
  }
}
