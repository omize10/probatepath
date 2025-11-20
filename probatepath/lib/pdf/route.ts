import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { HandlerContext, resolveContextParams } from "@/lib/server/params";
import { getServerAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { renderForm, type FormId } from "@/lib/pdf/forms";
import { sendPdfResponse } from "@/lib/pdf/response";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import type { IntakeDraft } from "@/lib/intake/types";

async function handleFormRequest(
  formId: FormId,
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

  const matter = await prisma.matter.findFirst({
    where: { id: matterId, userId },
    include: {
      willSearch: true,
      draft: true,
      executors: { orderBy: { orderIndex: "asc" } },
      beneficiaries: true,
    },
  });
  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }

  let pdfBytes: Uint8Array;
  let intakeDraft: IntakeDraft | undefined;
  if (matter.draft) {
    intakeDraft = formatIntakeDraftRecord(matter.draft);
  }

  if (formId === "will-search") {
    const willSearch = matter.willSearch?.[0];
    if (!willSearch) {
      return NextResponse.json({ error: "Will search data missing" }, { status: 404 });
    }
    pdfBytes = await renderForm(formId, { willSearch, intakeDraft, matter });
  } else {
    pdfBytes = await renderForm(formId, { intakeDraft, matter });
  }

  await logAudit({ matterId, actorId: userId, action: `form.${formId}.pdf` });
  return sendPdfResponse(pdfBytes, request, `${formId}.pdf`);
}

export { handleFormRequest };
