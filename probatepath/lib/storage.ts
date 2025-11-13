import { randomUUID } from "crypto";

export type StorageTarget = "packet" | "pack" | "file";

const FALLBACK_IMAGE = "/images/envelope.jpg";

export async function savePlaceholder(target: StorageTarget) {
  const id = randomUUID();
  const mapped = target === "pack" ? "/images/support-2.jpg" : FALLBACK_IMAGE;
  return {
    url: `${mapped}?ref=${id}`,
    key: `${target}/${id}`,
  };
}
