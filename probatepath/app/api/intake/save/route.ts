import { NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { getServerAuth } from "@/lib/auth";
import { logAudit, logSecurityAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const { session } = await getServerAuth();
  if (!session || !(session.user && (session.user as any).id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { matterId, payload } = body ?? {};
  if (!matterId) return NextResponse.json({ error: "Missing matterId" }, { status: 400 });

  try {
    const matter = await prisma.matter.findUnique({ where: { id: matterId } });
    if (!matter) return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    if (matter.userId && matter.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const now = new Date();
    const up = await prisma.intakeDraft.upsert({
      where: { matterId },
      create: {
        matterId,
        email: payload?.welcome?.email ?? "",
        consent: Boolean(payload?.welcome?.consent ?? false),
        exFullName: payload?.executor?.fullName ?? "",
        exPhone: payload?.executor?.phone ?? null,
        exCity: payload?.executor?.city ?? "",
        exRelation: payload?.executor?.relation ?? "",
        decFullName: payload?.deceased?.fullName ?? "",
        decDateOfDeath: payload?.deceased?.dateOfDeath ? new Date(payload.deceased.dateOfDeath) : new Date(),
        decCityProv: payload?.deceased?.city ?? "",
        hadWill: payload?.deceased?.hadWill === "yes" || payload?.deceased?.hadWill === true,
        willLocation: payload?.will?.willLocation ?? "",
        estateValueRange: payload?.will?.estateValueRange ?? "",
        anyRealProperty: Boolean(payload?.will?.anyRealProperty ?? false),
        multipleBeneficiaries: Boolean(payload?.will?.multipleBeneficiaries ?? false),
        specialCircumstances: payload?.will?.specialCircumstances ?? null,
        payload: payload ?? {},
        updatedAt: now,
      } as any,
      update: {
        payload: payload ?? {},
        updatedAt: now,
      } as any,
    });

    // matter-scoped audit
    await logAudit({ matterId: up.matterId, action: "INTAKE_SAVE", actorId: userId });
    // security audit
    await logSecurityAudit({ userId, matterId: up.matterId, action: "intake.save", meta: { matterId } });

    return NextResponse.json({ persisted: true, updatedAt: up.updatedAt });
  } catch (err: any) {
    // handle DB down gracefully
    console.warn("[intake.save] failed", err?.message ?? err);
    return NextResponse.json({ persisted: false }, { status: 200 });
  }
}
