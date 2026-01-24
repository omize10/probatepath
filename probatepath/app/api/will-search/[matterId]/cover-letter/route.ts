import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { generateWillSearchCoverLetterPdf, type CaseForWillSearchCover } from "@/lib/pdf/willSearchCoverLetter";

export async function GET(
  request: Request,
  context: { params: Promise<{ matterId: string }> }
) {
  const { session } = await getServerAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matterId } = await context.params;

  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    include: { draft: true },
  });

  if (!matter || (matter.userId && matter.userId !== session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pdfBytes = await generateWillSearchCoverLetterPdf({ matter: matter as unknown as CaseForWillSearchCover["matter"] });

  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": download
        ? `attachment; filename="will-search-cover-letter-${matterId}.pdf"`
        : "inline",
    },
  });
}
