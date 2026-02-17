import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { seedData } from "@/lib/puck/seed-data";
import { EditorClient } from "./EditorClient";
import type { Data } from "@puckeditor/core";

export const metadata: Metadata = {
  title: "Editing Page",
  robots: "noindex, nofollow",
};

export default async function EditSlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugStr = slug.join("/");

  // Load from DB, fall back to seed data, then empty canvas
  let data: Data | null = null;
  try {
    const row = await prisma.pageContent.findUnique({ where: { slug: slugStr } });
    if (row) {
      data = row.data as unknown as Data;
    }
  } catch {
    // DB not available, use seed
  }

  if (!data) {
    data = seedData[slugStr] || { root: { props: {} }, content: [], zones: {} };
  }

  return <EditorClient slug={slugStr} initialData={data} />;
}
