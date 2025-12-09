import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { savePdfToUploads } from "@/lib/uploads";
import { updatePortalState } from "@/lib/cases";

type UploadKind = "will_search" | "p1_notice" | "p1_packet" | "probate_package";

function mapKindToField(kind: UploadKind) {
  if (kind === "will_search") return "willSearchPdfUrl" as const;
  if (kind === "p1_notice") return "p1NoticePdfUrl" as const;
  if (kind === "p1_packet") return "p1PacketPdfUrl" as const;
  if (kind === "probate_package") return "probatePackagePdfUrl" as const;
  return null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ caseId: string }> }) {
  try {
    const store = await cookies();
    const hasOps = store.get("ops_auth")?.value === "1";

    if (!hasOps) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = await params;
    const matterId = caseId;
    if (!matterId) {
      console.error("Upload failed: missing caseId param", { params });
      return NextResponse.json({ error: "Missing caseId param" }, { status: 400 });
    }
    const formData = await request.formData();
    const kind = formData.get("kind")?.toString() as UploadKind | undefined;
    const file = formData.get("file");

    if (!kind || !file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file or kind" }, { status: 400 });
    }

    const field = mapKindToField(kind);
    if (!field) {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }

    console.log("Upload attempt", { matterId, kind });
    const record = await prisma.matter.findFirst({ where: { id: matterId } });
    if (!record) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const saved = await savePdfToUploads(matterId, kind, file);
    await updatePortalState(matterId, { [field]: saved.url } as any);

    revalidatePath("/ops");
    revalidatePath(`/ops/cases/${matterId}`);
    revalidatePath("/portal");

    return NextResponse.json({ ok: true, url: saved.url });
  } catch (err: any) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}
