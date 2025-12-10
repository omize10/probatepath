import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestClientInfo } from "@/lib/auth/request-info";

export async function POST() {
  try {
    // Get session if exists (optional for disclaimer)
    const session = await auth();
    const userId = session?.user?.id ?? null;

    // Get client info
    const { ip, userAgent } = await getRequestClientInfo();

    // Create disclaimer acceptance record
    await prisma.disclaimerAcceptance.create({
      data: {
        userId: userId ?? undefined,
        disclaimerType: "will_upload",
        ipAddress: ip ?? undefined,
        userAgent: userAgent ?? undefined,
      },
    });

    // Log to audit log
    await prisma.auditLog.create({
      data: {
        userId: userId ?? undefined,
        action: "accepted_will_upload_disclaimer",
        resourceType: "disclaimer",
        resourceId: null,
        ip: ip ?? undefined,
        ua: userAgent ?? undefined,
        meta: {
          disclaimerType: "will_upload",
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Disclaimer acceptance error:", error);
    return NextResponse.json(
      { error: "Failed to record disclaimer acceptance" },
      { status: 500 }
    );
  }
}
