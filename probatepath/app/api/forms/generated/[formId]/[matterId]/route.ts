import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin/auth";
import { generateForm } from "@/lib/forms/generator";
// New PDF-based form generators (pixel-perfect court forms)
import {
  generateP1,
  generateP2,
  generateP3,
  generateP5,
  generateP9,
  generateP10,
  transformEstateData,
} from "@/lib/forms-new";
import { generateNotaryCoverLetter, generateCourtCoverLetter, generateFilingChecklist } from "@/lib/forms/generate-cover-letters";
import { mapToEstateData } from "@/lib/forms/data-mapping";
import { HandlerContext, resolveContextParams } from "@/lib/server/params";

// Forms that use the new PDF generator (pixel-perfect court forms)
const PDF_FORMS = new Set(["P1", "P2", "P3", "P5", "P9", "P10"]);
// Cover letters still use DOCX
const DOCX_FORMS = new Set(["NOTARY-COVER", "COURT-COVER", "FILING-CHECKLIST"]);

// Forms that are coming soon (not yet implemented)
const COMING_SOON_FORMS = new Set(["P4", "P6", "P7", "P8", "P11", "P16", "P17", "P20", "P22", "P23", "P25"]);

// Form names for coming soon message
const FORM_NAMES: Record<string, string> = {
  P4: "Affidavit of Applicant (Long Form)",
  P6: "Ancillary Grant Application",
  P7: "Ancillary Grant Affidavit",
  P8: "Renunciation by Person Entitled to Apply",
  P11: "Assets & Liabilities (Non-Domiciled)",
  P16: "Affidavit of Translator",
  P17: "Renunciation / Consent",
  P20: "Affidavit of Condition of Will",
  P22: "Certificate of Pending Litigation",
  P23: "Statutory Declaration",
  P25: "Appointment of Lawyer",
};

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

    // Check if form is coming soon
    if (COMING_SOON_FORMS.has(formIdUpper)) {
      const formName = FORM_NAMES[formIdUpper] || formIdUpper;
      return NextResponse.json(
        {
          error: "Coming Soon",
          message: `Form ${formIdUpper} (${formName}) is not yet available. This form will be implemented in a future update.`,
          formId: formIdUpper,
          formName,
          status: "coming_soon",
        },
        { status: 501 }
      );
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

    // Use new PDF generators for court forms (P1-P10)
    if (PDF_FORMS.has(formIdUpper)) {
      const oldEstateData = mapToEstateData(matter);
      const estateData = transformEstateData(oldEstateData);

      // Track missing data for warning headers
      const missingData: string[] = [];
      if (estateData.applicants.length === 0) missingData.push("applicant");
      if (!estateData.deceased.firstName) missingData.push("deceased name");

      let buffer: Buffer;
      let filename: string;
      const lastName = estateData.deceased.lastName || "Estate";

      switch (formIdUpper) {
        case "P1":
          buffer = await generateP1(estateData);
          filename = `P1-Notice-${lastName}.pdf`;
          break;
        case "P2":
          buffer = await generateP2(estateData);
          filename = `P2-Submission-${lastName}.pdf`;
          break;
        case "P3":
          buffer = await generateP3({ ...estateData, applicantIndex: 0 });
          filename = `P3-Affidavit-${lastName}.pdf`;
          break;
        case "P5":
          buffer = await generateP5({ ...estateData, applicantIndex: 0 });
          filename = `P5-Administration-Affidavit-${lastName}.pdf`;
          break;
        case "P9":
          buffer = await generateP9({ ...estateData, applicantIndex: 0, affidavitNumber: 2 });
          filename = `P9-Delivery-${lastName}.pdf`;
          break;
        case "P10":
          buffer = await generateP10({ ...estateData, applicantIndex: 0, affidavitNumber: 3 });
          filename = `P10-Assets-${lastName}.pdf`;
          break;
        default:
          return NextResponse.json({ error: "Unknown form type" }, { status: 400 });
      }

      const responseHeaders: Record<string, string> = {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${filename}"`,
      };
      if (missingData.length > 0) {
        responseHeaders["X-Missing-Data"] = missingData.join(", ");
      }

      return new Response(new Uint8Array(buffer), {
        headers: responseHeaders,
      });
    }

    // Cover letters and checklists still use DOCX
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

    // Fallback to old Puppeteer PDF generator for other forms (P4, P5, P11, etc.)
    const pdfBytes = await generateForm(formIdUpper, matter);

    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${formIdUpper}-generated.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating form:", error);
    return NextResponse.json(
      { error: "Failed to generate form", details: error.message },
      { status: 500 }
    );
  }
}
