import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || "omize10";
const GITHUB_REPO = process.env.GITHUB_REPO || "probatepath";

export async function POST(request: Request) {
  try {
    const { slug, data } = await request.json();

    if (!slug || !data) {
      return NextResponse.json({ error: "Missing slug or data" }, { status: 400 });
    }

    // 1. Save to database
    await prisma.pageContent.upsert({
      where: { slug },
      update: { data, updatedAt: new Date() },
      create: { slug, data },
    });

    // 2. Commit to GitHub (if token is configured)
    let committed = false;
    if (GITHUB_TOKEN) {
      try {
        const { Octokit } = await import("octokit");
        const octokit = new Octokit({ auth: GITHUB_TOKEN });

        const path = `data/pages/${slug}.json`;
        const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
        const message = `Update ${slug} page content via editor`;

        // Get existing file SHA if it exists
        let sha: string | undefined;
        try {
          const { data: existing } = await octokit.rest.repos.getContent({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path,
          });
          if (!Array.isArray(existing) && existing.type === "file") {
            sha = existing.sha;
          }
        } catch {
          // File doesn't exist yet, that's fine
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path,
          message,
          content,
          sha,
        });

        committed = true;
      } catch (err) {
        console.error("GitHub commit failed:", err);
        // Don't fail the whole request - DB save succeeded
      }
    }

    return NextResponse.json({ success: true, committed });
  } catch (err) {
    console.error("Editor save error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 500 }
    );
  }
}
