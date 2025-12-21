export type WillFileKind = "pdf" | "image";

export type StoredWillFile = {
  path: string;
  url: string;
  size: number;
  contentType: string;
  originalFilename: string;
};

export type ImageDimensions = {
  width: number;
  height: number;
};

export type ResolutionCheck = {
  ok: boolean;
  error?: string;
  dimensions?: ImageDimensions;
};

export function checkImageResolution(dimensions: ImageDimensions): ResolutionCheck {
  const { width, height } = dimensions;
  if (!width || !height) {
    return { ok: false, error: "Could not read the photo dimensions.", dimensions };
  }
  if (width < WILL_FILE_LIMITS.minImageWidth || height < WILL_FILE_LIMITS.minImageHeight) {
    return {
      ok: false,
      dimensions,
      error: "This photo is too low resolution. Please retake it in brighter light, fill the whole page, and try again.",
    };
  }
  if (width > height) {
    return {
      ok: false,
      dimensions,
      error: "Please rotate to portrait orientation so the whole page is upright.",
    };
  }
  return { ok: true, dimensions };
}

export const WILL_FILE_LIMITS = {
  pdfMaxBytes: 15 * 1024 * 1024,
  maxImageFiles: 15,
  maxImageTotalBytes: 80 * 1024 * 1024,
  minImageBytes: 200 * 1024,
  maxImageBytes: 20 * 1024 * 1024,
  minImageWidth: 1500,
  minImageHeight: 2000,
};

export const ALLOWED_PDF_TYPES = ["application/pdf"];
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export function sanitizeFilename(name: string) {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

export function validatePdfFile(file: File): string | null {
  if (!ALLOWED_PDF_TYPES.includes(file.type)) {
    return "Only PDF files are allowed.";
  }
  if (file.size > WILL_FILE_LIMITS.pdfMaxBytes) {
    return "PDF must be 15MB or smaller.";
  }
  return null;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG or PNG photos are allowed.";
  }
  if (file.size < WILL_FILE_LIMITS.minImageBytes) {
    return "Photo is too small; retake a clearer photo.";
  }
  if (file.size > WILL_FILE_LIMITS.maxImageBytes) {
    return "Photo exceeds the 20MB limit.";
  }
  return null;
}

export function validateImageSelection(files: File[]): string[] {
  const errors: string[] = [];
  if (files.length > WILL_FILE_LIMITS.maxImageFiles) {
    errors.push("Please limit to 15 photos or fewer.");
  }
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > WILL_FILE_LIMITS.maxImageTotalBytes) {
    errors.push("Total photo size is too large; try fewer or smaller images.");
  }
  for (const file of files) {
    const error = validateImageFile(file);
    if (error) {
      errors.push(`${file.name}: ${error}`);
    }
  }
  return errors;
}

export function validatePdfSelection(files: File[]): string[] {
  const errors: string[] = [];
  if (files.length !== 1) {
    errors.push("Upload exactly one PDF for the will.");
  }
  const file = files[0];
  if (file) {
    const err = validatePdfFile(file);
    if (err) errors.push(err);
  }
  return errors;
}
