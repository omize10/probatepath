import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import { join } from "path";
import { getServerAuth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import { generateP1CoverLetterPdf } from "@/lib/pdf/p1CoverLetter";
import { buildP1PrintPacket } from "@/lib/pdf/mergeP1Packet";

async function fetchPdfBuffer(url: string): Promise<Uint8Array> {
  // local file served from /public
  if (url.startsWith("/")) {
    const filePath = join(process.cwd(), "public", url);
    const buf = await fs.readFile(filePath);
    return new Uint8Array(buf);
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch PDF: ${res.statusText}`);
  }
  const array = await res.arrayBuffer();
  return new Uint8Array(array);
}

export async function GET(_: Request, { params }: { params: { matterId: string } }) {
  const { matterId } = params;
  const cookieStore = await cookies();
  const opsAllowed = cookieStore.get("ops_auth")?.value === "1";

  const { session } = await getServerAuth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const admin = isAdmin(session ?? null);

  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    include: { draft: true, user: true },
  });

  if (!matter) {
    return NextResponse.json({ error: "Matter not found" }, { status: 404 });
  }

  if (matter.userId && matter.userId !== userId && !admin && !opsAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const packetUrl = matter.p1PacketPdfUrl ?? matter.p1NoticePdfUrl;
  if (!packetUrl) {
    return NextResponse.json({ error: "P1 notice PDF not uploaded yet" }, { status: 400 });
  }

  try {
    const p1Buffer = await fetchPdfBuffer(packetUrl);
    const coverBuffer = await generateP1CoverLetterPdf({ matter });
    const packet = await buildP1PrintPacket(p1Buffer, coverBuffer);

    return new NextResponse(Buffer.from(packet), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="p1-print-packet-${matter.caseCode ?? matter.id}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unable to build packet" }, { status: 500 });
  }
}
