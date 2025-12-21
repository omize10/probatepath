import { PDFDocument } from "pdf-lib";

export async function buildP1PrintPacket(p1Buffer: Uint8Array, coverBuffer: Uint8Array): Promise<Uint8Array> {
  const base = await PDFDocument.load(p1Buffer);
  const coverDoc = await PDFDocument.load(coverBuffer);

  const coverPages = await base.copyPages(coverDoc, coverDoc.getPageIndices());
  coverPages.forEach((p) => base.addPage(p));

  return await base.save();
}
