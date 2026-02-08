import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin/auth";
import { generateNotaryCoverLetter, generateCourtCoverLetter, generateFilingChecklist } from "@/lib/forms/generate-cover-letters";
import { mapToEstateData } from "@/lib/forms/data-mapping";
import { HandlerContext, resolveContextParams } from "@/lib/server/params";
import { generateForm, transformEstateData, isFormAvailable } from "@/lib/forms-new/integration";

// Cover letters still use DOCX (not PDF)
const DOCX_FORMS = new Set(["NOTARY-COVER", "COURT-COVER", "FILING-CHECKLIST"]);

export async function GET(
  request: NextRequest,
  context: HandlerContext<{ formId: string; matterId: string }>
) {
  try {
    const { formId, matterId } = await resolveContextParams(context);
    const formIdUpper = formId.toUpperCase();

    // Auth check
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

    // Fetch matter with all relations
    const matter = await prisma.matter.findFirst({
      where: admin || opsAllowed ? { id: matterId } : { id: matterId, userId },
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

    const downloadParam = request.nextUrl.searchParams.get("download");
    const disposition = downloadParam === "1" ? "attachment" : "inline";

    // Use new PDF generators for ALL probate forms (P1-P46)
    if (isFormAvailable(formIdUpper)) {
      const oldEstateData = mapToEstateData(matter);
      const estateData = transformEstateData(oldEstateData);

      // Track missing data for warning headers
      const missingData: string[] = [];
      if (estateData.applicants.length === 0) missingData.push("applicant");
      if (!estateData.deceased.firstName) missingData.push("deceased name");

      const pdf = await generateForm(formIdUpper, estateData);
      const lastName = estateData.deceased.lastName || "Estate";
      const filename = `${formIdUpper}-${lastName}.pdf`;

      const responseHeaders: Record<string, string> = {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${filename}"`,
      };
      if (missingData.length > 0) {
        responseHeaders["X-Missing-Data"] = missingData.join(", ");
      }

      return new Response(new Uint8Array(pdf), {
        headers: responseHeaders,
      });
    }

    // Cover letters still use DOCX
    if (DOCX_FORMS.has(formIdUpper)) {
      const estateData = mapToEstateData(matter);
      let buffer: Buffer;
      let filename: string;
      const lastName = estateData.deceased.lastName || "Estate";

      switch (formIdUpper) {
        case "NOTARY-COVER":
          buffer = await generateNotaryCoverLetter(estateData);
          filename = `Notary-Cover-Letter-${lastName}.docx`;
          break;
        case "COURT-COVER":
          buffer = await generateCourtCoverLetter(estateData);
          filename = `Court-Cover-Letter-${lastName}.docx`;
          break;
        case "FILING-CHECKLIST":
          buffer = await generateFilingChecklist(estateData);
          filename = `Filing-Checklist-${lastName}.docx`;
          break;
        default:
          return NextResponse.json({ error: "Unknown form type" }, { status: 400 });
      }

      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `${disposition}; filename="${filename}"`,
        },
      });
    }

    // Form not available
    return NextResponse.json(
      { 
        error: "Form Not Available", 
        message: `Form ${formIdUpper} is not available.`,
        availableForms: Object.keys(isFormAvailable).filter(f => isFormAvailable(f))
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Error generating form:", error);
    return NextResponse.json(
      { error: "Failed to generate form", details: error.message },
      { status: 500 }
    );
  }
}
