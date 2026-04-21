import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { seedData } from "@/lib/puck/seed-data";

// One-shot endpoint to push the checked-in seedData back into the
// PageContent table so the DB-backed Puck pages pick up edits made to
// seed-data.ts. Requires the ops_auth cookie (same gate as /api/editor/save).
// Safe to leave in tree; it never writes anything not already in the repo.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("ops_auth")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const onlySlug = url.searchParams.get("slug");

  const slugs = onlySlug ? [onlySlug] : Object.keys(seedData);
  const results: Record<string, string> = {};

  for (const slug of slugs) {
    const data = seedData[slug];
    if (!data) {
      results[slug] = "not-in-seed";
      continue;
    }
    try {
      await prisma.pageContent.upsert({
        where: { slug },
        update: { data: data as object, updatedAt: new Date() },
        create: { slug, data: data as object },
      });
      results[slug] = "ok";
    } catch (e) {
      results[slug] = `error: ${(e as Error).message}`;
    }
  }

  return NextResponse.json({ ok: true, results });
}
