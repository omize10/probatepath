import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/supabase";
import { getRequestClientInfo } from "@/lib/auth/request-info";

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB ?? "10", 10);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const AUTO_DELETE_DAYS = parseInt(process.env.AUTO_DELETE_UPLOADS_AFTER_DAYS ?? "90", 10);

const ALLOWED_PDF_TYPES = ["application/pdf"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"];

export async function POST(request: NextRequest) {
  try {
    // Require authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit` },
        { status: 400 }
      );
    }

    // Determine file type
    const mimeType = file.type.toLowerCase();
    let fileType: string;

    if (ALLOWED_PDF_TYPES.includes(mimeType)) {
      fileType = "pdf";
    } else if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      fileType = "image";
    } else {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and images (JPEG, PNG) are allowed." },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to Supabase
    const { storagePath } = await uploadFile({
      fileName: file.name,
      file: arrayBuffer,
      contentType: mimeType,
    });

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + AUTO_DELETE_DAYS);

    // Save to database
    const willUpload = await prisma.willUpload.create({
      data: {
        userId,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        storagePath,
        uploadedAt: new Date(),
        expiresAt,
      },
    });

    // Get client info and log to audit
    const { ip, userAgent } = await getRequestClientInfo();
    await prisma.auditLog.create({
      data: {
        userId,
        action: "will_upload",
        resourceType: "will_upload",
        resourceId: willUpload.id,
        ip: ip ?? undefined,
        ua: userAgent ?? undefined,
        meta: {
          fileName: file.name,
          fileType,
          fileSize: file.size,
        },
      },
    });

    return NextResponse.json({ uploadId: willUpload.id });
  } catch (error) {
    console.error("Will upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}
