import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_PDF_TYPES,
  WILL_FILE_LIMITS,
  checkImageResolution,
  sanitizeFilename,
  validateImageFile,
  validateImageSelection,
  validatePdfFile,
  validatePdfSelection,
  type ImageDimensions,
  type ResolutionCheck,
  type StoredWillFile,
  type WillFileKind,
} from "./will-storage.base";

export {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_PDF_TYPES,
  WILL_FILE_LIMITS,
  checkImageResolution,
  sanitizeFilename,
  validateImageFile,
  validateImageSelection,
  validatePdfFile,
  validatePdfSelection,
};
export type { ImageDimensions, ResolutionCheck, WillFileKind, StoredWillFile };

export async function measureImageDimensions(file: File): Promise<ImageDimensions> {
  if (typeof window !== "undefined") {
    throw new Error("measureImageDimensions (server) must run on the server");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const sharp = await import("sharp");
  const metadata = await sharp.default(buffer).metadata();
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

export async function uploadWillFile(params: { matterId: string; file: File; kind: WillFileKind }): Promise<StoredWillFile> {
  if (typeof window !== "undefined") {
    throw new Error("uploadWillFile must be called on the server");
  }
  const { matterId, file, kind } = params;
  const supabaseBucket = process.env.WILL_FILES_BUCKET ?? "will-uploads";
  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const key = buildStorageKey(matterId, file.name || "upload");
  const contentType = file.type || (kind === "pdf" ? "application/pdf" : "image/jpeg");
  const buffer = await file.arrayBuffer();

  if (hasSupabase) {
    try {
      const { uploadFileToBucket, getSupabaseServiceClient } = await import("@/lib/supabase");
      const { data, error } = await uploadFileToBucket({
        bucket: supabaseBucket,
        path: key,
        content: buffer,
        contentType,
      });
      if (error) {
        throw error;
      }
      const supabase = getSupabaseServiceClient();
      const publicUrl = supabase.storage.from(supabaseBucket).getPublicUrl(data?.path ?? key)?.data?.publicUrl ?? key;
      return {
        path: data?.path ?? key,
        url: publicUrl,
        size: file.size,
        contentType,
        originalFilename: file.name,
      };
    } catch (err) {
      // fall back to local storage below
      console.warn("[will-files] Supabase upload failed, falling back to local storage", err);
    }
  }

  // Fallback: store in public/uploads locally so the flow still works in dev or without Supabase env.
  const uploadsRoot = join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsRoot, { recursive: true });
  const filename = key.split("/").pop() ?? `will-${randomUUID()}`;
  const filepath = join(uploadsRoot, filename);
  await fs.writeFile(filepath, Buffer.from(buffer));
  const url = `/uploads/${filename}`;

  return {
    path: filepath,
    url,
    size: file.size,
    contentType,
    originalFilename: file.name,
  };
}

function buildStorageKey(matterId: string, filename: string) {
  const cleanName = sanitizeFilename(filename || "upload");
  return `${matterId}/${Date.now()}-${randomUUID()}-${cleanName}`;
}
