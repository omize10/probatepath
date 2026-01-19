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

    if (!prismaEnabled) {
      return NextResponse.json({ success: true, estateId: "mock-estate-id" });
    }

    // Get callback with related data
    const callback = await prisma.callbackSchedule.findUnique({
      where: { id },
      include: {
        user: true,
        tierSelection: true,
        retellIntake: true,
      },
    });

    if (!callback) {
      return NextResponse.json({ error: "Callback not found" }, { status: 404 });
    }

    if (!callback.retellIntake) {
      return NextResponse.json(
        { error: "No intake data available" },
        { status: 400 }
      );
    }

    if (callback.retellIntake.pushedToEstate) {
      return NextResponse.json(
        { error: "Intake data already pushed to estate" },
        { status: 400 }
      );
    }

    // Parse the intake data
    const intakeData = callback.retellIntake.intakeData as Record<string, unknown>;

    // Generate a unique client key
    const clientKey = `PP-${Date.now().toString(36).toUpperCase()}`;

    // Create a new Matter (estate record)
    const matter = await prisma.matter.create({
      data: {
        userId: callback.userId,
        clientKey,
        status: "INTAKE",
        portalStatus: "intake_complete",
      },
    });

    // If we have deceased info, create the intake draft
    const deceased = intakeData.deceased as Record<string, unknown> | undefined;
    const executor = intakeData.executor as Record<string, unknown> | undefined;
    const will = intakeData.will as Record<string, unknown> | undefined;

    if (deceased || executor) {
      await prisma.intakeDraft.create({
        data: {
          matterId: matter.id,
          email: callback.user.email,
          consent: true,
          exFullName: executor?.fullName as string || callback.user.name || "",
          exPhone: executor?.phone as string || callback.phoneNumber,
          exCity: executor?.city as string || "",
          exRelation: executor?.relationship as string || "executor",
          decFullName: deceased?.fullName as string || "",
          decDateOfDeath: deceased?.dateOfDeath
            ? new Date(deceased.dateOfDeath as string)
            : new Date(),
          decCityProv: deceased?.city
            ? `${deceased.city}, ${deceased.province || "BC"}`
            : "",
          hadWill: will?.hasOriginal as boolean ?? true,
          willLocation: "with_executor",
          estateValueRange: "unknown",
          anyRealProperty: false,
          multipleBeneficiaries: false,
          payload: intakeData as any,
        },
      });
    }

    // Update retell intake to mark as pushed
    await prisma.retellIntake.update({
      where: { id: callback.retellIntake.id },
      data: {
        pushedToEstate: true,
        estateId: matter.id,
      },
    });

    // Update callback status
    await prisma.callbackSchedule.update({
      where: { id },
      data: {
        status: "intake_complete",
      },
    });

    return NextResponse.json({
      success: true,
      estateId: matter.id,
      clientKey: matter.clientKey,
    });
  } catch (error) {
    console.error("[api/ops/callbacks/push-intake] Error:", error);
    return NextResponse.json(
      { error: "Failed to push intake data" },
      { status: 500 }
    );
  }
}
