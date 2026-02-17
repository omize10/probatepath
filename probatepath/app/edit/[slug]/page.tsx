import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { seedData } from "@/lib/puck/seed-data";
import { EditorClient } from "./EditorClient";
import type { Data } from "@puckeditor/core";

export const metadata: Metadata = {
  title: "Editing Page",
  robots: "noindex, nofollow",
};

const validSlugs = [
  "home", "pricing", "faqs", "how-it-works", "get-started",
  "contact", "testimonials", "legal", "info",
];

export default async function EditSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!validSlugs.includes(slug)) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-red-600">Page not found</h1>
        <p className="mt-2 text-[color:var(--muted-ink)]">Valid pages: {validSlugs.join(", ")}</p>
      </div>
    );
  }

  // Load from DB, fall back to seed data
  let data: Data | null = null;
  try {
    const row = await prisma.pageContent.findUnique({ where: { slug } });
    if (row) {
      data = row.data as unknown as Data;
    }
  } catch {
    // DB not available, use seed
  }

  if (!data) {
    data = seedData[slug] || { root: { props: {} }, content: [] };
  }

  return <EditorClient slug={slug} initialData={data} />;
}
