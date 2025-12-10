import "server-only";
import vision from "@google-cloud/vision";

const apiKey = process.env.GOOGLE_VISION_API_KEY;

if (!apiKey) {
  throw new Error("Missing GOOGLE_VISION_API_KEY environment variable.");
}

// Create a client using API key
const client = new vision.ImageAnnotatorClient({
  apiKey,
});

/**
 * Extract text from a PDF using Google Cloud Vision OCR
 */
export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const [result] = await client.documentTextDetection({
      image: { content: uint8Array },
    });

    const fullText = result.fullTextAnnotation?.text ?? "";
    return fullText.trim();
  } catch (error) {
    console.error("Vision API error (PDF):", error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Extract text from an image using Google Cloud Vision OCR
 */
export async function extractTextFromImage(buffer: ArrayBuffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const [result] = await client.documentTextDetection({
      image: { content: uint8Array },
    });

    const fullText = result.fullTextAnnotation?.text ?? "";
    return fullText.trim();
  } catch (error) {
    console.error("Vision API error (Image):", error);
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
