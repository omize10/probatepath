import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { downloadFileFromBucket } from "@/lib/supabase";
import { extractTextFromImage, extractTextFromPdf } from "@/lib/vision";
import { extractWillData } from "@/lib/claude";
import { getIp, getUA } from "@/lib/audit";

const BUCKET = "will-uploads";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { uploadId } = (await req.json().catch(() => ({}))) as {
      uploadId?: string;
    };
    if (!uploadId) {
      return NextResponse.json({ error: "No upload specified" }, { status: 400 });
    }

    const upload = await prisma.willUpload.findFirst({
      where: { id: uploadId, userId },
    });
    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    const { data, error } = await downloadFileFromBucket(BUCKET, upload.storagePath);
    if (error || !data) {
      return NextResponse.json({ error: "Could not download file from storage." }, { status: 500 });
    }

    const buffer = await data.arrayBuffer();
    const ocrText =
      upload.fileType === "pdf" ? await extractTextFromPdf(buffer) : await extractTextFromImage(buffer);

    const extracted = await extractWillData(ocrText);

    const extraction = await prisma.willExtraction.create({
      data: {
        userId,
        uploadId: upload.id,
        testatorName: extracted.testatorName,
        willDate: extracted.willDate,
        executors: extracted.executors,
        beneficiaries: extracted.beneficiaries,
        hasCodicils: extracted.hasCodicils,
        handwrittenChanges: extracted.handwrittenChanges,
        issues: extracted.issues,
        rawText: ocrText,
        extractedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "ai_extracted_will",
        resourceType: "will_extraction",
        resourceId: extraction.id,
        metadata: {
          uploadId: upload.id,
          issueCount: Array.isArray(extracted.issues) ? extracted.issues.length : 0,
          executorCount: Array.isArray(extracted.executors) ? extracted.executors.length : 0,
          beneficiaryCount: Array.isArray(extracted.beneficiaries) ? extracted.beneficiaries.length : 0,
        },
        ipAddress: getIp(req) ?? null,
        userAgent: getUA(req) ?? null,
      },
    });

    return NextResponse.json({ extractionId: extraction.id, data: extracted });
  } catch {
    return NextResponse.json({ error: "Unable to extract will data." }, { status: 500 });
  }
}
