import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { getSupabaseServiceClient } from "@/lib/supabase";
import sharp from "sharp";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
];

async function processImage(buffer: Buffer, contentType: string): Promise<{
  processed: Buffer;
  thumbnail: Buffer;
  qualityScore: number;
  warnings: string[];
}> {
  const warnings: string[] = [];
  let qualityScore = 100;

  // Get image metadata
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const minDimension = Math.min(width, height);

  // Check quality based on dimensions
  if (minDimension < 500) {
    warnings.push("Image resolution is very low - text may be hard to read");
    qualityScore = 30;
  } else if (minDimension < 1000) {
    warnings.push("Image resolution is below recommended - consider rescanning");
    qualityScore = 60;
  } else if (minDimension < 1500) {
    qualityScore = 85;
  }

  // Process the image: normalize, enhance contrast, sharpen
  const processed = await sharp(buffer)
    .normalize() // Normalize contrast
    .sharpen({ sigma: 1.0 }) // Sharpen text
    .modulate({ brightness: 1.05 }) // Slight brightness boost
    .jpeg({ quality: 90 }) // Convert to JPEG for consistency
    .toBuffer();

  // Generate thumbnail
  const thumbnail = await sharp(buffer)
    .resize(200, 200, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();

  return { processed, thumbnail, qualityScore, warnings };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const callbackScheduleId = formData.get("callbackScheduleId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!callbackScheduleId) {
      return NextResponse.json({ error: "Callback schedule ID is required" }, { status: 400 });
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Accepted: PDF, JPG, PNG, HEIC" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const basePath = `${userId}/${callbackScheduleId}`;

    let originalUrl = "";
    let processedUrl: string | undefined;
    let thumbnailUrl: string | undefined;
    let qualityScore: number | undefined;
    let qualityWarnings: string[] = [];
    let fileType: "pdf" | "image" = "pdf";

    const supabase = getSupabaseServiceClient();
    const bucket = "will-uploads";

    if (file.type === "application/pdf") {
      // PDF: upload as-is
      fileType = "pdf";
      const path = `${basePath}/original_${timestamp}_${sanitizedFilename}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType: "application/pdf",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      originalUrl = urlData.publicUrl;
      qualityScore = 100;
    } else {
      // Image: process and create thumbnail
      fileType = "image";

      // Handle HEIC conversion
      let imageBuffer: Buffer = buffer;
      if (file.type === "image/heic" || file.type === "image/heif") {
        try {
          // Sharp can handle HEIC with the right libraries installed
          imageBuffer = await sharp(buffer).jpeg().toBuffer() as Buffer;
        } catch {
          return NextResponse.json(
            { error: "Failed to convert HEIC image. Please convert to JPG first." },
            { status: 400 }
          );
        }
      }

      // Process the image
      const result = await processImage(imageBuffer, file.type);
      qualityScore = result.qualityScore;
      qualityWarnings = result.warnings;

      // Upload original
      const originalPath = `${basePath}/original_${timestamp}_${sanitizedFilename}`;
      const { error: origError } = await supabase.storage
        .from(bucket)
        .upload(originalPath, buffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (origError) {
        console.error("Original upload error:", origError);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
      }

      const { data: origUrlData } = supabase.storage.from(bucket).getPublicUrl(originalPath);
      originalUrl = origUrlData.publicUrl;

      // Upload processed
      const processedPath = `${basePath}/processed_${timestamp}.jpg`;
      const { error: procError } = await supabase.storage
        .from(bucket)
        .upload(processedPath, result.processed, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: false,
        });

      if (!procError) {
        const { data: procUrlData } = supabase.storage.from(bucket).getPublicUrl(processedPath);
        processedUrl = procUrlData.publicUrl;
      }

      // Upload thumbnail
      const thumbPath = `${basePath}/thumb_${timestamp}.jpg`;
      const { error: thumbError } = await supabase.storage
        .from(bucket)
        .upload(thumbPath, result.thumbnail, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: false,
        });

      if (!thumbError) {
        const { data: thumbUrlData } = supabase.storage.from(bucket).getPublicUrl(thumbPath);
        thumbnailUrl = thumbUrlData.publicUrl;
      }
    }

    // Save to database
    if (prismaEnabled) {
      const willUpload = await prisma.callbackWillUpload.create({
        data: {
          userId,
          callbackScheduleId,
          filename: file.name,
          fileType,
          originalUrl,
          processedUrl,
          thumbnailUrl,
          qualityScore,
          qualityWarnings,
          fileSize: file.size,
        },
      });

      return NextResponse.json({
        document: {
          id: willUpload.id,
          filename: willUpload.filename,
          fileType: willUpload.fileType,
          originalUrl: willUpload.originalUrl,
          processedUrl: willUpload.processedUrl,
          thumbnailUrl: willUpload.thumbnailUrl,
          qualityScore: willUpload.qualityScore,
          qualityWarnings: willUpload.qualityWarnings,
          fileSize: willUpload.fileSize,
        },
      });
    }

    return NextResponse.json({
      document: {
        id: `mock-${timestamp}`,
        filename: file.name,
        fileType,
        originalUrl,
        processedUrl,
        thumbnailUrl,
        qualityScore,
        qualityWarnings,
        fileSize: file.size,
      },
    });
  } catch (error) {
    console.error("[api/will/upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    if (!prismaEnabled) {
      return NextResponse.json({ success: true });
    }

    // Verify ownership and get file URLs
    const willUpload = await prisma.callbackWillUpload.findFirst({
      where: { id, userId },
    });

    if (!willUpload) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from Supabase storage
    const supabase = getSupabaseServiceClient();
    const bucket = "will-uploads";

    // Extract paths from URLs and delete files
    const urlsToDelete = [
      willUpload.originalUrl,
      willUpload.processedUrl,
      willUpload.thumbnailUrl,
    ].filter(Boolean);

    for (const url of urlsToDelete) {
      if (url) {
        // Extract path from public URL
        const pathMatch = url.match(/will-uploads\/(.+)$/);
        if (pathMatch) {
          await supabase.storage.from(bucket).remove([pathMatch[1]]);
        }
      }
    }

    // Delete from database
    await prisma.callbackWillUpload.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/will/upload] DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
