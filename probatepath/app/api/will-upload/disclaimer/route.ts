import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getIp, getUA } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id ?? null;

    const ipAddress = getIp(req);
    const userAgent = getUA(req);

    const acceptance = await prisma.disclaimerAcceptance.create({
      data: {
        userId,
        disclaimerType: "will_upload",
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "accepted_will_upload_disclaimer",
        resourceType: "disclaimer",
        resourceId: acceptance.id,
        metadata: { disclaimerType: "will_upload" },
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to record acceptance." }, { status: 500 });
  }
}
