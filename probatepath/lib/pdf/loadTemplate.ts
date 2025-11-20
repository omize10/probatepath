import { PDFDocument } from "pdf-lib";
import { readFile } from "fs/promises";
import path from "path";

export async function loadTemplate(name: string) {
  const templatePath = path.join(process.cwd(), "forms", name);
  const buffer = await readFile(templatePath);
  return PDFDocument.load(buffer);
}
