// Shared validation for file uploads.
// - Slugifies a user-supplied filename so it can't escape the storage prefix
//   or be served as HTML/SVG.
// - Sniffs the first bytes of the content so a renamed .exe can't masquerade
//   as a PDF/image.

export function slugifyFilename(name: string, fallback = "upload"): string {
  const base = name.split(/[\\/]/).pop() || fallback;
  return (
    base
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || fallback
  );
}

export type SniffKind = "pdf" | "jpeg" | "png" | "webp" | "unknown";

export function sniffKind(ab: ArrayBuffer): SniffKind {
  const head = new Uint8Array(ab.slice(0, 12));
  const startsWith = (sig: number[]) => sig.every((b, i) => head[i] === b);
  if (startsWith([0x25, 0x50, 0x44, 0x46])) return "pdf";
  if (startsWith([0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && head[8] === 0x57 && head[9] === 0x45) return "webp";
  return "unknown";
}

export function kindMatchesMime(kind: SniffKind, mime: string): boolean {
  if (kind === "pdf") return mime === "application/pdf";
  if (kind === "jpeg") return mime === "image/jpeg" || mime === "image/jpg";
  if (kind === "png") return mime === "image/png";
  if (kind === "webp") return mime === "image/webp";
  return false;
}
