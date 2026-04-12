import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getIp, getUA } from "@/lib/audit";
import { uploadFileToBucket } from "@/lib/supabase";

const BUCKET = "will-uploads";
const maxSizeMb = Number(process.env.MAX_FILE_SIZE_MB ?? "10") || 10;
const MAX_SIZE = maxSizeMb * 1024 * 1024;
const retentionDays = Number(process.env.AUTO_DELETE_UPLOADS_AFTER_DAYS ?? "90") || 90;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const mime = file.type;
    const isPdf = mime === "application/pdf";
    const allowedImages = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const isImage = allowedImages.includes(mime);
    if (!isPdf && !isImage) {
      return NextResponse.json({ error: "Only PDF, JPG, or PNG files are supported." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File must be smaller than ${maxSizeMb}MB.` }, { status: 400 });
    }

    // Magic-byte sniff so a renamed .exe / HTML can't pose as a PDF/image.
    const arrayBuffer = await file.arrayBuffer();
    const head = new Uint8Array(arrayBuffer.slice(0, 12));
    const startsWith = (sig: number[]) => sig.every((b, i) => head[i] === b);
    const isRealPdf = startsWith([0x25, 0x50, 0x44, 0x46]); // %PDF
    const isJpeg = startsWith([0xff, 0xd8, 0xff]);
    const isPng = startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const isWebp = startsWith([0x52, 0x49, 0x46, 0x46]) && head[8] === 0x57 && head[9] === 0x45;
    if (isPdf && !isRealPdf) {
      return NextResponse.json({ error: "File is not a valid PDF." }, { status: 400 });
    }
    if (isImage && !(isJpeg || isPng || isWebp)) {
      return NextResponse.json({ error: "File is not a valid image." }, { status: 400 });
    }

    // Slugify file name to defeat path traversal / HTML execution from
    // user-supplied names.
    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "upload";
    const path = `${userId}/${Date.now()}-${safeName}`;
    const { data, error } = await uploadFileToBucket({
      bucket: BUCKET,
      path,
      content: arrayBuffer,
      contentType: mime,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    const upload = await prisma.willUpload.create({
      data: {
        userId,
        fileName: file.name,
        fileType: isPdf ? "pdf" : "image",
        fileSize: file.size,
        storagePath: data?.path ?? path,
        uploadedAt: new Date(),
        expiresAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "will_upload",
        resourceType: "will_upload",
        resourceId: upload.id,
        metadata: { fileType: upload.fileType, fileName: upload.fileName, size: upload.fileSize },
        ipAddress: getIp(req) ?? null,
        userAgent: getUA(req) ?? null,
      },
    });

    return NextResponse.json({ uploadId: upload.id });
  } catch {
    return NextResponse.json({ error: "Unable to upload file." }, { status: 500 });
  }
}
