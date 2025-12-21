import { NextRequest, NextResponse } from "next/server";
import { requirePortalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markWillSearchMailed } from "@/lib/cases";
import { scheduleWillSearchReminder } from "@/lib/reminders";

function parseDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id;
  const { caseId } = await context.params;

  if (!userId || !caseId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matter = await prisma.matter.findFirst({ where: { id: caseId, userId }, select: { id: true } });
  if (!matter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const mailedAt = parseDate((body as { mailedAt?: string }).mailedAt) ?? new Date();

  await markWillSearchMailed({ caseId, mailedAt, portalStatus: "will_search_sent" });
  await scheduleWillSearchReminder({ caseId, mailedAt });

  return NextResponse.json({ ok: true, mailedAt });
}
