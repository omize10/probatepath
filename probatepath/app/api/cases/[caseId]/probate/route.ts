import { NextResponse } from "next/server";
import { requirePortalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markProbateFiled } from "@/lib/cases";

function parseDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request: Request, { params }: { params: { caseId: string } }) {
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id;
  const caseId = params.caseId;

  if (!userId || !caseId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matter = await prisma.matter.findFirst({ where: { id: caseId, userId }, select: { id: true } });
  if (!matter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const filedAt = parseDate((body as { filedAt?: string }).filedAt) ?? new Date();

  await markProbateFiled({ caseId, filedAt, portalStatus: "waiting_for_grant" });

  return NextResponse.json({ ok: true, filedAt });
}
