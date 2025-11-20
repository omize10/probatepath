import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { getServerAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { renderSchedulePdf } from "@/lib/schedules/pdf";
import { HandlerContext, resolveContextParams } from "@/lib/server/params";
import { renderForm, type FormId } from "@/lib/pdf/forms";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import type { IntakeDraft } from "@/lib/intake/types";

const PHASE_ONE_FORMS: FormId[] = ["p1", "will-search"];

export async function GET(
  request: NextRequest,
  context: HandlerContext<{ matterId: string }>,
) {
  const { matterId } = await resolveContextParams(context);
  const { session } = await getServerAuth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = user.id;

  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    include: {
      draft: true,
      willSearch: true,
      executors: { orderBy: { orderIndex: "asc" } },
      beneficiaries: true,
      schedules: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }
  if (matter.userId && matter.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let intakeDraft: IntakeDraft | undefined;
  if (matter.draft) {
    intakeDraft = formatIntakeDraftRecord(matter.draft);
  }
  const willSearchRecord = matter.willSearch?.[0] ?? null;

  const combined = await PDFDocument.create();

  for (const formId of PHASE_ONE_FORMS) {
    if (formId === "will-search" && !willSearchRecord) {
      continue;
    }
    const formBytes = await renderForm(formId, {
      intakeDraft,
      willSearch: formId === "will-search" ? willSearchRecord ?? undefined : undefined,
      matter,
    });
    const formDoc = await PDFDocument.load(formBytes);
    const pageIndices = formId === "will-search" ? [0] : formDoc.getPageIndices();
    const pages = await combined.copyPages(formDoc, pageIndices);
    pages.forEach((page) => combined.addPage(page));
  }

  for (const schedule of matter.schedules) {
    const scheduleBytes = await renderSchedulePdf(schedule);
    const scheduleDoc = await PDFDocument.load(scheduleBytes);
    const pages = await combined.copyPages(scheduleDoc, scheduleDoc.getPageIndices());
    pages.forEach((page) => combined.addPage(page));
  }

  const outputBuffer = Buffer.from(await combined.save());
  await logAudit({ matterId: matter.id, actorId: userId, action: "package.phase1.pdf" });

  return new Response(outputBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="probatepath-phase1-package.pdf"',
    },
  });
}
