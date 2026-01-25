import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FlagStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ matterId: string; flagId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { matterId, flagId } = await params;
    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    // Verify flag exists and belongs to this matter
    const existingFlag = await prisma.matterFlag.findFirst({
      where: { id: flagId, matterId },
    });

    if (!existingFlag) {
      return NextResponse.json({ error: "Flag not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses: FlagStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "DISMISSED"];
    if (!status || !validStatuses.includes(status as FlagStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const typedStatus = status as FlagStatus;
    const isClosing = typedStatus === "RESOLVED" || typedStatus === "DISMISSED";

    const flag = await prisma.matterFlag.update({
      where: { id: flagId },
      data: {
        status: typedStatus,
        ...(isClosing ? { resolvedBy: userId, resolvedAt: new Date() } : {}),
      },
    });

    return NextResponse.json(flag);
  } catch (error) {
    console.error("Error updating flag:", error);
    return NextResponse.json({ error: "Failed to update flag" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ matterId: string; flagId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { matterId, flagId } = await params;

    // Verify flag exists and belongs to this matter
    const existingFlag = await prisma.matterFlag.findFirst({
      where: { id: flagId, matterId },
    });

    if (!existingFlag) {
      return NextResponse.json({ error: "Flag not found" }, { status: 404 });
    }

    await prisma.matterFlag.delete({
      where: { id: flagId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting flag:", error);
    return NextResponse.json({ error: "Failed to delete flag" }, { status: 500 });
  }
}
