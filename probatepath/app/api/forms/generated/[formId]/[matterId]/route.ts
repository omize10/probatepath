import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin/auth";
import { generateForm } from "@/lib/forms/generator";
import { generateP1 } from "@/lib/forms/generate-p1";
import { generateP2 } from "@/lib/forms/generate-p2";
import { generateP3 } from "@/lib/forms/generate-p3";
import { generateP9 } from "@/lib/forms/generate-p9";
import { generateP10 } from "@/lib/forms/generate-p10";
import { mapToEstateData } from "@/lib/forms/data-mapping";
import { HandlerContext, resolveContextParams } from "@/lib/server/params";

// Forms that use the new docx generator
const DOCX_FORMS = new Set(["P1", "P2", "P3", "P9", "P10"]);

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
        schedules: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!matter) {
      return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    }

    const downloadParam = request.nextUrl.searchParams.get("download");
    const disposition = downloadParam === "1" ? "attachment" : "inline";

    // Use new docx generators for supported forms
    if (DOCX_FORMS.has(formIdUpper)) {
      const estateData = mapToEstateData(matter);
      let buffer: Buffer;
      let filename: string;
      const lastName = estateData.deceased.lastName || "Estate";

      switch (formIdUpper) {
        case "P1":
          buffer = await generateP1(estateData);
          filename = `P1-Notice-${lastName}.docx`;
          break;
        case "P2":
          buffer = await generateP2(estateData);
          filename = `P2-Submission-${lastName}.docx`;
          break;
        case "P3":
          buffer = await generateP3(estateData);
          filename = `P3-Affidavit-${lastName}.docx`;
          break;
        case "P9":
          buffer = await generateP9(estateData);
          filename = `P9-Delivery-${lastName}.docx`;
          break;
        case "P10":
          buffer = await generateP10(estateData);
          filename = `P10-Assets-${lastName}.docx`;
          break;
        default:
          return NextResponse.json({ error: "Unknown form type" }, { status: 400 });
      }

      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
