import { prisma } from "@/lib/prisma";
import type { Data } from "@puckeditor/core";

export async function getPageContent(slug: string): Promise<Data | null> {
  try {
    const row = await prisma.pageContent.findUnique({
      where: { slug },
    });
    if (!row) return null;
    return row.data as unknown as Data;
  } catch {
    return null;
  }
}
