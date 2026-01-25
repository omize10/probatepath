import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PDFDocument } from "pdf-lib";
import { getServerAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin/auth";
import { generateP2 } from "@/lib/forms/generate-p2";
import { generateP3 } from "@/lib/forms/generate-p3";
import { generateP5 } from "@/lib/forms/generate-p5";
import { generateP9 } from "@/lib/forms/generate-p9";
import { generateP10 } from "@/lib/forms/generate-p10";
import { mapToEstateData } from "@/lib/forms/data-mapping";
import { HandlerContext, resolveContextParams } from "@/lib/server/params";

// Converts a DOCX buffer to PDF using LibreOffice (if available) or returns empty
async function docxToPdf(docxBuffer: Buffer): Promise<Uint8Array> {
  // For now, we'll use a workaround: generate as DOCX and note that final assembly
  // requires manual conversion. In production, this would use LibreOffice or a conversion service.
  // For this package, we'll return the DOCX content with a note.
  // TODO: Integrate proper DOCX to PDF conversion
  return new Uint8Array(docxBuffer);
}

export async function GET(
  request: NextRequest,
  context: HandlerContext<{ matterId: string }>
) {
  const { matterId } = await resolveContextParams(context);
  const cookieStore = await cookies();
  const opsPass = cookieStore.get("ops_auth")?.value;
  const opsAllowed = opsPass === "1";
  const { session } = await getServerAuth();
  const user = session?.user as { id?: string } | undefined;
  const userId = user?.id;
  const admin = isAdmin(session ?? null);

  if (!userId && !opsAllowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    include: {
      draft: true,
      executors: { orderBy: { orderIndex: "asc" } },
      beneficiaries: true,
      intestateHeirs: true,
      schedules: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }
  if (matter.userId && matter.userId !== userId && !admin && !opsAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const estateData = mapToEstateData(matter);
    const isAdministration = matter.pathType === "administration";

    // Generate all forms as DOCX buffers
    const p2Buffer = await generateP2(estateData);
    const affidavitBuffer = isAdministration
      ? await generateP5(estateData)
      : await generateP3(estateData);
    const p9Buffer = await generateP9(estateData);
    const p10Buffer = await generateP10(estateData);

    // For now, return a ZIP-like response with all DOCX files
    // In production, these would be converted to PDF and merged
    // Since we can't easily merge DOCX to PDF without LibreOffice, we'll return
    // a JSON response with download links to individual forms

    const affidavitFormId = isAdministration ? "P5" : "P3";
    const packageType = isAdministration ? "administration" : "probate";

    const response = {
      message: `Filing package for ${packageType} case. Download individual forms below.`,
      pathType: matter.pathType,
      forms: [
        { id: "P2", name: "Submission for Estate Grant", url: `/api/forms/generated/P2/${matterId}?download=1` },
        {
          id: affidavitFormId,
          name: isAdministration ? "Affidavit for Administration" : "Affidavit of Applicant",
          url: `/api/forms/generated/${affidavitFormId}/${matterId}?download=1`,
        },
        { id: "P9", name: "Affidavit of Delivery", url: `/api/forms/generated/P9/${matterId}?download=1` },
        { id: "P10", name: "Assets and Liabilities", url: `/api/forms/generated/P10/${matterId}?download=1` },
      ],
      note: "Download each form individually. DOCX files can be printed or converted to PDF for filing.",
    };

    await logAudit({
      matterId: matter.id,
      actorId: userId ?? "ops-user",
      action: `package.filing.${packageType}`,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error generating filing package:", error);
    return NextResponse.json(
      { error: "Failed to generate filing package", details: error.message },
      { status: 500 }
    );
  }
}
