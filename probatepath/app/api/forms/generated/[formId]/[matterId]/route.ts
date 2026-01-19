import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin/auth";
import { generateForm } from "@/lib/forms/generator";
import { HandlerContext, resolveContextParams } from "@/lib/server/params";

export async function GET(
  request: NextRequest,
  context: HandlerContext<{ formId: string; matterId: string }>
) {
  try {
    const { formId, matterId } = await resolveContextParams(context);

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

    // Generate PDF using Puppeteer
    const pdfBytes = await generateForm(formId.toUpperCase(), matter);

    // Return PDF
    const downloadParam = request.nextUrl.searchParams.get("download");
    const disposition = downloadParam === "1" ? "attachment" : "inline";

    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${formId}-generated.pdf"`,
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
