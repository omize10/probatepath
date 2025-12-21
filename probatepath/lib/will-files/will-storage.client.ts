export {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_PDF_TYPES,
  WILL_FILE_LIMITS,
  checkImageResolution,
  validateImageFile,
  validateImageSelection,
  validatePdfFile,
  validatePdfSelection,
} from "./will-storage.base";
export type { WillFileKind, ImageDimensions, ResolutionCheck } from "./will-storage.base";

async function measureWithBrowserImage(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image."));
    };
    img.src = objectUrl;
  });
}

export async function measureImageDimensions(file: File) {
  if (typeof window === "undefined") {
    throw new Error("measureImageDimensions (client) must run in the browser");
  }
  return measureWithBrowserImage(file);
}
