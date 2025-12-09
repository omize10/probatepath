import "server-only";
import { promises as fs } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

const uploadsRoot = join(process.cwd(), "public", "uploads");

async function ensureUploadsDir() {
  await fs.mkdir(uploadsRoot, { recursive: true });
}

export async function savePdfToUploads(caseId: string, kind: string, file: File) {
  await ensureUploadsDir();
  const id = randomUUID();
  const filename = `${caseId}-${kind}-${id}.pdf`;
  const filepath = join(uploadsRoot, filename);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filepath, Buffer.from(arrayBuffer));
  return {
    url: `/uploads/${filename}`,
    path: filepath,
  };
}

export async function downloadAndStorePdf(caseId: string, kind: string, sourceUrl: string) {
  await ensureUploadsDir();
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const absolute = sourceUrl.startsWith("http") ? sourceUrl : new URL(sourceUrl, base).toString();
  const response = await fetch(absolute);
  if (!response.ok) {
    throw new Error(`Failed to download PDF from ${absolute}: ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const id = randomUUID();
  const filename = `${caseId}-${kind}-${id}.pdf`;
  const filepath = join(uploadsRoot, filename);
  await fs.writeFile(filepath, buffer);
  return {
    url: `/uploads/${filename}`,
    path: filepath,
  };
}
