import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = [
  "intake_complete",
  "will_search_prepping",
  "will_search_ready",
  "will_search_sent",
  "notices_in_progress",
  "notices_waiting_21_days",
  "probate_package_prepping",
  "probate_package_ready",
  "probate_filing_ready",
  "probate_filing_in_progress",
  "probate_filed",
  "waiting_for_grant",
  "grant_complete",
  "post_grant_active",
  "estate_closeout",
  "done",
];

export async function POST(request: Request) {
  try {
    const { matterId, status } = await request.json();

    if (!matterId || !status) {
      return NextResponse.json(
        { error: "Matter ID and status are required" },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status", validStatuses: VALID_STATUSES },
        { status: 400 }
      );
    }

    // Find the matter
    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
    });

    if (!matter) {
      return NextResponse.json(
        { error: "Case not found", matterId },
        { status: 404 }
      );
    }

    const previousStatus = matter.portalStatus;

    // Update the status
    const updated = await prisma.matter.update({
      where: { id: matterId },
      data: { portalStatus: status },
    });

    return NextResponse.json({
      success: true,
      message: `Status updated from ${previousStatus} to ${status}`,
      matterId,
      previousStatus,
      newStatus: status,
    });
  } catch (error) {
    console.error("[dev/set-status] Error:", error);
    return NextResponse.json(
      { error: "Failed to update status", details: String(error) },
      { status: 500 }
    );
  }
}
