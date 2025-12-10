import "server-only";
import { ImageAnnotatorClient } from "@google-cloud/vision";

let cachedVision: ImageAnnotatorClient | null = null;

export function getVisionClient(): ImageAnnotatorClient {
  if (cachedVision) return cachedVision;
  if (!process.env.GOOGLE_VISION_API_KEY) {
    throw new Error("GOOGLE_VISION_API_KEY must be configured for OCR.");
  }
  cachedVision = new ImageAnnotatorClient({ apiKey: process.env.GOOGLE_VISION_API_KEY });
  return cachedVision;
}

async function extractText(params: { buffer: ArrayBuffer; kind: "pdf" | "image" }): Promise<string> {
  const client = getVisionClient();
  const content = Buffer.from(params.buffer);
  const [result] =
    params.kind === "pdf"
      ? await client.documentTextDetection({ image: { content } })
      : await client.textDetection({ image: { content } });
  return (result.fullTextAnnotation?.text ?? "").trim();
}

export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  return extractText({ buffer, kind: "pdf" });
}

export async function extractTextFromImage(buffer: ArrayBuffer): Promise<string> {
  return extractText({ buffer, kind: "image" });
}
