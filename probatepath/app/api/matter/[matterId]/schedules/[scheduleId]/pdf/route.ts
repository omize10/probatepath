import { NextRequest, NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderSchedulePdf } from "@/lib/schedules/pdf";
import { HandlerContext, resolveContextParams } from "@/lib/server/params";

export async function GET(
  request: NextRequest,
  context: HandlerContext<{ matterId: string; scheduleId: string }>,
) {
  const { matterId, scheduleId } = await resolveContextParams(context);
  const { session } = await getServerAuth();
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const matter = await prisma.matter.findUnique({ where: { id: matterId } });
  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }
  if (matter.userId && matter.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const schedule = await prisma.supplementalSchedule.findFirst({
    where: { id: scheduleId, matterId: matter.id },
  });
  if (!schedule) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  const pdfBytes = await renderSchedulePdf(schedule);
  const body = Buffer.from(pdfBytes);
  const isDownload = request.nextUrl.searchParams.get("download") === "1";
  const disposition = isDownload ? "attachment" : "inline";

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="supplement-${schedule.kind.toLowerCase()}.pdf"`,
    },
  });
}
