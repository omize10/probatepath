import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { downloadFile } from "@/lib/supabase";
import { extractTextFromPdf, extractTextFromImage } from "@/lib/vision";
import { extractWillData } from "@/lib/claude";
import { getRequestClientInfo } from "@/lib/auth/request-info";

export async function POST(request: NextRequest) {
  try {
    // Require authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { uploadId } = body;

    if (!uploadId || typeof uploadId !== "string") {
      return NextResponse.json({ error: "Invalid uploadId" }, { status: 400 });
    }

    // Look up the upload and verify ownership
    const upload = await prisma.willUpload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    if (upload.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Download the file from Supabase
    const fileBuffer = await downloadFile(upload.storagePath);

    // Extract text using OCR based on file type
    let ocrText: string;
    if (upload.fileType === "pdf") {
      ocrText = await extractTextFromPdf(fileBuffer);
    } else if (upload.fileType === "image") {
      ocrText = await extractTextFromImage(fileBuffer);
    } else {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (!ocrText || ocrText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract any text from the file. Please ensure the image is clear and try again." },
        { status: 400 }
      );
    }

    // Extract structured data using Claude
    const extractedData = await extractWillData(ocrText);

    // Save extraction to database
    const extraction = await prisma.willExtraction.create({
      data: {
        userId,
        uploadId,
        testatorName: extractedData.testatorName,
        willDate: extractedData.willDate,
        executors: extractedData.executors,
        beneficiaries: extractedData.beneficiaries,
        hasCodicils: extractedData.hasCodicils,
        handwrittenChanges: extractedData.handwrittenChanges,
        issues: extractedData.issues,
        rawText: ocrText,
        extractedAt: new Date(),
      },
    });

    // Log to audit
    const { ip, userAgent } = await getRequestClientInfo();
    await prisma.auditLog.create({
      data: {
        userId,
        action: "ai_extracted_will",
        resourceType: "will_extraction",
        resourceId: extraction.id,
        ip: ip ?? undefined,
        ua: userAgent ?? undefined,
        meta: {
          uploadId,
          executorCount: extractedData.executors.length,
          beneficiaryCount: extractedData.beneficiaries.length,
          hasIssues: extractedData.issues.length > 0,
          issueCount: extractedData.issues.length,
        },
      },
    });

    return NextResponse.json({
      extractionId: extraction.id,
      data: extractedData,
    });
  } catch (error) {
    console.error("Will extraction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract will data" },
      { status: 500 }
    );
  }
}
